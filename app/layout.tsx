import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Agno Parse',
  description: '一个强大的流式解析器工具',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
