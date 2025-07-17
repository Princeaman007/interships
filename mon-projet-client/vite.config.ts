// vite.config.ts
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { fileURLToPath, pathToFileURL } from "url"
import { dirname, resolve } from "path"

// Simulation propre de __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
})
