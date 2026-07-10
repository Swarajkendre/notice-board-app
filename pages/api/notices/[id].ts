import type { NextApiRequest, NextApiResponse } from "next"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { validateNotice } from "@/lib/validation"

// /api/notices/:id
//   GET    -> fetch one notice
//   PUT    -> update a notice
//   DELETE -> delete a notice
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = Number(req.query.id)
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid notice id." })
  }

  try {
    switch (req.method) {
      case "GET": {
        const notice = await prisma.notice.findUnique({ where: { id } })
        if (!notice) {
          return res.status(404).json({ error: "Notice not found." })
        }
        return res.status(200).json({ notice })
      }

      case "PUT": {
        const result = validateNotice(req.body)
        if (!result.valid) {
          return res.status(422).json({ errors: result.errors })
        }

        const notice = await prisma.notice.update({
          where: { id },
          data: {
            ...result.data,
            publishDate: new Date(result.data.publishDate),
          },
        })
        return res.status(200).json({ notice })
      }

      case "DELETE": {
        await prisma.notice.delete({ where: { id } })
        return res.status(204).end()
      }

      default: {
        res.setHeader("Allow", ["GET", "PUT", "DELETE"])
        return res
          .status(405)
          .json({ error: `Method ${req.method} Not Allowed` })
      }
    }
  } catch (error) {
    // Prisma "record not found" for update/delete
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return res.status(404).json({ error: "Notice not found." })
    }
    console.error("[v0] /api/notices/[id] error:", error)
    const message = error instanceof Error ? error.message : "Unknown error"
    return res.status(500).json({ error: "Internal Server Error", details: message })
  }
}
