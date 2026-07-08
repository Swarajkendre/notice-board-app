import { useState } from "react"
import { useRouter } from "next/router"
import { Plus, Megaphone, AlertTriangle, Filter } from "lucide-react"
import type { SerializedNotice } from "@/lib/types"
import { NoticeCard } from "@/components/notice-card"
import { NoticeFormDialog } from "@/components/notice-form-dialog"
import { ConfirmDialog } from "@/components/confirm-dialog"

type Props = {
  initialNotices: SerializedNotice[]
}

const categoryColors: Record<string, string> = {
  Exam: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  Event: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300",
  General: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
}

export function NoticeBoard({ initialNotices }: Props) {
  const router = useRouter()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<SerializedNotice | null>(null)
  const [deleting, setDeleting] = useState<SerializedNotice | null>(null)
  const [deletePending, setDeletePending] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>("All")

  const categories = [...new Set(initialNotices.map((n) => n.category))]
  const filtered = filterCategory === "All"
    ? initialNotices
    : initialNotices.filter((n) => n.category === filterCategory)
  const urgentCount = filtered.filter((n) => n.isUrgent).length

  function refresh() {
    // Re-run getServerSideProps to pull the freshly ordered list from the DB.
    router.replace(router.asPath, undefined, { scroll: false })
  }

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(notice: SerializedNotice) {
    setEditing(notice)
    setFormOpen(true)
  }

  async function confirmDelete() {
    if (!deleting) return
    setDeletePending(true)
    setDeleteError(null)
    try {
      const res = await fetch(`/api/notices/${deleting.id}`, {
        method: "DELETE",
      })
      if (!res.ok && res.status !== 204) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed to delete notice.")
      }
      setDeleting(null)
      refresh()
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Something went wrong.")
    } finally {
      setDeletePending(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:py-10">
          <div className="flex items-start gap-3">
            <span className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Megaphone className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                Notice Board
              </h1>
              <p className="mt-1 text-sm text-muted-foreground text-pretty">
                {filtered.length}{" "}
                {filtered.length === 1 ? "notice" : "notices"}
                {urgentCount > 0 && (
                  <span className="text-destructive">
                    {" · "}
                    {urgentCount} urgent
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {categories.length > 0 && (
              <div className="relative">
                <Filter className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="h-10 appearance-none rounded-lg border border-border bg-background pl-9 pr-8 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Filter by category"
                >
                  <option value="All">All</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            )}
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <Plus className="size-4" aria-hidden="true" />
              New Notice
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Megaphone className="size-6" aria-hidden="true" />
            </span>
            <h2 className="mt-4 text-lg font-medium">
              {initialNotices.length === 0 ? "No notices yet" : "No notices match this filter"}
            </h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground text-pretty">
              {initialNotices.length === 0
                ? "Create your first notice to share an announcement with everyone."
                : "Try selecting a different category."}
            </p>
            {initialNotices.length === 0 && (
              <button
                type="button"
                onClick={openCreate}
                className="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <Plus className="size-4" aria-hidden="true" />
                New Notice
              </button>
            )}
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((notice) => (
              <li key={notice.id}>
                <NoticeCard
                  notice={notice}
                  onEdit={() => openEdit(notice)}
                  onDelete={() => {
                    setDeleteError(null)
                    setDeleting(notice)
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      <NoticeFormDialog
        open={formOpen}
        notice={editing}
        onClose={() => setFormOpen(false)}
        onSaved={() => {
          setFormOpen(false)
          refresh()
        }}
      />

      <ConfirmDialog
        open={deleting !== null}
        title="Delete this notice?"
        description={
          deleting
            ? `"${deleting.title}" will be permanently removed. This cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        pending={deletePending}
        error={deleteError}
        icon={<AlertTriangle className="size-5" aria-hidden="true" />}
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
      />
    </main>
  )
}
