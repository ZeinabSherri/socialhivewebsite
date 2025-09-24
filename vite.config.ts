import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    headers: {
      // Add CSP headers for Cloudflare Stream in development
      'Content-Security-Policy': 
        "media-src 'self' https://*.cloudflarestream.com https://videodelivery.net blob: data:; " +
        "img-src 'self' https://*.cloudflarestream.com https://videodelivery.net data: blob:; " +
        "frame-src 'self' https://iframe.videodelivery.net https://*.cloudflarestream.com; " +
        "connect-src 'self' https://*.cloudflarestream.com https://videodelivery.net;"
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Ensure proper chunking for video components
        manualChunks: {
          'video-player': ['./src/components/CloudflareStreamPlayer.tsx'],
        }
      }
    }
  }
}));
