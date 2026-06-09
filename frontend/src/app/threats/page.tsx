'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function ThreatFeedPage() {
  return (
    <div className="min-h-screen bg-aegis-base">
      <div className="max-w-screen-2xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link href="/" className="text-aegis-cyan text-sm hover:underline mb-4 inline-block">
            ← Back to Overview
          </Link>
          <h1 className="text-3xl font-bold text-aegis-text">⚡ Live Threat Feed</h1>
          <p className="text-aegis-muted mt-2">
            Real-time stream of all security events from Somnia Data Streams.
          </p>
        </motion.div>

        {/* Filters */}
        <div className="flex gap-3 mb-6">
          {['All', 'Critical', 'Warning', 'Info'].map((filter) => (
            <button
              key={filter}
              className="px-4 py-1.5 rounded-full text-sm border border-aegis-border text-aegis-muted hover:border-aegis-cyan hover:text-aegis-cyan transition-all"
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Feed Placeholder */}
        <div className="glass rounded-xl border border-aegis-border p-8 text-center">
          <div className="animate-pulse-cyan w-16 h-16 rounded-full border-2 border-aegis-cyan/30 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚡</span>
          </div>
          <p className="text-aegis-muted">Connecting to Somnia Data Streams...</p>
          <p className="text-aegis-muted/60 text-xs mt-2">
            TODO: Connect @somnia-chain/streams in Phase 4
          </p>
        </div>
      </div>
    </div>
  )
}
