#!/usr/bin/env bash
# Baixa as imagens brutas do site oficial para .raw/.
#
# Roda uma vez. A triagem do que entra na página está em src/lib/frota.ts e em
# scripts/otimizar-imagens.mjs. As imagens reprovadas continuam em .raw/ de
# propósito, para o próximo a revisar poder conferir o critério.
#
# Uso: bash scripts/baixar-imagens.sh
set -euo pipefail

cd "$(dirname "$0")/.."
mkdir -p .raw/frota .raw/lojas

ORIGEM="https://america-rentalcar.com.br"

# A extensão varia por arquivo, então tenta as duas e guarda a que responder 200
for slug in a c c1 d d1 e f g h1 h2 h3 i j k l l1 m n1 p; do
  for ext in png jpg; do
    destino=".raw/frota/${slug}.${ext}"
    codigo=$(curl -sL -o "$destino" -w "%{http_code}" --max-time 20 \
      "${ORIGEM}/images/veiculos/${slug}.${ext}")
    if [ "$codigo" = "200" ]; then
      echo "ok  ${destino}  $(wc -c < "$destino") bytes"
    else
      rm -f "$destino"
    fi
  done
done

for arquivo in logo.png vitoria.png vilavelha.png guarapari.png; do
  curl -sL -o ".raw/lojas/${arquivo}" --max-time 20 "${ORIGEM}/images/${arquivo}"
done

for numero in 4 5 6; do
  curl -sL -o ".raw/lojas/banner${numero}.jpg" --max-time 25 \
    "${ORIGEM}/images/main-slider/banner${numero}.jpg"
done

echo "Pronto. Agora: npm run imagens"
