"use client";

import { useEffect } from "react";

// Marca as cenas que entraram na tela para as animações de entrada (páginas sem o topo da home).
export function Reveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            (e.target as HTMLElement).dataset.in = "";
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -18% 0px" },
    );
    document.querySelectorAll("[data-scene]").forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);
  return null;
}
