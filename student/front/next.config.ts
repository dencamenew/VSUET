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
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8080/ws',
  },
  publicRuntimeConfig: {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api',
    socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8080/ws',
  },
  allowedDevOrigins: [
    'vsuetstudent.cloudpub.ru',
    'studentback.cloudpub.ru',
    'localhost',
    '127.0.0.1'
  ]
}

export default nextConfig