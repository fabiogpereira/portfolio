"use client";

import { useEffect, useMemo, useRef, useState } from "react";

// Rango ao vivo: a busca com IA roda na tela, passo a passo. Simulação com lugares fictícios;
// modelo, dimensões e limiar de cosseno são os reais do Rango.
type Lang = "pt" | "en";
type Place = { name: string; meta: string; sim: number; friends: number; reaction?: "fav" | "liked" };
type Query = { q: string; places: Place[]; answer: string };

const QUERIES: Record<Lang, Query[]> = {
  pt: [
    {
      q: "um japonês bom e barato perto de mim",
      places: [
        { name: "Kobe Lámen", meta: "Liberdade · 1,9 km · $", sim: 0.88, friends: 0 },
        { name: "Hiro Omakase", meta: "Vila Madalena · 2,4 km · $$$", sim: 0.85, friends: 1, reaction: "liked" },
        { name: "Tanaka Temaki", meta: "Consolação · 0,8 km · $", sim: 0.83, friends: 2, reaction: "liked" },
        { name: "Sushi Kaze", meta: "Pinheiros · 1,2 km · $$", sim: 0.82, friends: 3, reaction: "fav" },
        { name: "Ume Izakaya", meta: "Bela Vista · 1,5 km · $$", sim: 0.78, friends: 0 },
      ],
      answer: "Pra hoje eu iria no Sushi Kaze: balcão de omakase com preço justo, e 3 amigos seus marcaram como favorito. Se quiser gastar ainda menos, o Tanaka Temaki fica a 800 m.",
    },
    {
      q: "bar com música ao vivo pra ir com os amigos hoje",
      places: [
        { name: "Esquina Jazz", meta: "Jardins · 3,1 km · $$$", sim: 0.87, friends: 0 },
        { name: "Casa do Choro Novo", meta: "Centro · 2,2 km · $", sim: 0.86, friends: 1, reaction: "liked" },
        { name: "Boteco Pé de Samba", meta: "Vila Madalena · 1,4 km · $$", sim: 0.84, friends: 4, reaction: "fav" },
        { name: "Taberna 7 Cordas", meta: "Bixiga · 2,7 km · $", sim: 0.8, friends: 2, reaction: "liked" },
        { name: "Bar Clave", meta: "Pinheiros · 1,0 km · $$", sim: 0.77, friends: 0 },
      ],
      answer: "Hoje tem samba às 21h no Boteco Pé de Samba, e 4 amigos seus amam o lugar. Chega antes das 20h30 que enche rápido.",
    },
    {
      q: "lugar tranquilo pra um primeiro encontro",
      places: [
        { name: "Café Aurora", meta: "Higienópolis · 2,0 km · $", sim: 0.86, friends: 0 },
        { name: "Bistrô Lume", meta: "Jardins · 2,6 km · $$$", sim: 0.85, friends: 1, reaction: "liked" },
        { name: "Cantina Nonna Lia", meta: "Bela Vista · 1,1 km · $$", sim: 0.83, friends: 3, reaction: "fav" },
        { name: "Quintal Verde", meta: "Pinheiros · 1,7 km · $$", sim: 0.81, friends: 2, reaction: "liked" },
        { name: "Vinheria Dona Rosa", meta: "Vila Mariana · 3,4 km · $$", sim: 0.79, friends: 0 },
      ],
      answer: "A Cantina Nonna Lia é uma aposta segura: luz baixa, mesas afastadas e massa feita na hora. Marina e mais 2 amigos marcaram como favorito.",
    },
  ],
  en: [
    {
      q: "good, cheap sushi near me",
      places: [
        { name: "Kobe Lámen", meta: "Liberdade · 1.9 km · $", sim: 0.88, friends: 0 },
        { name: "Hiro Omakase", meta: "Vila Madalena · 2.4 km · $$$", sim: 0.85, friends: 1, reaction: "liked" },
        { name: "Tanaka Temaki", meta: "Consolação · 0.8 km · $", sim: 0.83, friends: 2, reaction: "liked" },
        { name: "Sushi Kaze", meta: "Pinheiros · 1.2 km · $$", sim: 0.82, friends: 3, reaction: "fav" },
        { name: "Ume Izakaya", meta: "Bela Vista · 1.5 km · $$", sim: 0.78, friends: 0 },
      ],
      answer: "Tonight I'd go to Sushi Kaze: an omakase counter at a fair price, and 3 of your friends marked it as a favorite. If you want to spend even less, Tanaka Temaki is 800 m away.",
    },
    {
      q: "a bar with live music to go with friends tonight",
      places: [
        { name: "Esquina Jazz", meta: "Jardins · 3.1 km · $$$", sim: 0.87, friends: 0 },
        { name: "Casa do Choro Novo", meta: "Centro · 2.2 km · $", sim: 0.86, friends: 1, reaction: "liked" },
        { name: "Boteco Pé de Samba", meta: "Vila Madalena · 1.4 km · $$", sim: 0.84, friends: 4, reaction: "fav" },
        { name: "Taberna 7 Cordas", meta: "Bixiga · 2.7 km · $", sim: 0.8, friends: 2, reaction: "liked" },
        { name: "Bar Clave", meta: "Pinheiros · 1.0 km · $$", sim: 0.77, friends: 0 },
      ],
      answer: "There's samba at 9 pm at Boteco Pé de Samba tonight, and 4 of your friends love the place. Get there before 8:30, it fills up fast.",
    },
    {
      q: "a quiet place for a first date",
      places: [
        { name: "Café Aurora", meta: "Higienópolis · 2.0 km · $", sim: 0.86, friends: 0 },
        { name: "Bistrô Lume", meta: "Jardins · 2.6 km · $$$", sim: 0.85, friends: 1, reaction: "liked" },
        { name: "Cantina Nonna Lia", meta: "Bela Vista · 1.1 km · $$", sim: 0.83, friends: 3, reaction: "fav" },
        { name: "Quintal Verde", meta: "Pinheiros · 1.7 km · $$", sim: 0.81, friends: 2, reaction: "liked" },
        { name: "Vinheria Dona Rosa", meta: "Vila Mariana · 3.4 km · $$", sim: 0.79, friends: 0 },
      ],
      answer: "Cantina Nonna Lia is a safe bet: low light, tables far apart and fresh pasta. Marina and 2 other friends marked it as a favorite.",
    },
  ],
};

const COPY = {
  pt: {
    fig: "RANGO, DA PERGUNTA À RESPOSTA", live: "simulação · lugares fictícios", vecAria: "vetor da pergunta",
    s1: "01 · EMBEDDING", s2: "02 · BUSCA SEMÂNTICA · pgvector · cosseno ≥ 0,45", s3: "03 · REORDENA PELO QUE OS AMIGOS ACHARAM", s4: "04 · RESPOSTA · LLM",
    friend: "amigo", friends: "amigos", fav: "favorito", liked: "gostei",
    phases: ["digitando", "vetorizando", "buscando", "reordenando", "respondendo", "pronto"], dec: ",",
  },
  en: {
    fig: "RANGO, FROM QUESTION TO ANSWER", live: "simulation · fictional venues", vecAria: "question vector",
    s1: "01 · EMBEDDING", s2: "02 · SEMANTIC SEARCH · pgvector · cosine ≥ 0.45", s3: "03 · RE-RANK BY WHAT FRIENDS THOUGHT", s4: "04 · ANSWER · LLM",
    friend: "friend", friends: "friends", fav: "favorite", liked: "liked",
    phases: ["typing", "embedding", "searching", "re-ranking", "answering", "done"], dec: ".",
  },
};

const score = (p: Place) => p.sim * 0.62 + Math.min(p.friends, 4) * 0.095 + (p.reaction === "fav" ? 0.04 : 0);

// Números pseudoaleatórios estáveis por consulta, para o vetor "assentar" sempre no mesmo lugar.
function seeded(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647) * 2 - 1;
}

type Phase = 0 | 1 | 2 | 3 | 4 | 5; // 0 digitando · 1 vetor · 2 busca · 3 reordena · 4 resposta · 5 pronto
const DIM = 48;
const ROW = 38;

export function RangoLive({ lang, fig = "1" }: { lang: Lang; fig?: string }) {
  const c = COPY[lang];
  const list = QUERIES[lang];
  const box = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [qi, setQi] = useState(0);
  const [phase, setPhase] = useState<Phase>(0);
  const [typed, setTyped] = useState("");
  const [vec, setVec] = useState<number[]>(() => Array(DIM).fill(0));
  const [said, setSaid] = useState(0);
  const [ms, setMs] = useState(0);
  const [auto, setAuto] = useState(true);
  const runId = useRef(0);
  const query = list[qi];
  const fmt = (n: number) => n.toFixed(2).replace(".", c.dec);

  // Só começa quando aparece na tela, e para quando sai.
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.35 });
    if (box.current) io.observe(box.current);
    return () => io.disconnect();
  }, []);

  const order = useMemo(() => {
    const bySim = query.places.map((p, i) => ({ p, i })).sort((a, b) => b.p.sim - a.p.sim);
    const byScore = [...bySim].sort((a, b) => score(b.p) - score(a.p));
    return { bySim, byScore };
  }, [query]);

  useEffect(() => {
    const id = ++runId.current;
    const alive = () => id === runId.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rnd = seeded(qi * 7919 + 13);
    const final = Array.from({ length: DIM }, () => rnd());
    const timers: ReturnType<typeof setTimeout>[] = [];
    const later = (t: number, f: () => void) => timers.push(setTimeout(() => alive() && f(), t));

    if (reduce) {
      later(0, () => {
        setTyped(query.q);
        setVec(final);
        setSaid(query.answer.length);
        setPhase(5);
      });
      return () => timers.forEach(clearTimeout);
    }
    if (!visible) return;

    later(0, () => {
      setPhase(0);
      setTyped("");
      setSaid(0);
      setVec(Array(DIM).fill(0));
    });
    const t0 = performance.now();
    const clock = setInterval(() => alive() && setMs(Math.round(performance.now() - t0)), 37);

    const typeMs = query.q.length * 34;
    for (let i = 1; i <= query.q.length; i++) later(i * 34, () => setTyped(query.q.slice(0, i)));
    later(typeMs + 250, () => setPhase(1));
    for (let k = 0; k < 12; k++) later(typeMs + 250 + k * 55, () => setVec(Array.from({ length: DIM }, () => Math.random() * 2 - 1)));
    later(typeMs + 950, () => setVec(final));
    later(typeMs + 1200, () => setPhase(2));
    later(typeMs + 2300, () => setPhase(3));
    later(typeMs + 3300, () => setPhase(4));
    const start = typeMs + 3400;
    for (let i = 1; i <= query.answer.length; i++) later(start + i * 16, () => setSaid(i));
    const end = start + query.answer.length * 16;
    later(end + 100, () => {
      setPhase(5);
      clearInterval(clock);
    });
    if (auto) later(end + 4200, () => setQi((v) => (v + 1) % list.length));

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(clock);
    };
  }, [qi, auto, query, visible, list.length]);

  const ranked = phase >= 3 ? order.byScore : order.bySim;
  const pos = new Map(ranked.map((r, k) => [r.i, k]));
  const tokens = Math.round(said / 3.6);

  return (
    <figure className="rl" ref={box}>
      <div className="arch-head">
        <span className="label">FIG. {fig} · {c.fig}</span>
        <span className="label arch-live"><i />{c.live}</span>
      </div>

      <div className="rl-input">
        <span className="rl-prompt">›</span>
        <span className="rl-q">{typed}<b className={phase === 0 ? "caret" : "caret off"} /></span>
      </div>
      <div className="rl-try">
        {list.map((qq, k) => (
          <button key={qq.q} type="button" className={k === qi ? "on" : undefined} onClick={() => { setAuto(false); setQi(k); runId.current++; }}>
            {qq.q}
          </button>
        ))}
      </div>

      <ol className="rl-steps">
        <li className={phase >= 1 ? "done" : undefined} data-now={phase === 1 || undefined}>
          <span className="label">{c.s1}</span>
          <div className="vec" aria-label={c.vecAria}>
            {vec.map((v, k) => (
              <i key={k} style={{ opacity: 0.12 + Math.abs(v) * 0.88, background: v >= 0 ? "var(--accent)" : "var(--ink)" }} />
            ))}
          </div>
          <span className="vec-num">[{vec.slice(0, 6).map((v) => v.toFixed(3)).join(", ")}, … ] · 3072 dims · text-embedding-3-large</span>
        </li>

        <li className={phase >= 2 ? "done" : undefined} data-now={phase === 2 || phase === 3 || undefined}>
          <span className="label">{phase >= 3 ? c.s3 : c.s2}</span>
          <div className="rl-list" style={{ height: query.places.length * ROW }}>
            {query.places.map((p, i) => (
              <div key={p.name} className="rl-row" style={{ transform: `translateY(${(pos.get(i) ?? 0) * ROW}px)`, opacity: phase >= 2 ? 1 : 0, transitionDelay: phase === 2 ? `${(pos.get(i) ?? 0) * 70}ms, 0ms` : "0ms" }}>
                <span className="rl-k">{(pos.get(i) ?? 0) + 1}</span>
                <span className="rl-name"><b>{p.name}</b><small>{p.meta}</small></span>
                <span className="rl-fr">{phase >= 3 && p.friends > 0 && p.reaction ? `${p.friends} ${p.friends > 1 ? c.friends : c.friend} · ${c[p.reaction]}` : ""}</span>
                <span className="rl-bar"><i style={{ width: `${(phase >= 3 ? score(p) : p.sim) * 100}%` }} /></span>
                <span className="rl-s">{phase >= 3 ? fmt(score(p)) : fmt(p.sim)}</span>
              </div>
            ))}
          </div>
        </li>

        <li className={phase >= 4 ? "done" : undefined} data-now={phase === 4 || undefined}>
          <span className="label">{c.s4}</span>
          <p className="rl-answer">
            {query.answer.slice(0, said)}
            {phase === 4 && <b className="caret" />}
          </p>
        </li>
      </ol>

      <div className="rl-foot mono">
        <span>{(ms / 1000).toFixed(2).replace(".", c.dec)} s</span>
        <span>{tokens} tokens</span>
        <span>{c.phases[phase]}</span>
      </div>
    </figure>
  );
}
