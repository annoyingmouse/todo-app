/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import basicSsl from '@vitejs/plugin-basic-ssl';
import wasm from "vite-plugin-wasm";
import { readFileSync, copyFileSync } from "fs";
import { resolve } from "path";

const wasmSrc = resolve(
  __dirname,
  "node_modules/@npiesco/absurder-sql/pkg/absurder_sql_bg.wasm",
);

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    {
      name: "absurder-wasm",
      // Dev: intercept the request and serve the WASM with the correct MIME type
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url?.startsWith("/absurder_sql_bg.wasm")) {
            res.setHeader("Content-Type", "application/wasm");
            res.end(readFileSync(wasmSrc));
            return;
          }
          next();
        });
      },
      // Build: copy the WASM into public/ so it ships with the bundle
      buildStart() {
        copyFileSync(wasmSrc, resolve(__dirname, "public/absurder_sql_bg.wasm"));
      },
    },
    wasm(),
    tailwindcss(),
    basicSsl(),
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
  ],
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: 'src/setupTests.ts',
  },
  base: '/'
});
