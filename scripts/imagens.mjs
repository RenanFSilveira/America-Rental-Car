/**
 * Prepara as imagens da página a partir do logo oficial.
 *
 * Entrada:  .raw/logo.png            (baixado do site oficial)
 * Saída:    public/logo.png, public/logo.webp, public/og.jpg, public/favicon.png
 *
 * A vitrine de frota saiu da página a pedido do cliente em 17/08/2026, então
 * não há mais foto de veículo para processar. O histórico do git guarda o
 * pipeline antigo, caso a seção volte.
 *
 * Uso: bash scripts/baixar-imagens.sh && node scripts/imagens.mjs
 */
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const raiz = path.resolve(import.meta.dirname, "..");
const origem = path.join(raiz, ".raw", "logo.png");
const publico = path.join(raiz, "public");

const VERDE = "#026237";
const VERDE_ESCURO = "#014a29";

if (!existsSync(origem)) {
  console.error(`Logo não encontrado em ${origem}`);
  console.error("Rode antes: bash scripts/baixar-imagens.sh");
  process.exit(1);
}

await mkdir(publico, { recursive: true });

/* logo: PNG para quem não lê webp, e webp para o resto */
const logo = sharp(origem);
await logo
  .clone()
  .png({ compressionLevel: 9, palette: true })
  .toFile(path.join(publico, "logo.png"));
await logo
  .clone()
  .webp({ quality: 90, effort: 6 })
  .toFile(path.join(publico, "logo.webp"));

/* imagem de compartilhamento: marca e cores próprias, sem print de plataforma.
   O texto só repete fato: nome, atividade e as três cidades. */
const fundo = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="${VERDE}"/>
  <rect y="560" width="1200" height="70" fill="${VERDE_ESCURO}"/>
  <g fill="#ffffff" font-family="Helvetica, Arial, sans-serif">
    <text x="80" y="330" font-size="62" font-weight="bold">Aluguel de carros</text>
    <text x="80" y="405" font-size="62" font-weight="bold">no Espírito Santo</text>
    <text x="80" y="480" font-size="34" fill="#d7e7de">Vila Velha  ·  Vitória  ·  Guarapari</text>
  </g>
</svg>`);

const marca = await sharp(origem).resize({ width: 420 }).png().toBuffer();

await sharp(fundo)
  .composite([{ input: marca, top: 90, left: 80 }])
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(path.join(publico, "og.jpg"));

/* favicon: quadrado da marca com o "A", legível em 16px */
const favicon = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">
  <rect width="512" height="512" rx="96" fill="${VERDE}"/>
  <text x="256" y="368" text-anchor="middle" font-family="Helvetica, Arial, sans-serif"
        font-size="340" font-weight="bold" fill="#ffffff">A</text>
</svg>`);

await sharp(favicon).png().toFile(path.join(publico, "favicon.png"));

console.log("logo.png, logo.webp, og.jpg e favicon.png gerados em public/");
