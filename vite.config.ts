import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "./", // importante para que funcione en subcarpetas
  server: {
    allowedHosts: ["vanetta-thyrsoid-tanya.ngrok-free.dev"],
  },
});
