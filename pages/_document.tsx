import { Html, Head, Main, NextScript } from "next/document"

export default function Document() {
  return (
    <Html lang="en" className="bg-background">
      <Head />
      <body className="antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme:dark)').matches))document.documentElement.classList.add('dark')}catch(e){}})()`,
          }}
        />
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
