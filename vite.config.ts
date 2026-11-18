import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // relative base so the build also works when hosted under a sub-path
  base: "./",
  plugins: [react()],
});
