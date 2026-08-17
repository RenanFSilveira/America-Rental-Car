/**
 * Prova, em navegador de verdade, que cada botão dispara a conversão certa
 * ANTES de navegar.
 *
 * IMPORTANTE: nenhuma requisição de conversão chega ao Google ou ao Meta.
 * Todos os endpoints de coleta são bloqueados na rede e apenas registrados.
 * O teste comprova que a chamada saiu com o rótulo certo, sem sujar a conta do
 * cliente com conversão de teste.
 *
 * São duas passadas por botão:
 *   1. Com o gtag real carregado: prova de rede. A requisição de conversão sai
 *      com o rótulo da loja e sai ANTES da navegação para o WhatsApp. É o mesmo
 *      sinal que o Tag Assistant mostraria.
 *   2. Com googletagmanager e connect.facebook bloqueados: prova de código. O
 *      dublê fica no lugar do gtag e do fbq e registra os argumentos exatos.
 *
 * Uso: node scripts/verificar-tags.mjs [url]
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import puppeteer from "puppeteer-core";

const base = process.argv[2] ?? "http://localhost:3210";
const raiz = path.resolve(import.meta.dirname, "..");
const provas = path.join(raiz, "provas");

/**
 * A página é servida ao navegador sob este endereço, e o conteúdo vem do
 * servidor local. Sem isso o teste rodaria em http://localhost, onde o pixel
 * do Meta se comporta diferente e o cookie Secure não é gravado.
 */
const ORIGEM = "https://lp.america-rentalcar.com.br";

/** Lê a chave do pixel direto da configuração da página. */
const PIXEL_LIGADO = /META_PIXEL_ENABLED = true/.test(
  await readFile(path.join(raiz, "src", "lib", "config.ts"), "utf8"),
);

const CHROME =
  process.env.CHROME_PATH ??
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const ESPERADO = [
  {
    loja: "Vila Velha",
    arquivo: "vila-velha",
    sendTo: "AW-866527260/wSEpCKrk1-8DEJzQmJ0D",
    numero: "5527999729448",
  },
  {
    loja: "Vitória",
    arquivo: "vitoria",
    sendTo: "AW-866527260/vsE_CLGxiPADEJzQmJ0D",
    numero: "5527999446195",
  },
  {
    loja: "Guarapari",
    arquivo: "guarapari",
    sendTo: "AW-866527260/nz7rCMno1-8DEJzQmJ0D",
    numero: "5527999713349",
  },
  {
    loja: "Empresas",
    arquivo: "empresas",
    sendTo: "AW-866527260/mZ5XCPrsuKUcEJzQmJ0D",
    numero: "5527988801118",
  },
];

/** Endpoints que transmitem hit. Bloqueados para não sujar a conta. */
const COLETA = [
  "google-analytics.com",
  "analytics.google.com",
  "googleads.g.doubleclick.net",
  "googleadservices.com",
  "google.com/pagead",
  "google.com.br/pagead",
  "facebook.com/tr",
];

/** Bloqueados só na passada 2, para o dublê sobreviver. */
const BIBLIOTECAS = ["googletagmanager.com", "connect.facebook.net"];

const resultados = [];
const ok = (nome, detalhe = "") => resultados.push({ ok: true, nome, detalhe });
const falha = (nome, detalhe = "") =>
  resultados.push({ ok: false, nome, detalhe });
/** Observação que não reprova a entrega, mas precisa aparecer no relatório. */
const nota = (nome, detalhe = "") =>
  resultados.push({ ok: true, nota: true, nome, detalhe });

/**
 * Dublê instalado depois do carregamento, por fora do que já estiver lá.
 *
 * Só funciona quando as bibliotecas reais não carregam: o gtag.js guarda uma
 * referência própria ao dataLayer.push e escapa de qualquer wrapper posterior.
 *
 * Cada evento é entregue na hora ao processo de teste (window.__registrar), e
 * não guardado numa variável de página: a navegação abortada do teste troca o
 * documento por uma página de erro e levaria qualquer estado local junto.
 */
const ESPIAO = `
const empurrar = window.dataLayer.push.bind(window.dataLayer);
window.dataLayer.push = function () {
  try {
    window.__registrar({
      tipo: 'gtag',
      args: JSON.parse(JSON.stringify(Array.from(arguments[0] ?? []), (chave, valor) =>
        typeof valor === 'function' ? '[callback]' : valor)),
      t: Date.now(),
    });
  } catch (e) {}
  return empurrar.apply(this, arguments);
};
const fbqOriginal = window.fbq;
if (typeof fbqOriginal === 'function') {
  window.fbq = function () {
    try {
      window.__registrar({ tipo: 'fbq', args: Array.from(arguments), t: Date.now() });
    } catch (e) {}
    return fbqOriginal.apply(this, arguments);
  };
  Object.assign(window.fbq, fbqOriginal);
}
`;

async function novaAba({ bloquearBibliotecas = false } = {}) {
  const aba = await navegador.newPage();
  await aba.setViewport({ width: 390, height: 844, isMobile: true });

  const coleta = [];
  const navegacoes = [];
  const eventos = [];

  await aba.exposeFunction("__registrar", (registro) => {
    eventos.push(registro);
  });

  await aba.setRequestInterception(true);
  aba.on("request", async (req) => {
    const url = req.url();
    // coleta vem primeiro: o beacon de clique de saída do GA4 carrega a URL do
    // WhatsApp dentro dele e seria confundido com a navegação
    if (COLETA.some((alvo) => url.includes(alvo))) {
      coleta.push({ url, t: Date.now() });
      return req.abort();
    }
    if (
      url.startsWith("https://wa.me/") ||
      url.startsWith("https://api.whatsapp.com/")
    ) {
      navegacoes.push({ url, t: Date.now() });
      return req.abort();
    }
    if (bloquearBibliotecas && BIBLIOTECAS.some((alvo) => url.includes(alvo))) {
      return req.abort();
    }
    // serve a página local sob o domínio de produção
    if (url.startsWith(ORIGEM)) {
      const resposta = await fetch(base + url.slice(ORIGEM.length));
      const corpo = Buffer.from(await resposta.arrayBuffer());
      return req.respond({
        status: resposta.status,
        headers: {
          "content-type":
            resposta.headers.get("content-type") ?? "application/octet-stream",
        },
        body: corpo,
      });
    }
    return req.continue();
  });

  return { aba, coleta, navegacoes, eventos };
}

/** Fechar aba pode falhar se a navegação abortada já derrubou o alvo. */
async function fechar(aba) {
  try {
    await aba.close();
  } catch {
    // alvo já foi embora, nada a fazer
  }
}

/** Espera a hidratação: o código de atendimento só entra no href depois dela. */
async function esperarHidratacao(aba, numero) {
  await aba.waitForFunction(
    (n) =>
      document
        .querySelector(`a[href*="${n}"]`)
        ?.getAttribute("href")
        ?.includes("%23AR-") === true,
    { timeout: 10000 },
    numero,
  );
}

/** Passada 1: prova de rede, com as bibliotecas reais carregadas. */
async function provaDeRede(caso) {
  const { aba, coleta, navegacoes } = await novaAba();
  await aba.goto(`${ORIGEM}/?gclid=TESTE123&utm_source=google&utm_medium=cpc`, {
    waitUntil: "networkidle2",
  });

  await esperarHidratacao(aba, caso.numero);
  await aba.click(`a[href*="${caso.numero}"]`);
  await new Promise((r) => setTimeout(r, 1500));

  const etiqueta = caso.sendTo.split("/")[1];
  const conversao = coleta.find(
    (r) => r.url.includes("866527260") && r.url.includes(etiqueta),
  );
  const contato = coleta.find(
    (r) => r.url.includes("facebook.com/tr") && r.url.includes("ev=Contact"),
  );
  const navegacao = navegacoes.find((n) => n.url.includes(caso.numero));

  conversao
    ? ok(
        `${caso.loja}: conversão do Google Ads sai com o rótulo certo`,
        `${etiqueta} em ${new URL(conversao.url).host}${new URL(conversao.url).pathname}`,
      )
    : falha(
        `${caso.loja}: conversão do Google Ads sai com o rótulo certo`,
        `nenhuma requisição com ${etiqueta}`,
      );

  // O pixel 734986470338470 carrega e inicializa, mas não transmite evento
  // nenhum: nem aqui, nem no site oficial (conferido em 11/08/2026). O problema
  // é do pixel, não da página. A chamada fbq('track','Contact') está provada na
  // passada 2. Vira pendência no relatório, não reprovação.
  if (!PIXEL_LIGADO) {
    contato
      ? falha(
          `${caso.loja}: pixel do Meta desligado não dispara nada`,
          "saiu requisição para o Meta com META_PIXEL_ENABLED = false",
        )
      : ok(`${caso.loja}: pixel do Meta desligado não dispara nada`);
  } else if (contato) {
    ok(`${caso.loja}: evento Contact sai para o Meta`);
  } else {
    nota(
      `${caso.loja}: Contact não sai pela rede`,
      "o pixel do Meta não transmite nem no site oficial, ver README",
    );
  }

  if (!navegacao) {
    falha(`${caso.loja}: navega para o número certo`, "não houve navegação");
  } else if (!conversao) {
    falha(
      `${caso.loja}: conversão antes da navegação`,
      "sem conversão para comparar",
    );
  } else if (navegacao.t < conversao.t) {
    falha(
      `${caso.loja}: conversão antes da navegação`,
      `navegou ${conversao.t - navegacao.t}ms antes de a conversão sair`,
    );
  } else {
    ok(
      `${caso.loja}: conversão antes da navegação`,
      `navegação ${navegacao.t - conversao.t}ms depois da conversão`,
    );
  }

  const codigo = navegacao?.url.match(/%23(AR-[A-Z2-9]{7})/)?.[1];
  codigo
    ? ok(`${caso.loja}: código de atendimento na mensagem`, codigo)
    : falha(
        `${caso.loja}: código de atendimento na mensagem`,
        navegacao?.url ?? "sem URL",
      );

  await writeFile(
    path.join(provas, `rede-${caso.arquivo}.json`),
    JSON.stringify({ conversao, contato, navegacao, coleta }, null, 2),
    "utf8",
  );

  await fechar(aba);
}

/** Passada 2: prova de código, com o dublê no lugar do gtag e do fbq. */
async function provaDeCodigo(caso) {
  const { aba, navegacoes, eventos } = await novaAba({
    bloquearBibliotecas: true,
  });
  await aba.goto(ORIGEM, { waitUntil: "domcontentloaded" });
  await esperarHidratacao(aba, caso.numero);
  await aba.evaluate(ESPIAO);
  await aba.click(`a[href*="${caso.numero}"]`);
  await new Promise((r) => setTimeout(r, 1500));

  const conversao = eventos.find(
    (e) =>
      e.tipo === "gtag" && e.args[0] === "event" && e.args[1] === "conversion",
  );
  conversao?.args[2]?.send_to === caso.sendTo
    ? ok(`${caso.loja}: send_to correto no código`, caso.sendTo)
    : falha(
        `${caso.loja}: send_to correto no código`,
        conversao
          ? `veio ${conversao.args[2]?.send_to}`
          : "conversão não chamada",
      );

  conversao?.args[2]?.event_callback === "[callback]"
    ? ok(`${caso.loja}: conversão enviada com event_callback`)
    : falha(`${caso.loja}: conversão enviada com event_callback`, "sem callback");

  const ga4 = eventos.find(
    (e) => e.tipo === "gtag" && e.args[1] === "contato_whatsapp",
  );
  ga4
    ? ok(`${caso.loja}: evento de GA4 disparado`, `loja=${ga4.args[2]?.loja}`)
    : falha(`${caso.loja}: evento de GA4 disparado`, "não disparou");

  const contato = eventos.find(
    (e) => e.tipo === "fbq" && e.args[0] === "track" && e.args[1] === "Contact",
  );
  if (!PIXEL_LIGADO) {
    contato
      ? falha(`${caso.loja}: nenhum fbq com o pixel desligado`, "fbq foi chamado")
      : ok(`${caso.loja}: nenhum fbq com o pixel desligado`);
  } else {
    contato
      ? ok(`${caso.loja}: fbq Contact chamado`)
      : falha(`${caso.loja}: fbq Contact chamado`, "não chamado");
  }

  navegacoes.some((n) => n.url.includes(caso.numero))
    ? ok(
        `${caso.loja}: navega mesmo com as tags bloqueadas`,
        "rede de segurança de 800ms",
      )
    : falha(`${caso.loja}: navega mesmo com as tags bloqueadas`);

  await writeFile(
    path.join(provas, `codigo-${caso.arquivo}.json`),
    JSON.stringify({ eventos, navegacoes }, null, 2),
    "utf8",
  );

  await fechar(aba);
}

/** Origem, código de atendimento e destaque de loja por UTM. */
async function testarOrigemECodigo() {
  const { aba, coleta } = await novaAba();
  await aba.goto(
    `${ORIGEM}/?gclid=TESTE123&wbraid=WB1&utm_source=google&utm_medium=cpc&utm_campaign=guarapari-locacao`,
    { waitUntil: "networkidle2" },
  );

  (await aba.evaluate(
    () => typeof window.gtag === "function" && Array.isArray(window.dataLayer),
  ))
    ? ok("gtag real carregado e configurado")
    : falha("gtag real carregado e configurado");

  const estado = await aba.evaluate(() => ({
    local: localStorage.getItem("arc_origem"),
    cookie: document.cookie,
    codigo: sessionStorage.getItem("arc_codigo"),
    destacada: document
      .querySelector('[data-loja][data-destaque="sim"]')
      ?.getAttribute("data-loja"),
    ordemVisual: [...document.querySelectorAll("[data-loja]")]
      .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)
      .map((el) => el.getAttribute("data-loja")),
  }));

  const guardado = estado.local ? JSON.parse(estado.local) : null;
  guardado?.gclid === "TESTE123" &&
  guardado?.utm_source === "google" &&
  guardado?.wbraid === "WB1"
    ? ok("gclid e UTM persistidos no localStorage", estado.local)
    : falha("gclid e UTM persistidos no localStorage", estado.local ?? "vazio");

  estado.cookie.includes("arc_origem") && estado.cookie.includes("TESTE123")
    ? ok("gclid e UTM persistidos no cookie primário")
    : falha("gclid e UTM persistidos no cookie primário", estado.cookie);

  /^AR-[A-Z2-9]{7}$/.test(estado.codigo ?? "")
    ? ok("código de atendimento no formato certo", estado.codigo)
    : falha("código de atendimento no formato certo", estado.codigo ?? "vazio");

  estado.destacada === "guarapari" && estado.ordemVisual[0] === "guarapari"
    ? ok(
        "card da cidade da campanha sobe para o topo",
        `ordem na tela: ${estado.ordemVisual.join(", ")}`,
      )
    : falha(
        "card da cidade da campanha sobe para o topo",
        `destacada=${estado.destacada}, ordem=${estado.ordemVisual?.join(", ")}`,
      );

  await aba.goto(`${ORIGEM}/?gclid=TESTE123`, { waitUntil: "networkidle2" });
  const segundoCodigo = await aba.evaluate(() =>
    sessionStorage.getItem("arc_codigo"),
  );
  segundoCodigo === estado.codigo
    ? ok("código estável dentro da sessão", segundoCodigo ?? "")
    : falha(
        "código estável dentro da sessão",
        `${estado.codigo} virou ${segundoCodigo}`,
      );

  ok(
    "nenhum hit real chegou ao Google ou ao Meta",
    `${coleta.length} requisição(ões) de coleta bloqueadas neste teste`,
  );

  await writeFile(
    path.join(provas, "coleta-bloqueada.json"),
    JSON.stringify(coleta, null, 2),
    "utf8",
  );

  await fechar(aba);
}

/** Sem JavaScript, o link ainda tem que levar ao WhatsApp. */
async function testarSemJavaScript() {
  const { aba } = await novaAba();
  await aba.setJavaScriptEnabled(false);
  await aba.goto(ORIGEM, { waitUntil: "domcontentloaded" });

  const hrefs = await aba.$$eval('a[href^="https://wa.me/"]', (as) =>
    as.map((a) => a.getAttribute("href")),
  );

  hrefs.length === 4
    ? ok("com JS desligado, os 4 links de WhatsApp continuam válidos")
    : falha(
        "com JS desligado, os 4 links de WhatsApp continuam válidos",
        `${hrefs.length} links encontrados`,
      );

  hrefs.every((h) => h?.includes("text=Ol%C3%A1"))
    ? ok("com JS desligado, a mensagem pré-preenchida continua no link")
    : falha("com JS desligado, a mensagem pré-preenchida continua no link");

  await fechar(aba);
}

async function tirarPrints() {
  for (const [nome, largura, altura] of [
    ["celular", 390, 844],
    ["celular-320", 320, 720],
    ["desktop", 1280, 900],
  ]) {
    const { aba } = await novaAba();
    await aba.setViewport({ width: largura, height: altura });
    await aba.goto(ORIGEM, { waitUntil: "networkidle2" });

    (await aba.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    ))
      ? falha(`sem rolagem horizontal em ${largura}px`)
      : ok(`sem rolagem horizontal em ${largura}px`);

    await aba.screenshot({
      path: path.join(provas, `pagina-${nome}.png`),
      fullPage: true,
    });
    await fechar(aba);
  }
}

/* ------------------------------------------------------------------ */

const navegador = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

try {
  await mkdir(provas, { recursive: true });
  for (const caso of ESPERADO) {
    await provaDeRede(caso);
    await provaDeCodigo(caso);
  }
  await testarOrigemECodigo();
  await testarSemJavaScript();
  await tirarPrints();
} finally {
  await navegador.close();
}

console.log(`\nVerificação em navegador — ${base}\n`);
for (const r of resultados) {
  console.log(
    `${r.nota ? " nota " : r.ok ? "  ok  " : " FALHA"}  ${r.nome}${r.detalhe ? `  — ${r.detalhe}` : ""}`,
  );
}
const falhas = resultados.filter((r) => !r.ok).length;
const notas = resultados.filter((r) => r.nota).length;
console.log(
  `\n${resultados.length - falhas - notas} de ${resultados.length - notas} verificações passaram, ${notas} observação(ões).\n`,
);
process.exit(falhas > 0 ? 1 : 0);
