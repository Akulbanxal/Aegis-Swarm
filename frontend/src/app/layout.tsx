import type { Metadata } from 'next'
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { SocketProvider } from '@/components/providers/SocketProvider'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-display' })

export const metadata: Metadata = {
  title: 'Aegis Swarm | Multi-Agent Security',
  description: 'Autonomous multi-agent smart contract defense system.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable} font-sans bg-aegis-base text-aegis-text antialiased selection:bg-aegis-cyan/30`}>
        <SocketProvider>
          {children}
        </SocketProvider>
      </body>
    </html>
  )
}
