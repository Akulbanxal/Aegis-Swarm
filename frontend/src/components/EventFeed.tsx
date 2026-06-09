'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Activity, ShieldAlert, CheckCircle, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export function EventFeed({ incidents }: { incidents: any[] }) {
  return (
    <div className="p-6 bg-glass-panel border border-white/[0.04] rounded-2xl shadow-glass-inner backdrop-blur-md h-full flex flex-col overflow-hidden">
      <div className="flex justify-between items-center mb-5 border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-aegis-cyan text-glow-cyan" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Live Event Stream</h3>
        </div>
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-aegis-green opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-aegis-green"></span>
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
        <AnimatePresence initial={false}>
          {incidents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-10">
              <span className="text-3xl animate-pulse inline-block mb-3">📡</span>
              <p className="text-xs font-mono text-aegis-muted tracking-wide">
                Listening for Somnia blockchain streams...
              </p>
            </div>
          ) : (
            incidents.map((inc, i) => {
              const isCritical = inc.severity >= 80
              const isWarning = inc.severity >= 40 && inc.severity < 80
              
              const borderTheme = isCritical 
                ? 'border-l-aegis-red hover:border-aegis-red/50 hover:bg-aegis-red/[0.02]' 
                : isWarning 
                  ? 'border-l-aegis-amber hover:border-aegis-amber/50 hover:bg-aegis-amber/[0.02]' 
                  : 'border-l-aegis-cyan hover:border-aegis-cyan/50 hover:bg-aegis-cyan/[0.02]'
              
              const badgeTheme = isCritical
                ? 'bg-aegis-red/10 text-aegis-red border-aegis-red/20'
                : isWarning
                  ? 'bg-aegis-amber/10 text-aegis-amber border-aegis-amber/20'
                  : 'bg-aegis-cyan/10 text-aegis-cyan border-aegis-cyan/20'

              return (
                <motion.div 
                  key={inc.incidentId + inc.latestEvent}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className={`p-4 rounded-xl bg-white/[0.02] border border-white/5 border-l-4 ${borderTheme} flex items-center justify-between transition-all duration-300 group`}
                >
                  <div className="flex-1 min-w-0 mr-4">
                    <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                      <span className="text-xs font-mono text-aegis-cyan font-semibold">{inc.incidentId}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold tracking-widest border uppercase ${badgeTheme}`}>
                        {inc.latestEvent || 'DETECTED'}
                      </span>
                    </div>
                    <p className="text-xs text-white/95 font-mono truncate">{inc.targetContract}</p>
                    <span className="text-[10px] text-aegis-muted font-mono block mt-1">
                      {new Date(inc.timestamp || Date.now()).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right shrink-0">
                      <span className={`text-xl font-bold font-mono ${isCritical ? 'text-aegis-red' : isWarning ? 'text-aegis-amber' : 'text-aegis-cyan'}`}>
                        {inc.severity || 0}
                      </span>
                      <p className="text-[8px] text-aegis-muted uppercase font-bold tracking-widest mt-0.5">Severity</p>
                    </div>
                    
                    <Link 
                      href={`/dashboard/investigation/${inc.id || inc.incidentId}`}
                      className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-aegis-muted hover:text-aegis-cyan hover:border-aegis-cyan/40 hover:bg-aegis-cyan/10 transition-all group-hover:translate-x-0.5 duration-200"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              )
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
