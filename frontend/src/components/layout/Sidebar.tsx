'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Activity, List, Users, BarChart2, Database } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AegisLogo } from '@/components/AegisLogo'
import { useSocket } from '@/components/providers/SocketProvider'

export function Sidebar() {
  const pathname = usePathname()
  const { incidents, connected } = useSocket()
  
  const hasOpenIncidents = incidents.some(inc => inc.status === 'OPEN' || !inc.status)

  const links = [
    { name: 'Global Command', href: '/dashboard', icon: Activity },
    { name: 'Swarm Telemetry', href: '/dashboard/agents', icon: Users },
    { name: 'Incident Log', href: '/dashboard/incidents', icon: List },
    { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart2 },
  ]

  return (
    <div className="w-64 h-full bg-[#050814]/90 border-r border-white/[0.04] backdrop-blur-xl flex flex-col relative z-20">
      {/* Glow highlight at top of sidebar */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-aegis-cyan/25 to-transparent pointer-events-none" />
      
      {/* Branding Section */}
      <div className="px-6 py-6 flex items-center justify-between border-b border-white/[0.03]">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="p-2 rounded-xl bg-gradient-to-br from-white/[0.02] to-white/[0.08] border border-white/[0.08] group-hover:border-aegis-cyan/40 group-hover:shadow-[0_0_15px_rgba(0,240,255,0.25)] transition-all duration-300">
            <AegisLogo className="w-5 h-5 text-aegis-cyan" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-display font-bold tracking-widest text-white uppercase group-hover:text-aegis-cyan transition-colors duration-300">
              Aegis<span className="text-aegis-cyan font-normal">Swarm</span>
            </span>
            <span className="text-[8px] font-mono tracking-widest text-slate-500 uppercase mt-0.5">
              Secure L1 Shield
            </span>
          </div>
        </Link>
      </div>
      
      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-8 space-y-1.5">
        <div className="px-3 mb-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">
          Security Operations
        </div>
        
        {links.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href || (pathname.startsWith(link.href + '/') && link.href !== '/dashboard')
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-300 text-xs font-mono border select-none group relative",
                isActive 
                  ? "bg-gradient-to-r from-aegis-cyan/[0.08] to-transparent text-white border-white/[0.08] shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)]" 
                  : "text-slate-400 hover:text-white hover:bg-white/[0.02] border-transparent"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-[20%] bottom-[20%] w-[3px] rounded-r-md bg-aegis-cyan shadow-[0_0_10px_rgba(0,240,255,1)]" />
              )}
              
              <div className="flex items-center gap-3">
                <Icon className={cn("w-4 h-4 transition-all duration-300 group-hover:scale-105", isActive ? "text-aegis-cyan drop-shadow-[0_0_4px_rgba(0,240,255,0.4)]" : "text-slate-500 group-hover:text-slate-300")} />
                <span className="font-medium tracking-wide transition-colors duration-200">{link.name}</span>
              </div>
              
              {link.name === 'Incident Log' && hasOpenIncidents && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-aegis-red opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-aegis-red shadow-[0_0_6px_#f43f5e]"></span>
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Cloud Status Panel */}
      <div className="p-4 m-4 rounded-xl bg-gradient-to-b from-white/[0.015] to-white/[0.005] border border-white/[0.04] shadow-glass-inner backdrop-blur-md relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-tr from-aegis-cyan/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        
        <div className="flex items-center gap-2 mb-2">
          <Database className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">
            Consortia Node
          </span>
        </div>
        
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.03]">
          <span className="text-[10px] text-slate-500 font-mono">Somnia L1</span>
          <div className="flex items-center gap-1.5">
            <div className={cn(
              "w-1.5 h-1.5 rounded-full transition-all duration-500",
              connected 
                ? 'bg-aegis-green animate-pulse shadow-[0_0_8px_#10b981]' 
                : 'bg-aegis-red shadow-[0_0_8px_#f43f5e]'
            )} />
            <span className={cn(
              "text-[9px] font-mono font-bold tracking-wider uppercase transition-colors duration-500",
              connected ? 'text-aegis-green text-glow-green' : 'text-aegis-red text-glow-red'
            )}>
              {connected ? 'SYNCED' : 'OFFLINE'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
