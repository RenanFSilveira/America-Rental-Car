import { INSTAGRAM_URL, SITE_OFICIAL_URL } from "~/lib/config";
import { LOJAS } from "~/lib/lojas";

/**
 * Rodapé: endereço, telefone e e-mail das três lojas, mais o Instagram oficial.
 * Sem CNPJ, sem horário de funcionamento e sem selo: nada disso está
 * confirmado na fonte.
 */
export function Rodape() {
  return (
    <footer className="bg-marca-escuro text-white">
      <div className="mx-auto max-w-5xl px-5 py-12">
        <img
          src="/logo.webp"
          alt="América Rental Car"
          width={244}
          height={72}
          className="h-10 w-auto"
          loading="lazy"
        />

        <ul className="mt-8 grid gap-8 sm:grid-cols-3">
          {LOJAS.map((loja) => (
            <li key={loja.slug}>
              <h2 className="text-base font-semibold">{loja.nome}</h2>
              <address className="mt-2 space-y-1 text-sm text-white/80 not-italic">
                <p>{loja.endereco}</p>
                <p>
                  <a
                    href={loja.telefoneLink}
                    className="underline underline-offset-4 hover:text-white"
                  >
                    {loja.telefone}
                  </a>
                </p>
                <p className="break-all">
                  <a
                    href={`mailto:${loja.email}`}
                    className="underline underline-offset-4 hover:text-white"
                  >
                    {loja.email}
                  </a>
                </p>
              </address>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/20 pt-6 text-sm text-white/70 sm:flex-row sm:items-center sm:justify-between">
          <p>América Rental Car</p>
          <p className="flex gap-5">
            <a
              href={INSTAGRAM_URL}
              className="underline underline-offset-4 hover:text-white"
              rel="noopener"
            >
              Instagram
            </a>
            <a
              href={SITE_OFICIAL_URL}
              className="underline underline-offset-4 hover:text-white"
              rel="noopener"
            >
              Site oficial
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
