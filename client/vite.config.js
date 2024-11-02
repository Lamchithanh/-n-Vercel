import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Thay đổi cách lấy giá trị hiện tại của thư mục
const currentDir = process.cwd();

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(currentDir, "src"), // Sử dụng currentDir thay cho __dirname
    },
  },
});
