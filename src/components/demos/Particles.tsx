"use client";

import { useEffect, useRef, useState } from "react";

// Dados como matéria: pontos que se reorganizam como os dados num pipeline (crus → camadas → grupos → total).
type Lang = "pt" | "en";

const COPY = {
  pt: {
    fig: "DO PDV AO PERFIL",
    states: [
      ["dados crus", "check-ins, compras e itens soltos"],
      ["tabelas", "eventos → pessoas → pessoa × casa"],
      ["grupos", "perfis por afinidade"],
      ["2,4M", "pessoas unificadas"],
    ],
    bands: ["EVENTS · check-ins, compras, itens", "PEOPLE · uma por CPF", "PERSON × VENUE · métricas"],
    groups: ["happy hour", "fim de semana", "só drinks", "petiscos", "aniversariantes", "sumidos há 60 dias"],
    total: "2,4M",
    read: "2.400 pontos · cada um ≈ 1.000 pessoas · ilustrativo",
  },
  en: {
    fig: "FROM POS TO PROFILE",
    states: [
      ["raw data", "loose check-ins, purchases and items"],
      ["tables", "events → people → person × venue"],
      ["groups", "profiles by affinity"],
      ["2.4M", "unified people"],
    ],
    bands: ["EVENTS · check-ins, purchases, items", "PEOPLE · one per CPF", "PERSON × VENUE · metrics"],
    groups: ["happy hour", "weekend", "drinks only", "bar food", "birthdays", "gone 60 days"],
    total: "2.4M",
    read: "2,400 points · each ≈ 1,000 people · illustrative",
  },
} as const;

type Pt = { x: number; y: number; vx: number; vy: number; tx: number; ty: number; hot: boolean };
type Label = { x: number; y: number; t: string; c?: boolean };

function rand(seed: number) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}
const gauss = (r: () => number) => (r() + r() + r() + r() - 2) / 2;

export function Particles({ lang, fig = "1" }: { lang: Lang; fig?: string }) {
  const c = COPY[lang];
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState(0);
  const [auto, setAuto] = useState(true);
  const [visible, setVisible] = useState(false);
  const [labels, setLabels] = useState<Label[]>([]);
  const stateRef = useRef(0);
  const visibleRef = useRef(false);
  const retarget = useRef<(i: number) => void>(() => {});

  useEffect(() => {
    const el = box.current!;
    const cv = canvas.current!;
    const ctx = cv.getContext("2d")!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0, H = 0, raf = 0;
    const mouse = { x: -9999, y: -9999 };
    let pts: Pt[] = [];
    const css = getComputedStyle(document.documentElement);
    const ink = css.getPropertyValue("--ink").trim() || "#111";
    const accent = css.getPropertyValue("--accent").trim() || "#ff4f00";
    const font = getComputedStyle(document.body).fontFamily;
    const area = () => ({ x: 8, y: 30, w: W - 16, h: H - 44 });

    function textTargets(n: number, a: ReturnType<typeof area>) {
      const off = document.createElement("canvas");
      off.width = Math.max(1, Math.round(a.w));
      off.height = Math.max(1, Math.round(a.h));
      const o = off.getContext("2d")!;
      o.textAlign = "center";
      o.textBaseline = "middle";
      o.font = `800 ${Math.round(Math.min(a.h * 0.78, a.w * 0.36))}px ${font}`;
      o.fillText(c.total, a.w / 2, a.h / 2);
      const data = o.getImageData(0, 0, off.width, off.height).data;
      const cand: [number, number][] = [];
      for (let y = 0; y < off.height; y += 3) for (let x = 0; x < off.width; x += 3) if (data[(y * off.width + x) * 4 + 3] > 128) cand.push([a.x + x, a.y + y]);
      const r = rand(99);
      return Array.from({ length: n }, () => cand[Math.floor(r() * cand.length)] ?? [a.x, a.y]);
    }

    function targets(i: number) {
      const a = area();
      const n = pts.length;
      const r = rand(7 + i * 31);
      let t: [number, number][] = [];
      const lab: Label[] = [];
      if (i === 0) {
        t = Array.from({ length: n }, () => [a.x + r() * a.w, a.y + r() * a.h]);
      } else if (i === 1) {
        const shares = [0.5, 0.3, 0.2], widths = [1, 0.7, 0.44];
        const gap = 26, bh = (a.h - gap * 2) / 3;
        let k = 0;
        shares.forEach((share, j) => {
          const cnt = j === 2 ? n - k : Math.round(n * share);
          const y0 = a.y + j * (bh + gap);
          for (let q = 0; q < cnt; q++) t.push([a.x + r() * a.w * widths[j], y0 + r() * bh]);
          k += cnt;
          lab.push({ x: a.x, y: y0 - 6, t: c.bands[j] });
        });
      } else if (i === 2) {
        const cols = 3, cw = a.w / cols, ch = a.h / 2;
        c.groups.forEach((g, j) => lab.push({ x: a.x + cw * (j % cols) + cw / 2, y: a.y + ch * Math.floor(j / cols) + ch * 0.82, t: g, c: true }));
        t = Array.from({ length: n }, (_, q) => {
          const j = q % c.groups.length;
          const cx = a.x + cw * (j % cols) + cw / 2, cy = a.y + ch * Math.floor(j / cols) + ch * 0.4;
          return [cx + gauss(r) * cw * 0.3, cy + gauss(r) * ch * 0.26];
        });
      } else {
        t = textTargets(n, a);
      }
      pts.forEach((p, q) => ((p.tx = t[q][0]), (p.ty = t[q][1])));
      setLabels(lab);
    }
    retarget.current = (i: number) => {
      stateRef.current = i;
      targets(i);
    };

    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (const p of pts) {
        ctx.fillStyle = p.hot ? accent : ink;
        ctx.globalAlpha = p.hot ? 1 : 0.78;
        ctx.fillRect(p.x, p.y, 2, 2);
      }
      ctx.globalAlpha = 1;
    }

    function resize() {
      const r = el.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width;
      H = r.height;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = W > 520 ? 2400 : 1200;
      if (pts.length !== n) {
        const rr = rand(3);
        pts = Array.from({ length: n }, () => ({ x: rr() * W, y: rr() * H, vx: 0, vy: 0, tx: 0, ty: 0, hot: rr() < 0.035 }));
      }
      targets(stateRef.current);
      if (reduce) pts.forEach((p) => ((p.x = p.tx), (p.y = p.ty)));
      draw();
    }

    // Só calcula enquanto o quadro está na tela.
    function frame() {
      raf = requestAnimationFrame(frame);
      if (!visibleRef.current) return;
      for (const p of pts) {
        const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
        if (d2 < 4900) {
          const f = (1 - d2 / 4900) * 2;
          const d = Math.sqrt(d2) || 1;
          p.vx += (dx / d) * f;
          p.vy += (dy / d) * f;
        }
        p.vx = (p.vx + (p.tx - p.x) * 0.035) * 0.84;
        p.vy = (p.vy + (p.ty - p.y) * 0.035) * 0.84;
        p.x += p.vx;
        p.y += p.vy;
      }
      draw();
    }

    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    const leave = () => ((mouse.x = -9999), (mouse.y = -9999));
    const io = new IntersectionObserver(([e]) => {
      visibleRef.current = e.isIntersecting;
      setVisible(e.isIntersecting);
    });
    io.observe(el);
    resize();
    if (!reduce) raf = requestAnimationFrame(frame);
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [c]);

  useEffect(() => {
    retarget.current(state);
  }, [state]);

  useEffect(() => {
    if (!auto || !visible || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setState((s) => (s + 1) % c.states.length), 3800);
    return () => clearInterval(t);
  }, [auto, visible, c]);

  return (
    <figure className="pt">
      <div className="arch-head">
        <span className="label">FIG. {fig} · {c.fig}</span>
        <span className="label">{c.states[state][1]}</span>
      </div>
      <div className="pt-box" ref={box}>
        <canvas ref={canvas} className="pt-canvas" aria-hidden="true" />
        {labels.map((l) => (
          <span key={l.t} className={`pt-label mono${l.c ? " c" : ""}`} style={{ left: l.x, top: l.y }}>{l.t}</span>
        ))}
      </div>
      <div className="pt-btns">
        {c.states.map(([label], i) => (
          <button key={label} type="button" aria-pressed={i === state} onClick={() => { setAuto(false); setState(i); }}>
            <span className="mono">0{i + 1}</span> {label}
          </button>
        ))}
      </div>
      <span className="mono pt-read">{c.read}</span>
    </figure>
  );
}
