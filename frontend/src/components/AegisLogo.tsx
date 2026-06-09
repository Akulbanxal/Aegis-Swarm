'use client'

import { motion } from 'framer-motion'

export function AegisLogo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <motion.svg
      viewBox="0 0 100 100"
      className={className}
      initial="hidden"
      animate="visible"
    >
      {/* Outer Hexagon */}
      <motion.polygon
        points="50,5 95,25 95,75 50,95 5,75 5,25"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        className="text-aegis-cyan/30"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          visible: { pathLength: 1, opacity: 1, transition: { duration: 1.5, ease: "easeInOut" } }
        }}
      />
      {/* Inner Glowing Shield/Hexagon */}
      <motion.polygon
        points="50,15 80,30 80,70 50,85 20,70 20,30"
        fill="currentColor"
        className="text-aegis-cyan/10"
        variants={{
          hidden: { scale: 0, opacity: 0 },
          visible: { scale: 1, opacity: 1, transition: { delay: 0.5, duration: 1 } }
        }}
      />
      <motion.polygon
        points="50,15 80,30 80,70 50,85 20,70 20,30"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        className="text-aegis-cyan"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          visible: { pathLength: 1, opacity: 1, transition: { delay: 0.3, duration: 1.5, ease: "easeInOut" } }
        }}
      />
      {/* Center Core */}
      <motion.circle
        cx="50"
        cy="50"
        r="6"
        fill="currentColor"
        className="text-white"
        variants={{
          hidden: { scale: 0 },
          visible: { scale: 1, transition: { delay: 1, type: "spring", stiffness: 200 } }
        }}
      />
    </motion.svg>
  )
}
