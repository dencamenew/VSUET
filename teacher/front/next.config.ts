import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
<<<<<<< HEAD
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api',
  },
  publicRuntimeConfig: {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api',
=======
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://teacherbackend1.cloudpub.ru/api',
  },
  publicRuntimeConfig: {
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://teacherbackend1.cloudpub.ru/api',
>>>>>>> teacher
  }
}

export default nextConfig;
