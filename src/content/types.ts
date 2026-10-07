// Formato do conteúdo do site. Todo texto mora em pt.ts e en.ts; os componentes só desenham.
export type Lang = "pt" | "en";

export type Stat = { label: string; title: string; value: string; caption: string; href?: string };
export type Num = [value: string, label: string];
export type Link = { label: string; href: string };

// Vitrine de um projeto grande na página inicial
export type Project = {
  id: string;
  n: string; // "01"
  kicker: string;
  name: string;
  tagline: string;
  body: string;
  roleLabel: string;
  role: string;
  stats: Num[];
  tags: string[];
  cta: Link;
  figCaption: string;
  figNote: string;
};

// Capítulo dentro de um case
export type CaseSection = { title: string; body: string; figure?: "ai" | "enrich" | "platform" | "flow" | "invoice" | "identity" | "analyst"; items?: string[] };

export type CasePage = {
  crumb: string;
  next: Link;
  kicker: string;
  title: string;
  lead: string;
  stats: Num[];
  sections: CaseSection[];
  decisionsLabel: string;
  decisions: string[];
  lessonLabel: string;
  lesson: string;
  back: string;
};

export type Dict = {
  lang: Lang;
  meta: { title: string; description: string };
  nav: { projects: string; journey: string; contact: string; cases: string; other: string; otherHref: string; home: string; portfolio: string };
  ids: { espaces: string; erp: string; others: string; journey: string; how: string; contact: string };
  hero: { kicker: string; statement: string; sub: string; figCaption: string; start: string; stats: Stat[]; originLabel: string; originTitle: string };
  projectLabel: string; // "PROJETO"
  espaces: Project & { screens: { feed: string; rango: string; avaliar: string; lugar: string } };
  erp: Project & { before: string; notes: string[]; windowTitle: string; screens: { month: string; app: string } };
  others: {
    kicker: string;
    title: string;
    items: { kicker: string; title: string; body: string; stats: Num[]; tags: string[]; figure: "data" | "invoice"; link?: Link }[];
    social: {
      kicker: string;
      title: string;
      body: string;
      steps: string[];
      reels: { label: string; views?: string; photo?: string; ratio?: string; hint: string }[];
    };
  };
  journey: {
    kicker: string;
    title: string;
    lanes: { edu: string; plat: string; esp: string };
    graph: { year: string; lane: "edu" | "plat" | "esp"; tag: string }[];
    items: {
      year: string;
      title: string;
      text: string;
      detail: { body: string; points: string[]; stat?: Num; tags?: string[]; links?: Link[] };
    }[];
  };
  how: {
    kicker: string;
    title: string;
    body: string;
    hint: string;
    circles: { b: string; s: string; a: string };
    regions: { key: "b" | "s" | "a" | "bs" | "sa" | "ba" | "bsa"; label: string; text: string }[];
  };
  figures: {
    illustrative: string;
    enrichLabel: string; enrichItems: string[];
    builtLabel: string; builtItems: string[]; stackLabel: string; stack: string[];
  };
  foundations: {
    kicker: string;
    title: string;
    verify: string;
    degree: { years: string; title: string; school: string; items: { title: string; text: string }[] };
    certsLabel: string;
    certs: { year: string; title: string; issuer: string; note?: string; href?: string }[];
  };
  life: { kicker: string; title: string; photoMissing: string; items: { title: string; tag?: string; text: string; photo?: string; photoPos?: string; screen?: boolean; light?: boolean; chart?: boolean; framed?: boolean; caption?: string; photoHint: string }[] };
  contact: { kicker: string; title: string; text: string; email: string; copy: string; copied: string; cv: string; place: string };
  footer: { made: string };
  espacesCase: CasePage & { galleryCaption: string; gallery: [string, string][] };
  notasCase: CasePage & { specLabel: string; spec: Num[] };
  cdpCase: CasePage & { specLabel: string; spec: Num[] };
  erpCase: CasePage & {
    specLabel: string; spec: Num[];
    screensCaption: string; screensNote: string; screens: [shot: string, label: string][];
    stepsLabel: string; steps: [string, string][];
  };
};
