import Image from "next/image";
import Link from "next/link";
import type { Dict, Num, Project } from "@/content/types";
import { ErpStage, EspacesStage } from "./Figures";
import { InvoiceCheck } from "./demos/InvoiceCheck";
import { Timeline } from "./Timeline";
import { Venn } from "./Venn";
import { Poker } from "./Poker";
import { Particles } from "./demos/Particles";
import { CopyEmail } from "./CopyEmail";
import { ph, rich } from "./ph";
import { asset } from "@/lib/asset";
import photo from "../../public/fabio.jpg";

export function Hero({ d }: { d: Dict }) {
  const h = d.hero;
  return (
    <section className="wrap hero" data-scene data-in="" data-nav="" aria-label={d.meta.title}>
      <div className="grid hero-main">
        <div className="hero-text">
          <span className="mono">{h.kicker}</span>
          <h1>Fábio<br />Pereira<span className="accent">.</span></h1>
          <p className="statement">{h.statement}</p>
          <p className="sub">{h.sub}</p>
        </div>
        <figure className="photo">
          <Image src={photo} alt="Fábio Pereira" priority sizes="(max-width: 900px) 280px, 22vw" placeholder="blur" />
          <figcaption className="cap"><span>Fig. 1</span><span>{h.figCaption}</span></figcaption>
        </figure>
      </div>
      <div className="cols ruled hero-stats">
        {h.stats.map((s) => (
          <Link key={s.label} href={s.href ?? "#"} className="hero-stat">
            <span className="label">{s.label}</span>
            <div className="hs-title">{s.title}</div>
            <div className="hs-value">{s.value}</div>
            <div className="hs-cap">{s.caption}</div>
          </Link>
        ))}
        <div className="hs-origin">
          <span className="label">{h.originLabel}</span>
          <div className="hs-title">{h.originTitle}</div>
          <Link href={`#${d.ids.espaces}`} className="hs-start">{h.start} <span aria-hidden="true">↓</span></Link>
        </div>
      </div>
    </section>
  );
}

export function Stats({ stats, className = "" }: { stats: Num[]; className?: string }) {
  return (
    <div className={`cols ruled-both stats ${className}`}>
      {stats.map(([v, l]) => (
        <div key={l}><div className="stat-xl">{v}</div><p className="stat-cap">{l}</p></div>
      ))}
    </div>
  );
}

function ProjectText({ p, d }: { p: Project; d: Dict }) {
  return (
    <div className="proj-text">
      <span className="mono rise">{d.projectLabel} {p.n} · {p.kicker}</span>
      <h2 className="proj-name rise d1" id={`${p.id}-t`}>{p.name}<span className="accent">.</span></h2>
      <p className="proj-tagline rise d1">{p.tagline}</p>
      <p className="proj-body rise d2">{rich(p.body)}</p>
      <div className="proj-role rise d2">
        <span className="label">{p.roleLabel}</span>
        <p>{p.role}</p>
      </div>
      {p.stats.length > 0 && <Stats stats={p.stats} className="proj-stats rise d3" />}
      <div className="proj-foot rise d3">
        <div className="chips">{p.tags.map((t) => <span key={t} className="chip">{ph(t)}</span>)}</div>
        <Link href={p.cta.href} className="more">{p.cta.label} <span aria-hidden="true">→</span></Link>
      </div>
    </div>
  );
}

export function EspacesProject({ d }: { d: Dict }) {
  const p = d.espaces;
  return (
    <section className="wrap scene proj" id={d.ids.espaces} data-scene data-nav="projects" aria-labelledby={`${p.id}-t`}>
      <div className="grid proj-grid">
        <ProjectText p={p} d={d} />
        <div className="proj-media"><EspacesStage d={d} /></div>
      </div>
    </section>
  );
}

export function ErpProject({ d }: { d: Dict }) {
  const p = d.erp;
  return (
    <section className="wrap scene proj proj-flip" id={d.ids.erp} data-scene data-nav="projects" aria-labelledby={`${p.id}-t`}>
      <div className="grid proj-grid">
        <div className="proj-media"><ErpStage d={d} /></div>
        <ProjectText p={p} d={d} />
      </div>
    </section>
  );
}

export function Others({ d }: { d: Dict }) {
  const o = d.others;
  return (
    <section className="wrap scene" id={d.ids.others} data-scene data-nav="projects" aria-labelledby="others-t">
      <span className="mono rise">{o.kicker}</span>
      <h2 className="h2-xl rise d1" id="others-t">{o.title}</h2>
      <div className="others">
        {o.items.map((it, i) => (
          <article key={it.title} className={`other rise d${i + 1}`}>
            <span className="mono">{it.kicker}</span>
            <h3>{it.title}</h3>
            <p className="other-body">{rich(it.body)}</p>
            <div className="other-fig">
              {it.figure === "data" ? <Particles lang={d.lang} fig="4" /> : <InvoiceCheck lang={d.lang} fig="5" compact />}
            </div>
            <div className="other-foot">
              <div className="chips">{it.tags.map((t) => <span key={t} className="chip">{t}</span>)}</div>
              {it.link && <Link href={it.link.href} className="more">{it.link.label} <span aria-hidden="true">→</span></Link>}
            </div>
          </article>
        ))}
      </div>

      <div className="social rise d2">
        <div className="social-text">
          <span className="mono">{o.social.kicker}</span>
          <h3>{o.social.title}</h3>
          <p>{rich(o.social.body)}</p>
          <div className="flowline social-steps">
            {o.social.steps.map((st, i) => (
              <span key={st} style={{ display: "contents" }}>
                {i > 0 && <span className="accent" aria-hidden="true">→</span>}
                {i === o.social.steps.length - 1 ? <b>{st}</b> : <span>{st}</span>}
              </span>
            ))}
          </div>
        </div>
        <div className="reels">
          {o.social.reels.map((r, i) => (
            <figure key={r.label} className="reel" data-i={i}>
              <div className="reel-shot" style={r.ratio ? { aspectRatio: r.ratio } : undefined}>
                {r.photo ? (
                  <Image src={asset(r.photo)} alt={r.label} fill sizes="(max-width: 900px) 45vw, 22vw" style={{ objectFit: "cover" }} />
                ) : (
                  <div className="reel-ph"><span className="mono">{ph(r.hint)}</span></div>
                )}
                {r.views && <span className="reel-views">▶ {r.views}</span>}
              </div>
              <figcaption className="mono">{r.label}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Journey({ d }: { d: Dict }) {
  const j = d.journey;
  return (
    <section className="wrap scene journey" id={d.ids.journey} data-scene data-nav="journey" aria-labelledby="journey-t">
      <span className="mono rise">{j.kicker}</span>
      <h2 className="h2-xl rise d1" id="journey-t">{j.title}</h2>
      <span className="mono tl-hint rise d2">{d.lang === "pt" ? "Passe o mouse ou toque em um ano" : "Hover or tap a year"}</span>
      <div className="rise d2"><Timeline j={j} /></div>
    </section>
  );
}

export function How({ d }: { d: Dict }) {
  const h = d.how;
  return (
    <section className="wrap scene how" id={d.ids.how} data-scene data-nav="journey" aria-labelledby="how-t">
      <span className="mono rise">{h.kicker}</span>
      <h2 className="rise d1" id="how-t">
        {h.title.split("×").map((part, i) => (
          <span key={i}>{i > 0 && <span className="accent">×</span>}{part}</span>
        ))}
      </h2>
      <div className="rise d2"><Venn how={h} /></div>
    </section>
  );
}

export function Foundations({ d }: { d: Dict }) {
  const fo = d.foundations;
  const li = d.life;
  return (
    <section className="wrap scene found-sec" data-scene data-nav="journey" aria-labelledby="fund-t">
      <div className="grid found-block">
        <div className="found-head">
          <span className="mono rise">{fo.kicker}</span>
          <h2 className="h2-xl rise d1" id="fund-t">{fo.title}</h2>
        </div>
        <div className="found-body rows rise d2">
          <div className="row">
            <span className="mono">{fo.degree.years}</span>
            <span>
              <b>{fo.degree.title}</b>
              <small>{fo.degree.school}</small>
              {fo.degree.items.map((x) => (
                <span key={x.title} className="row-sub"><b>{x.title}</b><small>{x.text}</small></span>
              ))}
            </span>
          </div>
          {fo.certs.map((c) => (
            <div key={c.title} className="row">
              <span className="mono">{c.year}</span>
              <span><b>{c.title}</b><small>{c.note ? `${c.issuer} · ${c.note}` : c.issuer}</small></span>
            </div>
          ))}
        </div>
      </div>

      <div className="life-block">
        <span className="mono rise">{li.kicker}</span>
        <h2 className="h2-xl rise d1">{li.title}</h2>
        <div className="life-cards rise d2">
          {li.items.map((it, i) => (
            <article key={it.title} className="life-card" data-i={i} data-light={it.light || undefined}>
              {it.photo && it.framed ? (
                <div className="life-framed"><div className="life-framed-img"><Image src={asset(it.photo)} alt={it.title} fill sizes="(max-width: 900px) 90vw, 30vw" style={{ objectFit: "cover" }} /></div></div>
              ) : it.photo && it.screen ? (
                <div className="life-screen"><div className="life-phone"><Image src={asset(it.photo)} alt={it.title} fill sizes="260px" className="life-photo" style={{ objectPosition: "50% 4%" }} /></div></div>
              ) : it.photo ? (
                <Image src={asset(it.photo)} alt={it.caption ? `${it.title} · ${it.caption}` : it.title} fill sizes="(max-width: 900px) 90vw, 30vw" className="life-photo" style={{ objectPosition: it.photoPos }} />
              ) : it.chart ? (
                <div className="life-chart"><Poker /></div>
              ) : (
                <div className="life-ph"><span className="mono">{ph(it.photoHint)}</span></div>
              )}
              <div className="life-shade" />
              <div className="life-over">
                <div className="life-top">
                  <span className="life-n">{String(i + 1).padStart(2, "0")}</span>
                  {it.caption && <span className="life-cap">{it.caption}</span>}
                </div>
                <div className="life-bottom">
                  {it.tag && <span className="life-tag">{it.tag}</span>}
                  <h3>{it.title}</h3>
                  <p>{it.text}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Contact({ d }: { d: Dict }) {
  const c = d.contact;
  const words = c.title.replace(/\?$/, "").split(" ");
  const tail = words.pop();
  return (
    <section className="contact" id={d.ids.contact} data-scene data-nav="contact" aria-labelledby="contact-t">
      <div className="wrap scene">
        <span className="mono rise">{c.kicker}</span>
        <h2 className="rise d1" id="contact-t">
          {words.join(" ")}<br />{tail}<span className="accent">?</span>
        </h2>
        <p className="contact-text rise d2">{c.text}</p>
        <div className="actions rise d3">
          <CopyEmail email={c.email} copy={c.copy} copied={c.copied} />
          <a className="btn" href="https://www.linkedin.com/in/fabiogpereira/" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
        </div>
        <div className="contact-gap" />
        <footer className="foot">
          <span>© 2026 Fábio Gofferjé Pereira</span>
          <span className="mono">{c.place} · PT / EN</span>
          <span>{d.footer.made}</span>
        </footer>
      </div>
    </section>
  );
}
