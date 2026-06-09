'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Shield, Radio, ShieldAlert } from 'lucide-react'

interface StreamLine {
  id: number
  x1: number
  y1: number
  progress: number
  isThreat: boolean
}

export function ThreatMap({ activeThreat = false }: { activeThreat?: boolean }) {
  const [lines, setLines] = useState<StreamLine[]>([])

  // Simulate High-Throughput Somnia Mempool scanning streams
  useEffect(() => {
    const interval = setInterval(() => {
      setLines(current => {
        // Remove completed lines
        const activeLines = current
          .map(l => ({ ...l, progress: l.progress + (activeThreat ? 4 : 2) }))
          .filter(l => l.progress < 100)

        // Add a new line
        const angle = Math.random() * Math.PI * 2
        const distance = 80 // start at 80% radius
        const startX = 50 + Math.cos(angle) * distance
        const startY = 50 + Math.sin(angle) * distance

        const newLine: StreamLine = {
          id: Math.random() + Date.now(),
          x1: startX,
          y1: startY,
          progress: 0,
          isThreat: activeThreat && Math.random() > 0.3 // High density threat lines in attack mode
        }

        return [...activeLines, newLine].slice(-25)
      })
    }, activeThreat ? 60 : 150)

    return () => clearInterval(interval)
  }, [activeThreat])

  return (
    <div className="relative w-full h-full min-h-[420px] bg-[#030712]/80 rounded-xl overflow-hidden border border-white/[0.04] flex flex-col items-center justify-center">
      {/* Background Matrix/Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00e5ff03_1px,transparent_1px),linear-gradient(to_bottom,#00e5ff03_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
      
      {/* Topology Hexagon Grid Layer */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="hex-grid" width="30" height="51.96" patternUnits="userSpaceOnUse" patternTransform="scale(0.8)">
            <path fill="none" stroke="#22d3ee" strokeWidth="1.5" d="M30 13l-15 8.66L0 13V-4.33l15-8.66L30-4.33V13zm0 34.64l-15 8.66-15-8.66v-17.32l15-8.66 15 8.66v17.32z" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hex-grid)" />
      </svg>
      
      {/* Circular Radar Sweep */}
      <div className="absolute w-[500px] h-[500px] rounded-full border border-aegis-cyan/[0.02] flex items-center justify-center pointer-events-none">
        <div className={`absolute inset-4 rounded-full border border-dashed border-aegis-cyan/[0.04] ${activeThreat ? 'animate-[spin_8s_linear_infinite]' : 'animate-[spin_20s_linear_infinite]'}`} />
        <div className="absolute inset-16 rounded-full border border-aegis-cyan/[0.03]" />
        
        {/* Actual Sweeping line */}
        <div className={classNameSweep(activeThreat)} />
      </div>

      {/* High-frequency Transaction Vectors */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {lines.map((l) => {
          // Calculate current coordinates based on progress (converging to center 50%, 50%)
          const dx = 50 - l.x1
          const dy = 50 - l.y1
          const currX = l.x1 + dx * (l.progress / 100)
          const currY = l.y1 + dy * (l.progress / 100)

          const strokeColor = l.isThreat ? '#f43f5e' : '#00f0ff'
          const glowFilter = l.isThreat ? 'drop-shadow(0 0 4px #f43f5e)' : 'drop-shadow(0 0 4px #00f0ff)'

          return (
            <g key={l.id}>
              {/* Path vector line */}
              <line
                x1={`${l.x1}%`}
                y1={`${l.y1}%`}
                x2={`${currX}%`}
                y2={`${currY}%`}
                stroke={strokeColor}
                strokeWidth={l.isThreat ? 1.5 : 1}
                strokeOpacity={0.15}
              />
              {/* Pulsing transaction packet dot */}
              <circle
                cx={`${currX}%`}
                cy={`${currY}%`}
                r={l.isThreat ? 2.5 : 1.5}
                fill={strokeColor}
                style={{ filter: glowFilter }}
              />
            </g>
          )
        })}
      </svg>
      
      {/* Center Target Contract Node */}
      <div className="relative flex items-center justify-center z-10">
        <motion.div 
          animate={activeThreat 
            ? { scale: [1, 1.15, 1], borderColor: ['rgba(244,63,94,0.4)', 'rgba(244,63,94,0.8)', 'rgba(244,63,94,0.4)'] } 
            : { scale: [1, 1.04, 1], borderColor: ['rgba(0,240,255,0.15)', 'rgba(0,240,255,0.3)', 'rgba(0,240,255,0.15)'] }
          }
          transition={{ duration: activeThreat ? 0.8 : 3, repeat: Infinity, ease: 'easeInOut' }}
          className={`relative flex items-center justify-center w-36 h-36 rounded-full border border-2 backdrop-blur-md ${
            activeThreat 
              ? 'bg-aegis-red/[0.04] shadow-[0_0_45px_rgba(244,63,94,0.2),inset_0_0_20px_rgba(244,63,94,0.1)]' 
              : 'bg-aegis-cyan/[0.02] shadow-[0_0_30px_rgba(0,240,255,0.03),inset_0_0_15px_rgba(0,240,255,0.02)]'
          }`}
        >
          {/* Internal orbital tracks */}
          <div className={`absolute w-28 h-28 rounded-full border border-dashed animate-[spin_25s_linear_infinite] ${
            activeThreat ? 'border-aegis-red/40' : 'border-aegis-cyan/25'
          }`} />
          
          <div className={`absolute w-20 h-20 rounded-full border border-dotted animate-[spin_15s_linear_infinite_reverse] ${
            activeThreat ? 'border-aegis-red/30' : 'border-aegis-cyan/20'
          }`} />

          {/* Core Symbol */}
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center relative ${
            activeThreat ? 'bg-aegis-red/10 border border-aegis-red/30 text-aegis-red' : 'bg-aegis-cyan/10 border border-aegis-cyan/20 text-aegis-cyan'
          }`}>
            {activeThreat ? (
              <ShieldAlert className="w-6 h-6 animate-bounce" />
            ) : (
              <Shield className="w-5 h-5" />
            )}
          </div>
        </motion.div>
      </div>

      {/* Topological Status & Information Overlays */}
      <div className="absolute bottom-5 left-5 right-5 flex justify-between items-end bg-[#090f1d]/85 backdrop-blur-md p-3.5 rounded-xl border border-white/[0.04] z-10">
        <div className="flex flex-col">
          <span className="text-aegis-muted font-mono text-[9px] tracking-widest mb-0.5 uppercase">Threat Scan Matrix</span>
          <span className={`text-xs font-mono font-bold tracking-wider uppercase ${activeThreat ? 'text-aegis-red animate-pulse' : 'text-aegis-cyan'}`}>
            {activeThreat ? '⚠️ MITIGATION PAYLOAD DEPLOYED' : 'MEMPOOL STREAM: 100K+ TPS'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/5 border border-white/5">
          <div className={`w-1.5 h-1.5 rounded-full ${activeThreat ? 'bg-aegis-red animate-ping' : 'bg-aegis-cyan animate-pulse'}`} />
          <span className="font-mono text-[9px] text-white/90 uppercase tracking-widest">
            {activeThreat ? 'exploited state' : 'secure state'}
          </span>
        </div>
      </div>
    </div>
  )
}

function classNameSweep(activeThreat: boolean): string {
  const base = "absolute top-1/2 left-1/2 w-[250px] h-[250px] origin-top-left -translate-x-[0.5px] -translate-y-[0.5px]"
  const colors = activeThreat 
    ? "bg-gradient-to-tr from-aegis-red/10 to-transparent border-t border-l border-aegis-red/20 rounded-tl-full"
    : "bg-gradient-to-tr from-aegis-cyan/5 to-transparent border-t border-l border-aegis-cyan/10 rounded-tl-full"
  const anim = activeThreat ? "animate-[spin_4s_linear_infinite]" : "animate-[spin_10s_linear_infinite]"
  return `${base} ${colors} ${anim}`
}
