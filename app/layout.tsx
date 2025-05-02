import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Meteor Dash",
  description: "An endless runner game in space",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}