import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://spring.cloudpub.ru/api',
    NEXT_PUBLIC_WS_URL: process.env.WS_URL || 'ws://spring.cloudpub.ru/ws',
    NEXT_PUBLIC_SOCKET_URL: process.env.SOCKET_URL || 'https://spring.cloudpub.ru/ws',
  },
  publicRuntimeConfig: {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://spring.cloudpub.ru/api',
    wsUrl: process.env.WS_URL || 'ws://spring.cloudpub.ru/ws',
    socketUrl: process.env.SOCKET_URL || 'https://spring.cloudpub.ru/ws',
  }
}

export default nextConfig