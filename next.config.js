/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [],
  },
  // Configuração para otimização
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Otimização de imports de pacotes grandes
  experimental: {
    optimizePackageImports: ['lucide-react', 'date-fns', 'recharts', '@radix-ui/react-dialog', '@radix-ui/react-select'],
  },
  // Otimização de chunks do webpack
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Chunk para Recharts (biblioteca de charts pesada)
            recharts: {
              test: /[\\/]node_modules[\\/]recharts[\\/]/,
              name: 'recharts',
              priority: 40,
              reuseExistingChunk: true,
            },
            // Chunk para Radix UI (componentes)
            radix: {
              test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
              name: 'radix-ui',
              priority: 30,
              reuseExistingChunk: true,
            },
            // Chunk para utilitários de data
            dateFns: {
              test: /[\\/]node_modules[\\/]date-fns[\\/]/,
              name: 'date-fns',
              priority: 20,
              reuseExistingChunk: true,
            },
            // Chunk comum para bibliotecas compartilhadas
            lib: {
              test: /[\\/]node_modules[\\/]/,
              name: 'lib',
              priority: 10,
              minChunks: 2,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }
    return config;
  },
}

module.exports = nextConfig