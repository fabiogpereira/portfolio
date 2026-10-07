"use client";

import { useEffect, useRef, useState } from "react";

// Uma pessoa, três registros: o PDV entrega check-in, comprador e itens separados, cada um sujo de um
// jeito. As regras limpam campo a campo e montam um perfil por CPF, guardando de onde veio cada dado.
// Pessoa e valores fictícios; as regras são as do projeto.
type Lang = "pt" | "en";
type Src = "checkin" | "buyer" | "items";
type Fix = { src: Src; field: string; raw: string; clean: string; rule: string };

const COPY = {
  pt: {
    fig: "UMA PESSOA, TRÊS REGISTROS", live: "pessoa fictícia · regras reais",
    srcs: { checkin: "CHECK-IN", buyer: "COMPRADOR", items: "ITENS VENDIDOS" },
    rules: "REGRAS DETERMINÍSTICAS", profile: "PERFIL ÚNICO · distinct_id = CPF", from: "fonte",
    venues: "PESSOA × CASA", visits: "visitas", global: "35 visitas no grupo viram",
    fixes: [
      { src: "checkin", field: "cpf", raw: "123.456.789-09", clean: "12345678909", rule: "CPF sem pontuação vira a chave" },
      { src: "buyer", field: "cpf", raw: "12345678909*", clean: "12345678909", rule: "a API põe * no CPF; remove e casa com o check-in" },
      { src: "checkin", field: "nome", raw: "MARINA COSTA 2", clean: "Marina Costa", rule: "tira dígitos, corrige caixa e acento" },
      { src: "checkin", field: "telefone", raw: "5.511987654321E+12", clean: "+55 11 98765-4321", rule: "notação científica vira número, força +55" },
      { src: "checkin", field: "horário", raw: "02:41-03:00", clean: "02:41 UTC", rule: "a hora já vem em UTC com um -03:00 falso; descarta o offset" },
      { src: "checkin", field: "dia", raw: "15/03 · 01:20", clean: "14/03", rule: "dia operacional vai das 3h às 3h" },
      { src: "checkin", field: "evento", raw: "a1f3…", clean: "a1f3…:2025-03-14", rule: "a API reaproveita o UUID; id composto evita duplicar" },
      { src: "buyer", field: "e-mail", raw: "MARINA.COSTA@EMAIL.COM", clean: "marina.costa@email.com", rule: "comprador tem prioridade sobre check-in" },
      { src: "items", field: "itens", raw: "tx_88f2", clean: "Chopp 500ml ×3 · Bolinho ×1", rule: "itens ligados pela transação" },
    ] as Fix[],
  },
  en: {
    fig: "ONE PERSON, THREE RECORDS", live: "fictional person · real rules",
    srcs: { checkin: "CHECK-IN", buyer: "BUYER", items: "ITEMS SOLD" },
    rules: "DETERMINISTIC RULES", profile: "SINGLE PROFILE · distinct_id = CPF", from: "source",
    venues: "PERSON × VENUE", visits: "visits", global: "35 visits across the group become",
    fixes: [
      { src: "checkin", field: "cpf", raw: "123.456.789-09", clean: "12345678909", rule: "CPF without punctuation becomes the key" },
      { src: "buyer", field: "cpf", raw: "12345678909*", clean: "12345678909", rule: "the API appends *; strip it and match the check-in" },
      { src: "checkin", field: "name", raw: "MARINA COSTA 2", clean: "Marina Costa", rule: "drop digits, fix casing and accents" },
      { src: "checkin", field: "phone", raw: "5.511987654321E+12", clean: "+55 11 98765-4321", rule: "scientific notation back to a number, force +55" },
      { src: "checkin", field: "time", raw: "02:41-03:00", clean: "02:41 UTC", rule: "time is already UTC with a fake -03:00; drop the offset" },
      { src: "checkin", field: "day", raw: "Mar 15 · 1:20 am", clean: "Mar 14", rule: "the operating day runs 3 am to 3 am" },
      { src: "checkin", field: "event", raw: "a1f3…", clean: "a1f3…:2025-03-14", rule: "the API reuses UUIDs; a composite id avoids duplicates" },
      { src: "buyer", field: "e-mail", raw: "MARINA.COSTA@EMAIL.COM", clean: "marina.costa@email.com", rule: "buyer data wins over check-in" },
      { src: "items", field: "items", raw: "tx_88f2", clean: "Draft beer ×3 · Codfish ball ×1", rule: "items linked by transaction" },
    ] as Fix[],
  },
};

const PROFILE: [label: [string, string], value: string, src: Src][] = [
  [["CPF", "CPF"], "***.456.789-**", "checkin"],
  [["nome", "name"], "Marina Costa", "checkin"],
  [["telefone", "phone"], "+55 11 98765-4321", "checkin"],
  [["e-mail", "e-mail"], "marina.costa@email.com", "buyer"],
  [["nascimento", "birth date"], "14/03/1994", "buyer"],
];
// a partir de qual regra cada campo do perfil aparece
const SHOW_AT = [1, 2, 3, 7, 7];
const STEP_MS = 1150;

export function IdentityMerge({ lang, fig = "1" }: { lang: Lang; fig?: string }) {
  const c = COPY[lang];
  const box = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [i, setI] = useState(-1);
  const last = c.fixes.length - 1;

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.3 });
    if (box.current) io.observe(box.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const t = setTimeout(() => setI(last + 1), 0);
      return () => clearTimeout(t);
    }
    if (!visible) return;
    const t = setTimeout(() => setI((v) => (v > last ? -1 : v + 1)), i > last ? 4500 : i < 0 ? 600 : STEP_MS);
    return () => clearTimeout(t);
  }, [i, visible, last]);

  const done = (k: number) => i > k;
  const now = c.fixes[i];

  return (
    <figure className="im" ref={box}>
      <div className="arch-head">
        <span className="label">FIG. {fig} · {c.fig}</span>
        <span className="label arch-live"><i />{c.live}</span>
      </div>

      <div className="im-grid">
        <div className="im-srcs">
          {(["checkin", "buyer", "items"] as Src[]).map((s) => (
            <div key={s} className="im-src" data-on={now?.src === s || undefined}>
              <span className="label">{c.srcs[s]}</span>
              {c.fixes.map((f, k) => f.src === s && (
                <div key={k} className="im-kv" data-state={done(k) ? "clean" : i === k ? "now" : "raw"}>
                  <span>{f.field}</span>
                  <code>{done(k) ? f.clean : f.raw}</code>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="im-rules">
          <span className="label">{c.rules}</span>
          <ol>
            {c.fixes.map((f, k) => (
              <li key={k} data-state={done(k) ? "done" : i === k ? "now" : "todo"}>
                <span className="mono">{String(k + 1).padStart(2, "0")}</span>
                <span>{f.rule}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="im-out">
          <span className="label">{c.profile}</span>
          <div className="im-profile">
            {PROFILE.map(([label, v, s], k) => {
              const on = i >= SHOW_AT[k];
              return (
                <div key={label[0]} data-on={on || undefined}>
                  <span>{lang === "pt" ? label[0] : label[1]}</span>
                  <b>{on ? v : "—"}</b>
                  <small>{on ? `${c.from}: ${c.srcs[s].toLowerCase()}` : ""}</small>
                </div>
              );
            })}
          </div>
          <span className="label im-venues-l">{c.venues}</span>
          <div className="im-venues" data-on={i > last || undefined}>
            <p>{c.global}</p>
            {[["Casa 01", 29], ["Casa 02", 3], ["Casa 03", 3]].map(([v, n]) => (
              <div key={v as string}>
                <span>{v}</span>
                <i style={{ width: i > last ? `${((n as number) / 29) * 100}%` : "0%" }} />
                <b>{n} {c.visits}</b>
              </div>
            ))}
          </div>
        </div>
      </div>
    </figure>
  );
}
