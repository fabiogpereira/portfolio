"use client";

import { useEffect, useRef, useState } from "react";

// Sistema vivo: a arquitetura da Espaces com requisições simuladas passando pelos serviços.
type Lang = "pt" | "en";
type Kind = "client" | "edge" | "service" | "job" | "data" | "ai";
type Node = { id: string; x: number; y: number; w?: number; label: string; kind: Kind; hot?: boolean; desc: [pt: string, en: string] };

const COPY = {
  pt: {
    fig: "ARQUITETURA DA ESPACES", live: "tráfego simulado", hint: "passe o mouse num bloco",
    kinds: { client: "CLIENTE", edge: "EDGE", service: "SERVIÇO", job: "JOB", data: "DADOS", ai: "IA" },
    aria: "Arquitetura da Espaces: apps, ingress no Kubernetes, serviços em NestJS, PostgreSQL com pgvector, LLM e CDN",
  },
  en: {
    fig: "ESPACES ARCHITECTURE", live: "simulated traffic", hint: "hover a block",
    kinds: { client: "CLIENT", edge: "EDGE", service: "SERVICE", job: "JOB", data: "DATA", ai: "AI" },
    aria: "Espaces architecture: apps, Kubernetes ingress, NestJS services, PostgreSQL with pgvector, LLM and CDN",
  },
};

const W = 150;
const H = 44;
const NODES: Node[] = [
  { id: "app", x: 10, y: 96, label: "App iOS · Android", kind: "client", desc: ["React Native (Expo) · 20K+ usuários", "React Native (Expo) · 20K+ users"] },
  { id: "site", x: 10, y: 236, label: "Site", kind: "client", desc: ["Next.js · páginas por bairro", "Next.js · neighborhood pages"] },
  { id: "painel", x: 10, y: 376, label: "Painel empresas", kind: "client", desc: ["Next.js · cadastro pelo WhatsApp", "Next.js · onboarding through WhatsApp"] },
  { id: "ingress", x: 196, y: 236, label: "ingress", kind: "edge", desc: ["Kubernetes na AWS · TLS · roteamento", "Kubernetes on AWS · TLS · routing"] },
  { id: "feed", x: 382, y: 36, label: "feed", kind: "service", desc: ["NestJS · feed dos amigos e avaliações", "NestJS · friends feed and reviews"] },
  { id: "lists", x: 382, y: 116, label: "lists", kind: "service", desc: ["NestJS · listas Quero ir", "NestJS · saved lists"] },
  { id: "rango", x: 382, y: 196, label: "rango · IA", kind: "service", hot: true, desc: ["NestJS · embeddings + pgvector + LLM", "NestJS · embeddings + pgvector + LLM"] },
  { id: "notif", x: 382, y: 276, label: "notifications", kind: "service", desc: ["NestJS · push e motor de regras", "NestJS · push and rules engine"] },
  { id: "public", x: 382, y: 356, label: "public", kind: "service", desc: ["NestJS · lugares, agenda, busca", "NestJS · venues, events, search"] },
  { id: "enrich", x: 382, y: 436, label: "enrich · cron", kind: "job", hot: true, desc: ["Python · LLM em lote, 300 lugares/dia", "Python · batch LLM, 300 venues/day"] },
  { id: "pg", x: 568, y: 116, label: "PostgreSQL · pgvector", kind: "data", desc: ["dados do produto + vetores", "product data + vectors"] },
  { id: "llm", x: 568, y: 256, label: "LLM API", kind: "ai", desc: ["geração e classificação", "generation and classification"] },
  { id: "s3", x: 568, y: 396, label: "S3 · CDN", kind: "data", desc: ["fotos servidas pela CDN", "photos served through the CDN"] },
];
const byId = Object.fromEntries(NODES.map((n) => [n.id, n]));

type Route = { path: string[]; method: string; ms: [number, number] };
const ROUTES: Route[] = [
  { path: ["app", "ingress", "feed", "pg"], method: "GET  /feed", ms: [48, 110] },
  { path: ["app", "ingress", "feed", "pg"], method: "POST /reviews", ms: [70, 140] },
  { path: ["app", "ingress", "lists", "pg"], method: "POST /lists/items", ms: [30, 70] },
  { path: ["app", "ingress", "rango", "pg"], method: "POST /rango/search", ms: [160, 320] },
  { path: ["app", "ingress", "rango", "llm"], method: "POST /rango/answer", ms: [700, 1400] },
  { path: ["site", "ingress", "public", "pg"], method: "GET  /lugares/:slug", ms: [22, 60] },
  { path: ["painel", "ingress", "public", "pg"], method: "PATCH /empresas/:id", ms: [40, 90] },
  { path: ["notif", "pg"], method: "EVT  notify.friend_review", ms: [8, 20] },
  { path: ["enrich", "llm"], method: "JOB  enrich.describe", ms: [900, 2200] },
  { path: ["enrich", "s3"], method: "JOB  enrich.photos", ms: [300, 800] },
];
const WEIGHTS = [5, 2, 2, 3, 2, 4, 1, 2, 1, 1];

const EDGES: [string, string][] = [
  ["app", "ingress"], ["site", "ingress"], ["painel", "ingress"],
  ["ingress", "feed"], ["ingress", "lists"], ["ingress", "rango"], ["ingress", "public"],
  ["feed", "pg"], ["lists", "pg"], ["rango", "pg"], ["rango", "llm"], ["notif", "pg"], ["public", "pg"],
  ["enrich", "llm"], ["enrich", "s3"], ["enrich", "pg"],
];

const w = (n: Node) => n.w ?? W;
// Linha em cotovelo: sai pela direita de um nó e entra pela esquerda do outro.
function elbow(a: Node, b: Node): [number, number][] {
  const x1 = a.x + w(a), y1 = a.y + H / 2, x2 = b.x, y2 = b.y + H / 2;
  const xm = Math.round((x1 + x2) / 2);
  return [[x1, y1], [xm, y1], [xm, y2], [x2, y2]];
}
const pts = (p: [number, number][]) => p.map(([x, y]) => `${x},${y}`).join(" ");

function routePoints(r: Route) {
  const out: [number, number][] = [];
  for (let i = 0; i < r.path.length - 1; i++) {
    const seg = elbow(byId[r.path[i]], byId[r.path[i + 1]]);
    if (i === 0) out.push([byId[r.path[0]].x + w(byId[r.path[0]]) / 2, seg[0][1]]);
    out.push(...seg);
    if (i < r.path.length - 2) out.push([byId[r.path[i + 1]].x + w(byId[r.path[i + 1]]), seg[3][1]]);
  }
  return out;
}

function pickRoute() {
  const total = WEIGHTS.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < ROUTES.length; i++) {
    r -= WEIGHTS[i];
    if (r <= 0) return ROUTES[i];
  }
  return ROUTES[0];
}

type Log = { id: number; t: string; m: string; code: number; ms: number };

export function Architecture({ lang, fig = "1" }: { lang: Lang; fig?: string }) {
  const c = COPY[lang];
  const layer = useRef<SVGGElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [hover, setHover] = useState<Node | null>(null);
  const [rps, setRps] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    type P = { el: SVGRectElement; pts: [number, number][]; len: number[]; total: number; d: number; end: string };
    const live: P[] = [];
    let raf = 0, last = performance.now(), spawnAcc = 0, id = 0, count = 0;
    const SPEED = 300;

    const spawn = () => {
      const r = pickRoute();
      const p = routePoints(r);
      const len: number[] = [];
      let total = 0;
      for (let i = 1; i < p.length; i++) {
        const l = Math.abs(p[i][0] - p[i - 1][0]) + Math.abs(p[i][1] - p[i - 1][1]);
        len.push(l);
        total += l;
      }
      const el = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      el.setAttribute("width", "6");
      el.setAttribute("height", "6");
      el.setAttribute("class", r.method.startsWith("JOB") || r.method.startsWith("EVT") ? "pk pk-ink" : "pk");
      layer.current?.appendChild(el);
      live.push({ el, pts: p, len, total, d: 0, end: r.path[r.path.length - 1] });
      const ms = Math.round(r.ms[0] + Math.random() * (r.ms[1] - r.ms[0]));
      const now = new Date();
      const t = now.toTimeString().slice(0, 8);
      count++;
      setLogs((l) => [{ id: id++, t, m: r.method, code: Math.random() < 0.985 ? 200 : 429, ms }, ...l].slice(0, 7));
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      spawnAcc += dt;
      if (spawnAcc > 0.42) {
        spawnAcc = 0;
        if (!document.hidden) spawn();
      }
      for (let i = live.length - 1; i >= 0; i--) {
        const p = live[i];
        p.d += SPEED * dt;
        if (p.d >= p.total) {
          p.el.remove();
          live.splice(i, 1);
          const n = svg.current?.querySelector(`[data-node="${p.end}"]`);
          n?.classList.add("flash");
          setTimeout(() => n?.classList.remove("flash"), 220);
          continue;
        }
        let d = p.d, k = 0;
        while (d > p.len[k]) d -= p.len[k++];
        const [ax, ay] = p.pts[k], [bx, by] = p.pts[k + 1];
        const f = p.len[k] ? d / p.len[k] : 0;
        p.el.setAttribute("x", String(ax + (bx - ax) * f - 3));
        p.el.setAttribute("y", String(ay + (by - ay) * f - 3));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const rpsTimer = setInterval(() => {
      setRps(count);
      count = 0;
    }, 1000);
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(rpsTimer);
      live.forEach((p) => p.el.remove());
    };
  }, []);

  return (
    <figure className="arch">
      <Crosshair />
      <div className="arch-head">
        <span className="label">FIG. {fig} · {c.fig}</span>
        <span className="label arch-live"><i />{c.live} · {rps} req/s</span>
      </div>
      <svg ref={svg} viewBox="0 0 730 500" className="arch-svg" role="img" aria-label={c.aria}>
        <g className="edges">
          {EDGES.map(([a, b]) => <polyline key={a + b} points={pts(elbow(byId[a], byId[b]))} />)}
        </g>
        {NODES.map((n) => (
          <g
            key={n.id}
            data-node={n.id}
            className={`node${n.hot ? " hot" : ""}${hover?.id === n.id ? " on" : ""}`}
            transform={`translate(${n.x} ${n.y})`}
            onPointerEnter={() => setHover(n)}
            onPointerLeave={() => setHover(null)}
          >
            <rect width={w(n)} height={H} />
            <text x="10" y="16" className="nk">{c.kinds[n.kind]}</text>
            <text x="10" y="33" className="nl">{n.label}</text>
          </g>
        ))}
        <g ref={layer} />
      </svg>
      <div className="arch-info mono">{hover ? <><b>{hover.label}</b> · {hover.desc[lang === "pt" ? 0 : 1]}</> : c.hint}</div>
      <ol className="log" aria-live="off">
        {logs.map((l) => (
          <li key={l.id}>
            <span>{l.t}</span>
            <span className="lm">{l.m}</span>
            <span className={l.code === 200 ? "ok" : "warn"}>{l.code}</span>
            <span className="lms">{l.ms} ms</span>
          </li>
        ))}
      </ol>
    </figure>
  );
}

// Mira que segue o mouse com a coordenada, como numa prancha de desenho técnico.
function Crosshair() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = ref.current?.parentElement;
    if (!host || !window.matchMedia("(pointer: fine)").matches) return;
    const move = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      ref.current!.style.setProperty("--cx", `${x}px`);
      ref.current!.style.setProperty("--cy", `${y}px`);
      ref.current!.dataset.on = "";
      ref.current!.querySelector("span")!.textContent = `x ${String(Math.round(x)).padStart(4, "0")} · y ${String(Math.round(y)).padStart(4, "0")}`;
    };
    const leave = () => delete ref.current!.dataset.on;
    host.addEventListener("pointermove", move);
    host.addEventListener("pointerleave", leave);
    return () => {
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", leave);
    };
  }, []);
  return <div ref={ref} className="cross" aria-hidden="true"><span /></div>;
}
