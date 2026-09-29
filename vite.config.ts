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
    // A página é pré-renderizada em HTML estático no build. O SSR continua
    // valendo: o HTML sai pronto, com o conteúdo todo, só que gerado uma vez
    // em vez de a cada visita. Resultado: dist/client é um site estático, que
    // qualquer CDN entrega sem função de servidor e sem cold start no caminho
    // do clique pago. O destaque de loja por UTM, que dependia do servidor,
    // virou um script curto no fim do corpo (routes/__root.tsx).
    tanstackStart({
      prerender: { enabled: true, failOnError: true },
      pages: [{ path: "/" }, { path: "/empresas" }],
    }),
    viteReact(),
  ],
});
