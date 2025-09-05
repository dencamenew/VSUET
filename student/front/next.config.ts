import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://studentback.cloudpub.ru/api',
    NEXT_PUBLIC_WS_URL: process.env.WS_URL || 'ws://studentback.cloudpub.ru/ws',
    NEXT_PUBLIC_SOCKET_URL: process.env.SOCKET_URL || 'https://studentback.cloudpub.ru/ws',
  },
  publicRuntimeConfig: {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://studentback.cloudpub.ru/api',
    wsUrl: process.env.WS_URL || 'ws://studentback.ru/ws',
    socketUrl: process.env.SOCKET_URL || 'https://studentback.cloudpub.ru/ws',
  }
}

export default nextConfig