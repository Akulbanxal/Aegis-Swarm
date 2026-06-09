'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { Shield, Zap, Database, Layers, FileText, RefreshCw, AlertTriangle, CheckCircle, Flame, Lock, Sparkles, Terminal, Activity, ShieldCheck, ArrowRight, ArrowDown } from 'lucide-react'
import { AegisLogo } from '@/components/AegisLogo'

// ─── Data ────────────────────────────────────────────────────────────────────

const agents = [
  { id: 'sentinel', name: 'Sentinel', role: 'Anomaly Scan', icon: Shield, color: 'text-aegis-cyan', border: 'border-aegis-cyan/30', glow: 'shadow-[0_0_24px_rgba(0,240,255,0.15)]', desc: 'Monitors the live mempool for signature abnormalities and frontrunning zero-day attacks before they are mined.' },
  { id: 'investigator', name: 'Investigator', role: 'State Trace', icon: Database, color: 'text-aegis-purple', border: 'border-aegis-purple/30', glow: 'shadow-[0_0_24px_rgba(168,85,247,0.15)]', desc: 'Simulates execution traces using sandboxed state forks to map caller contracts and flag dangerous flash loan volumes.' },
  { id: 'analyst', name: 'Analyst', role: 'Risk Rating', icon: AlertTriangle, color: 'text-aegis-amber', border: 'border-aegis-amber/30', glow: 'shadow-[0_0_24px_rgba(245,158,11,0.15)]', desc: 'Classifies threat vectors based on behavioral patterns and CVE match libraries, rating incident severity 1–100.' },
  { id: 'consensus', name: 'Consensus', role: 'Quorum Vote', icon: Layers, color: 'text-aegis-cyan', border: 'border-aegis-cyan/30', glow: 'shadow-[0_0_24px_rgba(0,240,255,0.15)]', desc: 'Coordinates the multi-agent committee ballot using cryptographic consensus signatures before any action is taken.' },
  { id: 'responder', name: 'Responder', role: 'State Pause', icon: Zap, color: 'text-aegis-red', border: 'border-aegis-red/30', glow: 'shadow-[0_0_24px_rgba(244,63,94,0.15)]', desc: 'Broadcasts high-gas circuit-breaker transactions to immediately freeze vault states at the smart contract level.' },
  { id: 'reporter', name: 'Reporter', role: 'Ledger Audit', icon: FileText, color: 'text-aegis-cyan', border: 'border-aegis-cyan/30', glow: 'shadow-[0_0_24px_rgba(0,240,255,0.15)]', desc: 'Archives incident logs, execution hashes, and bytecode trace files immutably to decentralized ledger storage.' },
  { id: 'recovery', name: 'Recovery', role: 'Staged Reset', icon: RefreshCw, color: 'text-aegis-green', border: 'border-aegis-green/30', glow: 'shadow-[0_0_24px_rgba(16,185,129,0.15)]', desc: 'Formulates safe contract unpause proposals, awaiting human-in-the-loop cryptographically signed approval keys.' },
]

const metrics = [
  { label: 'TVL Protected', value: '$42.5M', sub: '+12.4% in 30 days', icon: ShieldCheck, color: 'text-aegis-cyan', pulse: 'bg-aegis-cyan' },
  { label: 'Response Latency', value: '1.2s', sub: 'Avg. mitigation speed', icon: Zap, color: 'text-aegis-amber', pulse: 'bg-aegis-amber' },
  { label: 'Consensus Quorum', value: '7 / 7', sub: '100% agents online', icon: Layers, color: 'text-aegis-purple', pulse: 'bg-aegis-purple' },
  { label: 'Threats Blocked', value: '1,847', sub: 'Since deployment', icon: Activity, color: 'text-aegis-green', pulse: 'bg-aegis-green' },
]

const pipelineSteps = [
  { state: 'detecting', label: 'Sentinel', icon: Shield, color: 'text-aegis-cyan', log: '[0ms] Sentinel: Abnormal reentrancy signature on vault 0x619F…' },
  { state: 'tracing', label: 'Investigator', icon: Database, color: 'text-aegis-purple', log: '[150ms] Investigator: Execution trace forked. Attacker pool 0x3ac1…' },
  { state: 'analyzing', label: 'Analyst', icon: AlertTriangle, color: 'text-aegis-amber', log: '[320ms] Analyst: HIGH_SEVERITY_FLASH_LOAN classified. Threat score: 94.' },
  { state: 'voting', label: 'Consensus', icon: Layers, color: 'text-aegis-cyan', log: '[480ms] Consensus: Signature quorum 7/7 authorized.' },
  { state: 'mitigating', label: 'Responder', icon: Zap, color: 'text-aegis-red', log: '[650ms] Responder: Circuit-breaker broadcast. Vault state PAUSED.' },
  { state: 'reporting', label: 'Reporter', icon: FileText, color: 'text-aegis-cyan', log: '[800ms] Reporter: Telemetry archived on L1. Tx: 0x8aef…c712' },
  { state: 'recovery', label: 'Recovery', icon: RefreshCw, color: 'text-aegis-green', log: '[950ms] Recovery: Unpause proposal generated for admin review.' },
]

// Agent short names for consensus vote display
const agentVoters = ['SNT', 'INV', 'ANL', 'CSN', 'RSP', 'RPT', 'RCV']

// ─── Component ────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 })
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)

  // Simulator state
  const [simState, setSimState] = useState<'idle' | 'running' | 'secured'>('idle')
  const [activeStep, setActiveStep] = useState<number>(-1)
  const [simLogs, setSimLogs] = useState<string[]>(['> System monitoring blockchain mempool…'])
  const [votesIn, setVotesIn] = useState<number>(0)
  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let raf: number
    const onMove = (e: MouseEvent) => {
      raf = requestAnimationFrame(() => setMousePos({ x: (e.clientX / window.innerWidth) * 100, y: (e.clientY / window.innerHeight) * 100 }))
    }
    window.addEventListener('mousemove', onMove)
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf) }
  }, [])

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [simLogs])

  const runSimulation = () => {
    if (simState === 'running') return
    setSimState('running')
    setSimLogs([])
    setActiveStep(-1)
    setVotesIn(0)

    pipelineSteps.forEach((step, i) => {
      setTimeout(() => {
        setActiveStep(i)
        setSimLogs(prev => [...prev, `> ${step.log}`])

        // Animate consensus votes during step 3
        if (i === 3) {
          agentVoters.forEach((_, vi) => {
            setTimeout(() => setVotesIn(vi + 1), vi * 80)
          })
        }

        if (i === pipelineSteps.length - 1) {
          setTimeout(() => {
            setSimState('secured')
            setSimLogs(prev => [...prev, '> ✓ SECURED — $42.5M TVL protected. Awaiting admin review.'])
          }, 1200)
        }
      }, i * 1300)
    })
  }

  const resetSim = () => {
    setSimState('idle')
    setActiveStep(-1)
    setVotesIn(0)
    setSimLogs(['> System monitoring blockchain mempool…'])
  }

  const isVotingStep = activeStep === 3 && simState === 'running'
  const isVotingDone = (simState === 'secured') || (activeStep > 3)

  return (
    <div className="min-h-screen bg-[#000205] text-slate-100 flex flex-col font-sans relative selection:bg-aegis-cyan/30 selection:text-white overflow-x-hidden">

      {/* ── Ambient background ── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.div
          animate={{ background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(0,240,255,0.04) 0%, transparent 40%)` }}
          transition={{ type: 'tween', ease: 'linear', duration: 0.1 }}
          className="absolute inset-0"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem]"
          style={{ maskImage: 'radial-gradient(ellipse at 50% 0%, #000 0%, transparent 70%)', WebkitMaskImage: 'radial-gradient(ellipse at 50% 0%, #000 0%, transparent 70%)' }}
        />
      </div>

      {/* ── Nav ── */}
      <nav className="fixed top-0 w-full px-6 lg:px-10 py-4 flex justify-between items-center z-50 border-b border-white/[0.04] bg-[#000205]/70 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/[0.05] border border-white/[0.08]">
            <AegisLogo className="w-4 h-4 text-aegis-cyan" />
          </div>
          <span className="text-sm font-display font-semibold tracking-wide text-white">
            Aegis<span className="text-aegis-cyan">Swarm</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-[11px] font-semibold text-slate-400 tracking-widest uppercase">
          <a href="#demo" className="hover:text-white transition-colors">Live Demo</a>
          <a href="#agents" className="hover:text-white transition-colors">Agents</a>
          <a href="#metrics" className="hover:text-white transition-colors">Metrics</a>
          <a href="#architecture" className="hover:text-white transition-colors">Architecture</a>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/experience" className="hidden sm:flex group px-4 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:border-aegis-cyan/40 hover:bg-aegis-cyan/10 text-[11px] font-semibold uppercase tracking-wider text-white transition-all duration-300 items-center gap-2">
            Experience <Sparkles className="w-3 h-3 text-aegis-cyan" />
          </Link>
          <Link href="/dashboard" className="group px-5 py-2.5 rounded-lg bg-white text-black hover:bg-slate-200 text-[11px] font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2">
            Console <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </nav>

      {/* ════════════════════════════════════════════════════════════════
          SECTION 1 — HERO
      ════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-16 px-4 z-10">

        {/* Text block */}
        <div className="relative z-30 flex flex-col items-center text-center max-w-3xl mx-auto mb-14">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] mb-7"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-aegis-cyan opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-aegis-cyan" />
            </span>
            <span className="text-[10px] font-mono tracking-widest text-slate-300 uppercase">Autonomous Network Defense · Somnia L1</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5, ease: 'easeOut' }}
            className="text-5xl sm:text-6xl lg:text-[72px] font-display font-bold tracking-tight text-white leading-[1.05] mb-5 text-balance"
          >
            <br></br>
            Protocol Defense{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-aegis-cyan via-white to-aegis-purple">
              Decided in Milliseconds
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="max-w-xl text-base sm:text-lg font-light text-slate-400 mb-9 leading-relaxed text-balance"
          >
            A deterministic 7-agent swarm that intercepts smart contract exploits at the mempool level — before they execute on-chain.
            <br></br>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-5"
          >
            <a
              href="#demo"
              className="group h-14 px-8 rounded-2xl bg-gradient-to-r from-[#00f0ff] to-[#0080ff] text-[#000205] font-bold text-xs uppercase tracking-widest transition-all duration-300 flex items-center gap-2 hover:scale-[1.02] shadow-[0_0_30px_rgba(0,240,255,0.25)] hover:shadow-[0_0_50px_rgba(0,240,255,0.4)]"
            >
               Watch Live Demo <Flame className="w-5 h-5" />
            </a>
            <Link
              href="/dashboard"
              className="h-14 px-8 rounded-2xl bg-[#0a0c10]/80 border border-white/10 hover:bg-white/[0.06] hover:border-white/20 text-xs font-bold uppercase tracking-widest text-white transition-all duration-300 flex items-center gap-2 backdrop-blur-md"
            >
              Command Console <Terminal className="w-4 h-4 text-slate-400" />
            </Link>
          </motion.div>
        </div>

        {/* Swarm visualization */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
          className="relative w-[300px] h-[300px] md:w-[420px] md:h-[420px] flex items-center justify-center"
        >
          {/* Glow */}
          <div className="absolute inset-[-20%] bg-[radial-gradient(circle_at_center,rgba(0,240,255,0.08)_0%,rgba(168,85,247,0.04)_40%,transparent_70%)] pointer-events-none" />

          {/* SVG connector lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
            {agents.map((node, idx) => {
              const angle = (idx * 360) / agents.length
              const radians = (angle * Math.PI) / 180
              const radius = 42
              const x = 50 + Math.cos(radians) * radius
              const y = 50 + Math.sin(radians) * radius
              const isHovered = hoveredNode === node.id
              return (
                <motion.line
                  key={`line-${node.id}`}
                  x1="50%" y1="50%" x2={`${x}%`} y2={`${y}%`}
                  stroke={isHovered ? 'rgba(0,240,255,0.5)' : 'rgba(255,255,255,0.04)'}
                  strokeWidth={isHovered ? 1.5 : 1}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ delay: 0.6 + idx * 0.1, duration: 1, ease: 'easeOut' }}
                />
              )
            })}
          </svg>

          {/* Orbit rings */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-[10%] rounded-full border border-white/[0.03] animate-[spin_60s_linear_infinite]" />
            <div className="absolute inset-[20%] rounded-full border border-dashed border-aegis-cyan/10 animate-[spin_40s_linear_infinite_reverse]" />
          </div>

          {/* Core orb */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.4 }}
            className="relative w-24 h-24 md:w-32 md:h-32 rounded-full bg-[#050814] border border-white/[0.1] shadow-[0_0_50px_rgba(0,240,255,0.15)] flex items-center justify-center overflow-hidden z-10"
          >
            <div className="absolute inset-0 bg-aegis-cyan/5" />
            <div className="absolute inset-0 border-2 border-aegis-cyan/20 rounded-full animate-ping opacity-20" style={{ animationDuration: '4s' }} />
            <Shield className="w-10 h-10 md:w-12 md:h-12 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]" />
          </motion.div>

          {/* Agent node buttons — hover reveals name label */}
          {agents.map((node, idx) => {
            const angle = (idx * 360) / agents.length
            const radians = (angle * Math.PI) / 180
            const radius = 42
            const x = 50 + Math.cos(radians) * radius
            const y = 50 + Math.sin(radians) * radius
            const isHovered = hoveredNode === node.id
            // Label positioning: push outward from center
            const labelOffset = 14
            const lx = 50 + Math.cos(radians) * (radius + labelOffset)
            const ly = 50 + Math.sin(radians) * (radius + labelOffset)
            return (
              <div
                key={node.id}
                className="absolute z-20"
                style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
              >
                <motion.button
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + idx * 0.08, type: 'spring', stiffness: 150, damping: 15 }}
                  className={`w-11 h-11 md:w-14 md:h-14 rounded-2xl border transition-all duration-300 backdrop-blur-md flex items-center justify-center cursor-default focus:outline-none ${isHovered
                    ? `bg-[#060a1a] ${node.border} scale-125`
                    : 'bg-[#02040a]/80 border-white/[0.06] hover:border-white/20 hover:scale-110'
                    }`}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  aria-label={`${node.name} agent`}
                >
                  <node.icon className={`w-5 h-5 md:w-6 md:h-6 transition-colors duration-300 ${isHovered ? node.color : 'text-slate-500'}`} />
                </motion.button>

                {/* Name tooltip */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      transition={{ duration: 0.12 }}
                      className="absolute pointer-events-none whitespace-nowrap"
                      style={{
                        left: '50%',
                        top: y > 50 ? 'calc(100% + 6px)' : 'auto',
                        bottom: y <= 50 ? 'calc(100% + 6px)' : 'auto',
                        transform: 'translateX(-50%)',
                      }}
                    >
                      <div className={`px-2 py-1 rounded-lg bg-[#060a1a] border ${node.border} flex flex-col items-center`}>
                        <span className={`text-[10px] font-bold ${node.color}`}>{node.name}</span>
                        <span className="text-[9px] font-mono text-slate-500">{node.role}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </motion.div>

        {/* Scroll cue */}
        <motion.a
          href="#demo"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-10 flex flex-col items-center gap-1.5 text-slate-600 hover:text-slate-400 transition-colors group"
          aria-label="Scroll to demo"
        >
          <span className="text-[10px] font-mono uppercase tracking-widest">See it in action</span>
          <ArrowDown className="w-4 h-4 animate-bounce group-hover:text-aegis-cyan transition-colors" />
        </motion.a>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          SECTION 2 — LIVE ATTACK DEMO
      ════════════════════════════════════════════════════════════════ */}
      <section id="demo" className="w-full py-24 z-10 bg-[#000205] relative">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-12">

          {/* Section header */}
          <div className="w-full text-center max-w-xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight mb-3 text-center text-balance">
              Live Attack Demo
            </h2>
            <p className="text-sm text-slate-400 font-light leading-relaxed text-center">
              Inject a reentrancy exploit. Watch all 7 agents respond in sequence and secure the vault.
            </p>
          </div>

          <div className="rounded-2xl bg-[#04050A] border border-white/[0.06] overflow-hidden shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]">

            {/* Terminal chrome */}
            <div className="px-5 py-3 bg-[#020308] border-b border-white/[0.04] flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-white/[0.08]" />
                <div className="w-3 h-3 rounded-full bg-white/[0.08]" />
                <div className="w-3 h-3 rounded-full bg-white/[0.08]" />
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded bg-black/40 border border-white/[0.04]">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">sim·status</span>
                <span className={`text-[9px] font-mono font-bold uppercase tracking-widest flex items-center gap-1.5 ${simState === 'idle' ? 'text-slate-500' : simState === 'secured' ? 'text-aegis-green' : 'text-aegis-red'
                  }`}>
                  {simState === 'running' && (
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-aegis-red opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-aegis-red" />
                    </span>
                  )}
                  {simState === 'secured' ? 'SECURED' : simState === 'idle' ? 'STANDBY' : 'ACTIVE'}
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">

              {/* Left: controls + logs */}
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-xl font-display font-bold text-white mb-2">Reentrancy Injection</h3>
                  <p className="text-sm text-slate-400 font-light leading-relaxed">
                    A flash-loan reentrancy attack targeting vault <code className="text-aegis-cyan/80 text-[11px]">0x619F…</code>. The swarm detects, traces, classifies, votes, and mitigates — autonomously.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    disabled={simState === 'running'}
                    onClick={() => { if (simState === 'secured') { resetSim(); setTimeout(runSimulation, 50) } else if (simState === 'idle') runSimulation() }}
                    className="h-11 px-6 rounded-xl bg-white text-black font-bold text-[11px] uppercase tracking-wider transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-200 flex items-center gap-2"
                  >
                    <Flame className={`w-3.5 h-3.5 ${simState === 'running' ? 'text-black' : 'text-red-500'}`} />
                    {simState === 'secured' ? 'Run Again' : 'Inject Exploit'}
                  </button>

                  {simState !== 'idle' && (
                    <button
                      onClick={resetSim}
                      className="h-11 px-5 rounded-xl bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.06] text-[11px] font-semibold uppercase tracking-wider text-slate-400 transition-all"
                    >
                      Reset
                    </button>
                  )}
                </div>

                {/* ── Consensus Vote Panel — shows during + after voting step ── */}
                <AnimatePresence>
                  {(isVotingStep || isVotingDone) && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="rounded-xl bg-aegis-cyan/[0.04] border border-aegis-cyan/20 p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-mono text-aegis-cyan/70 uppercase tracking-widest">Consensus Vote</span>
                        <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${isVotingDone ? 'text-aegis-green' : 'text-aegis-cyan animate-pulse'}`}>
                          {votesIn} / 7 {isVotingDone ? '✓ QUORUM' : 'voting…'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {agentVoters.map((name, i) => (
                          <motion.div
                            key={name}
                            initial={{ scale: 0.6, opacity: 0 }}
                            animate={{
                              scale: i < votesIn ? 1 : 0.6,
                              opacity: i < votesIn ? 1 : 0.25,
                            }}
                            transition={{ duration: 0.2 }}
                            className={`px-2.5 py-1 rounded-lg border text-[9px] font-mono font-bold uppercase tracking-widest transition-all duration-300 ${i < votesIn
                              ? 'bg-aegis-green/10 border-aegis-green/40 text-aegis-green'
                              : 'bg-white/[0.02] border-white/[0.06] text-slate-600'
                              }`}
                          >
                            {name} {i < votesIn ? '✓' : '—'}
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Telemetry log */}
                <div className="rounded-xl bg-black/40 border border-white/[0.04] overflow-hidden">
                  <div className="px-4 py-2 border-b border-white/[0.03]">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Telemetry Output</span>
                  </div>
                  <div ref={logRef} className="h-[140px] overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {simLogs.map((log, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="font-mono text-[11px] text-slate-300 leading-relaxed break-words"
                      >
                        {log}
                      </motion.div>
                    ))}
                    {simState === 'running' && (
                      <div className="animate-pulse inline-block w-2 h-3.5 bg-aegis-cyan/50 align-middle" />
                    )}
                  </div>
                </div>
              </div>

              {/* Right: sequential pipeline */}
              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1">Agent Pipeline</span>

                {pipelineSteps.map((step, i) => {
                  const isDone = activeStep > i
                  const isActive = activeStep === i && simState === 'running'
                  const isSecured = simState === 'secured'
                  return (
                    <motion.div
                      key={step.state}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * i }}
                      className={`flex items-center gap-4 px-4 py-3 rounded-xl border transition-all duration-500 ${isActive
                        ? 'bg-aegis-cyan/[0.07] border-aegis-cyan/30 shadow-[0_0_20px_rgba(0,240,255,0.08)]'
                        : isDone || isSecured
                          ? 'bg-white/[0.03] border-white/[0.08]'
                          : 'bg-transparent border-white/[0.04]'
                        }`}
                    >
                      {/* Step indicator */}
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-500 ${isActive ? 'bg-aegis-cyan/20 ring-1 ring-aegis-cyan/50' :
                        isDone || isSecured ? 'bg-white/[0.06]' : 'bg-white/[0.02]'
                        }`}>
                        {isDone || (isSecured && !isActive) ? (
                          <CheckCircle className="w-4 h-4 text-aegis-green" />
                        ) : (
                          <step.icon className={`w-4 h-4 transition-colors duration-500 ${isActive ? step.color : 'text-slate-600'}`} />
                        )}
                      </div>

                      {/* Label */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-semibold transition-colors duration-500 ${isActive ? 'text-white' : isDone || isSecured ? 'text-slate-300' : 'text-slate-600'}`}>
                            {step.label}
                          </span>
                          {isActive && (
                            <span className="text-[9px] font-mono text-aegis-cyan uppercase tracking-widest animate-pulse">
                              running…
                            </span>
                          )}
                          {(isDone || isSecured) && !isActive && (
                            <span className="text-[9px] font-mono text-aegis-green uppercase tracking-widest">done</span>
                          )}
                        </div>
                      </div>

                      {/* Step number */}
                      <span className={`text-[10px] font-mono tabular-nums transition-colors duration-500 ${isActive ? 'text-aegis-cyan' : 'text-slate-700'}`}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </motion.div>
                  )
                })}

                {/* Mitigation result */}
                <AnimatePresence>
                  {simState === 'secured' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-2 flex items-center gap-3 px-4 py-3 rounded-xl bg-aegis-green/[0.08] border border-aegis-green/30 shadow-[0_0_24px_rgba(16,185,129,0.1)]"
                    >
                      <CheckCircle className="w-5 h-5 text-aegis-green shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-aegis-green">Vault Secured</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">$42.5M TVL protected · Exploit mitigated in 1.1s</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          SECTION 3 — HOW THE 7 AGENTS WORK
      ════════════════════════════════════════════════════════════════ */}
      <section id="agents" className="w-full py-24 z-10 relative">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="w-full text-center max-w-xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight mb-3 text-center text-balance">
              The 7 Agents
            </h2>
            <p className="text-sm text-slate-400 font-light leading-relaxed text-center">
              Each agent owns a single responsibility. Together they form a fault-tolerant, consensus-driven defense loop.
            </p>
          </div>

          {/* 7 cards: 3 + 4 layout — first row 4, second row 3 centered */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {agents.slice(0, 4).map((agent, i) => (
              <AgentCard key={agent.id} agent={agent} delay={i * 0.06} />
            ))}
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 lg:max-w-[calc(75%-0.5rem)] lg:mx-auto">
            {agents.slice(4).map((agent, i) => (
              <AgentCard key={agent.id} agent={agent} delay={(i + 4) * 0.06} />
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          SECTION 4 — SECURITY METRICS
      ════════════════════════════════════════════════════════════════ */}
      <section id="metrics" className="w-full py-24 z-10 relative bg-[#000102]">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="w-full text-center max-w-xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight mb-3 text-center">
              Security Metrics
            </h2>
            <p className="text-sm text-slate-400 font-light leading-relaxed text-center">
              Real-time system health across the Aegis Swarm network on Somnia L1.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {metrics.map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="flex flex-col gap-4 p-6 rounded-2xl bg-[#030509]/80 border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {/* Live pulse dot */}
                    <span className="relative flex h-1.5 w-1.5">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${m.pulse} opacity-50`} />
                      <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${m.pulse}`} />
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{m.label}</span>
                  </div>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/[0.04] border border-white/[0.06]">
                    <m.icon className={`w-3.5 h-3.5 ${m.color}`} />
                  </div>
                </div>
                <div>
                  <div className={`text-3xl font-display font-bold tracking-tight text-white`}>{m.value}</div>
                  <div className="text-[11px] text-slate-500 mt-1 font-light">{m.sub}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          SECTION 5 — ARCHITECTURE
      ════════════════════════════════════════════════════════════════ */}
      <section id="architecture" className="w-full py-24 z-10 relative">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

        <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="w-full text-center max-w-xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight mb-3 text-center">
              Architecture
            </h2>
            <p className="text-sm text-slate-400 font-light leading-relaxed text-center">
              From mempool ingestion to on-chain mitigation — the complete smart contract defense flow.
            </p>
          </div>

          {/* Architecture flow diagram */}
          <div className="relative p-6 sm:p-8 rounded-2xl bg-[#030509]/80 border border-white/[0.06] overflow-hidden">
            {/* Background grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:2rem_2rem]" />

            {/* Flow diagram */}
            <div className="relative z-10 flex flex-col gap-0">

              {/* Row 1: Ingestion */}
              <ArchRow label="Input Layer">
                <ArchNode color="border-slate-600" text="Mempool" sub="Live tx stream" icon={Activity} iconColor="text-slate-400" />
                <ArchArrow />
                <ArchNode color="border-aegis-cyan/40" text="Sentinel" sub="Anomaly detect" icon={Shield} iconColor="text-aegis-cyan" />
                <ArchArrow />
                <ArchNode color="border-aegis-purple/40" text="Investigator" sub="State fork trace" icon={Database} iconColor="text-aegis-purple" />
              </ArchRow>

              {/* Vertical connector */}
              <div className="flex justify-center my-0">
                <div className="w-px h-10 bg-gradient-to-b from-aegis-purple/30 to-aegis-amber/30" />
              </div>

              {/* Row 2: Analysis + Consensus */}
              <ArchRow label="Decision Layer">
                <ArchNode color="border-aegis-amber/40" text="Analyst" sub="Risk 1–100" icon={AlertTriangle} iconColor="text-aegis-amber" />
                <ArchArrow />
                <ArchNode color="border-aegis-cyan/40" text="Consensus" sub="7/7 quorum vote" icon={Layers} iconColor="text-aegis-cyan" highlight />
                <ArchArrow />
                <ArchNode color="border-aegis-red/40" text="Responder" sub="Circuit breaker" icon={Zap} iconColor="text-aegis-red" />
              </ArchRow>

              {/* Vertical connector */}
              <div className="flex justify-center my-0">
                <div className="w-px h-10 bg-gradient-to-b from-aegis-red/30 to-aegis-green/30" />
              </div>

              {/* Row 3: Finalization */}
              <ArchRow label="Output Layer">
                <ArchNode color="border-aegis-cyan/40" text="Reporter" sub="L1 ledger archive" icon={FileText} iconColor="text-aegis-cyan" />
                <ArchArrow />
                <ArchNode color="border-aegis-green/40" text="Recovery" sub="Staged unpause" icon={RefreshCw} iconColor="text-aegis-green" />
                <ArchArrow />
                <ArchNode color="border-aegis-green/60" text="Secured" sub="Admin handoff" icon={ShieldCheck} iconColor="text-aegis-green" highlight />
              </ArchRow>

            </div>

            {/* Legend */}
            <div className="relative z-10 mt-8 pt-6 border-t border-white/[0.04] flex flex-wrap gap-x-8 gap-y-3 justify-center">
              {[
                { color: 'bg-aegis-cyan', label: 'Detection & Monitoring' },
                { color: 'bg-aegis-amber', label: 'Analysis' },
                { color: 'bg-aegis-red', label: 'Active Mitigation' },
                { color: 'bg-aegis-green', label: 'Recovery' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${item.color}`} />
                  <span className="text-[10px] font-mono text-slate-500">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Smart contract notes */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { title: 'MCP Protocol', desc: 'Agents communicate via Model Context Protocol over a shared encrypted bus.' },
              { title: 'On-chain Consensus', desc: 'No action without a cryptographic 7/7 quorum signature from all agents.' },
              { title: 'Somnia L1', desc: 'Mitigation and audit logs are immutably anchored to the Somnia blockchain.' },
            ].map(item => (
              <div key={item.title} className="p-4 rounded-xl bg-[#030509]/60 border border-white/[0.04]">
                <p className="text-xs font-semibold text-white mb-1">{item.title}</p>
                <p className="text-[11px] text-slate-500 font-light leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          SECTION 6 — FOOTER
      ════════════════════════════════════════════════════════════════ */}
      <footer className="border-t border-white/[0.03] bg-[#000102] py-8 px-6 lg:px-12 z-20">
        <div className="max-w-[1100px] mx-auto flex flex-col md:flex-row justify-between items-center gap-5">
          <div className="flex items-center gap-2">
            <AegisLogo className="w-4 h-4 text-aegis-cyan opacity-80" />
            <span className="text-xs font-display font-semibold tracking-wide text-slate-300">
              Aegis<span className="text-aegis-cyan">Swarm</span>
            </span>
          </div>

          <p className="text-[10px] font-mono text-slate-600 text-center">
            © {new Date().getFullYear()} Aegis Swarm Security · Autonomous Smart Contract Defense on Somnia L1
          </p>

          <div className="flex items-center gap-4 text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-aegis-green" /> Somnia L1 Active</span>
            <span className="px-2 py-1 rounded bg-white/[0.03] border border-white/[0.05]">v3.0.0</span>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,240,255,0.15); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,240,255,0.35); }
      `}</style>
    </div>
  )
}

// ─── Agent card (extracted to fix grid layout) ────────────────────────────────

function AgentCard({ agent, delay }: { agent: typeof agents[0]; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.4 }}
      className={`group flex flex-col gap-3 p-5 rounded-2xl bg-[#030509]/80 border ${agent.border} hover:${agent.glow} transition-all duration-300 hover:-translate-y-0.5`}
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/[0.04] border border-white/[0.06]">
        <agent.icon className={`w-4 h-4 ${agent.color}`} />
      </div>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-white">{agent.name}</span>
          <span className={`text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] ${agent.color}`}>
            {agent.role}
          </span>
        </div>
        <p className="text-xs text-slate-500 font-light leading-relaxed">{agent.desc}</p>
      </div>
    </motion.div>
  )
}

// ─── Architecture sub-components ─────────────────────────────────────────────

function ArchRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">{label}</span>
      <div className="flex items-center gap-2 sm:gap-4 flex-wrap sm:flex-nowrap">
        {children}
      </div>
    </div>
  )
}

function ArchArrow() {
  return (
    <div className="flex-1 flex items-center min-w-[24px]">
      <div className="flex-1 h-px bg-gradient-to-r from-white/[0.06] to-white/[0.12]" />
      <ArrowRight className="w-3 h-3 text-slate-700 shrink-0" />
    </div>
  )
}

function ArchNode({
  text, sub, icon: Icon, iconColor, color, highlight
}: {
  text: string; sub: string; icon: React.ElementType; iconColor: string; color: string; highlight?: boolean
}) {
  return (
    <div className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border ${color} ${highlight ? 'bg-white/[0.04]' : 'bg-transparent'} min-w-[80px] sm:min-w-[100px] text-center transition-all`}>
      <Icon className={`w-4 h-4 ${iconColor}`} />
      <span className="text-[11px] font-semibold text-white leading-tight">{text}</span>
      <span className="text-[9px] font-mono text-slate-600 leading-tight">{sub}</span>
    </div>
  )
}
