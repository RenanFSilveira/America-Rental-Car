/**
 * Captura de origem, código de atendimento e disparo de conversão.
 *
 * Regras que valem para o arquivo inteiro:
 * - UTM é sempre LIDA da URL de entrada. Nenhuma UTM é escrita no código.
 * - A conversão dispara ANTES da navegação, com event_callback e rede de
 *   segurança por tempo, para que bloqueador ou rede lenta não prendam ninguém.
 * - Nenhum dado pessoal é capturado ou enviado. O código de atendimento é
 *   aleatório e não identifica a pessoa.
 */

import { LOG_ENDPOINT } from "./config";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/** Parâmetros de origem lidos da URL de entrada. Nunca escritos no código. */
const CHAVES_DE_ORIGEM = [
  "gclid",
  "wbraid",
  "gbraid",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

type ChaveDeOrigem = (typeof CHAVES_DE_ORIGEM)[number];
export type Origem = Partial<Record<ChaveDeOrigem, string>>;

const CHAVE_ORIGEM = "arc_origem";
const CHAVE_CODIGO = "arc_codigo";
const DIAS_DE_JANELA = 90; // janela da conversão B2B

/** Base 32 sem caractere ambíguo: sem O, sem 0, sem I, sem 1. */
const ALFABETO = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export const MENSAGEM_BASE =
  "Olá, vi seu anúncio no Google e gostaria de falar com um atendente!";

const noBrowser = () => typeof window !== "undefined";

/* ------------------------------------------------------------------ */
/* Persistência                                                        */
/* ------------------------------------------------------------------ */

function gravarCookie(nome: string, valor: string, dias: number): void {
  const validade = new Date(Date.now() + dias * 864e5).toUTCString();
  document.cookie = `${nome}=${encodeURIComponent(valor)}; expires=${validade}; path=/; SameSite=Lax${
    location.protocol === "https:" ? "; Secure" : ""
  }`;
}

function lerCookie(nome: string): string | null {
  const alvo = document.cookie
    .split("; ")
    .find((par) => par.startsWith(`${nome}=`));
  if (!alvo) return null;
  try {
    return decodeURIComponent(alvo.slice(nome.length + 1));
  } catch {
    return null;
  }
}

function lerJson<T>(bruto: string | null): T | null {
  if (!bruto) return null;
  try {
    return JSON.parse(bruto) as T;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Origem                                                              */
/* ------------------------------------------------------------------ */

/** Lê os parâmetros de origem da URL atual. */
function lerOrigemDaUrl(): Origem {
  const busca = new URLSearchParams(window.location.search);
  const origem: Origem = {};
  for (const chave of CHAVES_DE_ORIGEM) {
    const valor = busca.get(chave);
    if (valor) origem[chave] = valor.slice(0, 512);
  }
  return origem;
}

/**
 * Guarda a origem em localStorage e em cookie primário de 90 dias.
 * Só sobrescreve quando a URL atual traz origem nova: quem chegou por anúncio
 * e navegou depois não perde o gclid.
 */
export function capturarOrigem(): Origem {
  if (!noBrowser()) return {};

  const daUrl = lerOrigemDaUrl();
  const guardada =
    lerJson<Origem>(localStorage.getItem(CHAVE_ORIGEM)) ??
    lerJson<Origem>(lerCookie(CHAVE_ORIGEM)) ??
    {};

  const origem = Object.keys(daUrl).length > 0 ? daUrl : guardada;
  if (Object.keys(origem).length === 0) return {};

  const serializada = JSON.stringify(origem);
  try {
    localStorage.setItem(CHAVE_ORIGEM, serializada);
  } catch {
    // modo privado com storage bloqueado: o cookie abaixo cobre
  }
  gravarCookie(CHAVE_ORIGEM, serializada, DIAS_DE_JANELA);

  return origem;
}

export function origemAtual(): Origem {
  if (!noBrowser()) return {};
  return (
    lerJson<Origem>(localStorage.getItem(CHAVE_ORIGEM)) ??
    lerJson<Origem>(lerCookie(CHAVE_ORIGEM)) ??
    {}
  );
}

/* ------------------------------------------------------------------ */
/* Código de atendimento                                               */
/* ------------------------------------------------------------------ */

function sortear(quantidade: number): string {
  const bytes = new Uint8Array(quantidade);
  if (window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < quantidade; i++) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes, (b) => ALFABETO.charAt(b % ALFABETO.length)).join("");
}

function gerarCodigo(): string {
  // 4 caracteres derivados do timestamp (ordena no tempo) + 3 aleatórios
  let resto = Date.now();
  let doTempo = "";
  for (let i = 0; i < 4; i++) {
    doTempo = ALFABETO.charAt(resto % ALFABETO.length) + doTempo;
    resto = Math.floor(resto / ALFABETO.length);
  }
  return `AR-${doTempo}${sortear(3)}`;
}

/** Devolve o código da sessão, gerando na primeira chamada. */
export function codigoDeAtendimento(): string {
  if (!noBrowser()) return "";
  try {
    const existente = sessionStorage.getItem(CHAVE_CODIGO);
    if (existente) return existente;
    const novo = gerarCodigo();
    sessionStorage.setItem(CHAVE_CODIGO, novo);
    return novo;
  } catch {
    // storage bloqueado: o código continua funcionando dentro do render atual
    return gerarCodigo();
  }
}

/* ------------------------------------------------------------------ */
/* Link do WhatsApp                                                    */
/* ------------------------------------------------------------------ */

/**
 * Monta o link do WhatsApp. Sem código, devolve a mensagem base, que é o que
 * vai no HTML servido: assim o link funciona mesmo sem JavaScript.
 */
export function linkWhatsApp(numero: string, codigo?: string): string {
  const texto = codigo
    ? `${MENSAGEM_BASE} (atendimento #${codigo})`
    : MENSAGEM_BASE;
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}

/**
 * Mesma regra de linkWhatsApp, com mensagem própria em vez da MENSAGEM_BASE.
 *
 * Usado pelo formulário de empresas: a mensagem carrega o que a pessoa
 * digitou (nome, empresa, necessidade), então só pode ser montada depois da
 * hidratação, diferente do link fixo dos botões de loja. Por isso este
 * caminho depende de JavaScript — não existe versão estática equivalente,
 * porque HTML puro não sabe combinar três campos numa única query string.
 */
export function linkWhatsAppComMensagem(
  numero: string,
  mensagem: string,
  codigo?: string,
): string {
  const texto = codigo ? `${mensagem} (atendimento #${codigo})` : mensagem;
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}

/* ------------------------------------------------------------------ */
/* Registro (opcional)                                                 */
/* ------------------------------------------------------------------ */

/**
 * Envia o código e a origem para o backend de registro, se houver.
 * Com LOG_ENDPOINT vazio é no-op e a página funciona normalmente.
 */
function registrar(dados: Record<string, unknown>): void {
  if (!LOG_ENDPOINT || !noBrowser()) return;
  try {
    const corpo = JSON.stringify(dados);
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        LOG_ENDPOINT,
        new Blob([corpo], { type: "application/json" }),
      );
    }
  } catch {
    // registro nunca pode impedir o clique de seguir
  }
}

/* ------------------------------------------------------------------ */
/* Conversão                                                           */
/* ------------------------------------------------------------------ */

/** Rede de segurança: rede lenta ou bloqueador não pode prender o usuário. */
const ESPERA_MAXIMA_MS = 800;

export type CliqueDeContato = {
  /** Rótulo da conversão do Google Ads (lib/lojas.ts). */
  sendTo: string;
  /** Link final do WhatsApp, já com a mensagem. */
  url: string;
  /** slug da loja ou "empresas". Só para GA4 e registro. */
  loja: string;
};

/**
 * Dispara a conversão e só então navega.
 *
 * O elemento continua sendo um <a href> real: o onClick faz preventDefault e
 * chama esta função. Sem JavaScript, o href leva ao WhatsApp do mesmo jeito.
 */
export function irParaWhatsApp({ sendTo, url, loja }: CliqueDeContato): void {
  if (!noBrowser()) return;

  let navegou = false;
  const seguir = () => {
    if (navegou) return;
    navegou = true;
    window.location.href = url;
  };

  const codigo = codigoDeAtendimento();
  const origem = origemAtual();

  if (typeof window.gtag === "function") {
    window.gtag("event", "conversion", {
      send_to: sendTo,
      event_callback: seguir,
    });
    window.gtag("event", "contato_whatsapp", {
      loja,
      codigo_atendimento: codigo,
    });
  }

  if (typeof window.fbq === "function") {
    window.fbq("track", "Contact", { content_name: loja });
  }

  registrar({
    codigo,
    loja,
    ...origem,
    timestamp: new Date().toISOString(),
    referrer: document.referrer,
    user_agent: navigator.userAgent,
  });

  window.setTimeout(seguir, ESPERA_MAXIMA_MS);
}
