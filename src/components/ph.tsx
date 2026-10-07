import { Fragment, type ReactNode } from "react";

// **Trecho** em negrito no meio do texto.
export function rich(text: string): ReactNode {
  if (!text.includes("**")) return text;
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) => (i % 2 ? <b key={i}>{part}</b> : <Fragment key={i}>{part}</Fragment>));
}

// Trechos [entre colchetes] ainda não foram escritos: ficam marcados na tela até serem trocados.
export function ph(text: string): ReactNode {
  if (!text.includes("[")) return text;
  return text.split(/(\[[^\]]+\])/g).map((part, i) =>
    part.startsWith("[") ? <mark key={i} className="todo">{part}</mark> : <Fragment key={i}>{part}</Fragment>,
  );
}
