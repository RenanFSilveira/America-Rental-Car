/**
 * FAQ curto, em <details> nativo (funciona sem JavaScript, sem estado React).
 *
 * As três perguntas respondem dúvida real de busca (ver termos que o cliente
 * enviou: "...Espírito Santo", "...Brasil", "...Bahia", "...MG", "vale a
 * pena?"). A resposta da primeira corrige de propósito a expectativa de
 * atendimento fora do ES: a operação é confirmada só em Vila Velha, Vitória e
 * Guarapari (perfil.md), então a página não deixa a dúvida no ar. Nenhuma
 * resposta afirma condição de contrato não confirmada — onde a resposta
 * depende disso, ela aponta para o atendimento corporativo.
 */
const PERGUNTAS = [
  {
    pergunta: "A América atende empresas em todo o Brasil?",
    resposta:
      "O atendimento é no Espírito Santo, com loja própria em Vila Velha, Vitória e Guarapari.",
  },
  {
    pergunta: "Qual a diferença entre aluguel avulso e terceirização de frota?",
    resposta:
      "No aluguel avulso, sua empresa contrata por diária ou período determinado. Na terceirização, a frota fica sob contrato com a América.",
  },
  {
    pergunta: "Como funciona o orçamento para a minha empresa?",
    resposta:
      "Cada empresa tem uma necessidade diferente de frota. Fale com o atendimento corporativo abaixo e monte a condição junto com a equipe.",
  },
] as const;

export function FaqEmpresas() {
  return (
    <section className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
      <h2 className="text-2xl font-bold sm:text-3xl">Perguntas frequentes</h2>

      <div className="mt-8 flex flex-col gap-3">
        {PERGUNTAS.map((item) => (
          <details
            key={item.pergunta}
            className="border-linha group rounded-xl border bg-white p-5"
          >
            <summary className="cursor-pointer list-none font-semibold marker:content-none">
              {item.pergunta}
            </summary>
            <p className="text-tinta-suave mt-3 text-sm leading-relaxed">
              {item.resposta}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
