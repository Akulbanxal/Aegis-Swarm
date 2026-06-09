'use client'

import { useSocket } from './providers/SocketProvider'
import { Shield, Database, AlertTriangle, Users, Zap, FileText, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

export function SwarmStatus() {
  const { incidents } = useSocket()
  const latest = incidents[0]
  
  // If there is an active (unresolved) incident, we dynamically light up processing agents
  const isThreatActive = latest && latest.status === 'OPEN'

  const agents = [
    {
      name: 'Sentinel Agent',
      role: 'Mempool Monitoring',
      icon: Shield,
      status: isThreatActive && latest.initialThreatDetected ? 'ACTIVE' : 'STANDBY',
      activeColor: 'text-aegis-cyan border-aegis-cyan/30 bg-aegis-cyan/5 shadow-[0_0_12px_rgba(34,211,238,0.15)]',
    },
    {
      name: 'Investigation Agent',
      role: 'Transaction Tracing',
      icon: Database,
      status: isThreatActive && latest.txTrace ? 'ACTIVE' : 'STANDBY',
      activeColor: 'text-aegis-purple border-aegis-purple/30 bg-aegis-purple/5 shadow-[0_0_12px_rgba(168,85,247,0.15)]',
    },
    {
      name: 'Threat Analysis Agent',
      role: 'exploit classification',
      icon: AlertTriangle,
      status: isThreatActive && latest.attackVector && latest.attackVector !== 'UNKNOWN' ? 'ACTIVE' : 'STANDBY',
      activeColor: 'text-aegis-amber border-aegis-amber/30 bg-aegis-amber/5 shadow-[0_0_12px_rgba(245,158,11,0.15)]',
    },
    {
      name: 'Consensus Agent',
      role: 'quorum arbitration',
      icon: Users,
      status: isThreatActive && latest.consensusReached ? 'ACTIVE' : 'STANDBY',
      activeColor: 'text-aegis-cyan border-aegis-cyan/30 bg-aegis-cyan/5 shadow-[0_0_12px_rgba(34,211,238,0.15)]',
    },
    {
      name: 'Response Agent',
      role: 'mitigation planning',
      icon: Zap,
      status: isThreatActive && latest.defenseActionTaken && latest.defenseActionTaken !== 'NO_ACTION' ? 'ACTIVE' : 'STANDBY',
      activeColor: 'text-aegis-red border-aegis-red/30 bg-aegis-red/5 shadow-[0_0_12px_rgba(239,68,68,0.15)]',
    },
    {
      name: 'Reporting Agent',
      role: 'Ledger Audit Archival',
      icon: FileText,
      status: isThreatActive && latest.defenseTxHash ? 'ACTIVE' : 'STANDBY',
      activeColor: 'text-aegis-cyan border-aegis-cyan/30 bg-aegis-cyan/5 shadow-[0_0_12px_rgba(34,211,238,0.15)]',
    },
    {
      name: 'Recovery Agent',
      role: 'admin unpause staging',
      icon: RefreshCw,
      status: isThreatActive && latest.recoveryProposed ? 'ACTIVE' : 'STANDBY',
      activeColor: 'text-aegis-green border-aegis-green/30 bg-aegis-green/5 shadow-[0_0_12px_rgba(16,185,129,0.15)]',
    }
  ]

  return (
    <div className="p-6 bg-glass-panel border border-white/[0.04] rounded-2xl shadow-glass-inner backdrop-blur-md">
      <div className="flex justify-between items-center mb-5 border-b border-white/5 pb-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Swarm Registry</h3>
        <span className="text-[9px] font-mono text-aegis-muted px-2 py-0.5 rounded bg-white/5 uppercase">
          7 Nodes active
        </span>
      </div>
      
      <div className="space-y-3">
        {agents.map((agent) => {
          const Icon = agent.icon
          const isActive = agent.status === 'ACTIVE'
          
          return (
            <div 
              key={agent.name} 
              className={cn(
                "flex justify-between items-center p-2 rounded-xl transition-all duration-500 border border-transparent",
                isActive ? agent.activeColor : "hover:bg-white/[0.01]"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-lg border",
                  isActive 
                    ? "border-transparent bg-white/5" 
                    : "border-white/5 bg-[#020617]/50 text-aegis-muted"
                )}>
                  <Icon className={cn("w-4 h-4", isActive ? "" : "text-aegis-muted")} />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white tracking-wide">{agent.name}</h4>
                  <p className="text-[9px] text-aegis-muted uppercase tracking-wider font-mono mt-0.5">
                    {agent.role}
                  </p>
                </div>
              </div>
              
              <span className={cn(
                "text-[9px] font-mono font-bold tracking-wider px-2.5 py-1 rounded-full border transition-all duration-500",
                isActive 
                  ? "animate-pulse" 
                  : "text-aegis-muted bg-white/5 border-white/5"
              )}>
                {agent.status}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
