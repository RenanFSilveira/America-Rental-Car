import { useEffect, useState } from "react";

import {
  codigoDeAtendimento,
  irParaWhatsApp,
  linkWhatsApp,
} from "~/lib/tracking";

type Props = {
  /** WhatsApp da loja em E.164 sem o "+". Vem de lib/lojas.ts. */
  numero: string;
  /** Rótulo de conversão do Google Ads. Vem de lib/lojas.ts. */
  sendTo: string;
  /** slug da loja ou "empresas". Só para GA4 e registro. */
  loja: string;
  rotulo: string;
  variante?: "cheio" | "contorno";
  className?: string;
};

/**
 * Botão de contato.
 *
 * É um <a href> real com o link do WhatsApp já montado no HTML servido: sem
 * JavaScript, o clique leva ao WhatsApp do mesmo jeito. Com JavaScript, o
 * onClick segura a navegação, dispara a conversão e só então segue.
 *
 * O código de atendimento só existe no navegador, então entra no href depois
 * da montagem. O primeiro render é igual ao do servidor, sem salto de layout.
 */
export function BotaoWhatsApp({
  numero,
  sendTo,
  loja,
  rotulo,
  variante = "cheio",
  className = "",
}: Props) {
  const [codigo, setCodigo] = useState<string>();

  useEffect(() => {
    setCodigo(codigoDeAtendimento());
  }, []);

  const url = linkWhatsApp(numero, codigo);

  const base =
    "inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-4 text-base font-semibold transition-colors";
  const estilo =
    variante === "cheio"
      ? "bg-zap text-white hover:bg-zap-escuro active:bg-zap-escuro"
      : "border-2 border-marca bg-white text-marca hover:bg-marca-tinta";

  return (
    <a
      href={url}
      className={`${base} ${estilo} ${className}`}
      onClick={(evento) => {
        // clique com modificador ou botão do meio: deixa o navegador cuidar
        if (
          evento.defaultPrevented ||
          evento.metaKey ||
          evento.ctrlKey ||
          evento.shiftKey ||
          evento.altKey ||
          evento.button !== 0
        ) {
          return;
        }
        evento.preventDefault();
        irParaWhatsApp({ sendTo, url, loja });
      }}
    >
      <IconeWhatsApp />
      {rotulo}
    </a>
  );
}

function IconeWhatsApp() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="currentColor"
      className="shrink-0"
    >
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.76-1.66-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.06 2.87 1.21 3.07.15.2 2.09 3.2 5.07 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35Z" />
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.13h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.17 8.17 0 0 1-1.26-4.36c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.2 8.2 0 0 1 2.41 5.83c0 4.54-3.7 8.21-8.24 8.21Z" />
    </svg>
  );
}
