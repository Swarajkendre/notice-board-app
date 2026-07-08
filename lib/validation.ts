// Shared validation used by the API routes (server-side) and reused by the
// client form for instant feedback. The API is the source of truth.

export type NoticeInput = {
  title: string
  content: string
  isUrgent: boolean
  imageUrl: string | null
}

export type ValidationResult =
  | { valid: true; data: NoticeInput }
  | { valid: false; errors: Record<string, string> }

const TITLE_MIN = 3
const TITLE_MAX = 150
const CONTENT_MIN = 5
const CONTENT_MAX = 5000

export function validateNotice(body: unknown): ValidationResult {
  const errors: Record<string, string> = {}

  if (typeof body !== "object" || body === null) {
    return { valid: false, errors: { form: "Invalid request body." } }
  }

  const raw = body as Record<string, unknown>

  // Title
  const title = typeof raw.title === "string" ? raw.title.trim() : ""
  if (!title) {
    errors.title = "Title is required."
  } else if (title.length < TITLE_MIN) {
    errors.title = `Title must be at least ${TITLE_MIN} characters.`
  } else if (title.length > TITLE_MAX) {
    errors.title = `Title must be ${TITLE_MAX} characters or fewer.`
  }

  // Content
  const content = typeof raw.content === "string" ? raw.content.trim() : ""
  if (!content) {
    errors.content = "Content is required."
  } else if (content.length < CONTENT_MIN) {
    errors.content = `Content must be at least ${CONTENT_MIN} characters.`
  } else if (content.length > CONTENT_MAX) {
    errors.content = `Content must be ${CONTENT_MAX} characters or fewer.`
  }

  // isUrgent (optional, defaults to false)
  const isUrgent = raw.isUrgent === true || raw.isUrgent === "true"

  // imageUrl (optional)
  let imageUrl: string | null = null
  if (raw.imageUrl !== undefined && raw.imageUrl !== null && raw.imageUrl !== "") {
    if (typeof raw.imageUrl !== "string") {
      errors.imageUrl = "Image URL must be a string."
    } else {
      try {
        // eslint-disable-next-line no-new
        new URL(raw.imageUrl)
        imageUrl = raw.imageUrl
      } catch {
        errors.imageUrl = "Image URL must be a valid URL."
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors }
  }

  return { valid: true, data: { title, content, isUrgent, imageUrl } }
}
