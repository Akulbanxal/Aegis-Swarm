'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function ContractsPage() {
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-aegis-text">📋 Protected Contracts</h1>
              <p className="text-aegis-muted mt-2">Register and manage smart contracts under Aegis protection.</p>
            </div>
            <button className="px-6 py-2.5 bg-aegis-cyan text-aegis-base font-semibold rounded-lg hover:bg-aegis-cyan/90 transition-all shadow-glow-cyan">
              + Register Contract
            </button>
          </div>
        </motion.div>

        {/* Empty State */}
        <div className="glass rounded-xl border border-aegis-border p-12 text-center">
          <div className="w-16 h-16 rounded-full border-2 border-aegis-border flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📋</span>
          </div>
          <p className="text-aegis-text font-medium">No contracts registered yet</p>
          <p className="text-aegis-muted text-sm mt-2">
            Register your first contract to begin Aegis protection.
          </p>
          <p className="text-aegis-muted/60 text-xs mt-4">
            TODO: Connect AegisCore.registerContract() in Phase 4
          </p>
        </div>
      </div>
    </div>
  )
}
