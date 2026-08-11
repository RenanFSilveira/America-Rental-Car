/**
 * Gera a imagem de compartilhamento (og.jpg) e o favicon a partir do logo
 * oficial e das cores da marca. Nada de print de preview de plataforma.
 *
 * O texto usado só repete o que é fato: nome, atividade e as três cidades.
 *
 * Uso: node scripts/gerar-og-e-favicon.mjs
 */
import path from "node:path";
import sharp from "sharp";

const raiz = path.resolve(import.meta.dirname, "..");
const logo = path.join(raiz, ".raw", "lojas", "logo.png");
const publico = path.join(raiz, "public");

const VERDE = "#026237";
const VERDE_ESCURO = "#014a29";

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

const marca = await sharp(logo).resize({ width: 420 }).png().toBuffer();

await sharp(fundo)
  .composite([{ input: marca, top: 90, left: 80 }])
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile(path.join(publico, "og.jpg"));

// favicon: quadrado verde com o "A" da marca, legível em 16px
const favicon = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512">
  <rect width="512" height="512" rx="96" fill="${VERDE}"/>
  <text x="256" y="368" text-anchor="middle" font-family="Helvetica, Arial, sans-serif"
        font-size="340" font-weight="bold" fill="#ffffff">A</text>
</svg>`);

await sharp(favicon).png().toFile(path.join(publico, "favicon.png"));

console.log("og.jpg e favicon.png gerados em public/");
