import { useState } from "react"
import { Pencil, Trash2, Calendar } from "lucide-react"
import type { SerializedNotice } from "@/lib/types"

type Props = {
  notice: SerializedNotice
  onEdit: () => void
  onDelete: () => void
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function formatDateOnly(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

const categoryColors: Record<string, string> = {
  Exam: "bg-amber-100 text-amber-800 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:ring-amber-700",
  Event: "bg-sky-100 text-sky-800 ring-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:ring-sky-700",
  General: "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-600",
}

export function NoticeCard({ notice, onEdit, onDelete }: Props) {
  const [imgError, setImgError] = useState(false)

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-md">
      {notice.imageUrl && !imgError && (
        <div className="aspect-video w-full overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={notice.imageUrl || "/placeholder.svg"}
            alt={notice.title}
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
            crossOrigin="anonymous"
          />
        </div>
      )}

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold leading-snug text-balance">
            {notice.title}
          </h3>
          <div className="flex shrink-0 items-center gap-1.5">
            {notice.isUrgent && (
              <span className="inline-flex items-center rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-semibold text-destructive ring-1 ring-inset ring-destructive/20">
                Urgent
              </span>
            )}
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${categoryColors[notice.category] || categoryColors.General}`}>
              {notice.category}
            </span>
          </div>
        </div>

        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
          {notice.content}
        </p>

        <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-3">
          <time
            dateTime={notice.publishDate}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground"
          >
            <Calendar className="size-3.5" aria-hidden="true" />
            {formatDateOnly(notice.publishDate)}
          </time>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onEdit}
              aria-label={`Edit ${notice.title}`}
              className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Pencil className="size-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={onDelete}
              aria-label={`Delete ${notice.title}`}
              className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/40"
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
