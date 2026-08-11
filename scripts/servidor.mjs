/**
 * Servidor Node para rodar o build localmente (teste e Lighthouse).
 *
 * O build gera um handler `fetch` padrão em dist/server/server.js e os assets
 * estáticos em dist/client. Este arquivo só junta os dois: serve o estático e
 * manda o resto para o handler. Na Cloudflare esse papel é do próprio Worker
 * (ver wrangler.toml), então este servidor é ferramenta de teste, não de
 * produção.
 *
 * Uso: node scripts/servidor.mjs [porta]
 */
import { createReadStream, existsSync, statSync } from "node:fs";
import http from "node:http";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createGzip } from "node:zlib";

const raiz = path.resolve(import.meta.dirname, "..");
const estatico = path.join(raiz, "dist", "client");
const porta = Number(process.argv[2] ?? process.env.PORT ?? 3000);

const { default: entrada } = await import(
  pathToFileURL(path.join(raiz, "dist", "server", "server.js")).href
);

/** Tipos que valem comprimir. Imagem e webp já vêm comprimidos. */
const COMPRIMIVEIS = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".svg",
  ".txt",
]);

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
};

function arquivoEstatico(urlPath) {
  const relativo = decodeURIComponent(urlPath).replace(/^\/+/, "");
  if (!relativo || relativo.includes("..")) return null;
  const destino = path.join(estatico, relativo);
  if (!destino.startsWith(estatico)) return null;
  if (!existsSync(destino) || !statSync(destino).isFile()) return null;
  return destino;
}

const servidor = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host}`);

  const destino = arquivoEstatico(url.pathname);
  if (destino) {
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
    return;
  }

  try {
    const resposta = await entrada.fetch(
      new Request(url, {
        method: req.method,
        headers: Object.entries(req.headers).flatMap(([chave, valor]) =>
          Array.isArray(valor)
            ? valor.map((v) => [chave, v])
            : valor === undefined
              ? []
              : [[chave, valor]],
        ),
      }),
    );

    const comprimir = (req.headers["accept-encoding"] ?? "").includes("gzip");
    res.writeHead(resposta.status, {
      ...Object.fromEntries(resposta.headers),
      ...(comprimir
        ? { "content-encoding": "gzip", vary: "accept-encoding" }
        : {}),
    });

    const saida = comprimir ? createGzip() : null;
    if (saida) saida.pipe(res);
    if (resposta.body) {
      for await (const pedaco of resposta.body) (saida ?? res).write(pedaco);
    }
    (saida ?? res).end();
  } catch (erro) {
    console.error(erro);
    res.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
    res.end("Erro no servidor");
  }
});

servidor.listen(porta, () => {
  console.log(`http://localhost:${porta}`);
});
