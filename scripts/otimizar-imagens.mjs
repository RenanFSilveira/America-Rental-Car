/**
 * Otimiza as imagens brutas baixadas do site oficial para os assets da página.
 *
 * Entrada:  .raw/frota/*.{png,jpg}  e  .raw/lojas/logo.png   (baixados do site oficial)
 * Saída:    public/frota/<slug>.webp + .jpg   e   public/logo.png
 *
 * A triagem de quais imagens entram está em src/lib/frota.ts (campo `imagem`).
 * Imagens reprovadas no crivo de aparência atual não são processadas aqui.
 *
 * Uso: node scripts/otimizar-imagens.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const raiz = path.resolve(import.meta.dirname, "..");
const origemFrota = path.join(raiz, ".raw", "frota");
const destinoFrota = path.join(raiz, "public", "frota");

/**
 * Categorias aprovadas no crivo da seção 3.6, com o arquivo de origem exato.
 *
 * O arquivo é explícito de propósito: a categoria C existe em duas versões no
 * site (c.png com um hatch atual, c.jpg com um Onix de geração antiga) e o
 * Onix está reprovado pelo cliente. Escolher por ordem de leitura da pasta já
 * trouxe o arquivo errado uma vez.
 */
const APROVADOS = {
  a: "a.png",
  c: "c.png",
  c1: "c1.png",
  d1: "d1.jpg",
  f: "f.jpg",
  j: "j.jpg",
  h2: "h2.jpg",
  h3: "h3.jpg",
  n1: "n1.jpg",
};

const LARGURA_CARD = 800; // teto de largura para card de frota

async function main() {
  if (!existsSync(origemFrota)) {
    console.error(`Pasta de origem não encontrada: ${origemFrota}`);
    console.error("Rode antes: bash scripts/baixar-imagens.sh");
    process.exit(1);
  }

  await mkdir(destinoFrota, { recursive: true });

  const relatorio = [];

  for (const [slug, arquivo] of Object.entries(APROVADOS)) {
    const entrada = path.join(origemFrota, arquivo);
    if (!existsSync(entrada)) {
      console.error(`Sem arquivo bruto para a categoria "${slug}": ${arquivo}`);
      process.exitCode = 1;
      continue;
    }

    const base = sharp(entrada).resize({
      width: LARGURA_CARD,
      withoutEnlargement: true,
    });
    // fundo branco: os recortes vêm com transparência em alguns PNGs
    const achatada = base.flatten({ background: "#ffffff" });

    const webp = await achatada
      .clone()
      .webp({ quality: 78, effort: 6 })
      .toBuffer({ resolveWithObject: true });
    const jpg = await achatada
      .clone()
      .jpeg({ quality: 78, mozjpeg: true, progressive: true })
      .toBuffer({ resolveWithObject: true });

    await writeFile(path.join(destinoFrota, `${slug}.webp`), webp.data);
    await writeFile(path.join(destinoFrota, `${slug}.jpg`), jpg.data);

    relatorio.push({
      categoria: slug.toUpperCase(),
      dimensoes: `${webp.info.width}x${webp.info.height}`,
      webp_kb: +(webp.data.length / 1024).toFixed(1),
      jpg_kb: +(jpg.data.length / 1024).toFixed(1),
    });
  }

  // logo: mantém PNG (tem área chapada, comprime bem) e gera webp
  const origemLogo = path.join(raiz, ".raw", "lojas", "logo.png");
  if (existsSync(origemLogo)) {
    const logo = sharp(origemLogo);
    await logo
      .clone()
      .png({ compressionLevel: 9, palette: true })
      .toFile(path.join(raiz, "public", "logo.png"));
    await logo
      .clone()
      .webp({ quality: 90, effort: 6 })
      .toFile(path.join(raiz, "public", "logo.webp"));
  }

  console.table(relatorio);
  const totalWebp = relatorio.reduce((s, r) => s + r.webp_kb, 0);
  console.log(`Total frota (webp): ${totalWebp.toFixed(1)} KB`);
}

await main();
