/**
 * Fonte única dos dados de loja.
 *
 * Nenhum telefone, link de WhatsApp ou rótulo de conversão pode aparecer solto
 * em componente. Se precisar de um desses valores, importe daqui.
 *
 * Origem dos dados, verificada em 11/08/2026: API do Google Ads (tag_snippets)
 * para os rótulos de conversão, e o HTML de america-rentalcar.com.br para
 * endereço, telefone, e-mail e WhatsApp.
 */

export type Loja = {
  /** Identificador interno, usado em href de âncora e em log. */
  slug: "vila-velha" | "vitoria" | "guarapari";
  nome: string;
  endereco: string;
  /** Telefone fixo como o cliente escreve. */
  telefone: string;
  /** Mesmo telefone em formato discável. */
  telefoneLink: string;
  email: string;
  /** WhatsApp em E.164 sem o "+". */
  whatsapp: string;
  /** Rótulo da ação de conversão do Google Ads desta loja. */
  sendTo: string;
  /**
   * Termos que, se aparecerem em utm_campaign / utm_term, sobem este card.
   * Comparação feita sem acento e em minúscula.
   */
  sinaisDeCidade: string[];
};

export const LOJAS: readonly Loja[] = [
  {
    slug: "vila-velha",
    nome: "Vila Velha",
    endereco: "Av. Carlos Lindenberg, 3500",
    telefone: "(27) 3320-2828",
    telefoneLink: "tel:+552733202828",
    email: "reservas@america-rentalcar.com.br",
    whatsapp: "5527999729448",
    sendTo: "AW-866527260/wSEpCKrk1-8DEJzQmJ0D",
    sinaisDeCidade: ["vila velha", "vila-velha", "vilavelha"],
  },
  {
    slug: "vitoria",
    nome: "Vitória",
    endereco: "Av. Adalberto Simão Nader, 1521",
    telefone: "(27) 3317-8583",
    telefoneLink: "tel:+552733178583",
    email: "reservasvitoria@america-rentalcar.com.br",
    whatsapp: "5527999446195",
    sendTo: "AW-866527260/vsE_CLGxiPADEJzQmJ0D",
    sinaisDeCidade: ["vitoria", "grande vitoria"],
  },
  {
    slug: "guarapari",
    nome: "Guarapari",
    endereco: "Rua Padre Anchieta, 404",
    telefone: "(27) 3361-5435",
    telefoneLink: "tel:+552733615435",
    email: "reservasguarapari@america-rentalcar.com.br",
    whatsapp: "5527999713349",
    sendTo: "AW-866527260/nz7rCMno1-8DEJzQmJ0D",
    sinaisDeCidade: ["guarapari"],
  },
] as const;

/** Canal de empresas. Existe para não perder quem chega, não para ser trabalhado. */
export const EMPRESAS = {
  slug: "empresas",
  nome: "Empresas",
  whatsapp: "5527988801118",
  sendTo: "AW-866527260/mZ5XCPrsuKUcEJzQmJ0D",
} as const;

/** Tira acento e caixa para comparar sinal de cidade vindo de UTM. */
function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

/**
 * Reordena as lojas quando a URL de entrada traz o nome de uma cidade em
 * utm_campaign ou utm_term. Sem sinal, devolve a ordem original.
 *
 * Roda no servidor e no cliente com o mesmo resultado, porque só depende da
 * query string: a ordem já sai pronta no HTML, sem salto de layout.
 */
export function ordenarLojas(
  parametros: Record<string, unknown>,
  lojas: readonly Loja[] = LOJAS,
): readonly Loja[] {
  const sinal = normalizar(
    [parametros["utm_campaign"], parametros["utm_term"]]
      .filter((v): v is string => typeof v === "string")
      .join(" "),
  );

  if (!sinal) return lojas;

  const destaque = lojas.find((loja) =>
    loja.sinaisDeCidade.some((termo) => sinal.includes(termo)),
  );

  if (!destaque) return lojas;

  return [destaque, ...lojas.filter((loja) => loja.slug !== destaque.slug)];
}
