import type { NextApiRequest, NextApiResponse } from "next"
import { put } from "@vercel/blob"

// Disable the default body parser so we can stream the raw file bytes.
export const config = {
  api: {
    bodyParser: false,
  },
}

const MAX_BYTES = 8 * 1024 * 1024 // 8 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"]

function readRawBody(req: NextApiRequest, limit: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    let size = 0
    req.on("data", (chunk: Buffer) => {
      size += chunk.length
      if (size > limit) {
        reject(new Error("FILE_TOO_LARGE"))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on("end", () => resolve(Buffer.concat(chunks)))
    req.on("error", reject)
  })
}

// POST /api/upload -> uploads an image to Vercel Blob, returns { url }
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"])
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` })
  }

  const contentType = req.headers["content-type"] || ""
  if (!ALLOWED.includes(contentType)) {
    return res
      .status(422)
      .json({ error: "Only JPEG, PNG, WEBP, or GIF images are allowed." })
  }

  const filename =
    (Array.isArray(req.headers["x-filename"])
      ? req.headers["x-filename"][0]
      : req.headers["x-filename"]) || "upload"

  try {
    const buffer = await readRawBody(req, MAX_BYTES)
    if (buffer.length === 0) {
      return res.status(400).json({ error: "No file provided." })
    }

    const blob = await put(`notices/${Date.now()}-${filename}`, buffer, {
      access: "public",
      contentType,
    })

    return res.status(201).json({ url: blob.url })
  } catch (error) {
    if (error instanceof Error && error.message === "FILE_TOO_LARGE") {
      return res.status(413).json({ error: "Image must be 8 MB or smaller." })
    }
    console.error("[v0] /api/upload error:", error)
    return res.status(500).json({ error: "Upload failed." })
  }
}
