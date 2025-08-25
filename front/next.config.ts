import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
    NEXT_PUBLIC_WS_URL: process.env.WS_URL || 'ws://localhost:8080/ws',
    NEXT_PUBLIC_SOCKET_URL: process.env.SOCKET_URL || 'http://localhost:8080/ws',
  },
  publicRuntimeConfig: {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
    wsUrl: process.env.WS_URL || 'ws://localhost:8080/ws',
    socketUrl: process.env.SOCKET_URL || 'http://localhost:8080/ws',
  }
}

export default nextConfig