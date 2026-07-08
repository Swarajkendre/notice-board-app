import type { NextApiRequest, NextApiResponse } from "next"
import { prisma } from "@/lib/prisma"
import { validateNotice } from "@/lib/validation"

// /api/notices
//   GET  -> list all notices (urgent first, then newest first)
//   POST -> create a new notice
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case "GET": {
        const notices = await prisma.notice.findMany({
          // Ordering is enforced by the database, not the browser.
          orderBy: [{ isUrgent: "desc" }, { createdAt: "desc" }],
        })
        return res.status(200).json({ notices })
      }

      case "POST": {
        const result = validateNotice(req.body)
        if (!result.valid) {
          return res.status(422).json({ errors: result.errors })
        }

        const notice = await prisma.notice.create({
          data: result.data,
        })
        return res.status(201).json({ notice })
      }

      default: {
        res.setHeader("Allow", ["GET", "POST"])
        return res
          .status(405)
          .json({ error: `Method ${req.method} Not Allowed` })
      }
    }
  } catch (error) {
    console.error("[v0] /api/notices error:", error)
    return res.status(500).json({ error: "Internal Server Error" })
  }
}
