/**
 * Identificadores e chaves de configuração da página.
 *
 * Todos os valores foram verificados na fonte em 11/08/2026 (API do Google Ads
 * e HTML de america-rentalcar.com.br).
 *
 * Nada aqui é UTM. UTM é sempre lida da URL de entrada, nunca escrita no código.
 */

/** Conta de conversão do Google Ads. */
export const GOOGLE_ADS_ID = "AW-866527260";

/** Propriedade GA4. */
export const GA4_ID = "G-3PHBH2YTJ2";

/** Pixel do Meta usado no site oficial. */
export const META_PIXEL_ID = "734986470338470";

/**
 * Liga/desliga o pixel do Meta nesta página. Uma linha para inverter.
 *
 * Desligado na v1, por dois motivos somados:
 *   1. A frente de Meta Ads da conta está em reavaliação.
 *   2. Em teste de navegador (11/08/2026), o pixel 734986470338470 carrega e
 *      inicializa mas não transmite evento nenhum, nem nesta página nem no
 *      site oficial. Custaria 168 KB e 93 ms de bloqueio por zero medição.
 *
 * O código do pixel continua pronto em routes/__root.tsx e o evento Contact
 * continua sendo chamado em lib/tracking.ts. Confirmado que o pixel está ativo
 * e que a frente de Meta continua, trocar para true e publicar de novo.
 */
export const META_PIXEL_ENABLED = false;

/**
 * Endpoint de registro do código de atendimento.
 *
 * Vazio = a função de registro é no-op e a página funciona normalmente.
 * Preenchido = envia um JSON por `navigator.sendBeacon` a cada clique de contato.
 * O backend entra depois, no padrão de Clientes/_template/Planilha-Tracking/.
 */
export const LOG_ENDPOINT = "";

/**
 * URL canônica da página. Só é usada em metadados (canonical, og:url).
 *
 * PENDENTE: o domínio final depende de acesso ao DNS, do lado do cliente. O
 * valor abaixo é a hipótese de subdomínio próprio; trocar quando o destino
 * estiver definido. A regra é inegociável: a URL final do anúncio tem que ser
 * um domínio da América, nunca um endereço de plataforma.
 */
export const SITE_URL = "https://lp.america-rentalcar.com.br";

/** Perfis oficiais, extraídos do HTML do site em 11/08/2026. */
export const INSTAGRAM_URL = "https://www.instagram.com/americarentalcar/";
export const FACEBOOK_URL = "https://www.facebook.com/americarentalcar";
export const SITE_OFICIAL_URL = "https://america-rentalcar.com.br";
