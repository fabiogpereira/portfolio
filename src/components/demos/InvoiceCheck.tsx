"use client";

import { useEffect, useRef, useState } from "react";

// Conferência automática de notas fiscais: notas entram na fila, cada uma é lida pelo caminho mais
// barato que funcionar (texto, OCR ou modelo de visão) e três campos são conferidos contra a base.
// Simulação com dados de exemplo; tempos são ilustrativos.
type Lang = "pt" | "en";
type Path = "text" | "ocr" | "vision";
type Field = { k: "cnpj" | "value" | "code"; got: string; want: string };
type Note = { artist: string; city: string; scanned: boolean; ocrConf?: number; path: Path; fields: Field[]; ms: number; aiField?: Field["k"] };

const NOTES: Note[] = [
  { artist: "Banda Aurora", city: "Santos/SP", scanned: false, path: "text", ms: 1240, fields: [
    { k: "cnpj", got: "12.345.678/0001-90", want: "12.345.678/0001-90" }, { k: "value", got: "21.000,00", want: "21.000,00" }, { k: "code", got: "12.07", want: "12.07" } ] },
  { artist: "Trio da Ponte", city: "Olinda/PE", scanned: true, ocrConf: 0.93, path: "ocr", ms: 3180, fields: [
    { k: "cnpj", got: "23.456.789/0001-01", want: "23.456.789/0001-01" }, { k: "value", got: "8.900,00", want: "9.800,00" }, { k: "code", got: "12.07", want: "12.07" } ] },
  { artist: "MC Vera", city: "Campinas/SP", scanned: true, ocrConf: 0.41, path: "vision", ms: 6420, fields: [
    { k: "cnpj", got: "34.567.890/0001-12", want: "34.567.890/0001-12" }, { k: "value", got: "52.000,00", want: "52.000,00" }, { k: "code", got: "12.07", want: "12.07" } ] },
  { artist: "Clara Venâncio", city: "Rio de Janeiro/RJ", scanned: false, path: "text", ms: 1310, fields: [
    { k: "cnpj", got: "45.678.901/0001-23", want: "45.678.901/0001-23" }, { k: "value", got: "11.200,00", want: "11.200,00" }, { k: "code", got: "12.13", want: "12.07" } ] },
  { artist: "Samba do Miolo", city: "São Paulo/SP", scanned: false, path: "text", ms: 980, fields: [
    { k: "cnpj", got: "56.789.012/0001-34", want: "56.789.012/0001-34" }, { k: "value", got: "18.500,00", want: "18.500,00" }, { k: "code", got: "12.07", want: "12.07" } ] },
  { artist: "DJ Nortada", city: "Belo Horizonte/MG", scanned: true, ocrConf: 0.88, path: "ocr", ms: 2870, aiField: "value", fields: [
    { k: "cnpj", got: "67.890.123/0001-45", want: "67.890.123/0001-45" }, { k: "value", got: "7.400,00", want: "7.400,00" }, { k: "code", got: "12.07", want: "12.07" } ] },
];

const COPY = {
  pt: {
    fig: "CONFERÊNCIA AUTOMÁTICA DE NOTAS FISCAIS", live: "simulação · dados de exemplo",
    queue: "FILA", note: "NFS-e",
    s1: "01 · TIPO DO PDF", s2: "02 · LEITURA", s3: "03 · EXTRAÇÃO DOS CAMPOS", s4: "04 · CONFERÊNCIA COM A BASE", s5: "05 · RESPOSTA AO ARTISTA",
    text: "texto do PDF", scannedL: "escaneado", textPdf: "PDF com texto",
    paths: { text: "texto nativo", ocr: "Tesseract OCR", vision: "modelo de visão" },
    conf: "confiança", fallback: "abaixo do limite → modelo de visão",
    rules: { cnpj: "regex CNPJ", code: "lista de códigos", value: "rótulos de valor" }, ai: "IA classificou", aiOnly: "só este campo foi para a IA",
    fields: { cnpj: "CNPJ", value: "Valor", code: "Código de serviço" }, got: "na nota", want: "esperado",
    ok: "Nota aprovada", bad: (f: string) => `Divergência: ${f}`, sent: "retorno em",
    done: "conferidas", approved: "aprovadas", flagged: "com divergência",
  },
  en: {
    fig: "AUTOMATED INVOICE CHECK", live: "simulation · sample data",
    queue: "QUEUE", note: "NFS-e",
    s1: "01 · PDF TYPE", s2: "02 · READING", s3: "03 · FIELD EXTRACTION", s4: "04 · CHECK AGAINST THE DATABASE", s5: "05 · FEEDBACK TO THE ARTIST",
    text: "PDF text", scannedL: "scanned", textPdf: "text PDF",
    paths: { text: "native text", ocr: "Tesseract OCR", vision: "vision model" },
    conf: "confidence", fallback: "below threshold → vision model",
    rules: { cnpj: "CNPJ regex", code: "service code list", value: "amount labels" }, ai: "AI classified", aiOnly: "only this field went to AI",
    fields: { cnpj: "CNPJ", value: "Amount", code: "Service code" }, got: "on invoice", want: "expected",
    ok: "Invoice approved", bad: (f: string) => `Mismatch: ${f}`, sent: "feedback in",
    done: "checked", approved: "approved", flagged: "flagged",
  },
};

// Fases de uma nota: 0 tipo · 1 leitura · 2 template · 3..5 campos · 6 resultado
const PHASE_MS = [700, 1300, 700, 450, 450, 450, 2200];

export function InvoiceCheck({ lang, fig = "1", compact = false }: { lang: Lang; fig?: string; compact?: boolean }) {
  const c = COPY[lang];
  const box = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [n, setN] = useState(0);
  const [phase, setPhase] = useState(-1);
  const [stats, setStats] = useState({ done: 0, ok: 0, bad: 0 });

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.3 });
    if (box.current) io.observe(box.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      const t = setTimeout(() => setPhase(6), 0);
      return () => clearTimeout(t);
    }
    if (!visible) return;
    const extra = phase === 1 && NOTES[n].path === "vision" ? 1100 : 0;
    const t = setTimeout(() => {
      if (phase >= 6) {
        const note = NOTES[n];
        const ok = note.fields.every((f) => f.got === f.want);
        setStats((s) => ({ done: s.done + 1, ok: s.ok + (ok ? 1 : 0), bad: s.bad + (ok ? 0 : 1) }));
        setN((v) => (v + 1) % NOTES.length);
        setPhase(0);
      } else {
        setPhase((p) => p + 1);
      }
    }, phase < 0 ? 500 : PHASE_MS[phase] + extra);
    return () => clearTimeout(t);
  }, [phase, n, visible]);

  const note = NOTES[n];
  const queue = Array.from({ length: 5 }, (_, k) => NOTES[(n + 1 + k) % NOTES.length]);
  const checked = Math.max(0, phase - 2); // quantos campos já conferidos
  const bad = note.fields.filter((f) => f.got !== f.want);
  const at = (p: number) => (phase > p ? "done" : phase === p ? "now" : "todo");

  return (
    <figure className={`ic${compact ? " compact" : ""}`} ref={box}>
      <div className="arch-head">
        <span className="label">FIG. {fig} · {c.fig}</span>
        {!compact && <span className="label arch-live"><i />{c.live}</span>}
      </div>

      <div className="ic-grid">
        {!compact && <div className="ic-queue">
          <span className="label">{c.queue}</span>
          <ol>
            {queue.map((q, k) => (
              <li key={(n + 1 + k) % NOTES.length}>
                <span className="mono">{c.note}</span>
                <b>{q.artist}</b>
                <small>{q.city}</small>
              </li>
            ))}
          </ol>
        </div>}

        <div className="ic-main">
          <div className="ic-note">
            <span className="mono">{c.note}</span>
            <b>{note.artist}</b>
            <small>{note.city}</small>
          </div>

          {!compact && <div className="ic-step" data-s={at(0)}>
            <span className="label">{c.s1}</span>
            <p>{phase >= 0 ? (note.scanned ? <>{c.scannedL} · <span className="mono">0 {c.text}</span></> : c.textPdf) : "·"}</p>
          </div>}

          <div className="ic-step" data-s={at(1)}>
            <span className="label">{c.s2}</span>
            <div className="ic-paths">
              {(["text", "ocr", "vision"] as Path[]).map((p) => {
                const tried = phase >= 1 && ((p === "text" && !note.scanned) || (p === "ocr" && note.scanned) || (p === "vision" && note.path === "vision"));
                const used = phase >= 1 && note.path === p;
                const skipped = phase >= 1 && p === "ocr" && note.path === "vision";
                return (
                  <span key={p} data-used={used || undefined} data-tried={tried || undefined} data-skip={skipped || undefined}>
                    {c.paths[p]}
                  </span>
                );
              })}
            </div>
            <p className="ic-sub">
              {phase >= 1 && note.ocrConf !== undefined && <>{c.conf} {note.ocrConf.toFixed(2).replace(".", lang === "pt" ? "," : ".")}{note.path === "vision" ? <> · <b>{c.fallback}</b></> : null}</>}
            </p>
          </div>

          <div className="ic-step" data-s={at(2)}>
            <span className="label">{c.s3}</span>
            <div className="ic-rules">
              {(["cnpj", "code", "value"] as Field["k"][]).map((k) => {
                const viaAi = note.aiField === k;
                return (
                  <span key={k} data-on={phase >= 2 || undefined} data-ai={(phase >= 2 && viaAi) || undefined}>
                    {phase >= 2 && viaAi ? <><s>{c.rules[k]}</s> → {c.ai}</> : c.rules[k]} {phase >= 2 ? (viaAi ? "" : "✓") : ""}
                  </span>
                );
              })}
            </div>
            <p className="ic-sub">{phase >= 2 && note.aiField ? <b>{c.aiOnly}</b> : ""}</p>
          </div>

          <div className="ic-step" data-s={phase >= 3 && phase < 6 ? "now" : phase >= 6 ? "done" : "todo"}>
            <span className="label">{c.s4}</span>
            <div className="ic-fields">
              {note.fields.map((f, k) => {
                const shown = k < checked || phase >= 6;
                const ok = f.got === f.want;
                return (
                  <div key={f.k} data-state={!shown ? "todo" : ok ? "ok" : "bad"}>
                    <span className="ic-fk">{c.fields[f.k]}</span>
                    <span className="mono">{shown ? f.got : "…"}</span>
                    <span className="mono ic-want">{shown && !ok ? `${c.want} ${f.want}` : ""}</span>
                    <span className="ic-mark">{shown ? (ok ? "✓" : "✕") : ""}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="ic-step ic-result" data-s={phase >= 6 ? "done" : "todo"} data-bad={phase >= 6 && bad.length > 0 ? "" : undefined}>
            <span className="label">{c.s5}</span>
            <p>
              {phase >= 6 ? (bad.length ? c.bad(bad.map((f) => c.fields[f.k]).join(", ")) : c.ok) : "·"}
              {phase >= 6 && <span className="mono"> · {c.sent} {(note.ms / 1000).toFixed(1).replace(".", lang === "pt" ? "," : ".")} s</span>}
            </p>
          </div>
        </div>
      </div>

      <div className="ic-foot mono">
        <span>{stats.done} {c.done}</span>
        <span>{stats.ok} {c.approved}</span>
        <span>{stats.bad} {c.flagged}</span>
      </div>
    </figure>
  );
}
