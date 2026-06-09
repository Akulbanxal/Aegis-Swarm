'use client'

import { motion } from 'framer-motion'

export function SeverityGauge({ score = 0 }: { score?: number }) {
  const isCritical = score >= 80
  const isWarning = score >= 40 && score < 80
  
  // Color configuration
  const colorHex = isCritical 
    ? '#f43f5e' // aegis-red
    : isWarning 
      ? '#fbbf24' // aegis-amber
      : '#00f0ff' // aegis-cyan

  const colorTextClass = isCritical 
    ? 'text-aegis-red text-glow-red' 
    : isWarning 
      ? 'text-aegis-amber text-glow-amber' 
      : 'text-aegis-cyan text-glow-cyan'

  const label = isCritical 
    ? 'CRITICAL DEFENSE ACTIVE' 
    : isWarning 
      ? 'WARNING: MONITORING VECTOR' 
      : 'SECURE / STANDBY'

  // Circle path calculations
  const radius = 50
  const strokeWidth = 8
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (circumference * Math.min(Math.max(score, 0), 100)) / 100

  return (
    <div className="flex flex-col items-center justify-center py-4 relative w-full h-full">
      {/* Decorative Outer Rings */}
      <div className="absolute w-44 h-44 rounded-full border border-white/[0.02] pointer-events-none" />
      <div className="absolute w-36 h-36 rounded-full border border-dashed border-white/[0.04] pointer-events-none animate-[spin_40s_linear_infinite]" />
      
      {/* SVG Circle Gauge */}
      <div className="relative w-32 h-32 flex items-center justify-center z-10">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r={radius}
            className="stroke-white/[0.05]"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <motion.circle
            cx="60"
            cy="60"
            r={radius}
            stroke={colorHex}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 6px ${colorHex})`
            }}
          />
        </svg>
        
        {/* Score Readout in the Center */}
        <div className="absolute flex flex-col items-center justify-center">
          <motion.span 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className={`text-4xl font-mono font-bold tracking-tight ${colorTextClass}`}
          >
            {score}
          </motion.span>
          <span className="text-[9px] text-aegis-muted uppercase tracking-widest font-mono">
            threat
          </span>
        </div>
      </div>
      
      {/* Detailed Status description */}
      <div className="mt-5 text-center z-10">
        <span className="text-[10px] font-bold text-white uppercase tracking-widest block mb-1">
          Severity Score
        </span>
        <span 
          className="text-xs font-mono font-medium transition-colors duration-500"
          style={{ color: colorHex }}
        >
          {label}
        </span>
      </div>
    </div>
  )
}
