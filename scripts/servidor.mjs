/**
 * Servidor local para conferir o build (teste e Lighthouse).
 *
 * A página é pré-renderizada em HTML estático, então `dist/client` é tudo que
 * vai para produção: este servidor só entrega esses arquivos com os mesmos
 * cabeçalhos que a hospedagem usa (gzip e cache), para o que se mede aqui
 * valer lá.
 *
 * Uso: node scripts/servidor.mjs [porta]
 */
import { createReadStream, existsSync, statSync } from "node:fs";
import http from "node:http";
import path from "node:path";
import { createGzip } from "node:zlib";

const raiz = path.resolve(import.meta.dirname, "..");
const estatico = path.join(raiz, "dist", "client");
const porta = Number(process.argv[2] ?? process.env.PORT ?? 3000);

if (!existsSync(path.join(estatico, "index.html"))) {
  console.error("dist/client/index.html não existe. Rode `npm run build`.");
  process.exit(1);
}

/** Tipos que valem comprimir. Imagem e webp já vêm comprimidos. */
const COMPRIMIVEIS = new Set([".css", ".html", ".js", ".json", ".svg", ".txt"]);

const TIPOS = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8",
};

function resolverArquivo(caminhoUrl) {
  const relativo = decodeURIComponent(caminhoUrl).replace(/^\/+/, "");
  if (relativo.includes("..")) return null;

  const destino = relativo
    ? path.join(estatico, relativo)
    : path.join(estatico, "index.html");
  if (!destino.startsWith(estatico)) return null;

  if (existsSync(destino) && statSync(destino).isFile()) return destino;

  // rota sem extensão cai no index.html da pasta, como faz a hospedagem
  const comIndex = path.join(destino, "index.html");
  if (existsSync(comIndex)) return comIndex;

  return null;
}

const servidor = http.createServer((req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host}`);
  const destino = resolverArquivo(url.pathname);

  if (!destino) {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Não encontrado");
    return;
  }

  const extensao = path.extname(destino);
  const comprimir =
    COMPRIMIVEIS.has(extensao) &&
    (req.headers["accept-encoding"] ?? "").includes("gzip");

  res.writeHead(200, {
    "content-type": TIPOS[extensao] ?? "application/octet-stream",
    "cache-control": url.pathname.startsWith("/assets/")
      ? "public, max-age=31536000, immutable"
      : "public, max-age=3600",
    ...(comprimir ? { "content-encoding": "gzip", vary: "accept-encoding" } : {}),
  });

  const leitura = createReadStream(destino);
  if (comprimir) leitura.pipe(createGzip()).pipe(res);
  else leitura.pipe(res);
});

servidor.listen(porta, () => {
  console.log(`http://localhost:${porta}`);
});
