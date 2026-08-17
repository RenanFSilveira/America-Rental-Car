/**
 * Checklist de aceite automatizável da página.
 *
 * Roda contra o HTML servido pelo build e contra o código-fonte. O que depende
 * de navegador de verdade (disparo das conversões) está em scripts/verificar-tags.mjs.
 *
 * Uso: node scripts/validar.mjs [url]   (padrão http://localhost:3210)
 */
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";

const raiz = path.resolve(import.meta.dirname, "..");
const base = process.argv[2] ?? "http://localhost:3210";

const resultados = [];
const ok = (nome, detalhe = "") => resultados.push({ ok: true, nome, detalhe });
const falha = (nome, detalhe = "") =>
  resultados.push({ ok: false, nome, detalhe });

const html = await (await fetch(base)).text();
const fonte = await lerRecursivo(path.join(raiz, "src"));
const cliente = await lerRecursivo(path.join(raiz, "dist", "client"), [
  ".js",
  ".css",
  ".html",
]);

async function lerRecursivo(dir, extensoes = [".ts", ".tsx", ".css"]) {
  const arquivos = [];
  async function andar(atual) {
    for (const item of await readdir(atual, { withFileTypes: true })) {
      const caminho = path.join(atual, item.name);
      if (item.isDirectory()) await andar(caminho);
      else if (extensoes.includes(path.extname(item.name))) {
        arquivos.push({
          caminho: path.relative(raiz, caminho),
          texto: await readFile(caminho, "utf8"),
        });
      }
    }
  }
  await andar(dir);
  return arquivos;
}

/* ---------------- links e navegação ---------------- */

const WHATSAPP = {
  "Vila Velha": "5527999729448",
  Vitória: "5527999446195",
  Guarapari: "5527999713349",
  Empresas: "5527988801118",
};

for (const [loja, numero] of Object.entries(WHATSAPP)) {
  html.includes(`https://wa.me/${numero}`)
    ? ok(`WhatsApp ${loja}`, numero)
    : falha(`WhatsApp ${loja}`, `${numero} não encontrado no HTML servido`);
}

const TELEFONES = ["tel:+552733202828", "tel:+552733178583", "tel:+552733615435"];
for (const telefone of TELEFONES) {
  html.includes(telefone)
    ? ok(`Telefone discável ${telefone}`)
    : falha(`Telefone discável ${telefone}`, "ausente no HTML servido");
}

html.includes('href="#"')
  ? falha("Sem href placeholder", 'existe href="#" no HTML')
  : ok("Sem href placeholder");

const encurtadores = ["bit.ly", "linktr.ee", "tinyurl", "cutt.ly"];
const achouEncurtador = [...cliente, ...fonte].filter((a) =>
  encurtadores.some((e) => a.texto.includes(e)),
);
achouEncurtador.length === 0
  ? ok("Sem encurtador de link")
  : falha(
      "Sem encurtador de link",
      achouEncurtador.map((a) => a.caminho).join(", "),
    );

const httpInseguro = [...html.matchAll(/http:\/\/(?!localhost|127\.0\.0\.1)[^"'\s]+/g)];
httpInseguro.length === 0
  ? ok("Todo link externo é https")
  : falha("Todo link externo é https", httpInseguro.map((m) => m[0]).join(", "));

const mensagem = "vi%20seu%20an%C3%BAncio%20no%20Google";
html.includes(mensagem)
  ? ok("Mensagem pré-preenchida com acento", "codificada com encodeURIComponent")
  : falha("Mensagem pré-preenchida com acento", "não encontrada no HTML servido");

/* ---------------- rastreamento ---------------- */

const CONVERSOES = {
  "Vila Velha": "AW-866527260/wSEpCKrk1-8DEJzQmJ0D",
  Vitória: "AW-866527260/vsE_CLGxiPADEJzQmJ0D",
  Guarapari: "AW-866527260/nz7rCMno1-8DEJzQmJ0D",
  Empresas: "AW-866527260/mZ5XCPrsuKUcEJzQmJ0D",
};

for (const [loja, rotulo] of Object.entries(CONVERSOES)) {
  const noHtml = html.includes(rotulo);
  const noBundle = cliente.some((a) => a.texto.includes(rotulo));
  noHtml || noBundle
    ? ok(`Rótulo de conversão ${loja}`, rotulo)
    : falha(`Rótulo de conversão ${loja}`, `${rotulo} não chegou ao navegador`);
}

html.includes("googletagmanager.com/gtag/js?id=AW-866527260")
  ? ok("gtag carregado")
  : falha("gtag carregado", "script do gtag ausente");

html.includes("gtag('config', 'AW-866527260')")
  ? ok("config do Google Ads")
  : falha("config do Google Ads", "ausente");

html.includes("gtag('config', 'G-3PHBH2YTJ2')")
  ? ok("config do GA4")
  : falha("config do GA4", "ausente");

html.includes("UA-88788246-2")
  ? falha("Universal Analytics fora", "UA ainda presente")
  : ok("Universal Analytics fora");

html.includes("GTM-TPGZ6MV")
  ? falha("GTM fora", "contêiner do GTM presente")
  : ok("GTM fora");

/* UTM: só leitura, nunca escrita */
const escritaDeUtm = fonte.filter((a) => /utm_[a-z]+=/.test(a.texto));
escritaDeUtm.length === 0
  ? ok("Nenhuma UTM fixa no código")
  : falha(
      "Nenhuma UTM fixa no código",
      escritaDeUtm.map((a) => a.caminho).join(", "),
    );

/* ---------------- conteúdo ---------------- */

// "mais de 35 anos" é afirmação do próprio cliente, enviada em 17/08/2026, e
// por isso é permitida. Qualquer outro número de anos continua barrado, assim
// como preço, horário e selo, que seguem sem fonte.
const conteudoAprovado = [/mais de 35 anos/i, /\+35 anos/i];
const proibidos = [
  /\bR\$\s?\d/,
  /\b24\s?h(oras)?\b/i,
  /\b\d+\s+anos\b/i,
  /\b\d+\s*(estrelas|avalia)/i,
  /\bISO\s?9001\b/i,
];
const conteudoVisivel = html
  .replace(/<script[\s\S]*?<\/script>/g, "")
  .replace(/<[^>]+>/g, " ");
const semAprovados = conteudoAprovado.reduce(
  (texto, aprovado) => texto.replace(new RegExp(aprovado, "gi"), ""),
  conteudoVisivel,
);
const achouProibido = proibidos.filter((r) => r.test(semAprovados));
achouProibido.length === 0
  ? ok("Sem preço, horário ou número inventado no texto visível")
  : falha(
      "Sem preço, horário ou número inventado no texto visível",
      achouProibido.map(String).join(", "),
    );

html.includes('lang="pt-BR"')
  ? ok('lang="pt-BR"')
  : falha('lang="pt-BR"', "ausente");

html.includes("@Lovable") || html.toLowerCase().includes("lovable")
  ? falha("Sem resquício do repo de referência", "menção a Lovable no HTML")
  : ok("Sem resquício do repo de referência");

/* ---------------- peso ---------------- */

const pesoHtml = Buffer.byteLength(html);
const pesoHtmlGzip = gzipSync(Buffer.from(html)).length;

const assets = await lerRecursivo(path.join(raiz, "dist", "client"), [
  ".js",
  ".css",
]);
const pesoJsCss = assets.reduce(
  (soma, a) => soma + gzipSync(Buffer.from(a.texto)).length,
  0,
);

const logo = await stat(path.join(raiz, "public", "logo.webp"));
const primeiraDobra = pesoHtmlGzip + pesoJsCss + logo.size;

primeiraDobra < 400 * 1024
  ? ok(
      "Primeira dobra abaixo de 400 KB",
      `${(primeiraDobra / 1024).toFixed(1)} KB transferidos (html+js+css+logo, comprimido)`,
    )
  : falha(
      "Primeira dobra abaixo de 400 KB",
      `${(primeiraDobra / 1024).toFixed(1)} KB`,
    );

// a vitrine de frota saiu da página, então não há mais imagem abaixo da dobra
primeiraDobra < 1.2 * 1024 * 1024
  ? ok(
      "Página inteira abaixo de 1,2 MB",
      `${(primeiraDobra / 1024).toFixed(1)} KB, a página toda cabe na primeira dobra`,
    )
  : falha(
      "Página inteira abaixo de 1,2 MB",
      `${(primeiraDobra / 1024).toFixed(1)} KB`,
    );

// "autoPlay" aparece na lista interna de atributos do react-dom, então essa
// palavra só é procurada no nosso código; mídia de verdade é procurada em tudo.
const comMidia = [...cliente, ...fonte].filter((a) =>
  /<video|<audio|\.mp4|\.webm/i.test(a.texto),
);
const comAutoplay = fonte.filter((a) => /autoplay/i.test(a.texto));
comMidia.length === 0 && comAutoplay.length === 0
  ? ok("Sem vídeo e sem autoplay")
  : falha(
      "Sem vídeo e sem autoplay",
      [...comMidia, ...comAutoplay].map((a) => a.caminho).join(", "),
    );

/* ---------------- saída ---------------- */

console.log(`\nChecklist automatizado — ${base}\n`);
for (const r of resultados) {
  console.log(
    `${r.ok ? "  ok  " : " FALHA"}  ${r.nome}${r.detalhe ? `  — ${r.detalhe}` : ""}`,
  );
}
const falhas = resultados.filter((r) => !r.ok).length;
console.log(
  `\n${resultados.length - falhas} de ${resultados.length} verificações passaram.\n`,
);
console.log(`HTML servido: ${(pesoHtml / 1024).toFixed(1)} KB (${(pesoHtmlGzip / 1024).toFixed(1)} KB comprimido)`);
process.exit(falhas > 0 ? 1 : 0);
