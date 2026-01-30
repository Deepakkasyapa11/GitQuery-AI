import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Standard Vite Configuration for high-performance React applications
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  // We removed the AI-specific 'componentTagger' to clean the build pipeline
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      // Standard path aliasing for cleaner imports
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));