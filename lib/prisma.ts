import { PrismaClient } from "@prisma/client"
import { PrismaTiDBCloud } from "@tidbcloud/prisma-adapter"

// TiDB Cloud Serverless is reached over its HTTPS driver (port 443), which works
// in serverless runtimes and this preview sandbox. A classic MySQL TCP
// connection (port 4000) is not available here, so we use the driver adapter.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// TiDB Serverless clusters expose read-only system databases (e.g. `sys`).
// If the connection string points at one of those (or omits a database),
// fall back to the writable `test` database so the app can read/write.
function resolveDatabaseUrl() {
  const raw = process.env.DATABASE_URL
  if (!raw) throw new Error("DATABASE_URL is not set")
  try {
    const url = new URL(raw)
    const dbName = url.pathname.replace(/^\//, "")
    if (!dbName || ["sys", "mysql", "information_schema", "performance_schema"].includes(dbName.toLowerCase())) {
      url.pathname = "/test"
    }
    return url.toString()
  } catch {
    return raw
  }
}

function createPrismaClient() {
  const adapter = new PrismaTiDBCloud({ url: resolveDatabaseUrl() })
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
