/**
 * Fonte única das categorias exibidas na vitrine de frota.
 *
 * As categorias e suas descrições reproduzem o que o site oficial publica. Nada
 * aqui é inventado: sem preço, sem ano, sem quantidade, sem promessa de modelo
 * específico. A foto ilustra a categoria.
 *
 * Triagem de imagem: só entram categorias cuja foto de origem mostra veículo de
 * aparência atual. As reprovadas estão listadas em CATEGORIAS_SEM_FOTO_APROVADA,
 * com o motivo, e dependem de foto nova para voltar.
 */

export type Categoria = {
  /** Letra do grupo, como o site publica. */
  codigo: string;
  /** Descrição curta, derivada do rótulo do site. */
  descricao: string;
  /** Etiquetas curtas, também derivadas do rótulo do site. */
  etiquetas: string[];
  /** Nome base do arquivo em public/frota (sem extensão). */
  imagem: string;
  /** Texto alternativo. Descreve o que a foto mostra, sem prometer modelo. */
  alt: string;
};

export const CATEGORIAS: readonly Categoria[] = [
  {
    codigo: "A",
    descricao: "Hatch subcompacto",
    etiquetas: ["Compacto"],
    imagem: "a",
    alt: "Hatch subcompacto branco da categoria A da América Rental Car",
  },
  {
    codigo: "C",
    descricao: "Hatch completo, com ar-condicionado",
    etiquetas: ["Completo", "Ar-condicionado"],
    imagem: "c",
    alt: "Hatch branco completo da categoria C da América Rental Car",
  },
  {
    codigo: "C1",
    descricao: "Sedan",
    etiquetas: ["Porta-malas maior"],
    imagem: "c1",
    alt: "Sedan branco da categoria C1 da América Rental Car",
  },
  {
    codigo: "D1",
    descricao: "Hatch automático",
    etiquetas: ["Câmbio automático"],
    imagem: "d1",
    alt: "Hatch branco automático da categoria D1 da América Rental Car",
  },
  {
    codigo: "F",
    descricao: "Sedan automático",
    etiquetas: ["Câmbio automático"],
    imagem: "f",
    alt: "Sedan branco automático da categoria F da América Rental Car",
  },
  {
    codigo: "J",
    descricao: "SUV",
    etiquetas: ["SUV"],
    imagem: "j",
    alt: "SUV branco da categoria J da América Rental Car",
  },
  {
    codigo: "H2",
    descricao: "Pickup",
    etiquetas: ["Pickup"],
    imagem: "h2",
    alt: "Pickup branca de cabine dupla da categoria H2 da América Rental Car",
  },
  {
    codigo: "H3",
    descricao: "Pickup 4x4 a diesel",
    etiquetas: ["4x4", "Diesel"],
    imagem: "h3",
    alt: "Pickup branca 4x4 a diesel da categoria H3 da América Rental Car",
  },
  {
    codigo: "N1",
    descricao: "Furgão grande a diesel",
    etiquetas: ["Carga", "Diesel"],
    imagem: "n1",
    alt: "Furgão branco de carga da categoria N1 da América Rental Car",
  },
] as const;

/**
 * Categorias que existem no site mas ficaram de fora da vitrine, com o motivo.
 * Alimenta a lista de pendências da entrega. Não é usada em tela.
 */
export const CATEGORIAS_SEM_FOTO_APROVADA: readonly {
  codigo: string;
  descricao: string;
  motivo: string;
}[] = [
  {
    codigo: "D",
    descricao: "Hatch turbo",
    motivo:
      "A foto de origem mostra um Onix. O cliente reprovou Onix em 28/07/2026. Precisa de foto de outro modelo.",
  },
  {
    codigo: "E",
    descricao: "Sedan mecânico",
    motivo:
      "A foto de origem mostra um Onix Plus. Mesmo critério da categoria D.",
  },
  {
    codigo: "G",
    descricao: "Mini van 7 lugares",
    motivo: "Foto de geração antiga do veículo, aparência datada.",
  },
  {
    codigo: "H1",
    descricao: "Pickup cabine simples",
    motivo: "Foto de geração antiga e de baixa qualidade.",
  },
  {
    codigo: "I",
    descricao: "Furgão pequeno",
    motivo: "Foto com frente datada.",
  },
  {
    codigo: "K",
    descricao: "Executivo luxo",
    motivo:
      "Foto de sedan de geração 2015 a 2017, aparência datada, resolução baixa.",
  },
  {
    codigo: "L",
    descricao: "Utilitário diesel 4x4, cabine simples",
    motivo: "Foto de geração antiga do veículo.",
  },
  {
    codigo: "L1",
    descricao: "Utilitário diesel 4x4, cabine dupla",
    motivo: "Foto de geração antiga do veículo.",
  },
  {
    codigo: "M",
    descricao: "Van 15 lugares",
    motivo: "Foto de geração antiga do veículo.",
  },
  {
    codigo: "P",
    descricao: "Caminhão VUC até 3.500 kg",
    motivo: "Não existe imagem desta categoria no site de origem.",
  },
];
