/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep Prisma and the TiDB Cloud driver adapter as real Node modules instead
  // of letting Turbopack bundle them, which otherwise breaks the driver-adapter
  // wiring and makes Prisma fall back to a raw TCP connection.
  serverExternalPackages: [
    "@prisma/client",
    "@prisma/adapter-tidbcloud",
    "@tidbcloud/prisma-adapter",
    "@tidbcloud/serverless",
  ],
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
