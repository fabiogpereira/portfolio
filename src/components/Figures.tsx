import Image, { type StaticImageData } from "next/image";
import type { Dict } from "@/content/types";
import feed from "../../public/espaces/feed.png";
import rango from "../../public/espaces/rango.png";
import avaliar from "../../public/espaces/avaliar.png";
import lugar from "../../public/espaces/lugar.png";
import eventosMes from "../../public/erp/eventos-mes.png";
import clientes from "../../public/erp/clientes.png";
import contratos from "../../public/erp/contratos.png";
import receber from "../../public/erp/receber.png";
import app from "../../public/erp/app.png";

type F = Dict["figures"];

// Telas do app refeitas em código para o vídeo de lançamento (lugares e pessoas fictícios).
export const screens: Record<"feed" | "rango" | "avaliar" | "lugar", StaticImageData> = { feed, rango, avaliar, lugar };

// Telas de apresentação do ERP, com dado de exemplo.
export const erpScreens: Record<string, StaticImageData> = { "eventos-mes": eventosMes, clientes, contratos, receber, app };

export function Phone({ shot, alt, sizes, priority }: { shot: keyof typeof screens; alt: string; sizes: string; priority?: boolean }) {
  return <Image className="phone-img" src={screens[shot]} alt={alt} sizes={sizes} priority={priority} />;
}

// Três celulares lado a lado: o do meio na frente.
export function EspacesStage({ d }: { d: Dict }) {
  const s = d.espaces.screens;
  return (
    <figure className="stage-fig">
      <div className="stage stage-phones">
        <div className="ph side rise d1"><Phone shot="feed" alt={s.feed} sizes="(max-width: 900px) 34vw, 15vw" /></div>
        <div className="ph mid rise"><Phone shot="rango" alt={s.rango} sizes="(max-width: 900px) 42vw, 19vw" /></div>
        <div className="ph side rise d2"><Phone shot="lugar" alt={s.lugar} sizes="(max-width: 900px) 34vw, 15vw" /></div>
      </div>
      <figcaption className="cap"><span>{d.espaces.figCaption}</span><span>{d.espaces.figNote}</span></figcaption>
    </figure>
  );
}

// Janela do sistema. Enquanto não houver print, mostra o espaço reservado.
export function ErpStage({ d }: { d: Dict }) {
  const e = d.erp;
  return (
    <figure className="stage-fig">
      <div className="stage stage-erp">
        <div className="erp-shots">
          <div className="win rise">
            <div className="win-bar"><i /><i /><i /><span>{e.windowTitle}</span></div>
            <Image src={eventosMes} alt={e.screens.month} sizes="(max-width: 900px) 92vw, 50vw" placeholder="blur" />
          </div>
          <div className="erp-phone rise d2">
            <Image src={app} alt={e.screens.app} sizes="(max-width: 900px) 30vw, 12vw" placeholder="blur" />
          </div>
        </div>
        <div className="before rise d2">
          <span className="label">{e.before}</span>
          <div className="before-notes">{e.notes.map((n) => <s key={n}>{n}</s>)}</div>
        </div>
      </div>
      <figcaption className="cap"><span>{e.figCaption}</span><span>{e.figNote}</span></figcaption>
    </figure>
  );
}

export function EnrichFigure({ f }: { f: F }) {
  return (
    <div className="cols ruled-both">
      <div>
        <span className="label">{f.enrichLabel}</span>
        <div className="list strong">{f.enrichItems.map((x) => <span key={x}>{x}</span>)}</div>
      </div>
    </div>
  );
}

export function PlatformFigure({ f }: { f: F }) {
  return (
    <div className="cols ruled-both">
      <div>
        <span className="label">{f.builtLabel}</span>
        <div className="list strong">{f.builtItems.map((x) => <span key={x}>{x}</span>)}</div>
      </div>
      <div>
        <span className="label">{f.stackLabel}</span>
        <div className="chips">{f.stack.map((t) => <span key={t} className="chip">{t}</span>)}</div>
      </div>
    </div>
  );
}
