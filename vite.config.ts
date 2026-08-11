import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  resolve: {
    alias: {
      "~": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  plugins: [
    tailwindcss(),
    // target padrão = node-server (roda com `npm run build && npm start`).
    // Para publicar na Cloudflare, trocar por: tanstackStart({ target: "cloudflare-module" })
    // e usar o wrangler.toml da raiz. Ver RELATORIO.md, seção "Hospedagem".
    tanstackStart(),
    viteReact(),
  ],
});
