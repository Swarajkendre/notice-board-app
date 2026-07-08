import type { GetServerSideProps } from "next"
import { prisma } from "@/lib/prisma"
import type { SerializedNotice } from "@/lib/types"
import { NoticeBoard } from "@/components/notice-board"

type HomeProps = {
  notices: SerializedNotice[]
}

export default function Home({ notices }: HomeProps) {
  return <NoticeBoard initialNotices={notices} />
}

// Data is fetched and ordered on the server (urgent first, then newest first).
export const getServerSideProps: GetServerSideProps<HomeProps> = async () => {
  try {
    const notices = await prisma.notice.findMany({
      orderBy: [{ isUrgent: "desc" }, { createdAt: "desc" }],
    })

    return {
      props: {
        notices: notices.map((n) => ({
          id: n.id,
          title: n.title,
          content: n.content,
          category: n.category,
          isUrgent: n.isUrgent,
          publishDate: n.publishDate.toISOString(),
          imageUrl: n.imageUrl,
          createdAt: n.createdAt.toISOString(),
          updatedAt: n.updatedAt.toISOString(),
        })),
      },
    }
  } catch (error) {
    console.error("[v0] getServerSideProps error:", error)
    // Render an empty board if the DB is unreachable rather than crashing.
    return { props: { notices: [] } }
  }
}
