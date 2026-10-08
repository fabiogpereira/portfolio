// Caminho de arquivo em /public com o prefixo do site (no GitHub Pages, /portfolio).
export const asset = (path: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;
