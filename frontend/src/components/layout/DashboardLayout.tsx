import React from 'react'
import { Sidebar } from './Sidebar'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-aegis-base text-aegis-text overflow-hidden font-sans selection:bg-aegis-cyan/30">
      <Sidebar />
      <div className="flex-1 flex flex-col relative overflow-y-auto">
        {/* Luminous Glow Behind Content */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-aegis-cyan/10 blur-[120px] rounded-full pointer-events-none" />
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-5 pointer-events-none" />
        
        <main className="flex-1 p-8 z-10 relative">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
