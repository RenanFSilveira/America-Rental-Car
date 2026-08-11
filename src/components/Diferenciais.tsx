/**
 * Diferenciais. Só o que se sustenta com o que está confirmado:
 * operação local no ES, atendimento direto por WhatsApp, processo simples.
 * Sem prazo de entrega, sem tempo de resposta, sem selo.
 */
const ITENS = [
  {
    titulo: "Locadora daqui, não uma central de atendimento",
    texto:
      "A América é capixaba e tem loja e equipe próprias em Vila Velha, Vitória e Guarapari. Quem atende conhece a região, o trânsito e a distância que você vai percorrer.",
  },
  {
    titulo: "Conversa direta com a unidade",
    texto:
      "O número que você aciona é o da loja que vai entregar o carro. Sua solicitação não passa por uma fila de central nem por um formulário que alguém retorna depois.",
  },
  {
    titulo: "Menos burocracia para resolver",
    texto:
      "Você diz o que precisa e para quando, e combina retirada e devolução na própria conversa. Sem cadastro obrigatório antes de falar com alguém.",
  },
] as const;

export function Diferenciais() {
  return (
    <section className="mx-auto max-w-5xl px-5 py-12 sm:py-16">
      <h2 className="text-2xl font-bold sm:text-3xl">
        Por que alugar com a América
      </h2>

      <ul className="mt-8 grid gap-6 sm:grid-cols-3">
        {ITENS.map((item) => (
          <li key={item.titulo}>
            <div className="bg-marca h-1 w-10 rounded-full" />
            <h3 className="mt-4 text-lg font-semibold">{item.titulo}</h3>
            <p className="text-tinta-suave mt-2 text-sm leading-relaxed">
              {item.texto}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
