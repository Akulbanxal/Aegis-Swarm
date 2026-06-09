'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ChevronRight, ShieldAlert, CheckCircle, Radio, Clock, ShieldCheck, ArrowRight } from 'lucide-react'

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<any[]>([])

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
        const res = await fetch(`${backendUrl}/api/incidents`)
        if (!res.ok) throw new Error('Fetch failed')
        const data = await res.json()
        if (data && data.length > 0) {
          setIncidents(data)
        } else {
          throw new Error('Empty data')
        }
      } catch (err) {
        console.error('Failed to fetch incidents, using mock data for demo:', err)
        setIncidents([
          {
            id: 'INC-8A91F',
            timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
            targetContract: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
            severity: 95,
            defenseActionTaken: 'CIRCUIT BREAKER',
            status: 'RECOVERED'
          },
          {
            id: 'INC-3B22C',
            timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
            targetContract: '0x1111111254fb6c44bac0bed2854e76f90643097d',
            severity: 82,
            defenseActionTaken: 'PAUSED CONTRACT',
            status: 'RESOLVED'
          },
          {
            id: 'INC-9F44E',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            targetContract: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
            severity: 45,
            defenseActionTaken: 'FLASH LOAN REVERT',
            status: 'RESOLVED'
          },
          {
            id: 'INC-1A77D',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            targetContract: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
            severity: 12,
            defenseActionTaken: 'MONITORING',
            status: 'RESOLVED'
          }
        ])
      }
    }
    
    fetchIncidents()
  }, [])

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/[0.04] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Radio className="w-3.5 h-3.5 text-aegis-cyan animate-pulse" />
            <span className="text-[9px] font-mono font-bold tracking-widest text-aegis-cyan uppercase">
              Consortium Database Ledger
            </span>
          </div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">System Incident Logs</h1>
          <p className="text-xs text-slate-400 mt-1.5 font-light leading-relaxed max-w-2xl">
            Historical audit logs of all transaction exploits intercepted, paused, and recovered by the 7-agent consensus framework.
          </p>
        </div>
      </div>

      {/* Grid Table Container */}
      <div className="bg-[#090f1d]/45 border border-white/[0.04] rounded-2xl shadow-glass-inner backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#030712]/50 border-b border-white/[0.03] text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4.5 font-mono">Incident ID</th>
                <th className="px-6 py-4.5">Timestamp</th>
                <th className="px-6 py-4.5">Target Contract</th>
                <th className="px-6 py-4.5">Severity</th>
                <th className="px-6 py-4.5">Mitigation Action</th>
                <th className="px-6 py-4.5">Verification</th>
                <th className="px-6 py-4.5 text-right">Drill Down</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02] text-xs">
              <AnimatePresence>
                {incidents.map((inc, i) => {
                  const isCritical = inc.severity >= 80
                  const isWarning = inc.severity >= 40 && inc.severity < 80
                  
                  const textGlow = isCritical 
                    ? 'text-aegis-red text-glow-red' 
                    : isWarning 
                      ? 'text-aegis-amber text-glow-amber' 
                      : 'text-aegis-green text-glow-green'

                  const badgeTheme = isCritical
                    ? 'bg-aegis-red/5 border-aegis-red/20 text-aegis-red'
                    : isWarning
                      ? 'bg-aegis-amber/5 border-aegis-amber/20 text-aegis-amber'
                      : 'bg-white/[0.02] border-white/10 text-slate-300'

                  return (
                    <motion.tr 
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      key={inc.id} 
                      className="hover:bg-white/[0.01] transition-colors duration-200 group"
                    >
                      <td className="px-6 py-4 font-mono text-aegis-cyan font-bold tracking-tight">{inc.id}</td>
                      <td className="px-6 py-4 text-slate-400 font-mono">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          {new Date(inc.timestamp).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-300 max-w-[220px] truncate select-all">
                        {inc.targetContract}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-mono font-bold text-sm ${textGlow}`}>
                          {inc.severity || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border tracking-wider ${badgeTheme}`}>
                          {inc.defenseActionTaken || 'DETECTED'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {inc.status === 'RESOLVED' || inc.status === 'RECOVERED' ? (
                          <div className="flex items-center gap-1.5 text-aegis-green text-[10px] font-mono font-bold uppercase tracking-wider text-glow-green">
                            <ShieldCheck className="w-3.5 h-3.5" /> Synchronized
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-aegis-amber text-[10px] font-mono font-bold uppercase tracking-wider text-glow-amber">
                            <ShieldAlert className="w-3.5 h-3.5 animate-pulse" /> Active Alert
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link 
                          href={`/dashboard/investigation/${inc.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.06] text-slate-400 hover:text-white hover:border-aegis-cyan/30 hover:bg-aegis-cyan/5 transition-all duration-300 group-hover:translate-x-0.5"
                        >
                          <span className="text-[10px] font-mono tracking-wider uppercase">Investigate</span>
                          <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-aegis-cyan" />
                        </Link>
                      </td>
                    </motion.tr>
                  )
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        {incidents.length === 0 && (
          <div className="p-16 text-center text-slate-500 font-mono tracking-wider uppercase text-xs border-t border-white/[0.02]">
            📡 No incidents indexed in the current epoch telemetry database.
          </div>
        )}
      </div>
    </div>
  )
}
