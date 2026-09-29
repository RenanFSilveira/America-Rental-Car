import { useState } from "react";
import type { FormEvent, ReactNode } from "react";

import { BotaoWhatsApp } from "./BotaoWhatsApp";
import { EMPRESAS } from "~/lib/lojas";
import {
  codigoDeAtendimento,
  irParaWhatsApp,
  linkWhatsAppComMensagem,
} from "~/lib/tracking";

/**
 * Formulário curto do atendimento corporativo.
 *
 * Decisão do cliente (29/09/2026): formulário mínimo, só para o atendente
 * receber a conversa já com direcionamento, não um funil de qualificação.
 * Três campos: nome (quebra o gelo), empresa (confirma que é B2B de fato) e
 * necessidade (rotula a conversa nos clusters de busca reais — ver
 * NecessidadesEmpresas.tsx). Não pede telefone: quem abre o WhatsApp pelo
 * link já leva o próprio número, pedir de novo seria redundante.
 *
 * Ao enviar, monta a mensagem e reaproveita irParaWhatsApp (tracking.ts): a
 * mesma conversão do Google Ads e o mesmo evento de GA4 que os botões de
 * loja disparam, com sendTo e loja de EMPRESAS (lib/lojas.ts).
 *
 * Diferente dos botões de contato, este caminho depende de JavaScript: a
 * mensagem só existe depois de combinar o que a pessoa digitou, e HTML puro
 * não sabe fazer isso. Sem JS, o formulário não envia — por isso o link
 * direto abaixo dele: o resto do site garante que os 4 links de WhatsApp
 * funcionam com JS desligado (verificar-tags.mjs), e esta página não pode
 * ser a única sem nenhum caminho de contato nesse cenário.
 */
const NECESSIDADES = [
  { valor: "avulso", rotulo: "Aluguel avulso (diária ou período)" },
  { valor: "frota", rotulo: "Terceirização de frota" },
  { valor: "assinatura", rotulo: "Aluguel por assinatura mensal" },
  { valor: "outro", rotulo: "Ainda não sei, quero conversar" },
] as const;

const ESTILO_CAMPO =
  "border-linha rounded-xl border bg-white px-4 py-3 text-base text-tinta focus:border-marca focus:outline-none";

export function FormularioEmpresas() {
  const [nome, setNome] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [necessidade, setNecessidade] = useState("");
  const [enviando, setEnviando] = useState(false);

  function aoEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!nome.trim() || !empresa.trim() || !necessidade || enviando) return;

    const rotuloNecessidade =
      NECESSIDADES.find((item) => item.valor === necessidade)?.rotulo ?? "";
    const mensagem = `Olá! Me chamo ${nome.trim()}, da empresa ${empresa.trim()}. Interesse: ${rotuloNecessidade}.`;

    setEnviando(true);
    const codigo = codigoDeAtendimento();
    const url = linkWhatsAppComMensagem(EMPRESAS.whatsapp, mensagem, codigo);
    irParaWhatsApp({ sendTo: EMPRESAS.sendTo, url, loja: EMPRESAS.slug });
  }

  return (
    <section
      id="fale-com-a-gente"
      className="border-linha border-y bg-white"
    >
      <div className="mx-auto max-w-2xl px-5 py-12 sm:py-16">
        <h2 className="text-2xl font-bold sm:text-3xl">
          Fale com o atendimento corporativo
        </h2>
        <p className="text-tinta-suave mt-2 text-sm">
          Três dados rápidos e você já cai no WhatsApp com quem atende
          empresas.
        </p>

        <form onSubmit={aoEnviar} className="mt-8 flex flex-col gap-5" noValidate>
          <Campo label="Seu nome" htmlFor="nome-empresa">
            <input
              id="nome-empresa"
              name="nome"
              type="text"
              required
              autoComplete="name"
              value={nome}
              onChange={(evento) => setNome(evento.target.value)}
              className={ESTILO_CAMPO}
              placeholder="Como podemos te chamar"
            />
          </Campo>

          <Campo label="Empresa" htmlFor="nome-da-empresa">
            <input
              id="nome-da-empresa"
              name="empresa"
              type="text"
              required
              autoComplete="organization"
              value={empresa}
              onChange={(evento) => setEmpresa(evento.target.value)}
              className={ESTILO_CAMPO}
              placeholder="Nome da empresa"
            />
          </Campo>

          <Campo label="O que sua empresa precisa" htmlFor="necessidade">
            <select
              id="necessidade"
              name="necessidade"
              required
              value={necessidade}
              onChange={(evento) => setNecessidade(evento.target.value)}
              className={ESTILO_CAMPO}
            >
              <option value="" disabled>
                Selecione uma opção
              </option>
              {NECESSIDADES.map((item) => (
                <option key={item.valor} value={item.valor}>
                  {item.rotulo}
                </option>
              ))}
            </select>
          </Campo>

          <button
            type="submit"
            disabled={enviando}
            className="bg-zap hover:bg-zap-escuro active:bg-zap-escuro inline-flex items-center justify-center gap-2 rounded-xl px-5 py-4 text-base font-semibold text-white transition-colors disabled:opacity-70"
          >
            Enviar e falar no WhatsApp
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center gap-2 text-center">
          <span className="text-tinta-suave text-xs">
            Prefere ir direto, sem preencher o formulário?
          </span>
          <BotaoWhatsApp
            numero={EMPRESAS.whatsapp}
            sendTo={EMPRESAS.sendTo}
            loja={EMPRESAS.slug}
            rotulo="Falar agora no WhatsApp"
            variante="contorno"
            className="sm:w-auto"
          />
        </div>
      </div>
    </section>
  );
}

function Campo({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
