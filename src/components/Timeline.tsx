"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type FocusEvent, type MouseEvent, type PointerEvent } from "react";
import type { Dict } from "@/content/types";
import { rich } from "./ph";

type Lane = "edu" | "plat" | "esp";
const LANE_Y: Record<Lane, number> = { esp: 22, plat: 62, edu: 102 };
const H = 138;
const DOT_X = 6; // o ponto fica alinhado com a borda esquerda de cada ano

// Trajetória como um gráfico de trilhas (estilo git): formação, a plataforma e a Espaces correndo em paralelo.
// Com o mouse num ano, a coluna acende e o detalhe abre embaixo; ao sair, fecha. No toque, tocar abre e
// tocar de novo fecha. Pelo teclado, o foco abre.
export function Timeline({ j }: { j: Dict["journey"] }) {
  const [active, setActive] = useState<number | null>(null);
  const [w, setW] = useState(0);
  const track = useRef<HTMLDivElement>(null);
  const it = active === null ? null : j.items[active];
  const n = j.items.length;

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const isMouse = (e: PointerEvent | MouseEvent) => (e.nativeEvent as globalThis.PointerEvent).pointerType === "mouse";
  const idx = (year: string) => j.items.findIndex((x) => x.year === year);
  const x = (i: number) => (w / n) * i + DOT_X;
  const node = (year: string, lane: Lane) => ({ x: x(idx(year)), y: LANE_Y[lane] });

  // Linhas de cada trilha (nós na ordem) e as ramificações entre trilhas.
  const lanes: Lane[] = ["edu", "plat", "esp"];
  const byLane = (l: Lane) => j.graph.filter((g) => g.lane === l).map((g) => node(g.year, l));
  const curve = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const mx = (a.x + b.x) / 2;
    return `M${a.x},${a.y} C${mx},${a.y} ${mx},${b.y} ${b.x},${b.y}`;
  };
  const first = (l: Lane) => j.graph.find((g) => g.lane === l);
  const last = (l: Lane) => [...j.graph].reverse().find((g) => g.lane === l);
  const prevYear = (year: string) => j.items[Math.max(0, idx(year) - 1)].year;
  const platStart = first("plat");
  const espStart = first("esp");
  const eduEnd = last("edu");
  const branches: string[] = [];
  if (w && platStart) branches.push(curve(node(prevYear(platStart.year), "edu"), node(platStart.year, "plat")));
  if (w && espStart) branches.push(curve(node(prevYear(espStart.year), "plat"), node(espStart.year, "esp")));
  if (w && eduEnd && idx(eduEnd.year) < n - 1) branches.push(curve(node(eduEnd.year, "edu"), node(j.items[idx(eduEnd.year) + 1].year, "plat")));

  return (
    <div
      className="tl"
      data-open={it ? "" : undefined}
      onPointerLeave={(e) => isMouse(e) && setActive(null)}
      onBlur={(e: FocusEvent<HTMLDivElement>) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setActive(null);
      }}
    >
      {w > 0 && (
        <svg className="tl-graph" width={w} height={H} viewBox={`0 0 ${w} ${H}`} aria-hidden="true">
          {active !== null && <line className="tl-col" x1={x(active)} x2={x(active)} y1={0} y2={H} />}
          {lanes.map((l) => {
            const pts = byLane(l);
            if (!pts.length) return null;
            const open = l !== "edu"; // trilhas que continuam depois do último ano
            return (
              <g key={l} className={`tl-lane tl-lane-${l}`}>
                <path d={`M${pts[0].x},${pts[0].y} L${pts[pts.length - 1].x},${pts[0].y}`} />
                {open && <path className="tl-cont" d={`M${pts[pts.length - 1].x},${pts[0].y} L${w},${pts[0].y}`} />}
                <text className="tl-lane-label" x={pts[0].x - DOT_X} y={pts[0].y - 11}>{j.lanes[l].toUpperCase()}</text>
              </g>
            );
          })}
          {branches.map((d) => <path key={d} className="tl-branch" d={d} />)}
          {j.graph.map((g) => {
            const i = idx(g.year);
            const p = node(g.year, g.lane);
            const on = active === i;
            return (
              <g
                key={g.year + g.lane}
                className="tl-node"
                data-on={on || undefined}
                data-past={(active !== null && i < active) || undefined}
                onPointerEnter={(e) => isMouse(e) && setActive(i)}
              >
                <circle cx={p.x} cy={p.y} r={on ? 7 : 5} />
                <text x={p.x - 2} y={p.y + 21}>{g.tag}</text>
              </g>
            );
          })}
        </svg>
      )}

      <div ref={track} className="tl-track" role="tablist" aria-label={j.title} style={{ "--n": n } as CSSProperties}>
        {j.items.map((it2, i) => (
          <button
            key={it2.year}
            type="button"
            role="tab"
            id={`tl-tab-${it2.year}`}
            aria-selected={i === active}
            aria-controls="tl-panel"
            className="tl-item"
            data-state={active === null ? "idle" : i < active ? "past" : i === active ? "now" : "next"}
            onPointerEnter={(e) => isMouse(e) && setActive(i)}
            onFocus={(e) => e.currentTarget.matches(":focus-visible") && setActive(i)}
            onClick={(e) => setActive((a) => (a === i && !isMouse(e) ? null : i))}
          >
            <i aria-hidden="true" />
            <span className="tl-year">{it2.year}</span>
            <b>{it2.title}</b>
            <span className="sr-only">{it2.text}</span>
          </button>
        ))}
      </div>

      {it && (
        <div className="tl-panel" id="tl-panel" role="tabpanel" aria-labelledby={`tl-tab-${it.year}`} key={it.year}>
          <div className="tl-p-head">
            <span className="tl-p-year">{it.year}</span>
            <h3>{it.title}</h3>
            <p>{rich(it.detail.body)}</p>
          </div>
          <ul className="tl-p-points">
            {it.detail.points.map((p) => <li key={p}>{rich(p)}</li>)}
          </ul>
          <div className="tl-p-side">
            {it.detail.stat && (
              <div className="tl-p-stat">
                <span className="stat-xl">{it.detail.stat[0]}</span>
                <span className="stat-cap">{it.detail.stat[1]}</span>
              </div>
            )}
            {it.detail.tags && <div className="chips">{it.detail.tags.map((t) => <span key={t} className="chip">{t}</span>)}</div>}
            {it.detail.links?.map((l) => (
              <Link key={l.href} href={l.href} className="more">{l.label} <span aria-hidden="true">→</span></Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
