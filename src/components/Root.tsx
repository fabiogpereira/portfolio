import type { ReactNode } from "react";
import { IBM_Plex_Mono, Schibsted_Grotesk } from "next/font/google";
import "../app/globals.css";
import "../app/demos.css";

const sans = Schibsted_Grotesk({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-sans", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono", display: "swap" });

// Cada idioma tem seu próprio layout raiz para o <html lang> sair certo no HTML estático.
export function Root({ lang, children }: { lang: string; children: ReactNode }) {
  return (
    <html lang={lang} className={`${sans.variable} ${mono.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body>
        {/* Marca que há JS antes do conteúdo pintar: só então as cenas começam escondidas para animar. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        {children}
      </body>
    </html>
  );
}
