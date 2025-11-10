import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { Client } from "./client"
import Script from "next/script"

export const metadata: Metadata = {
  title: "Student Schedule App",
  description: "Telegram Mini App для расписания студентов",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <Client>
          {children}
        </Client>
        <Script
          src="https://st.max.ru/js/max-web-app.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
