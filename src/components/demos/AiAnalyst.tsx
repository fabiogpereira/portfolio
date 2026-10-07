"use client";

import { useEffect, useRef, useState } from "react";

// Analista com IA: a pergunta vira SQL (tool use), a trava confere o SQL antes de rodar no ClickHouse
// e só então a resposta volta. Dados de exemplo; as travas são as do projeto.
type Lang = "pt" | "en";
type Check = { label: string; ok: boolean };
type Turn = { q: string; sql: string; checks: Check[]; rows?: [string, number][]; answer: string; blocked?: boolean };

const COPY: Record<Lang, { fig: string; live: string; ask: string; sqlL: string; guard: string; result: string; answer: string; turns: Turn[]; people: string; phases: string[] }> = {
  pt: {
    fig: "ANALISTA COM IA, DA PERGUNTA AO SQL", live: "dados de exemplo · travas reais",
    ask: "PERGUNTA", sqlL: "SQL GERADO · tool use", guard: "TRAVA ANTES DE RODAR", result: "CLICKHOUSE", answer: "RESPOSTA",
    people: "pessoas",
    phases: ["perguntando", "gerando SQL", "conferindo", "consultando", "respondendo", "pronto"],
    turns: [
      {
        q: "Quem veio mais de 3 vezes e nunca pediu drink?",
        sql: "SELECT venue_id, uniqExact(distinct_id) AS pessoas\nFROM person_venue_stats\nWHERE venue_id IN ({casas_autorizadas})\n  AND total_visits > 3\n  AND distinct_id NOT IN (\n    SELECT distinct_id FROM person_products\n    WHERE product_category = 'Drinks')\nGROUP BY venue_id",
        checks: [{ label: "só SELECT ou WITH", ok: true }, { label: "filtra pelas casas autorizadas", ok: true }, { label: "nenhuma coluna de documento", ok: true }],
        rows: [["Casa 01", 1284], ["Casa 02", 342], ["Casa 03", 97]],
        answer: "São 1.723 pessoas, quase três quartos na Casa 01. Quer que eu transforme isso num segmento para uma campanha de drinks?",
      },
      {
        q: "Me passa o CPF dessas pessoas.",
        sql: "SELECT distinct_id\nFROM people\nWHERE …",
        checks: [{ label: "só SELECT ou WITH", ok: true }, { label: "filtra pelas casas autorizadas", ok: false }, { label: "nenhuma coluna de documento", ok: false }],
        blocked: true,
        answer: "Não consigo mostrar CPF nem dados de documento. Posso salvar essas pessoas como segmento e disparar a campanha por e-mail ou WhatsApp.",
      },
      {
        q: "Qual o dia mais forte da Casa 02?",
        sql: "SELECT sum(visits_thu) AS qui, sum(visits_fri) AS sex,\n       sum(visits_sat) AS sab\nFROM person_venue_stats\nWHERE venue_id IN ({casas_autorizadas})\n  AND venue_id = 'casa-02'",
        checks: [{ label: "só SELECT ou WITH", ok: true }, { label: "filtra pelas casas autorizadas", ok: true }, { label: "nenhuma coluna de documento", ok: true }],
        rows: [["quinta", 1820], ["sexta", 3410], ["sábado", 4120]],
        answer: "Sábado, com sexta logo atrás. Quinta tem metade do movimento: um bom dia para testar uma ação.",
      },
    ],
  },
  en: {
    fig: "AI ANALYST, FROM QUESTION TO SQL", live: "sample data · real guardrails",
    ask: "QUESTION", sqlL: "GENERATED SQL · tool use", guard: "GUARDRAIL BEFORE RUNNING", result: "CLICKHOUSE", answer: "ANSWER",
    people: "people",
    phases: ["asking", "writing SQL", "checking", "querying", "answering", "done"],
    turns: [
      {
        q: "Who came more than 3 times and never ordered a drink?",
        sql: "SELECT venue_id, uniqExact(distinct_id) AS people\nFROM person_venue_stats\nWHERE venue_id IN ({authorized_venues})\n  AND total_visits > 3\n  AND distinct_id NOT IN (\n    SELECT distinct_id FROM person_products\n    WHERE product_category = 'Drinks')\nGROUP BY venue_id",
        checks: [{ label: "only SELECT or WITH", ok: true }, { label: "filters by authorized venues", ok: true }, { label: "no document columns", ok: true }],
        rows: [["Venue 01", 1284], ["Venue 02", 342], ["Venue 03", 97]],
        answer: "That's 1,723 people, almost three quarters at Venue 01. Want me to turn this into a segment for a drinks campaign?",
      },
      {
        q: "Give me these people's CPF.",
        sql: "SELECT distinct_id\nFROM people\nWHERE …",
        checks: [{ label: "only SELECT or WITH", ok: true }, { label: "filters by authorized venues", ok: false }, { label: "no document columns", ok: false }],
        blocked: true,
        answer: "I can't show CPF or any document data. I can save these people as a segment and send the campaign by e-mail or WhatsApp.",
      },
      {
        q: "What's the busiest day at Venue 02?",
        sql: "SELECT sum(visits_thu) AS thu, sum(visits_fri) AS fri,\n       sum(visits_sat) AS sat\nFROM person_venue_stats\nWHERE venue_id IN ({authorized_venues})\n  AND venue_id = 'venue-02'",
        checks: [{ label: "only SELECT or WITH", ok: true }, { label: "filters by authorized venues", ok: true }, { label: "no document columns", ok: true }],
        rows: [["Thursday", 1820], ["Friday", 3410], ["Saturday", 4120]],
        answer: "Saturday, with Friday close behind. Thursday has half the traffic: a good day to test a promotion.",
      },
    ],
  },
};

export function AiAnalyst({ lang, fig = "1" }: { lang: Lang; fig?: string }) {
  const c = COPY[lang];
  const box = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [ti, setTi] = useState(0);
  const [phase, setPhase] = useState(0); // 0 pergunta · 1 SQL · 2 trava · 3 resultado · 4 resposta · 5 pronto
  const [q, setQ] = useState("");
  const [sql, setSql] = useState("");
  const [checks, setChecks] = useState(0);
  const [said, setSaid] = useState(0);
  const runId = useRef(0);
  const t = c.turns[ti];
  const nf = new Intl.NumberFormat(lang === "pt" ? "pt-BR" : "en-US");

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.3 });
    if (box.current) io.observe(box.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const id = ++runId.current;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const later = (ms: number, f: () => void) => timers.push(setTimeout(() => id === runId.current && f(), ms));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      later(0, () => { setQ(t.q); setSql(t.sql); setChecks(t.checks.length); setSaid(t.answer.length); setPhase(5); });
      return () => timers.forEach(clearTimeout);
    }
    if (!visible) return () => timers.forEach(clearTimeout);
    later(0, () => { setPhase(0); setQ(""); setSql(""); setChecks(0); setSaid(0); });
    let at = 200;
    for (let k = 1; k <= t.q.length; k++) later(at + k * 30, () => setQ(t.q.slice(0, k)));
    at += t.q.length * 30 + 350;
    later(at, () => setPhase(1));
    for (let k = 1; k <= t.sql.length; k += 3) later(at + k * 6, () => setSql(t.sql.slice(0, k + 2)));
    at += t.sql.length * 2 + 400;
    later(at, () => setPhase(2));
    t.checks.forEach((_, k) => later(at + (k + 1) * 380, () => setChecks(k + 1)));
    at += t.checks.length * 380 + 450;
    later(at, () => setPhase(3));
    at += 900;
    later(at, () => setPhase(4));
    for (let k = 1; k <= t.answer.length; k++) later(at + k * 16, () => setSaid(k));
    at += t.answer.length * 16 + 100;
    later(at, () => setPhase(5));
    later(at + 4200, () => setTi((v) => (v + 1) % c.turns.length));
    return () => timers.forEach(clearTimeout);
  }, [ti, visible, t, c.turns.length]);

  const blocked = t.blocked && phase >= 3;
  const max = t.rows ? Math.max(...t.rows.map((r) => r[1])) : 1;

  return (
    <figure className="aa" ref={box}>
      <div className="arch-head">
        <span className="label">FIG. {fig} · {c.fig}</span>
        <span className="label arch-live"><i />{c.live}</span>
      </div>

      <div className="aa-q">
        <span className="label">{c.ask}</span>
        <p>{q}{phase === 0 && <b className="caret" />}</p>
      </div>

      <div className="aa-grid">
        <div className="aa-sql" data-on={phase >= 1 || undefined}>
          <span className="label">{c.sqlL}</span>
          <pre>{sql || " "}</pre>
        </div>
        <div className="aa-side">
          <div className="aa-guard" data-on={phase >= 2 || undefined}>
            <span className="label">{c.guard}</span>
            <ul>
              {t.checks.map((ch, k) => (
                <li key={ch.label} data-state={k < checks ? (ch.ok ? "ok" : "bad") : "todo"}>
                  <span>{k < checks ? (ch.ok ? "✓" : "✕") : "·"}</span>{ch.label}
                </li>
              ))}
            </ul>
          </div>
          <div className="aa-res" data-on={phase >= 3 || undefined} data-blocked={blocked || undefined}>
            <span className="label">{c.result}</span>
            {blocked ? (
              <p className="aa-block">✕ {lang === "pt" ? "consulta bloqueada, nada foi executado" : "query blocked, nothing ran"}</p>
            ) : (
              <div className="aa-rows">
                {t.rows?.map(([k, v]) => (
                  <div key={k}>
                    <span>{k}</span>
                    <i style={{ width: phase >= 3 ? `${(v / max) * 100}%` : "0%" }} />
                    <b>{phase >= 3 ? nf.format(v) : "—"}</b>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="aa-ans" data-on={phase >= 4 || undefined}>
        <span className="label">{c.answer}</span>
        <p>{t.answer.slice(0, said)}{phase === 4 && <b className="caret" />}</p>
      </div>

      <div className="rl-foot mono">
        <span>{c.turns.map((_, k) => (k === ti ? "●" : "○")).join(" ")}</span>
        <span>{c.phases[phase]}</span>
      </div>
    </figure>
  );
}
