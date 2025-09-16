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
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || 'https://studentback.cloudpub.ru/ws',
  },
  publicRuntimeConfig: {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://studentback.cloudpub.ru/api',
    socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL || 'https://studentback.cloudpub.ru/ws',
  },
  allowedDevOrigins: [
    'vsuetstudent.cloudpub.ru',
    'studentback.cloudpub.ru',
    'localhost',
    '127.0.0.1'
  ]
}

export default nextConfig