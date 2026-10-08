// O export do Next 16 grava os arquivos de prefetch em pastas (__next.!X/cases/erp/__PAGE__.txt),
// mas o navegador pede o nome com pontos (__next.!X.cases.erp.__PAGE__.txt). Num host estático
// como o GitHub Pages isso dá 404; aqui criamos a cópia com o nome que o navegador pede.
import fs from "node:fs";
import path from "node:path";

const out = path.resolve(process.argv[2] ?? "out");
let n = 0;

function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (!e.isDirectory() || e.name === "_next") continue;
    if (e.name.startsWith("__next.")) flatten(p, dir, e.name);
    else walk(p);
  }
}

function flatten(root, parent, prefix) {
  const stack = [[root, []]];
  while (stack.length) {
    const [d, parts] = stack.pop();
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) stack.push([p, [...parts, e.name]]);
      else {
        fs.copyFileSync(p, path.join(parent, [prefix, ...parts, e.name].join(".")));
        n++;
      }
    }
  }
}

walk(out);
console.log(`prefetch: ${n} arquivos copiados com nome plano`);
