'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function IncidentsPage() {
  return (
    <div className="min-h-screen bg-aegis-base">
      <div className="max-w-screen-2xl mx-auto px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Link href="/" className="text-aegis-cyan text-sm hover:underline mb-4 inline-block">← Back</Link>
          <h1 className="text-3xl font-bold text-aegis-text">🔍 Incident Viewer</h1>
          <p className="text-aegis-muted mt-2">Deep-dive into any incident: agent chain, receipts, actions taken.</p>
        </motion.div>
        <div className="glass rounded-xl border border-aegis-border p-12 text-center">
          <p className="text-aegis-muted">No incidents logged yet. TODO: Connect AlertRegistry in Phase 4.</p>
        </div>
      </div>
    </div>
  )
}
