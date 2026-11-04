import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Builds into ../web, a static site: index.html, config.json and hashed bundles in assets/.
// base "./" keeps every URL relative, so the same build works on 127.0.0.1:8630 and on a Hugging Face static Space.
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: { outDir: "../web", emptyOutDir: true, assetsDir: "assets", chunkSizeWarningLimit: 900 },
  server: { port: 5190, host: "127.0.0.1", strictPort: true },
});
