#!/usr/bin/env bash
# Baixa o logo oficial para .raw/, que é a origem das imagens da página.
#
# A vitrine de frota saiu da página a pedido do cliente em 17/08/2026, então o
# download das fotos de veículo não é mais necessário. O histórico do git
# guarda a versão que baixava a frota inteira, caso a seção volte.
#
# Uso: bash scripts/baixar-imagens.sh && node scripts/imagens.mjs
set -euo pipefail

cd "$(dirname "$0")/.."
mkdir -p .raw

curl -sL -o .raw/logo.png --max-time 20 "https://america-rentalcar.com.br/images/logo.png"
echo "ok  .raw/logo.png  $(wc -c < .raw/logo.png) bytes"

echo "Pronto. Agora: npm run imagens"
