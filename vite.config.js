import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separa React e bibliotecas relacionadas
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Separa biblioteca de gráficos
          'charts': ['recharts'],
          // Separa ícones
          'icons': ['lucide-react'],
        },
      },
    },
    // Aumenta o limite de aviso para 600kb (ainda exibe avisos úteis)
    chunkSizeWarningLimit: 600,
  },
})
