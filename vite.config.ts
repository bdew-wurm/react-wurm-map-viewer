import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    react(),
    dts({ include: ["src"], entryRoot: "src", rollupTypes: false, tsconfigPath: "./tsconfig.json" }),
  ],
  build: {
    lib: {
      entry: "src/index.tsx",
      formats: ["es", "cjs"],
      fileName: format => (format === "es" ? "index.js" : "index.cjs"),
      cssFileName: "style",
    },
    rollupOptions: {
      output: { banner: "\"use client\";" },
      external: [/^react($|\/)/, /^react-dom($|\/)/, /^react-icons($|\/)/],
    },
  },
});
