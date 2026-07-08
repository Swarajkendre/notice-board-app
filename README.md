# Notice Board App

A full CRUD notice board built for **Reno Platforms** — a responsive web app that lets institutions post, edit, and manage community notices with category filters, urgency badges, and image support.

**Live URL:** [https://noticeboard-git-main-surajkendre0089-2814s-projects.vercel.app/](https://noticeboard-git-main-surajkendre0089-2814s-projects.vercel.app/)

## Tech Stack

- **Framework:** Next.js (Pages Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui tokens
- **Database:** TiDB Cloud (MySQL-compatible) via Prisma ORM
- **File storage:** Vercel Blob
- **Deployment:** Vercel (Hobby tier)

## Features

- Create, read, update, and delete notices
- Urgent notices always appear first with a red badge
- Category filtering (Exam, Event, General)
- Image upload for notices
- Responsive grid layout (phone, tablet, desktop)
- Dark mode support (follows system preference)
- Server-side validation with instant client feedback
- Confirmation dialog before deletion

## Getting Started

1.  **Clone the repo**

    ```bash
    git clone https://github.com/Swarajkendre/notice-board-app.git
    cd notice-board-app
    ```

2.  **Install dependencies**

    ```bash
    npm install
    # or
    pnpm install
    ```

3.  **Set up environment variables**

    Create a `.env.local` file:

    ```env
    DATABASE_URL="mysql://..."
    BLOB_READ_WRITE_TOKEN="..."
    ```

    - Get a free TiDB Cloud database at [tidbcloud.com](https://tidbcloud.com)
    - Get a Vercel Blob token in your Vercel project dashboard → Storage

4.  **Push the schema to your database**

    ```bash
    npx prisma db push
    ```

5.  **Run the development server**

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000).

## One thing I would improve with more time

Add **real-time updates** — when one user creates or edits a notice, other open instances of the app would update instantly without requiring a manual page refresh. This could be done with Server-Sent Events (SSE) or WebSockets via a lightweight library like `uWebSockets.js` or by polling the API on an interval. It would make the board feel much more collaborative, especially in an institutional setting where multiple admins may be posting notices simultaneously.

## AI usage

- **v0 by Vercel** — the initial project scaffold, schema, API routes, and components were bootstrapped using v0, an AI-powered development tool. All generated code was reviewed and adapted to meet the assignment requirements.
- **opencode** — used during final polish for README improvements, UI refinements, adding missing fields (category, publishDate), and validation fixes. The AI assisted with code suggestions which were manually verified and adjusted.
