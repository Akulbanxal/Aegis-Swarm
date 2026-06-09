'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'

const AGENTS = [
  { name: 'Sentinel', type: 'JSON API Request', invocations: 0, successRate: '—', color: 'text-aegis-cyan' },
  { name: 'Analyst', type: 'LLM Inference', invocations: 0, successRate: '—', color: 'text-aegis-purple' },
  { name: 'Responder', type: 'LLM Inference', invocations: 0, successRate: '—', color: 'text-aegis-green' },
  { name: 'Archivist', type: 'LLM Parse Website', invocations: 0, successRate: '—', color: 'text-aegis-amber' },
  { name: 'Messenger', type: 'HTTP POST', invocations: 0, successRate: '—', color: 'text-aegis-muted' },
]

export default function IntelligencePage() {
  return (
    <div className="min-h-screen bg-aegis-base">
      <div className="max-w-screen-2xl mx-auto px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Link href="/" className="text-aegis-cyan text-sm hover:underline mb-4 inline-block">← Back</Link>
          <h1 className="text-3xl font-bold text-aegis-text">🤖 Swarm Intelligence</h1>
          <p className="text-aegis-muted mt-2">Agent performance metrics, invocation history, and cost tracking.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {AGENTS.map((agent, i) => (
            <motion.div
              key={agent.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-xl border border-aegis-border p-5"
            >
              <p className={`font-bold text-lg ${agent.color}`}>{agent.name}</p>
              <p className="text-aegis-muted text-xs mt-1">{agent.type}</p>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-aegis-muted">Invocations</span>
                  <span className="font-mono text-aegis-text">{agent.invocations}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-aegis-muted">Success Rate</span>
                  <span className="font-mono text-aegis-text">{agent.successRate}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="glass rounded-xl border border-aegis-border p-6 text-center">
          <p className="text-aegis-muted text-sm">TODO: Connect live agent metrics in Phase 4</p>
        </div>
      </div>
    </div>
  )
}
