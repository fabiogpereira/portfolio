import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import type { CasePage, CaseSection, Dict } from "@/content/types";
import { Header, LangSwitch } from "./Header";
import { EnrichFigure, PlatformFigure, Phone, erpScreens } from "./Figures";
import { ShowFlow } from "./demos/ShowFlow";
import { InvoiceCheck } from "./demos/InvoiceCheck";
import { IdentityMerge } from "./demos/IdentityMerge";
import { AiAnalyst } from "./demos/AiAnalyst";
import { RangoLive } from "./demos/RangoLive";
import { Architecture } from "./demos/Architecture";
import { Contact, EspacesProject, ErpProject, Foundations, Hero, How, Journey, Others, Stats } from "./Sections";
import { ph, rich } from "./ph";

// Origem do site (SITE_URL no build do GitHub Pages); os caminhos levam o prefixo do site (B).
const SITE = process.env.SITE_URL
  ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

const prefix = (d: Dict) => (d.nav.home === "/" ? "" : d.nav.home);
const B = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function homeMetadata(d: Dict): Metadata {
  return {
    metadataBase: new URL(SITE),
    title: d.meta.title,
    description: d.meta.description,
    alternates: { canonical: `${B}${d.nav.home}`, languages: { "pt-BR": `${B}/`, en: `${B}/en` } },
    openGraph: { title: d.meta.title, description: d.meta.description, type: "website", locale: d.lang === "pt" ? "pt_BR" : "en_US" },
  };
}

export function caseMetadata(d: Dict, slug: "espaces" | "erp" | "notas" | "dados"): Metadata {
  const c = slug === "espaces" ? d.espacesCase : slug === "erp" ? d.erpCase : slug === "notas" ? d.notasCase : d.cdpCase;
  return {
    metadataBase: new URL(SITE),
    title: `${c.title} · Fábio Pereira`,
    description: c.lead,
    alternates: { canonical: `${B}${prefix(d)}/cases/${slug}`, languages: { "pt-BR": `${B}/cases/${slug}`, en: `${B}/en/cases/${slug}` } },
  };
}

export function HomePage({ d }: { d: Dict }) {
  return (
    <>
      <a className="skip" href={`#${d.ids.espaces}`}>{d.nav.projects}</a>
      <Header nav={d.nav} ids={d.ids} />
      <main>
        <Hero d={d} />
        <EspacesProject d={d} />
        <ErpProject d={d} />
        <Others d={d} />
        <Journey d={d} />
        <How d={d} />
        <Foundations d={d} />
      </main>
      <Contact d={d} />
    </>
  );
}

function CaseHeader({ d, c, slug }: { d: Dict; c: CasePage; slug: string }) {
  const otherLang = d.nav.otherHref === "/" ? `/cases/${slug}` : `${d.nav.otherHref}/cases/${slug}`;
  return (
    <header className="top">
      <div className="wrap">
        <div className="top-in">
          <div className="crumbs">
            <Link href={d.nav.home} className="top-name">Fábio Pereira</Link>
            <span className="sep">/</span>
            <Link href={`${d.nav.home}#${d.ids.espaces}`}>{d.nav.cases}</Link>
            <span className="sep">/</span>
            <span>{c.crumb}</span>
            <Link href={c.next.href} className="mono crumb-next">{c.next.label.toUpperCase()} →</Link>
          </div>
          <LangSwitch nav={d.nav} href={otherLang} />
        </div>
      </div>
    </header>
  );
}

function CaseHead({ c }: { c: CasePage }) {
  return (
    <div className="grid case-top">
      <div className="case-head">
        <span className="mono">{c.kicker}</span>
        <h1>{c.title}</h1>
        <p className="case-lead">{rich(c.lead)}</p>
      </div>
      {c.stats.length > 0 && <Stats stats={c.stats} className="case-stats" />}
    </div>
  );
}

function CaseEnd({ d, c }: { d: Dict; c: CasePage }) {
  return (
    <>
      <div className="grid case-end">
        <section className="decisions">
          <span className="mono">{c.decisionsLabel}</span>
          <ol>
            {c.decisions.map((x, i) => (
              <li key={i}><span>{String.fromCharCode(65 + i)}</span><span>{ph(x)}</span></li>
            ))}
          </ol>
        </section>
        <aside className="lesson">
          <span className="mono">{c.lessonLabel}</span>
          <p>{ph(c.lesson)}</p>
        </aside>
      </div>
      <nav className="case-nav">
        <Link href={`${d.nav.home}#${d.ids.espaces}`} className="more"><span aria-hidden="true">←</span> {c.back}</Link>
        <Link href={c.next.href} className="more">{c.next.label} <span aria-hidden="true">→</span></Link>
      </nav>
    </>
  );
}

// Capítulos numerados de um case. As peças vivas (Rango, fluxo do show) ocupam a largura toda.
function CaseSections({ d, sections }: { d: Dict; sections: CaseSection[] }) {
  return (
    <div className="case-sections">
      {sections.map((s, i) => {
        const demo = s.figure === "ai" || s.figure === "flow" || s.figure === "invoice" || s.figure === "identity" || s.figure === "analyst";
        const side = s.figure === "enrich" || s.figure === "platform";
        const head = (
          <>
            <span className="case-n">{String(i + 1).padStart(2, "0")}</span>
            <h2>{s.title}</h2>
          </>
        );
        const text = (
          <>
            <p>{s.body}</p>
            {s.items && <ul className="case-items">{s.items.map((x) => <li key={x}>{x}</li>)}</ul>}
          </>
        );
        return (
          <section key={s.title} className={`grid case-sec${demo ? " has-demo" : ""}${side ? " has-side" : ""}`}>
            {side ? (
              <>
                <div className="case-sec-head case-sec-text">{head}{text}{s.figure === "platform" && <PlatformFigure f={d.figures} />}</div>
                <div className="case-sec-body">
                  {s.figure === "enrich" && <EnrichFigure f={d.figures} />}
                  {s.figure === "platform" && <Architecture lang={d.lang} fig="3" />}
                </div>
              </>
            ) : (
              <>
                <div className="case-sec-head">{head}</div>
                <div className="case-sec-body">{text}</div>
              </>
            )}
            {s.figure === "ai" && <div className="case-demo"><RangoLive lang={d.lang} fig="2" /></div>}
            {s.figure === "flow" && <div className="case-demo"><ShowFlow lang={d.lang} fig="2" /></div>}
            {s.figure === "invoice" && <div className="case-demo"><InvoiceCheck lang={d.lang} fig="1" /></div>}
            {s.figure === "identity" && <div className="case-demo"><IdentityMerge lang={d.lang} fig="1" /></div>}
            {s.figure === "analyst" && <div className="case-demo"><AiAnalyst lang={d.lang} fig="2" /></div>}
          </section>
        );
      })}
    </div>
  );
}

export function EspacesCasePage({ d }: { d: Dict }) {
  const c = d.espacesCase;
  return (
    <>
      <CaseHeader d={d} c={c} slug="espaces" />
      <main className="wrap case" data-scene data-in="">
        <CaseHead c={c} />

        <figure className="gallery-fig">
          <div className="gallery">
            {c.gallery.map(([shot, label], i) => (
              <figure key={shot} className="gallery-item">
                <Phone shot={shot as "feed"} alt={label} sizes="(max-width: 640px) 70vw, (max-width: 1100px) 40vw, 22vw" priority={i < 2} />
                <figcaption className="label">{String(i + 1).padStart(2, "0")} · {label}</figcaption>
              </figure>
            ))}
          </div>
          <figcaption className="cap"><span>{c.galleryCaption}</span><span>{d.espaces.figNote}</span></figcaption>
        </figure>

        <CaseSections d={d} sections={c.sections} />

        <CaseEnd d={d} c={c} />
      </main>
      <Contact d={d} />
    </>
  );
}

export function NotasCasePage({ d }: { d: Dict }) {
  const c = d.notasCase;
  return (
    <>
      <CaseHeader d={d} c={c} slug="notas" />
      <main className="wrap case" data-scene data-in="">
        <CaseHead c={c} />
        <section className="spec-sec" aria-label={c.specLabel}>
          <span className="mono">{c.specLabel}</span>
          <Stats stats={c.spec} className="spec-strip" />
        </section>
        <CaseSections d={d} sections={c.sections} />
        <CaseEnd d={d} c={c} />
      </main>
      <Contact d={d} />
    </>
  );
}

export function CdpCasePage({ d }: { d: Dict }) {
  const c = d.cdpCase;
  return (
    <>
      <CaseHeader d={d} c={c} slug="dados" />
      <main className="wrap case" data-scene data-in="">
        <CaseHead c={c} />
        <section className="spec-sec" aria-label={c.specLabel}>
          <span className="mono">{c.specLabel}</span>
          <Stats stats={c.spec} className="spec-strip" />
        </section>
        <CaseSections d={d} sections={c.sections} />
        <CaseEnd d={d} c={c} />
      </main>
      <Contact d={d} />
    </>
  );
}

export function ErpCasePage({ d }: { d: Dict }) {
  const c = d.erpCase;
  const [main, ...rest] = c.screens;
  return (
    <>
      <CaseHeader d={d} c={c} slug="erp" />
      <main className="wrap case" data-scene data-in="">
        <CaseHead c={c} />

        <section className="spec-sec" aria-label={c.specLabel}>
          <span className="mono">{c.specLabel}</span>
          <Stats stats={c.spec} className="spec-strip" />
        </section>

        <figure className="erp-gallery-fig">
          <div className="erp-gallery">
            <figure className="erp-shot big">
              <Image src={erpScreens[main[0]]} alt={main[1]} sizes="(max-width: 900px) 100vw, 1296px" placeholder="blur" priority />
              <figcaption className="label">01 · {main[1]}</figcaption>
            </figure>
            {rest.map(([shot, label], i) => (
              <figure key={shot} className="erp-shot">
                <Image src={erpScreens[shot]} alt={label} sizes="(max-width: 900px) 100vw, 430px" placeholder="blur" />
                <figcaption className="label">{String(i + 2).padStart(2, "0")} · {label}</figcaption>
              </figure>
            ))}
          </div>
          <figcaption className="cap"><span>{c.screensCaption}</span><span>{c.screensNote}</span></figcaption>
        </figure>

        <CaseSections d={d} sections={c.sections} />

        <section className="steps-sec" aria-label={c.stepsLabel}>
          <span className="mono">{c.stepsLabel}</span>
          <div className="cols ruled-both steps steps-4">
            {c.steps.map(([title, text], i) => (
              <div key={title}>
                <span className="label">{String(i + 1).padStart(2, "0")}</span>
                <b>{title}</b>
                <p>{ph(text)}</p>
              </div>
            ))}
          </div>
        </section>
        <CaseEnd d={d} c={c} />
      </main>
      <Contact d={d} />
    </>
  );
}
