import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 关键配置：设置为 './' 使得资源路径变为相对路径
  base: './',
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'lucide-react'],
          pdf: ['jspdf', 'html2canvas', 'jspdf-autotable'],
          genai: ['@google/genai']
        }
      }
    }
  },
  define: {
    'process.env': {}
  }
});