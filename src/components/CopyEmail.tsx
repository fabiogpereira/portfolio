"use client";

import { useRef, useState } from "react";
import { ph } from "./ph";

// Copia o e-mail. Se o navegador recusar, seleciona o texto para a pessoa copiar na mão.
export function CopyEmail({ email, copy, copied }: { email: string; copy: string; copied: string }) {
  const [done, setDone] = useState(false);
  const textRef = useRef<HTMLSpanElement>(null);

  async function onClick() {
    try {
      await navigator.clipboard.writeText(email);
      setDone(true);
      setTimeout(() => setDone(false), 1800);
    } catch {
      const el = textRef.current;
      const sel = window.getSelection();
      if (el && sel) {
        const range = document.createRange();
        range.selectNodeContents(el);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  }

  return (
    <button type="button" className="btn solid" onClick={onClick}>
      <span ref={textRef}>{ph(email)}</span>
      <span className="label" aria-live="polite">{done ? copied : copy}</span>
    </button>
  );
}
