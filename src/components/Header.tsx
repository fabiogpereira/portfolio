"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Dict } from "@/content/types";

type Props = { nav: Dict["nav"]; ids: Dict["ids"] };

// Topo fixo da página inicial: marca a seção em que a pessoa está e mostra o quanto já rolou.
export function Header({ nav, ids }: Props) {
  const [active, setActive] = useState("");
  const barRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const scenes = Array.from(document.querySelectorAll<HTMLElement>("[data-scene]"));

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
    scenes.forEach((s) => io.observe(s));

    let frame = 0;
    const update = () => {
      frame = 0;
      const mid = window.innerHeight * 0.5;
      let current = "";
      for (const s of scenes) {
        if (s.getBoundingClientRect().top < mid) current = s.dataset.nav ?? "";
      }
      setActive(current);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (barRef.current) barRef.current.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const links: [string, string, string][] = [
    ["projects", nav.projects, ids.espaces],
    ["journey", nav.journey, ids.journey],
    ["contact", nav.contact, ids.contact],
  ];

  return (
    <header className="top">
      <div className="wrap">
        <div className="top-in">
          <Link href={nav.home} className="top-name">Fábio Pereira</Link>
          <span className="mono top-sub">{nav.portfolio}</span>
          <nav className="top-links">
            {links.map(([key, label, id]) => (
              <Link key={key} href={`#${id}`} aria-current={active === key ? "true" : undefined}>{label}</Link>
            ))}
          </nav>
          <LangSwitch nav={nav} />
        </div>
      </div>
      <span className="top-progress" ref={barRef} aria-hidden="true" />
    </header>
  );
}

export function LangSwitch({ nav, href }: { nav: Dict["nav"]; href?: string }) {
  const other = <Link href={href ?? nav.otherHref} hrefLang={nav.other === "EN" ? "en" : "pt-BR"}>{nav.other}</Link>;
  return (
    <span className="mono lang">
      {nav.other === "EN" ? <><b>PT</b> / {other}</> : <>{other} / <b>EN</b></>}
    </span>
  );
}
