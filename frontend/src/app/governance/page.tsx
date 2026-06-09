'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function GovernancePage() {
  return (
    <div className="min-h-screen bg-aegis-base">
      <div className="max-w-screen-2xl mx-auto px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Link href="/" className="text-aegis-cyan text-sm hover:underline mb-4 inline-block">← Back</Link>
          <h1 className="text-3xl font-bold text-aegis-text">⚖️ Governance</h1>
          <p className="text-aegis-muted mt-2">Threshold settings, operator management, treasury stats.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: 'Critical Threshold', value: '80', desc: 'Severity score that triggers full pause' },
            { label: 'Warning Threshold', value: '40', desc: 'Severity score that triggers rate limits' },
            { label: 'Treasury Balance', value: '—', desc: 'Available STT for agent fees' },
          ].map((param) => (
            <div key={param.label} className="glass rounded-xl border border-aegis-border p-5">
              <p className="text-aegis-muted text-xs uppercase tracking-wider mb-1">{param.label}</p>
              <p className="text-3xl font-bold font-mono text-aegis-cyan">{param.value}</p>
              <p className="text-aegis-muted text-xs mt-2">{param.desc}</p>
            </div>
          ))}
        </div>

        <div className="glass rounded-xl border border-aegis-border p-6 text-center">
          <p className="text-aegis-muted text-sm">TODO: AegisGovernance contract integration in Phase 4</p>
        </div>
      </div>
    </div>
  )
}
