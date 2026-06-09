'use client'

import { useSocket } from '@/components/providers/SocketProvider'
import { SeverityGauge } from '@/components/SeverityGauge'
import { ShieldAlert, Zap, Radio, ShieldCheck, Database, Clock, Activity, Shield, Layers, FileText, RefreshCw, AlertTriangle, ArrowRight, Play, Server, User, Flame, CheckCircle, Lock, ShieldX, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import Link from 'next/link'

type DemoState = 'idle' | 'attack-entry' | 'threat-expansion' | 'sentinel-detect' | 'investigation' | 'risk-analysis' | 'consensus-voting' | 'strategy-select' | 'emergency-pause' | 'secured'

export default function DashboardPage() {
  const { incidents, alerts, connected, simulateAttack } = useSocket()

  // Real-time backend simulation state
  const [isSimulating, setIsSimulating] = useState(false)

  // Cinematic hackathon demo mode state
  const [demoState, setDemoState] = useState<DemoState>('idle')
  const [demoLogs, setDemoLogs] = useState<Array<{ time: string, title: string, desc: string, agent: string }>>([])
  const [votingAgents, setVotingAgents] = useState<string[]>([])

  const totalIncidents = incidents.length

  const handleRealSimulate = async () => {
    setIsSimulating(true)
    await simulateAttack('0xProtectedVault_Demo')
    setTimeout(() => setIsSimulating(false), 2000)
  }

  // Cinematic sequence runner for Hackathon Judges
  const startCinematicDemo = () => {
    setVotingAgents([])
    setDemoLogs([])

    const timeNow = () => new Date().toTimeString().split(' ')[0]

    // Step-by-step triggers
    const timeline: Array<{ state: DemoState, log?: { title: string, desc: string, agent: string }, delay: number, action?: () => void }> = [
      {
        state: 'attack-entry',
        log: { title: 'Mempool Transaction Scanned', desc: 'Identified raw payload targeting protected contract address 0xProtectedVault_Demo.', agent: 'sentinel' },
        delay: 0
      },
      {
        state: 'threat-expansion',
        log: { title: 'Large Withdrawal Exploit Signature Detected', desc: 'Vulnerability exploit vector detected in block height pool streams.', agent: 'sentinel' },
        delay: 2000
      },
      {
        state: 'sentinel-detect',
        log: { title: 'Sentinel Alarm Triggered', desc: 'Flagged anomalies payload committing state frontrun attempt.', agent: 'sentinel' },
        delay: 4000
      },
      {
        state: 'investigation',
        log: { title: 'Investigation Sandbox Trace Spawned', desc: 'Traced contract trace variables caller: 0xAttackerContract, depth: 12.', agent: 'investigator' },
        delay: 6000
      },
      {
        state: 'risk-analysis',
        log: { title: 'Threat Severity Computed: 94/100', desc: 'Analyst maps pattern: FLASH_LOAN_REENTRANCY. Severity threshold met.', agent: 'analyst' },
        delay: 8500
      },
      {
        state: 'consensus-voting',
        log: { title: 'Committee Quorum Ballot Initialized', desc: 'Awaiting signature validations from 7 distributed committee agents.', agent: 'consensus' },
        delay: 11000,
        action: () => {
          // Sequentially light up voting indicators
          const agentIds = ['sentinel', 'investigator', 'analyst', 'consensus', 'responder', 'reporter', 'recovery']
          agentIds.forEach((id, index) => {
            setTimeout(() => {
              setVotingAgents(prev => [...prev, id])
            }, index * 400)
          })
        }
      },
      {
        state: 'strategy-select',
        log: { title: 'Defense Strategy Selected: HARD_PAUSE', desc: 'Consensus committee reached 100% quorum vote to execute vault freeze call.', agent: 'responder' },
        delay: 14500
      },
      {
        state: 'emergency-pause',
        log: { title: 'Emergency Contract State Circuit paused', desc: 'Response agent signs and broadcasts circuit-breaker txn with gas priority.', agent: 'responder' },
        delay: 16500
      },
      {
        state: 'secured',
        log: { title: 'Telemetry index receipt logs verified', desc: 'Incident resolved. Vault locks deployed successfully. TVL saved: $42.5M.', agent: 'reporter' },
        delay: 19000,
        action: () => {
          // Trigger backend simulation too so that it saves to the SQLite database
          simulateAttack('0xProtectedVault_Demo')
        }
      }
    ]

    timeline.forEach(step => {
      setTimeout(() => {
        setDemoState(step.state)
        if (step.log) {
          setDemoLogs(prev => [...prev, { time: timeNow(), ...step.log! }])
        }
        if (step.action) {
          step.action()
        }
      }, step.delay)
    })
  }

  const latestIncident = incidents[0]
  const isRealThreatActive = latestIncident?.status === 'OPEN'
  const isThreatActive = demoState !== 'idle' && demoState !== 'secured' || isRealThreatActive
  const globalSeverity = demoState === 'risk-analysis' || demoState === 'consensus-voting' || demoState === 'strategy-select' || demoState === 'emergency-pause' || demoState === 'secured'
    ? 94
    : isRealThreatActive
      ? (latestIncident?.severity || 0)
      : 0

  const getTimelineSteps = () => {
    if (!latestIncident) return []
    const baseTime = new Date(latestIncident.timestamp || Date.now())

    const formatTime = (secsOffset: number) => {
      const time = new Date(baseTime.getTime() + secsOffset * 1000)
      return time.toTimeString().split(' ')[0]
    }

    const steps = []

    if (latestIncident.initialThreatDetected || isRealThreatActive) {
      steps.push({
        time: formatTime(0),
        title: 'Mempool Threat Anomaly signature detected',
        desc: 'Sentinel agent flags pending tx exploit signature.',
        status: 'active',
        agent: 'sentinel'
      })
    }

    if (latestIncident.txTrace) {
      steps.push({
        time: formatTime(2),
        title: 'Trace Simulation execution trace generated',
        desc: 'Investigator agent traces caller state modifications.',
        status: 'active',
        agent: 'investigator'
      })
    }

    if (latestIncident.attackVector && latestIncident.attackVector !== 'UNKNOWN') {
      steps.push({
        time: formatTime(4),
        title: `Threat score computed: ${latestIncident.severity || 0}/100`,
        desc: `Analyst agent maps exploit pattern: ${latestIncident.attackVector}.`,
        status: 'active',
        agent: 'analyst'
      })
    }

    if (latestIncident.consensusReached) {
      steps.push({
        time: formatTime(5),
        title: 'Consensus Approved quorum voting complete',
        desc: 'Consensus agent gathers 7 cryptographic validations.',
        status: 'active',
        agent: 'consensus'
      })
    }

    if (latestIncident.defenseActionTaken && latestIncident.defenseActionTaken !== 'NO_ACTION') {
      steps.push({
        time: formatTime(6),
        title: `Vault Paused via ${latestIncident.defenseActionTaken}`,
        desc: 'Response agent signs and broadcasts circuit-breaker txn.',
        status: 'active',
        agent: 'responder'
      })
    }

    if (latestIncident.defenseTxHash) {
      steps.push({
        time: formatTime(7),
        title: 'Telemetry index logs archived',
        desc: `Reporter agent writes audit file. Hash: ${latestIncident.defenseTxHash.slice(0, 10)}...`,
        status: 'active',
        agent: 'reporter'
      })
    }

    if (latestIncident.recoveryProposed) {
      steps.push({
        time: formatTime(8),
        title: latestIncident.isRecovered ? 'Protocol Restored & Active' : 'Unpause Recovery staged',
        desc: latestIncident.isRecovered
          ? 'Recovery agent validates state proposal; contract unpaused.'
          : 'Recovery agent Stages multi-sig unpause transaction proposal.',
        status: latestIncident.isRecovered ? 'completed' : 'pending',
        agent: 'recovery'
      })
    }

    return steps
  }

  const timelineSteps = getTimelineSteps()

  const agents = [
    { id: 'sentinel', name: 'Sentinel', role: 'Mempool Scan', icon: Shield, x: 78.1, y: 50.0, color: 'rgb(0, 240, 255)', glow: 'rgba(0, 240, 255, 0.4)' },
    { id: 'investigator', name: 'Investigator', role: 'State Trace', icon: Database, x: 67.5, y: 71.9, color: 'rgb(168, 85, 247)', glow: 'rgba(168, 85, 247, 0.4)' },
    { id: 'analyst', name: 'Analyst', role: 'Threat Score', icon: AlertTriangle, x: 43.8, y: 77.4, color: 'rgb(251, 191, 36)', glow: 'rgba(251, 191, 36, 0.4)' },
    { id: 'consensus', name: 'Consensus', role: 'Quorum Vote', icon: Layers, x: 24.7, y: 62.3, color: 'rgb(236, 72, 153)', glow: 'rgba(236, 72, 153, 0.4)' },
    { id: 'responder', name: 'Responder', role: 'State Pause', icon: Zap, x: 24.7, y: 37.7, color: 'rgb(244, 63, 94)', glow: 'rgba(244, 63, 94, 0.4)' },
    { id: 'reporter', name: 'Reporter', role: 'Ledger Audit', icon: FileText, x: 43.8, y: 22.6, color: 'rgb(6, 182, 212)', glow: 'rgba(6, 182, 212, 0.4)' },
    { id: 'recovery', name: 'Recovery', role: 'Staged Reset', icon: RefreshCw, x: 67.5, y: 28.1, color: 'rgb(16, 185, 129)', glow: 'rgba(16, 185, 129, 0.4)' }
  ]

  // Detect which node is currently selected
  const activeAgentId = () => {
    if (demoState === 'sentinel-detect' || demoState === 'attack-entry' || demoState === 'threat-expansion') return 'sentinel'
    if (demoState === 'investigation') return 'investigator'
    if (demoState === 'risk-analysis') return 'analyst'
    if (demoState === 'consensus-voting') return 'consensus'
    if (demoState === 'strategy-select' || demoState === 'emergency-pause') return 'responder'
    if (demoState === 'secured') return 'reporter'

    // Fallback to real socket status
    if (!latestIncident || !isRealThreatActive) return null
    if (latestIncident.isRecovered) return 'recovery'
    if (latestIncident.defenseTxHash) return 'reporter'
    if (latestIncident.defenseActionTaken && latestIncident.defenseActionTaken !== 'NO_ACTION') return 'responder'
    if (latestIncident.consensusReached) return 'consensus'
    if (latestIncident.attackVector && latestIncident.attackVector !== 'UNKNOWN') return 'analyst'
    if (latestIncident.txTrace) return 'investigator'
    if (latestIncident.initialThreatDetected) return 'sentinel'
    return null
  }

  const currentActiveId = activeAgentId()

  // Dynamic status display
  const getSimStatusText = () => {
    if (demoState !== 'idle') {
      switch (demoState) {
        case 'attack-entry': return '⚠️ EXPLOIT PAYLOAD ENTERED MATRIX'
        case 'threat-expansion': return '⚠️ EXPLOIT REACHED PROTOCOL ENDPOINT'
        case 'sentinel-detect': return '🚨 SENTINEL ANOMALY TRIGGER VERIFIED'
        case 'investigation': return '🔍 INVESTIGATING CONTEXT EXECUTION TRACE'
        case 'risk-analysis': return '⚡ SEVERITY CRITIQUE COMPLETE: 94/100'
        case 'consensus-voting': return '🗳️ COMMITTEE QUORUM BALLOT ACTIVE'
        case 'strategy-select': return '🛡️ STRATEGY SELECTED: BROADCAST LOCKOUT'
        case 'emergency-pause': return '⚡ EMERGENCY STATE PAUSE DISPATCHED'
        case 'secured': return '🔒 VAULT LOCKED. FUNDS SECURED'
      }
    }
    return isRealThreatActive ? '⚠️ MITIGATION PAYLOAD DEPLOYED' : 'MEMPOOL SCAN: 100K+ TPS'
  }

  return (
    <div className="space-y-8 animate-fade-in-up">

      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/[0.04] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-aegis-cyan opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-aegis-cyan"></span>
            </span>
            <span className="text-[9px] font-mono font-bold tracking-widest text-aegis-cyan uppercase">
              Global Security Operations Console
            </span>
          </div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">Autonomous Command Center</h1>
          <p className="text-xs text-slate-400 mt-1 font-light">
            Live mempool audit streams, multi-agent quorum verification, and circuit-breaker deployments.
          </p>
        </div>

        {/* Simulation Triggers */}
        <div className="flex flex-wrap items-center gap-3">
          {/* WOW Hackathon Demo trigger */}
          <button
            onClick={startCinematicDemo}
            disabled={demoState !== 'idle' && demoState !== 'secured'}
            className="relative overflow-hidden flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-aegis-cyan to-[#0284c7] text-slate-950 font-mono font-bold text-xs tracking-wider uppercase hover:shadow-[0_0_25px_rgba(0,240,255,0.4)] transition-all duration-300 disabled:opacity-50 active:scale-98 cursor-pointer shadow-lg group"
          >
            <Sparkles className="w-4 h-4 text-slate-950 animate-pulse" />
            <span>Launch Attack Simulation</span>
            {/* Ambient hover light */}
            <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </button>

          {/* Core index sync simulation */}
          <button
            onClick={handleRealSimulate}
            disabled={isSimulating}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-slate-300 font-mono font-bold text-xs tracking-wider uppercase hover:border-white/[0.15] hover:bg-white/[0.05] transition-all duration-300 disabled:opacity-50 active:scale-98 cursor-pointer"
          >
            <Zap className="w-4 h-4 text-slate-400" />
            <span>Telemetry Inject</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Swarm Security State"
          value={isThreatActive ? "MITIGATION ACTIVE" : "SECURE / ACTIVE"}
          sub={isThreatActive ? "Vulnerability neutralized" : "Scanning blockchain mempool"}
          valueColor={isThreatActive ? "text-aegis-red text-glow-red font-bold animate-pulse" : "text-aegis-green text-glow-green"}
          icon={ShieldCheck}
        />
        <KPICard
          title="Active Swarm Committee"
          value="7 / 7 Online"
          sub="Deterministic consensus active"
          icon={Activity}
        />
        <KPICard
          title="Average Block Latency"
          value="1.2s avg"
          sub="Mempool scan to pause execution"
          icon={Clock}
        />
        <KPICard
          title="Consortium Audits"
          value={`${totalIncidents} Intercepted`}
          sub="Secured assets total $42.5M"
          icon={ShieldAlert}
        />
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left Column: Command Center Centerpiece Map (col-span-8) */}
        <div className="lg:col-span-8 space-y-8">

          {/* World-Class Swarm Centerpiece */}
          <div className="p-6 bg-gradient-to-br from-white/[0.015] to-white/[0.002] border border-white/[0.04] rounded-3xl shadow-glass-inner backdrop-blur-md overflow-hidden relative min-h-[480px] flex flex-col justify-between">

            {/* Dynamic visual gradients overlay reflecting hazard state */}
            <div className={`absolute inset-0 transition-opacity duration-1000 pointer-events-none ${demoState === 'attack-entry' || demoState === 'threat-expansion' || demoState === 'sentinel-detect'
                ? 'bg-radial-gradient from-aegis-red/[0.03] to-transparent opacity-100'
                : 'bg-radial-gradient from-aegis-cyan/[0.01] to-transparent opacity-100'
              }`} />

            {/* Header / Telemetry Info */}
            <div className="flex justify-between items-center border-b border-white/[0.03] pb-3 mb-4 z-10 relative">
              <div className="flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-aegis-cyan animate-pulse" />
                <span className="text-[10px] font-mono font-bold text-white uppercase tracking-wider">
                  Swarm Telemetry Topology
                </span>
              </div>
              <span className={`text-[8px] font-mono font-bold uppercase tracking-wider ${isThreatActive ? 'text-aegis-red' : 'text-slate-500'}`}>
                {getSimStatusText()}
              </span>
            </div>

            {/* Central Agent Network Visualizer */}
            <div className="flex-1 flex items-center justify-center min-h-[460px] relative py-12 select-none">

              {/* Outer grid orbits */}
              <div className="absolute w-[440px] h-[440px] border border-white/[0.01] rounded-full flex items-center justify-center">
                <div className="absolute w-[340px] h-[340px] border border-dashed border-white/[0.03] animate-[spin_40s_linear_infinite]" />
                <div className="absolute w-[220px] h-[220px] border border-dotted border-white/[0.04] animate-[spin_20s_linear_infinite_reverse]" />
              </div>

              {/* Dynamic SVG Connections and Particle Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                <defs>
                  <linearGradient id="laser-grad-red" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.1" />
                  </linearGradient>
                  <linearGradient id="laser-grad-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#00f0ff" stopOpacity="0.1" />
                  </linearGradient>
                </defs>

                {/* SVG connection lines between agents and central vault */}
                {agents.map((agent) => {
                  const isActive = currentActiveId === agent.id
                  const lineGlow = isActive ? agent.color : 'rgba(255, 255, 255, 0.03)'
                  return (
                    <g key={agent.id}>
                      {/* Connection Pathway */}
                      <line
                        x1="50%"
                        y1="50%"
                        x2={`${agent.x}%`}
                        y2={`${agent.y}%`}
                        stroke={lineGlow}
                        strokeWidth={isActive ? 2 : 1}
                        className="transition-all duration-500"
                        strokeDasharray={isActive ? "none" : "4 4"}
                      />

                      {/* Particle data packet flows along the connection line */}
                      {isActive && (
                        <motion.circle
                          cx="50%"
                          cy="50%"
                          r="3"
                          fill={agent.color}
                          animate={{
                            cx: [`50%`, `${agent.x}%`],
                            cy: [`50%`, `${agent.y}%`],
                          }}
                          transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            ease: 'easeInOut'
                          }}
                          style={{ filter: `drop-shadow(0 0 6px ${agent.color})` }}
                        />
                      )}
                    </g>
                  )
                })}

                {/* Attacker to center line */}
                {isThreatActive && (
                  <line
                    x1="12%"
                    y1="50%"
                    x2="50%"
                    y2="50%"
                    stroke={demoState === 'emergency-pause' || demoState === 'secured' ? '#475569' : '#f43f5e'}
                    strokeWidth={demoState === 'emergency-pause' || demoState === 'secured' ? 1 : 2}
                    className="transition-all duration-500"
                    strokeDasharray={demoState === 'emergency-pause' || demoState === 'secured' ? '3 3' : 'none'}
                  />
                )}
              </svg>

              {/* Attacker Node (Visible during attack phases) */}
              {isThreatActive && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5, x: -50 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  className="absolute left-8 flex flex-col items-center z-10"
                >
                  <div className="w-14 h-14 rounded-2xl bg-aegis-red/10 border border-aegis-red/40 flex items-center justify-center shadow-[0_0_20px_rgba(244,63,94,0.3)] relative">
                    <Flame className="w-6 h-6 text-aegis-red animate-pulse" />

                    {/* Ring shockwave */}
                    {(demoState === 'attack-entry' || demoState === 'threat-expansion') && (
                      <motion.div
                        animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="absolute inset-0 rounded-2xl border border-aegis-red/40"
                      />
                    )}
                  </div>
                  <span className="text-[9px] text-aegis-red font-mono font-bold uppercase tracking-wider mt-2.5">Exploit Origin</span>
                  <span className="text-[7px] text-slate-500 font-mono mt-0.5 select-all">0xAttacker...</span>
                </motion.div>
              )}

              {/* Central Shield Protocol Node */}
              <div className="relative z-10 flex flex-col items-center">
                <motion.div
                  animate={isThreatActive
                    ? { scale: [1, 1.1, 1] }
                    : { scale: [1, 1.05, 1] }
                  }
                  transition={{ duration: isThreatActive ? 1 : 4, repeat: Infinity }}
                  className={`w-28 h-28 rounded-full border-2 bg-[#050814]/90 flex items-center justify-center shadow-glass-inner relative transition-all duration-500 ${demoState === 'secured'
                      ? 'border-aegis-green bg-aegis-green/[0.02] shadow-[0_0_30px_rgba(16,185,129,0.25)]'
                      : demoState === 'emergency-pause'
                        ? 'border-aegis-red bg-aegis-red/[0.02] shadow-[0_0_30px_rgba(244,63,94,0.3)]'
                        : isThreatActive
                          ? 'border-aegis-amber bg-aegis-amber/[0.02] shadow-[0_0_25px_rgba(251,191,36,0.2)]'
                          : 'border-aegis-cyan/30 bg-aegis-cyan/[0.01]'
                    }`}
                >
                  <AnimatePresence mode="wait">
                    {demoState === 'secured' ? (
                      <motion.div key="secured" initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }}>
                        <CheckCircle className="w-10 h-10 text-aegis-green drop-shadow-[0_0_8px_#10b981]" />
                      </motion.div>
                    ) : demoState === 'emergency-pause' ? (
                      <motion.div key="lock" initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }}>
                        <Lock className="w-9 h-9 text-aegis-red drop-shadow-[0_0_8px_#f43f5e]" />
                      </motion.div>
                    ) : isThreatActive ? (
                      <motion.div key="alert" initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }}>
                        <ShieldAlert className="w-9 h-9 text-aegis-amber animate-bounce" />
                      </motion.div>
                    ) : (
                      <motion.div key="check" initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }}>
                        <ShieldCheck className="w-9 h-9 text-aegis-cyan" />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Circular threat ripple shockwave */}
                  {demoState === 'threat-expansion' && (
                    <motion.div
                      animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                      className="absolute inset-0 rounded-full border border-2 border-aegis-red"
                    />
                  )}
                </motion.div>
                <span className="text-[10px] text-white font-mono font-bold tracking-wider mt-4 uppercase">Protected Vault</span>
                <span className="text-[8px] text-slate-500 font-mono mt-1 select-all">0xProt…Demo</span>
              </div>

              {/* Swarm Committee Agents */}
              <div className="absolute inset-0 w-full h-full pointer-events-none z-10">
                {agents.map((agent) => {
                  const isPulsing = currentActiveId === agent.id
                  const hasVoted = votingAgents.includes(agent.id)

                  // Active nodes checklist checks
                  const isNodeActive = isThreatActive && (
                    isPulsing ||
                    hasVoted ||
                    (agent.id === 'sentinel' && (demoState !== 'attack-entry' && demoState !== 'threat-expansion'))
                  )

                  const Icon = agent.icon

                  return (
                    <div
                      key={agent.id}
                      className="absolute flex flex-col items-center select-none transition-all duration-500"
                      style={{
                        left: `${agent.x}%`,
                        top: `${agent.y}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      <motion.div
                        animate={isPulsing ? { scale: [1, 1.15, 1] } : {}}
                        transition={{ duration: 1.2, repeat: Infinity }}
                        className="w-12 h-12 rounded-2xl bg-[#060a17]/95 border flex items-center justify-center shadow-glass-inner relative"
                        style={{
                          borderColor: isPulsing
                            ? agent.color
                            : isNodeActive
                              ? 'rgba(255, 255, 255, 0.15)'
                              : 'rgba(255, 255, 255, 0.03)',
                          boxShadow: isPulsing
                            ? `0 0 15px ${agent.glow}`
                            : 'none'
                        }}
                      >
                        <Icon className="w-4.5 h-4.5" style={{ color: isPulsing || isNodeActive ? agent.color : '#475569' }} />

                        {/* Little check mark indicating voting authorization status */}
                        {hasVoted && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 rounded-full bg-aegis-green flex items-center justify-center border border-[#040714] text-[8px] font-bold text-[#040714]"
                          >
                            ✓
                          </motion.div>
                        )}
                      </motion.div>

                      <span className={`text-[8px] font-mono mt-2 uppercase font-bold tracking-wider transition-colors duration-300 ${isPulsing || isNodeActive ? 'text-white' : 'text-slate-600'}`}>
                        {agent.name}
                      </span>
                    </div>
                  )
                })}
              </div>

            </div>

            {/* Victory overlay banner for demo secured */}
            <AnimatePresence>
              {demoState === 'secured' && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute inset-x-6 bottom-16 bg-gradient-to-r from-aegis-green/[0.08] to-aegis-cyan/[0.08] border border-aegis-green/30 p-5 rounded-2xl backdrop-blur-lg z-20 flex flex-col sm:flex-row justify-between items-center gap-4 text-left shadow-[0_0_30px_rgba(16,185,129,0.1)]"
                >
                  <div className="space-y-1">
                    <span className="text-[8px] font-mono font-bold text-aegis-green uppercase tracking-widest block">simulation success</span>
                    <h4 className="text-sm font-display font-bold text-white flex items-center gap-2">
                      <ShieldCheck className="w-4.5 h-4.5 text-aegis-green animate-pulse" /> Exploitation Vector Neutralized
                    </h4>
                    <p className="text-[10px] text-slate-300 font-light max-w-xl">
                      Swarm frontran reentrancy call parameters, lock state variables paused, and completed telemetry indexing records in <strong className="text-white">120ms</strong>. Assets protected: <strong className="text-aegis-green">$42.5M TVL</strong>.
                    </p>
                  </div>
                  <button
                    onClick={() => setDemoState('idle')}
                    className="px-4 py-2 rounded-xl bg-aegis-green text-slate-950 font-mono font-bold text-[10px] uppercase hover:bg-white transition-all duration-300"
                  >
                    Clear Matrix
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Sub-bar showing connection parameters */}
            <div className="border-t border-white/[0.03] pt-3 flex justify-between items-center text-[9px] font-mono text-slate-500 z-10 relative">
              <span className="flex items-center gap-1"><Server className="w-3 h-3" /> Consensus Port: 3001</span>
              <span>Committee Size: 7 Swarm Agents</span>
              <span className="flex items-center gap-1"><User className="w-3 h-3" /> State: Synced</span>
            </div>
          </div>

          {/* Cinematic Timeline Section */}
          <div className="p-6 bg-gradient-to-br from-white/[0.015] to-white/[0.002] border border-white/[0.04] rounded-3xl shadow-glass-inner backdrop-blur-md">
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-widest mb-6 border-b border-white/[0.03] pb-3">
              Cinematic Incident Defense Timeline
            </h3>

            {/* Merge real socket timelines with demo logs */}
            {timelineSteps.length === 0 && demoLogs.length === 0 ? (
              <div className="py-12 text-center text-slate-500 font-mono text-xs uppercase tracking-wider">
                📡 Standing by. Trigger a simulation to see the cinematic timeline logs...
              </div>
            ) : (
              <div className="relative pl-6 border-l border-white/[0.05] space-y-6">
                <AnimatePresence>
                  {(demoState !== 'idle' ? demoLogs : timelineSteps).map((step, idx) => {
                    const agentConfig = agents.find(a => a.id === step.agent)
                    return (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={idx}
                        className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-left"
                      >
                        {/* Timeline dot */}
                        <div
                          className="absolute -left-[29px] top-1 w-3.5 h-3.5 rounded-full border-2 bg-[#040714] transition-colors duration-500"
                          style={{ borderColor: agentConfig?.color || 'rgba(255,255,255,0.2)', boxShadow: `0 0 8px ${agentConfig?.glow}` }}
                        />

                        <div className="flex-1">
                          <div className="flex items-center gap-2.5">
                            <span className="text-[10px] font-mono font-bold text-slate-500">{step.time}</span>
                            <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider">{step.title}</h4>
                          </div>
                          <p className="text-[10px] text-slate-400 font-mono mt-1">{step.desc}</p>
                        </div>

                        <span className="text-[8px] font-mono px-2 py-0.5 rounded border uppercase shrink-0 font-bold self-start sm:self-center"
                          style={{
                            color: agentConfig?.color,
                            borderColor: `${agentConfig?.color}25`,
                            backgroundColor: `${agentConfig?.color}08`
                          }}
                        >
                          {step.agent}
                        </span>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Severity Gauge & Swarm Registry & Mini Alerts (col-span-4) */}
        <div className="lg:col-span-4 space-y-8 flex flex-col">

          {/* Severity Gauge Arc Dial */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-white/[0.015] to-white/[0.002] border border-white/[0.04] shadow-glass-inner backdrop-blur-md flex flex-col items-center justify-center relative overflow-hidden min-h-[240px]">
            <div
              className={`absolute inset-0 opacity-10 transition-all duration-1000 ${isThreatActive ? 'bg-aegis-red blur-3xl scale-125' : 'bg-aegis-cyan blur-2xl'}`}
              style={{ filter: 'blur(70px)' }}
            />
            <SeverityGauge score={globalSeverity} />
          </div>

          {/* Quick Details / Staged Proposal Card */}
          {((latestIncident && isRealThreatActive) || (demoState !== 'idle' && demoState !== 'secured')) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-5 rounded-3xl border border-aegis-cyan/25 bg-aegis-cyan/[0.01] shadow-glass-inner flex flex-col justify-between text-left"
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest">Active Incident Dossier</span>
                <span className="text-[8px] px-1.5 py-0.5 rounded bg-aegis-cyan/15 text-aegis-cyan font-bold font-mono">MITIGATION ACTIVE</span>
              </div>
              <p className="text-[10px] text-slate-300 font-mono leading-relaxed">
                Reentrancy frontrun lockout sequence triggered against target. Exploit neutralized. Bytecode paused contract address variables.
              </p>
              <div className="mt-4 pt-3 border-t border-white/[0.03] flex justify-between items-center">
                <span className="text-[8px] font-mono text-slate-500">ID: {latestIncident?.id ? latestIncident.id.slice(0, 14) : 'sim-hackathon-epoch'}...</span>
                <Link
                  href={`/dashboard/investigation/${latestIncident?.id || 'sim-latest'}`}
                  className="flex items-center gap-1 text-[9px] text-aegis-cyan font-mono font-bold hover:underline"
                >
                  Inspect details <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </motion.div>
          )}

          {/* Mini-feed alerts */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-white/[0.015] to-white/[0.002] border border-white/[0.04] shadow-glass-inner backdrop-blur-md flex-1 overflow-hidden flex flex-col min-h-[300px]">
            <h3 className="text-[10px] font-mono font-bold text-white uppercase tracking-widest flex items-center gap-2 mb-4 border-b border-white/[0.03] pb-2">
              <ShieldAlert className="w-3.5 h-3.5 text-aegis-amber animate-pulse" /> Live Telemetry Alerts
            </h3>

            <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar text-left">
              <AnimatePresence initial={false}>
                {alerts.length === 0 && demoState === 'idle' ? (
                  <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                    <span className="text-slate-500 font-mono text-[9px] uppercase tracking-widest">Awaiting telemetry logs...</span>
                  </div>
                ) : (
                  (demoState !== 'idle'
                    ? demoLogs.map((log, i) => ({ id: i, message: log.desc, severity: 70, timestamp: Date.now() }))
                    : alerts
                  ).map((alert, i) => (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={`alert-${i}-${alert.id ?? ''}`}
                      className="p-3.5 rounded-2xl bg-white/[0.015] border border-white/[0.03] text-xs backdrop-blur-md"
                    >
                      <div className="flex justify-between items-center mb-1.5 flex-wrap gap-1">
                        <span className={`font-mono text-[9px] font-bold uppercase tracking-wider ${alert.severity >= 80 ? 'text-aegis-red' : 'text-aegis-amber'}`}>
                          {alert.severity >= 80 ? 'CRITICAL SHIELD' : 'TELEMETRY'}
                        </span>
                        <span className="text-slate-500 font-mono text-[8px]">
                          {new Date(alert.timestamp || Date.now()).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-slate-300 font-mono text-[10px] leading-relaxed">{alert.message}</p>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}

function KPICard({ title, value, sub, valueColor = "text-white", icon: Icon }: { title: string, value: string, sub: string, valueColor?: string, icon: any }) {
  return (
    <div className="p-5 bg-gradient-to-br from-white/[0.015] to-white/[0.002] border border-white/[0.04] shadow-glass-inner rounded-2xl backdrop-blur-md flex flex-col justify-between select-none text-left">
      <div className="flex justify-between items-center mb-3">
        <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">{title}</span>
        <Icon className="w-4 h-4 text-slate-500" />
      </div>
      <div>
        <h4 className={`text-base sm:text-lg font-display font-bold tracking-tight ${valueColor}`}>{value}</h4>
        <span className="text-[9px] text-slate-500 mt-1 block leading-tight">{sub}</span>
      </div>
    </div>
  )
}
