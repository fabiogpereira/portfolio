"use client";

import { useState, type MouseEvent } from "react";
import type { Dict } from "@/content/types";

// Negócio × Software × IA em três círculos. Cada região diz o que acontece quando falta uma parte;
// o centro é onde eu trabalho. Mouse ou toque mudam a região; sem interação, fica no centro.
type Key = "b" | "s" | "a" | "bs" | "sa" | "ba" | "bsa";
const R = 118;
const C = { b: { x: 200, y: 132 }, s: { x: 138, y: 238 }, a: { x: 262, y: 238 } } as const;
const ORDER: Key[] = ["bsa", "bs", "ba", "sa", "b", "s", "a"];

function regionAt(x: number, y: number): Key | null {
  const inside = (["b", "s", "a"] as const).filter((k) => (x - C[k].x) ** 2 + (y - C[k].y) ** 2 <= R * R);
  return inside.length ? (inside.join("") as Key) : null;
}

export function Venn({ how }: { how: Dict["how"] }) {
  const [key, setKey] = useState<Key>("bsa");
  const region = how.regions.find((r) => r.key === key) ?? how.regions[0];

  const fromEvent = (e: MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM()?.inverse());
    return regionAt(p.x, p.y);
  };

  // Máscara de cada região: interseção dos círculos que entram, menos os que ficam de fora.
  const mask = (k: Key) => {
    const inc = k.split("") as ("b" | "s" | "a")[];
    const exc = (["b", "s", "a"] as const).filter((c) => !inc.includes(c));
    const nested = inc.reduceRight<React.ReactNode>(
      (child, c) => <g clipPath={`url(#vc-${c})`}>{child}</g>,
      <rect width="400" height="380" fill="white" />,
    );
    return (
      <mask id={`vm-${k}`} key={k}>
        <rect width="400" height="380" fill="black" />
        {nested}
        {exc.map((c) => <circle key={c} cx={C[c].x} cy={C[c].y} r={R} fill="black" />)}
      </mask>
    );
  };

  return (
    <div className="venn">

      <div className="venn-copy">
        <p className="venn-lead">{how.body}</p>
        <div className="venn-region-box" aria-live="polite" data-center={key === "bsa" || undefined}>
          <span className="label">{region.label}</span>
          <p>{region.text}</p>
        </div>
        <span className="mono venn-hint">{how.hint}</span>
      </div>
      <svg
        className="venn-svg"
        viewBox="0 0 400 380"
        role="img"
        aria-label={how.title}
        onPointerMove={(e) => { const k = fromEvent(e); if (k) setKey(k); }}
        onPointerLeave={() => setKey("bsa")}
        onClick={(e) => { const k = fromEvent(e); if (k) setKey(k); }}
      >
        <defs>
          {(["b", "s", "a"] as const).map((c) => (
            <clipPath id={`vc-${c}`} key={c}><circle cx={C[c].x} cy={C[c].y} r={R} /></clipPath>
          ))}
          {ORDER.map(mask)}
        </defs>
        {ORDER.map((k) => (
          <rect key={k} width="400" height="380" mask={`url(#vm-${k})`} className="venn-region" data-k={k} data-on={k === key || undefined} />
        ))}
        {(["b", "s", "a"] as const).map((c) => (
          <circle key={c} cx={C[c].x} cy={C[c].y} r={R} className="venn-ring" />
        ))}
        <text x={C.b.x} y={C.b.y - 52} className="venn-label">{how.circles.b}</text>
        <text x={C.s.x - 46} y={C.s.y + 34} className="venn-label">{how.circles.s}</text>
        <text x={C.a.x + 46} y={C.a.y + 34} className="venn-label">{how.circles.a}</text>
        <text x="200" y="210" className="venn-center" data-on={key === "bsa" || undefined}>×</text>
      </svg>
    </div>
  );
}
