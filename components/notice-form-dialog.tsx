import { useEffect, useRef, useState } from "react"
import { ImagePlus, Loader2, X } from "lucide-react"
import type { SerializedNotice } from "@/lib/types"
import { Modal } from "@/components/modal"

type Props = {
  open: boolean
  notice: SerializedNotice | null
  onClose: () => void
  onSaved: () => void
}

type FieldErrors = Record<string, string>

export function NoticeFormDialog({ open, notice, onClose, onSaved }: Props) {
  const isEdit = notice !== null
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState("General")
  const [isUrgent, setIsUrgent] = useState(false)
  const [publishDate, setPublishDate] = useState("")
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Sync form state whenever the dialog opens for a new/edited notice.
  useEffect(() => {
    if (open) {
      setTitle(notice?.title ?? "")
      setContent(notice?.content ?? "")
      setCategory(notice?.category ?? "General")
      setIsUrgent(notice?.isUrgent ?? false)
      setPublishDate(notice?.publishDate ? new Date(notice.publishDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0])
      setImageUrl(notice?.imageUrl ?? null)
      setErrors({})
    }
  }, [open, notice])

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setErrors((prev) => ({ ...prev, imageUrl: "" }))
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "content-type": file.type,
          "x-filename": encodeURIComponent(file.name),
        },
        body: file,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Upload failed.")
      setImageUrl(data.url)
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        imageUrl: err instanceof Error ? err.message : "Upload failed.",
      }))
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setErrors({})
    try {
      const res = await fetch(
        isEdit ? `/api/notices/${notice!.id}` : "/api/notices",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ title, content, category, isUrgent, publishDate, imageUrl }),
        },
      )

      if (res.status === 422) {
        const data = await res.json()
        setErrors(data.errors || {})
        return
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to save notice.")
      }
      onSaved()
    } catch (err) {
      setErrors({
        form: err instanceof Error ? err.message : "Something went wrong.",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} labelledBy="form-title">
      <form onSubmit={handleSubmit}>
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 id="form-title" className="text-lg font-semibold">
            {isEdit ? "Edit notice" : "New notice"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex flex-col gap-5 p-5">
          {errors.form && (
            <p
              role="alert"
              className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {errors.form}
            </p>
          )}

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="title" className="text-sm font-medium">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={150}
              aria-invalid={!!errors.title}
              className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring aria-[invalid=true]:border-destructive"
              placeholder="e.g. Water supply interruption"
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title}</p>
            )}
          </div>

          {/* Content */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="content" className="text-sm font-medium">
              Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              maxLength={5000}
              aria-invalid={!!errors.content}
              className="resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm leading-relaxed outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring aria-[invalid=true]:border-destructive"
              placeholder="Share the details of your notice…"
            />
            {errors.content && (
              <p className="text-xs text-destructive">{errors.content}</p>
            )}
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="category" className="text-sm font-medium">
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-invalid={!!errors.category}
              className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring aria-[invalid=true]:border-destructive"
            >
              <option value="General">General</option>
              <option value="Exam">Exam</option>
              <option value="Event">Event</option>
            </select>
            {errors.category && (
              <p className="text-xs text-destructive">{errors.category}</p>
            )}
          </div>

          {/* Publish Date */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="publishDate" className="text-sm font-medium">
              Publish date
            </label>
            <input
              id="publishDate"
              type="date"
              value={publishDate}
              onChange={(e) => setPublishDate(e.target.value)}
              aria-invalid={!!errors.publishDate}
              className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring aria-[invalid=true]:border-destructive"
            />
            {errors.publishDate && (
              <p className="text-xs text-destructive">{errors.publishDate}</p>
            )}
          </div>

          {/* Urgent toggle */}
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-background p-3">
            <input
              type="checkbox"
              checked={isUrgent}
              onChange={(e) => setIsUrgent(e.target.checked)}
              className="size-4 accent-[var(--destructive)]"
            />
            <span className="flex flex-col">
              <span className="text-sm font-medium">Mark as urgent</span>
              <span className="text-xs text-muted-foreground">
                Urgent notices always appear first with a red badge.
              </span>
            </span>
          </label>

          {/* Image upload */}
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">
              Image{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </span>

            {imageUrl ? (
              <div className="relative overflow-hidden rounded-lg border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl || "/placeholder.svg"}
                  alt="Notice preview"
                  className="aspect-video w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl(null)}
                  aria-label="Remove image"
                  className="absolute right-2 top-2 inline-flex size-8 items-center justify-center rounded-md bg-foreground/70 text-background transition-colors hover:bg-foreground"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex h-24 items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-background text-sm text-muted-foreground transition-colors hover:bg-muted disabled:opacity-60"
              >
                {uploading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    Uploading…
                  </>
                ) : (
                  <>
                    <ImagePlus className="size-4" aria-hidden="true" />
                    Upload an image
                  </>
                )}
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={handleFile}
              className="hidden"
            />
            {errors.imageUrl && (
              <p className="text-xs text-destructive">{errors.imageUrl}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-border p-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || uploading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50"
          >
            {submitting && (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            )}
            {isEdit ? "Save changes" : "Create notice"}
          </button>
        </div>
      </form>
    </Modal>
  )
}
