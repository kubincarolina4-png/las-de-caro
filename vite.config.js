import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// El repo se llama "las-de-caro", así que GitHub Pages lo publica en
// https://<tu-usuario>.github.io/las-de-caro/ -- por eso el "base" abajo.
// Si alguna vez renombrás el repositorio, actualizá este valor también.
export default defineConfig({
  plugins: [react()],
 base: "/",
});
