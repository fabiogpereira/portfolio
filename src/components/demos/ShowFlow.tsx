"use client";

import { useEffect, useRef, useState } from "react";

// Um show, do fechamento ao repasse: o evento passa pelos módulos do ERP e cada passo deixa
// histórico e log de auditoria, como no sistema. Dados de exemplo, os mesmos das telas de apresentação.
type Lang = "pt" | "en";
type Step = { stage: number; status: string; note: string; who: string; field: string; from: string; to: string };

const COPY = {
  pt: {
    fig: "UM SHOW, DO FECHAMENTO AO REPASSE", live: "dados de exemplo",
    stages: ["COMERCIAL", "JURÍDICO", "FISCAL", "OPERACIONAL", "FINANCEIRO"],
    show: "Banda Aurora", venue: "Espaço Cais · Santos", when: "26/09 · 22:30", fee: "R$ 21.000",
    history: "HISTÓRICO DE STATUS", audit: "LOG DE AUDITORIA", split: "REPASSE · REGRA SHOW PADRÃO",
    parts: [["Artista", "R$ 15.960"], ["Escritório", "R$ 3.780"], ["Comissão", "R$ 1.260"]],
    steps: [
      { stage: 0, status: "Proposta", note: "proposta enviada à casa", who: "Rafael", field: "evento.status", from: "—", to: "PROPOSTA" },
      { stage: 0, status: "Fechado", note: "casa aceitou R$ 21.000", who: "Rafael", field: "evento.status", from: "PROPOSTA", to: "RESERVADO" },
      { stage: 1, status: "Contrato gerado", note: "gerado do evento, template Show padrão", who: "Rafael", field: "contrato.status", from: "—", to: "GERADO" },
      { stage: 1, status: "Assinatura", note: "enviado pelo DocuSign", who: "sistema", field: "contrato.status", from: "GERADO", to: "ENVIADO" },
      { stage: 1, status: "Assinado", note: "casa e artista assinaram · PDF no S3", who: "webhook", field: "contrato.status", from: "ENVIADO", to: "ASSINADO" },
      { stage: 2, status: "Pedido de venda", note: "PV-2411 · tomador Espaço Cais", who: "Lu", field: "pedido.status", from: "—", to: "ABERTO" },
      { stage: 2, status: "Impostos", note: "calculados pelo regime da empresa", who: "sistema", field: "pedido.impostos", from: "—", to: "CALCULADO" },
      { stage: 3, status: "Confirmado", note: "equipe escalada, rota no app", who: "Marina", field: "evento.status", from: "RESERVADO", to: "CONFIRMADO" },
      { stage: 3, status: "No palco", note: "check-in 21:52 pelo app", who: "produção", field: "evento.etapa", from: "CHECK-IN", to: "NO PALCO" },
      { stage: 3, status: "Finalizado", note: "show encerrado 00:10", who: "produção", field: "evento.status", from: "CONFIRMADO", to: "FINALIZADO" },
      { stage: 4, status: "A receber", note: "R$ 21.000 · vence 26/09", who: "sistema", field: "parcela.status", from: "—", to: "EM ABERTO" },
      { stage: 4, status: "Recebido", note: "baixa feita · repasse dividido", who: "Lu", field: "parcela.status", from: "EM ABERTO", to: "RECEBIDO" },
    ] as Step[],
  },
  en: {
    fig: "ONE SHOW, FROM CLOSING THE DEAL TO PAYOUT", live: "sample data",
    stages: ["SALES", "LEGAL", "TAX", "OPERATIONS", "FINANCE"],
    show: "Banda Aurora", venue: "Espaço Cais · Santos", when: "Sep 26 · 10:30 pm", fee: "R$21,000",
    history: "STATUS HISTORY", audit: "AUDIT LOG", split: "PAYOUT · STANDARD SHOW RULE",
    parts: [["Artist", "R$15,960"], ["Agency", "R$3,780"], ["Commission", "R$1,260"]],
    steps: [
      { stage: 0, status: "Proposal", note: "proposal sent to the venue", who: "Rafael", field: "event.status", from: "—", to: "PROPOSAL" },
      { stage: 0, status: "Closed", note: "venue accepted R$21,000", who: "Rafael", field: "event.status", from: "PROPOSAL", to: "RESERVED" },
      { stage: 1, status: "Contract", note: "generated from the event, standard template", who: "Rafael", field: "contract.status", from: "—", to: "GENERATED" },
      { stage: 1, status: "Signature", note: "sent through DocuSign", who: "system", field: "contract.status", from: "GENERATED", to: "SENT" },
      { stage: 1, status: "Signed", note: "venue and artist signed · PDF on S3", who: "webhook", field: "contract.status", from: "SENT", to: "SIGNED" },
      { stage: 2, status: "Sales order", note: "PV-2411 · billed to Espaço Cais", who: "Lu", field: "order.status", from: "—", to: "OPEN" },
      { stage: 2, status: "Taxes", note: "computed from the company's tax regime", who: "system", field: "order.taxes", from: "—", to: "COMPUTED" },
      { stage: 3, status: "Confirmed", note: "crew assigned, route in the app", who: "Marina", field: "event.status", from: "RESERVED", to: "CONFIRMED" },
      { stage: 3, status: "On stage", note: "check-in 9:52 pm through the app", who: "crew", field: "event.stage", from: "CHECK-IN", to: "ON STAGE" },
      { stage: 3, status: "Done", note: "show ended 12:10 am", who: "crew", field: "event.status", from: "CONFIRMED", to: "DONE" },
      { stage: 4, status: "Receivable", note: "R$21,000 · due Sep 26", who: "system", field: "installment.status", from: "—", to: "OPEN" },
      { stage: 4, status: "Received", note: "payment logged · payout split", who: "Lu", field: "installment.status", from: "OPEN", to: "RECEIVED" },
    ] as Step[],
  },
};

const SPLIT = [76, 18, 6];
const STEP_MS = 1100;

export function ShowFlow({ lang, fig = "1" }: { lang: Lang; fig?: string }) {
  const c = COPY[lang];
  const box = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [i, setI] = useState(-1); // passo atual; -1 = antes de começar

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.3 });
    if (box.current) io.observe(box.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      const t = setTimeout(() => setI(c.steps.length - 1), 0);
      return () => clearTimeout(t);
    }
    if (!visible) return;
    const last = c.steps.length - 1;
    const t = setTimeout(() => setI((v) => (v >= last ? -1 : v + 1)), i >= last ? 4200 : i < 0 ? 600 : STEP_MS);
    return () => clearTimeout(t);
  }, [i, visible, c.steps.length]);

  const step = i >= 0 ? c.steps[i] : null;
  const stage = step ? step.stage : -1;
  const done = i === c.steps.length - 1;
  const shown = c.steps.slice(0, i + 1);

  return (
    <figure className="sf" ref={box}>
      <div className="arch-head">
        <span className="label">FIG. {fig} · {c.fig}</span>
        <span className="label arch-live"><i />{c.live}</span>
      </div>

      <ol className="sf-track">
        {c.stages.map((s, k) => {
          const last = [...shown].reverse().find((x) => x.stage === k);
          return (
            <li key={s} data-state={k < stage || done ? "done" : k === stage ? "now" : "todo"}>
              <span className="sf-n">0{k + 1}</span>
              <b>{s}</b>
              <small>{last ? last.status : "·"}</small>
            </li>
          );
        })}
      </ol>

      <div className="sf-card">
        <div>
          <b>{c.show}</b>
          <span>{c.venue}</span>
        </div>
        <span className="mono">{c.when}</span>
        <span className="sf-fee">{c.fee}</span>
        <span className="sf-pill" data-done={done || undefined}>{step ? step.to : "—"}</span>
      </div>

      <div className="sf-panels">
        <div>
          <span className="label">{c.history}</span>
          <ol className="sf-hist">
            {shown.slice(-5).reverse().map((x) => (
              <li key={x.field + x.to}>
                <i />
                <b>{x.status}</b>
                <span>{x.note}</span>
              </li>
            ))}
          </ol>
        </div>
        <div>
          <span className="label">{c.audit}</span>
          <ol className="sf-log">
            {shown.slice(-6).reverse().map((x, k) => (
              <li key={x.field + x.to}>
                <span className="lf">{x.field}</span>
                <span>{x.from} → <b>{x.to}</b></span>
                <span className="lw">{x.who}</span>
                <span className="lt">#{String(4120 + i - k).padStart(5, "0")}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="sf-split" data-on={done || undefined}>
        <span className="label">{c.split}</span>
        <div className="sf-bar">
          {SPLIT.map((w, k) => <i key={k} style={{ width: done ? `${w}%` : "0%" }} data-k={k} />)}
        </div>
        <div className="sf-parts">
          {c.parts.map(([l, v], k) => (
            <span key={l}><i data-k={k} />{l} <b>{v}</b></span>
          ))}
        </div>
      </div>
    </figure>
  );
}
