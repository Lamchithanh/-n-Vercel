import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Get current working directory
const currentDir = process.cwd();

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(currentDir, "src"), // Alias '@' points to 'src' folder
    },
  },
});
