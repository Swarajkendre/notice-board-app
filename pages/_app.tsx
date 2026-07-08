import "@/styles/globals.css"
import type { AppProps } from "next/app"
import Head from "next/head"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Notice Board — Reno Platforms</title>
        <meta
          name="description"
          content="Post, edit, and manage community notices. Filter by category, mark urgency, and attach images."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#ffffff" />
      </Head>
      <div className={`${geistSans.variable} ${geistMono.variable} font-sans`}>
        <Component {...pageProps} />
      </div>
      {process.env.NODE_ENV === "production" && <Analytics />}
    </>
  )
}
