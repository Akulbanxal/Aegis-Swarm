'use client'

import { useSocket } from '@/components/providers/SocketProvider'
import { SeverityGauge } from '@/components/SeverityGauge'
import { 
  Shield, Zap, AlertTriangle, Database, Users, FileText, RefreshCw, 
  Radio, CheckCircle, Lock, Layers, Sparkles, MessageSquare, Server, 
  ArrowLeft, Play, Pause, RotateCcw, Activity, ShieldAlert, ChevronRight,
  Terminal, Globe, DollarSign, Cpu, Flame, LockKeyhole, ShieldCheck, Fingerprint
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

type DemoState = 
  | 'idle' 
  | 'attack-entry' 
  | 'threat-expansion' 
  | 'sentinel-detect' 
  | 'investigation' 
  | 'risk-analysis' 
  | 'consensus-voting' 
  | 'strategy-select' 
  | 'emergency-pause' 
  | 'secured'

interface MempoolTx {
  hash: string
  from: string
  to: string
  value: string
  gasPrice: string
  status: 'benign' | 'exploit' | 'mitigation'
  method: string
}

export default function ExperiencePage() {
  const { incidents, connected, simulateAttack } = useSocket()
  
  // HUD toggles for messy layout cleanup
  const [showIntelHUD, setShowIntelHUD] = useState<boolean>(true)
  const [showChatHUD, setShowChatHUD] = useState<boolean>(true)
  const [leftTab, setLeftTab] = useState<'mempool' | 'dossier'>('mempool')
  const [rightTab, setRightTab] = useState<'ledger' | 'chat'>('chat')
  const [orbitScale, setOrbitScale] = useState<number>(0.72)
  
  // Simulation config & multipliers
  const [demoState, setDemoState] = useState<DemoState>('idle')
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1) // 0.5, 1, 2, 5
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0)
  
  // Real-time feeds and logs
  const [mempoolList, setMempoolList] = useState<MempoolTx[]>([])
  const [debateMessages, setDebateMessages] = useState<Array<{
    sender: string
    role: string
    message: string
    color: string
    icon: any
    time: string
  }>>([])
  const [votingAgents, setVotingAgents] = useState<string[]>([])
  const [selectedAgentId, setSelectedAgentId] = useState<string>('sentinel')
  
  // Global dashboard metrics
  const [blockHeight, setBlockHeight] = useState<number>(1829940)
  const [latencyMs, setLatencyMs] = useState<number>(0)
  const [gasPriceGwei, setGasPriceGwei] = useState<number>(32)
  const [tvlProtected, setTvlProtected] = useState<string>('$42.5M')

  const timeoutRefs = useRef<NodeJS.Timeout[]>([])
  const mempoolIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const debateContainerRef = useRef<HTMLDivElement>(null)
  const terminalLogsRef = useRef<HTMLDivElement>(null)

  // Dynamically expand and contract orbit scale based on what windows are open
  useEffect(() => {
    if (!showIntelHUD && !showChatHUD) {
      setOrbitScale(0.92)
    } else if (!showIntelHUD || !showChatHUD) {
      setOrbitScale(0.82)
    } else {
      setOrbitScale(0.70)
    }
  }, [showIntelHUD, showChatHUD])

  // System agent identities using scaled coordinate layout
  const agents = [
    { id: 'sentinel', name: 'Sentinel Agent', role: 'Mempool Auditor', icon: Shield, color: 'rgb(0, 240, 255)', glow: 'rgba(0, 240, 255, 0.4)', x: 50 + 36 * orbitScale, y: 50, desc: 'Audits live block mempool, executing zero-day heuristic classifications on pending payloads.' },
    { id: 'investigator', name: 'Investigator Agent', role: 'Transaction Tracer', icon: Database, color: 'rgb(168, 85, 247)', glow: 'rgba(168, 85, 247, 0.4)', x: 50 + 22.4 * orbitScale, y: 50 + 28.1 * orbitScale, desc: 'Spawns on-demand EVM trace simulations, tracking caller contracts, depth, and memory values.' },
    { id: 'analyst', name: 'Analyst Agent', role: 'Exploit Classifier', icon: AlertTriangle, color: 'rgb(251, 191, 36)', glow: 'rgba(251, 191, 36, 0.4)', x: 50 - 8 * orbitScale, y: 50 + 35.1 * orbitScale, desc: 'Maps sandbox traces against signature sets, generating real-time hazard vectors and severity scoring.' },
    { id: 'consensus', name: 'Consensus Agent', role: 'Quorum Validator', icon: Users, color: 'rgb(236, 72, 153)', glow: 'rgba(236, 72, 153, 0.4)', x: 50 - 32.4 * orbitScale, y: 50 + 15.7 * orbitScale, desc: 'Aggregates cryptographic signatures across the swarm, confirming quorum consensus variables.' },
    { id: 'responder', name: 'Responder Agent', role: 'Mitigation Executor', icon: Zap, color: 'rgb(244, 63, 94)', glow: 'rgba(244, 63, 94, 0.4)', x: 50 - 32.4 * orbitScale, y: 50 - 15.7 * orbitScale, desc: 'Constructs secure circuit-breaker payloads and broadcasts frontrunning emergency pause txs.' },
    { id: 'reporter', name: 'Reporter Agent', role: 'Ledger Archiver', icon: FileText, color: 'rgb(6, 182, 212)', glow: 'rgba(6, 182, 212, 0.4)', x: 50 - 8 * orbitScale, y: 50 - 35.1 * orbitScale, desc: 'Documents mitigation txn structures, logs call data variables, and commits receipts to the audit chain.' },
    { id: 'recovery', name: 'Recovery Agent', role: 'State Restorer', icon: RefreshCw, color: 'rgb(16, 185, 129)', glow: 'rgba(16, 185, 129, 0.4)', x: 50 + 22.4 * orbitScale, y: 50 - 28.1 * orbitScale, desc: 'Conducts post-mitigation trace checks and schedules safe, signature-approved state restoration.' }
  ]

  const timelineSteps: { state: DemoState; title: string; desc: string }[] = [
    { state: 'idle', title: 'Idle Scanning', desc: 'Auditing blockchain mempools at 100K+ TPS' },
    { state: 'attack-entry', title: 'Exploit Mempool Entry', desc: 'Vulnerability exploit proxy payload broadcasted' },
    { state: 'threat-expansion', title: 'Threat Expansion', desc: 'Targeting ProtectedVault storage balances' },
    { state: 'sentinel-detect', title: 'Sentinel Flagged', desc: 'Anomaly trigger fired by Sentinel heuristic' },
    { state: 'investigation', title: 'Sandbox Trace', desc: 'Trace execution stacks & sandboxed forking' },
    { state: 'risk-analysis', title: 'Threat Score', desc: 'Exploit verified, rating severity 94/100' },
    { state: 'consensus-voting', title: 'Committee Ballot', desc: 'Collecting signature validations' },
    { state: 'strategy-select', title: 'Action Selection', desc: 'Emergency circuit-breaker pause approved' },
    { state: 'emergency-pause', title: 'Emergency Freeze', desc: 'Broadcasting lock bytecode transaction' },
    { state: 'secured', title: 'Assets Secured', desc: 'Protocol paused. Exploit blocked. Saved $42.5M' }
  ]

  // Clear pending timers
  const clearTimers = () => {
    timeoutRefs.current.forEach(t => clearTimeout(t))
    timeoutRefs.current = []
  }

  // Scroll utilities
  useEffect(() => {
    if (debateContainerRef.current) {
      debateContainerRef.current.scrollTop = debateContainerRef.current.scrollHeight
    }
  }, [debateMessages, rightTab])

  // Simulated benign mempool activity
  useEffect(() => {
    const generateBenignTx = () => {
      const methods = ['transfer', 'swap', 'approve', 'deposit', 'stake']
      const hex = '0123456789abcdef'
      const randomHex = (len: number) => Array.from({ length: len }, () => hex[Math.floor(Math.random() * 16)]).join('')
      
      return {
        hash: `0x${randomHex(8)}...${randomHex(4)}`,
        from: `0x${randomHex(4)}...${randomHex(4)}`,
        to: `0x${randomHex(4)}...${randomHex(4)}`,
        value: `${(Math.random() * 5).toFixed(2)} ETH`,
        gasPrice: `${(28 + Math.random() * 10).toFixed(0)} Gwei`,
        status: 'benign' as const,
        method: methods[Math.floor(Math.random() * methods.length)]
      }
    }

    // Initialize list
    setMempoolList(Array.from({ length: 12 }, generateBenignTx))

    mempoolIntervalRef.current = setInterval(() => {
      setMempoolList(prev => {
        const next = [generateBenignTx(), ...prev]
        return next.slice(0, 16)
      })
      setBlockHeight(b => b + (Math.random() > 0.85 ? 1 : 0))
    }, 1500)

    return () => {
      if (mempoolIntervalRef.current) clearInterval(mempoolIntervalRef.current)
      clearTimers()
    }
  }, [])

  const currentStepConfig = timelineSteps.find(s => s.state === demoState)
  const isThreatActive = demoState !== 'idle' && demoState !== 'secured'
  const isVaultPaused = demoState === 'emergency-pause'
  const isVaultSecured = demoState === 'secured'

  const activeAgentId = () => {
    if (demoState === 'attack-entry' || demoState === 'threat-expansion' || demoState === 'sentinel-detect') return 'sentinel'
    if (demoState === 'investigation') return 'investigator'
    if (demoState === 'risk-analysis') return 'analyst'
    if (demoState === 'consensus-voting') return 'consensus'
    if (demoState === 'strategy-select' || demoState === 'emergency-pause') return 'responder'
    if (demoState === 'secured') return 'reporter'
    return selectedAgentId
  }

  const currentActiveId = activeAgentId()

  const getSeverity = () => {
    if (demoState === 'idle') return 0
    if (demoState === 'attack-entry') return 12
    if (demoState === 'threat-expansion') return 34
    if (demoState === 'sentinel-detect') return 58
    if (demoState === 'investigation') return 72
    return 94
  }

  // Cinematic Sequencer
  const runSequence = (startStep: number) => {
    clearTimers()
    setIsPlaying(true)

    const timeNow = () => new Date().toTimeString().split(' ')[0]
    
    // Scale factor based on speed selector (0.5x, 1x, 2x, 5x)
    const baseDuration = (ms: number) => ms / simulationSpeed

    const timeline: Array<{
      state: DemoState
      action?: () => void
      delay: number
      kpis?: { latency: number; gas: number; tvl: string }
    }> = [
      {
        state: 'idle',
        delay: 0,
        kpis: { latency: 0, gas: 32, tvl: '$42.5M' },
        action: () => {
          setVotingAgents([])
          setDebateMessages([])
        }
      },
      {
        state: 'attack-entry',
        delay: 1000,
        kpis: { latency: 15, gas: 35, tvl: '$42.5M' },
        action: () => {
          // Open left panel automatically to draw focus
          setShowIntelHUD(true)
          setLeftTab('mempool')
          // Inject malicious tx to mempool
          setMempoolList(prev => [
            {
              hash: '0xe712...93bf',
              from: '0xAttackerContract',
              to: '0xProtectedVault_Demo',
              value: '0.00 ETH',
              gasPrice: '450 Gwei',
              status: 'exploit',
              method: 'exploitProxy'
            },
            ...prev.slice(0, 15)
          ])
          // Dialogue
          setDebateMessages(prev => [
            ...prev,
            {
              sender: 'Sentinel Agent',
              role: 'Mempool Scanner',
              message: '🚨 Warning: Mempool transactions scan parsed. Found high-priority payload targeting vault deposit/withdraw bytecode paths.',
              color: 'rgb(0, 240, 255)',
              icon: Shield,
              time: timeNow()
            }
          ])
        }
      },
      {
        state: 'threat-expansion',
        delay: 3000,
        kpis: { latency: 32, gas: 35, tvl: '$42.5M' },
        action: () => {
          setDebateMessages(prev => [
            ...prev,
            {
              sender: 'Sentinel Agent',
              role: 'Mempool Scanner',
              message: '🚨 Hazard Alert: Flash loan reentrancy signature verified. Target: 0xProtectedVault_Demo. Exploit entering memory queue.',
              color: 'rgb(0, 240, 255)',
              icon: Shield,
              time: timeNow()
            }
          ])
        }
      },
      {
        state: 'sentinel-detect',
        delay: 5000,
        kpis: { latency: 45, gas: 60, tvl: '$42.5M' },
        action: () => {
          setDebateMessages(prev => [
            ...prev,
            {
              sender: 'Sentinel Agent',
              role: 'Mempool Scanner',
              message: '🚨 SENTINEL ANOMALY TRIGGER ENGAGED. Initializing swarm-wide incident bridge consensus committee.',
              color: 'rgb(0, 240, 255)',
              icon: Shield,
              time: timeNow()
            }
          ])
        }
      },
      {
        state: 'investigation',
        delay: 7500,
        kpis: { latency: 68, gas: 60, tvl: '$42.5M' },
        action: () => {
          setSelectedAgentId('investigator')
          setLeftTab('dossier')
          setDebateMessages(prev => [
            ...prev,
            {
              sender: 'Investigation Agent',
              role: 'Transaction Tracer',
              message: '🔍 Sandboxed fork completed. Execution trace isolates deep reentrant withdrawal calls. Attacker: 0xAttackerContract. Gas: 450 Gwei.',
              color: 'rgb(168, 85, 247)',
              icon: Database,
              time: timeNow()
            }
          ])
        }
      },
      {
        state: 'risk-analysis',
        delay: 10000,
        kpis: { latency: 85, gas: 92, tvl: '$42.5M' },
        action: () => {
          setSelectedAgentId('analyst')
          setDebateMessages(prev => [
            ...prev,
            {
              sender: 'Analyst Agent',
              role: 'Exploit Classifier',
              message: '⚡ Classifications check matches Flash Loan Reentrancy exploit patterns. Severity rating computed at 94/100. Policy recommends IMMEDIATE pause protocol.',
              color: 'rgb(251, 191, 36)',
              icon: AlertTriangle,
              time: timeNow()
            }
          ])
        }
      },
      {
        state: 'consensus-voting',
        delay: 12500,
        kpis: { latency: 98, gas: 120, tvl: '$42.5M' },
        action: () => {
          setSelectedAgentId('consensus')
          setShowChatHUD(true)
          setRightTab('ledger')
          setDebateMessages(prev => [
            ...prev,
            {
              sender: 'Consensus Agent',
              role: 'Quorum Validator',
              message: '🗳️ Committee ballot initialised. Dispatching ballot signatures index requests across all 7 nodes.',
              color: 'rgb(236, 72, 153)',
              icon: Users,
              time: timeNow()
            }
          ])

          // Vote ticking animation sequence
          const agentIds = ['sentinel', 'investigator', 'analyst', 'consensus', 'responder', 'reporter', 'recovery']
          agentIds.forEach((id, index) => {
            const voteTimer = setTimeout(() => {
              setVotingAgents(prev => [...prev, id])
              const agentObj = agents.find(a => a.id === id)!
              setDebateMessages(prev => [
                ...prev,
                {
                  sender: agentObj.name,
                  role: agentObj.role,
                  message: `✓ Cryptographic signature signed. Key hash: ${agentObj.desc.substring(0, 12)}...`,
                  color: agentObj.color,
                  icon: CheckCircle,
                  time: timeNow()
                }
              ])
            }, baseDuration(index * 300))
            timeoutRefs.current.push(voteTimer)
          })
        }
      },
      {
        state: 'strategy-select',
        delay: 16000,
        kpis: { latency: 105, gas: 180, tvl: '$42.5M' },
        action: () => {
          setSelectedAgentId('responder')
          setDebateMessages(prev => [
            ...prev,
            {
              sender: 'Response Agent',
              role: 'Mitigation Executor',
              message: '🛡️ Swarm committee reached 100% quorum vote. Compiling bytecode for circuit-breaker execution trace. Mitigation type: HARD_PAUSE.',
              color: 'rgb(244, 63, 94)',
              icon: Zap,
              time: timeNow()
            }
          ])
        }
      },
      {
        state: 'emergency-pause',
        delay: 18500,
        kpis: { latency: 112, gas: 500, tvl: '$42.5M' },
        action: () => {
          // Pre-empt inject mitigation transaction into mempool
          setMempoolList(prev => [
            {
              hash: '0x99a2...cb11',
              from: '0xResponseAgent',
              to: '0xProtectedVault_Demo',
              value: '0.00 ETH',
              gasPrice: '500 Gwei',
              status: 'mitigation',
              method: 'setPaused(true)'
            },
            ...prev
          ])
          setDebateMessages(prev => [
            ...prev,
            {
              sender: 'Response Agent',
              role: 'Mitigation Executor',
              message: '⚡ Frontrunning attack transaction broadcasted. Circuit-breaker gas priority set to 500 Gwei. Broadcasting state pause call on-chain...',
              color: 'rgb(244, 63, 94)',
              icon: Zap,
              time: timeNow()
            }
          ])
        }
      },
      {
        state: 'secured',
        delay: 21500,
        kpis: { latency: 120, gas: 32, tvl: '$42.5M' },
        action: () => {
          setSelectedAgentId('reporter')
          setRightTab('chat')
          setDebateMessages(prev => [
            ...prev,
            {
              sender: 'Reporting Agent',
              role: 'Ledger Archiver',
              message: '📄 EMERGENCY PAUSE MINED. Vault paused variables locked. Exploit Tx failed (reverted). TVL Saved: $42.5M. Telemetry receipt indexed on ledger.',
              color: 'rgb(6, 182, 212)',
              icon: FileText,
              time: timeNow()
            },
            {
              sender: 'Recovery Agent',
              role: 'State Restorer',
              message: '🔄 Swarm Security Operations status: SECURED. Safe unpause parameters queued.',
              color: 'rgb(16, 185, 129)',
              icon: RefreshCw,
              time: timeNow()
            }
          ])
          setIsPlaying(false)
          
          // Trigger actual backend simulation if socket exists
          simulateAttack('0xProtectedVault_Demo').catch(() => {})
        }
      }
    ]

    // Slice timeline based on where we are starting
    const executionSteps = timeline.slice(startStep)
    let totalDelay = 0

    executionSteps.forEach((step, idx) => {
      const stepTimer = setTimeout(() => {
        setDemoState(step.state)
        setActiveStepIndex(startStep + idx)
        if (step.kpis) {
          setLatencyMs(step.kpis.latency)
          setGasPriceGwei(step.kpis.gas)
          setTvlProtected(step.kpis.tvl)
        }
        if (step.action) {
          step.action()
        }
      }, baseDuration(totalDelay))
      
      timeoutRefs.current.push(stepTimer)
      totalDelay += step.delay
    })
  }

  // Start simulation from beginning
  const startSimulation = () => {
    setDemoState('idle')
    setVotingAgents([])
    setDebateMessages([])
    runSequence(0)
  }

  // Toggle Play/Pause
  const togglePlay = () => {
    if (isPlaying) {
      clearTimers()
      setIsPlaying(false)
    } else {
      runSequence(activeStepIndex)
    }
  }

  // Reset to Idle
  const resetSimulation = () => {
    clearTimers()
    setIsPlaying(false)
    setDemoState('idle')
    setActiveStepIndex(0)
    setVotingAgents([])
    setDebateMessages([])
    setLatencyMs(0)
    setGasPriceGwei(32)
  }

  // Manually jump to a phase
  const jumpToPhase = (index: number) => {
    clearTimers()
    setIsPlaying(false)
    const targetState = timelineSteps[index].state
    setDemoState(targetState)
    setActiveStepIndex(index)
    
    // Partially sync details depending on where we jump
    if (index === 0) {
      setVotingAgents([])
      setDebateMessages([])
      setLatencyMs(0)
      setGasPriceGwei(32)
    } else if (index < 6) {
      setVotingAgents([])
      setLatencyMs(45)
      setGasPriceGwei(60)
    } else {
      setVotingAgents(['sentinel', 'investigator', 'analyst', 'consensus', 'responder', 'reporter', 'recovery'])
      setLatencyMs(120)
      setGasPriceGwei(500)
    }
  }

  return (
    <div className="min-h-screen bg-[#02050c] text-slate-100 flex flex-col font-sans relative overflow-hidden select-none">
      
      {/* Dynamic Immersive Background Grid */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,240,255,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,240,255,0.012)_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none" 
        style={{
          maskImage: 'radial-gradient(circle at 50% 50%, #000 50%, transparent 95%)',
          WebkitMaskImage: 'radial-gradient(circle at 50% 50%, #000 50%, transparent 95%)'
        }}
      />

      {/* Cyber Sweep Bar Animation */}
      <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-aegis-cyan/25 to-transparent animate-[bounce_8s_infinite] pointer-events-none blur-[0.5px]" />

      {/* Radial soft background ambient glows */}
      <div 
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] rounded-full blur-[160px] pointer-events-none transition-all duration-1000 opacity-20 ${
          demoState === 'emergency-pause' 
            ? 'bg-aegis-red/25' 
            : demoState === 'secured'
              ? 'bg-aegis-green/25'
              : isThreatActive
                ? 'bg-aegis-amber/20'
                : 'bg-aegis-cyan/20'
        }`}
      />

      {/* ─── HUD TOP HEADER BAR ─── */}
      <header className="h-16 px-6 border-b border-white/[0.04] bg-[#02050c]/85 backdrop-blur-md flex items-center justify-between z-20 sticky top-0">
        
        {/* Back Link & Logo */}
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard"
            className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.15] text-slate-400 hover:text-white transition-all flex items-center gap-1.5 text-[10px] font-mono tracking-wider uppercase"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Console
          </Link>
          
          <div className="h-4 w-[1px] bg-white/[0.08]" />
          
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-aegis-cyan animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-widest text-white uppercase">
              AEGIS <span className="text-aegis-cyan">SWARM</span> COMMAND
            </span>
          </div>
        </div>

        {/* HUD COLLAPSIBLE WINDOW CONTROLS - "Options to Click" */}
        <div className="flex items-center gap-3 bg-white/[0.01] border border-white/[0.04] p-1.5 rounded-2xl shadow-glass-inner">
          <button
            onClick={() => setShowIntelHUD(!showIntelHUD)}
            className={`px-3 py-1.5 rounded-xl border text-[9px] font-mono font-bold tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer focus:outline-none ${
              showIntelHUD 
                ? 'bg-aegis-cyan/10 border-aegis-cyan/40 text-aegis-cyan shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                : 'bg-transparent border-transparent text-slate-500 hover:text-slate-350'
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${showIntelHUD ? 'bg-aegis-cyan animate-pulse' : 'bg-slate-700'}`} />
            Intel Scanner
          </button>
          
          <button
            onClick={() => setShowChatHUD(!showChatHUD)}
            className={`px-3 py-1.5 rounded-xl border text-[9px] font-mono font-bold tracking-wider uppercase transition-all flex items-center gap-2 cursor-pointer focus:outline-none ${
              showChatHUD 
                ? 'bg-aegis-purple/10 border-aegis-purple/40 text-aegis-purple shadow-[0_0_10px_rgba(168,85,247,0.2)]'
                : 'bg-transparent border-transparent text-slate-500 hover:text-slate-350'
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${showChatHUD ? 'bg-aegis-purple animate-pulse' : 'bg-slate-700'}`} />
            Quorum Room
          </button>
        </div>

        {/* Time and Info stamps */}
        <div className="flex items-center gap-4 text-[9px] font-mono text-slate-500">
          <div className="hidden sm:flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> L1: Somnia Synced</div>
          <div className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> Swarm: OK</div>
        </div>
      </header>

      {/* ─── MAIN TRIPLE-PANE FLOATING HUD LAYOUT ─── */}
      <div className="flex-1 w-full relative overflow-hidden h-[calc(100vh-4rem-6rem)]">
        
        {/* FULLSCREEN BACKGROUND SWARM NET MAP CENTERPIECE */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
          <div className="w-full h-full relative flex items-center justify-center">
            
            {/* Holographic orbital scanner sweep rings */}
            <div className="absolute w-[440px] h-[440px] border border-white/[0.015] rounded-full flex items-center justify-center">
              <div className="absolute w-[360px] h-[360px] border border-dashed border-white/[0.03] animate-[spin_45s_linear_infinite]" />
              <div className="absolute w-[240px] h-[240px] border border-dotted border-white/[0.04] animate-[spin_25s_linear_infinite_reverse]" />
            </div>

            {/* SVG Layer containing traces, beams, and floating data packets */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              <defs>
                <linearGradient id="exploit-laser" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.1" />
                </linearGradient>
                <linearGradient id="pauser-laser" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="1" />
                  <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.2" />
                </linearGradient>
              </defs>

              {/* Dynamic SVG links between Agents and Vault */}
              {agents.map((agent) => {
                const isActive = currentActiveId === agent.id
                const isVoting = demoState === 'consensus-voting'
                const lineGlow = isActive ? agent.color : isVoting ? `${agent.color}40` : 'rgba(255, 255, 255, 0.025)'
                return (
                  <g key={agent.id}>
                    <motion.line
                      x1="50%"
                      y1="50%"
                      x2={`${agent.x}%`}
                      y2={`${agent.y}%`}
                      stroke={lineGlow}
                      strokeWidth={isActive ? 2 : 0.75}
                      strokeDasharray={isActive ? "none" : "5 5"}
                      className="transition-all duration-300"
                    />
                    
                    {/* SVG packet flows when agent is selected or voting */}
                    {isActive && (
                      <motion.circle
                        cx={`${agent.x}%`}
                        cy={`${agent.y}%`}
                        r="3.5"
                        fill={agent.color}
                        animate={{
                          cx: [`${agent.x}%`, `50%`],
                          cy: [`${agent.y}%`, `50%`]
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

              {/* SVG connection trace from Exploit node to central Vault */}
              {isThreatActive && (
                <line
                  x1="12%"
                  y1="50%"
                  x2="50%"
                  y2="50%"
                  stroke={isVaultPaused || isVaultSecured ? '#475569' : '#f43f5e'}
                  strokeWidth={2}
                  className="transition-all duration-350"
                  strokeDasharray={(isVaultPaused || isVaultSecured) ? '4 4' : 'none'}
                />
              )}

              {/* Responder firing execution trace lightning beam during pause */}
              {demoState === 'emergency-pause' && (
                <line
                  x1="25.7%"
                  y1="38.2%"
                  x2="50%"
                  y2="50%"
                  stroke="url(#pauser-laser)"
                  strokeWidth={4.5}
                  className="animate-pulse"
                />
              )}
            </svg>

            {/* Flying cryptographic Quorum signature keys particles during vote */}
            <AnimatePresence>
              {demoState === 'consensus-voting' && (
                agents.map((agent) => (
                  <motion.div
                    key={'key-' + agent.id}
                    initial={{ x: `${agent.x - 50}vw`, y: `${agent.y - 50}vh`, opacity: 0, scale: 0.5 }}
                    animate={{ 
                      x: 0, 
                      y: 0, 
                      opacity: [0, 1, 1, 0], 
                      scale: [0.5, 1, 1, 0.2] 
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      ease: 'easeInOut', 
                      delay: Math.random() * 0.4 
                    }}
                    className="absolute w-3.5 h-3.5 rounded-full flex items-center justify-center z-15"
                    style={{ 
                      backgroundColor: agent.color, 
                      boxShadow: `0 0 10px ${agent.glow}`,
                      left: `${agent.x}%`,
                      top: `${agent.y}%`,
                      transform: 'translate(-50%, -50%)' 
                    }}
                  >
                    <Fingerprint className="w-2.5 h-2.5 text-slate-950" />
                  </motion.div>
                ))
              )}
            </AnimatePresence>

            {/* Threat Exploit Proxy node (Visible at left edge) */}
            <AnimatePresence>
              {isThreatActive && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.2, x: -60 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.2, x: -60 }}
                  className="absolute left-[8%] flex flex-col items-center z-10"
                >
                  <div className="w-16 h-16 rounded-2xl bg-aegis-red/10 border border-aegis-red/45 flex items-center justify-center shadow-[0_0_25px_rgba(244,63,94,0.35)] relative">
                    <Flame className="w-7 h-7 text-aegis-red animate-pulse" />
                    
                    {/* Pulsing red locator target */}
                    {demoState === 'threat-expansion' && (
                      <motion.div 
                        animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="absolute inset-0 rounded-2xl border-2 border-aegis-red"
                      />
                    )}
                  </div>
                  <span className="text-[9px] text-aegis-red font-mono font-bold uppercase tracking-widest mt-3">Exploit Proxy</span>
                  <span className="text-[7px] text-slate-500 font-mono mt-0.5 select-all">0xAttacker...</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Central Protected Vault Node (Focus of defense system) */}
            <div className="relative z-10 flex flex-col items-center">
              <motion.div 
                animate={
                  isThreatActive 
                    ? { scale: [1, 1.08, 1] } 
                    : isVaultSecured 
                      ? { scale: [1, 1.03, 1] }
                      : { scale: [1, 1.05, 1] }
                }
                transition={{ duration: isThreatActive ? 1 : 4, repeat: Infinity }}
                className={`w-32 h-32 rounded-full border-2 bg-[#02050c]/98 flex items-center justify-center relative transition-all duration-500 ${
                  isVaultSecured 
                    ? 'border-aegis-green bg-aegis-green/[0.03] shadow-[0_0_40px_rgba(16,185,129,0.3)]'
                    : isVaultPaused 
                      ? 'border-aegis-red bg-aegis-red/[0.03] shadow-[0_0_40px_rgba(244,63,94,0.35)]'
                      : isThreatActive 
                        ? 'border-aegis-amber bg-aegis-amber/[0.03] shadow-[0_0_30px_rgba(251,191,36,0.25)]'
                        : 'border-aegis-cyan/35 bg-aegis-cyan/[0.01] shadow-[0_0_20px_rgba(0,240,255,0.08)]'
                }`}
              >
                <AnimatePresence mode="wait">
                  {isVaultSecured ? (
                    <motion.div key="secured" initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }}>
                      <ShieldCheck className="w-12 h-12 text-aegis-green drop-shadow-[0_0_10px_#10b981]" />
                    </motion.div>
                  ) : isVaultPaused ? (
                    <motion.div key="paused" initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }}>
                      <LockKeyhole className="w-12 h-12 text-aegis-red drop-shadow-[0_0_10px_#f43f5e]" />
                    </motion.div>
                  ) : isThreatActive ? (
                    <motion.div key="incident" initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }}>
                      <ShieldAlert className="w-12 h-12 text-aegis-amber animate-bounce" />
                    </motion.div>
                  ) : (
                    <motion.div key="idle" initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }}>
                      <Layers className="w-10 h-10 text-aegis-cyan animate-pulse" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Massive shield barrier hologram wrap */}
                <AnimatePresence>
                  {(isVaultPaused || isVaultSecured) && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.7, rotate: 0 }}
                      animate={{ opacity: 1, scale: 1.35, rotate: 360 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      transition={{ 
                        opacity: { duration: 0.4 }, 
                        rotate: { duration: 20, repeat: Infinity, ease: 'linear' } 
                      }}
                      className={`absolute inset-0 border-2 border-dashed rounded-full pointer-events-none ${
                        isVaultSecured ? 'border-aegis-green/45' : 'border-aegis-red/50'
                      }`}
                    />
                  )}
                </AnimatePresence>

                {/* Shield hexagonal pulsing walls */}
                <AnimatePresence>
                  {isVaultSecured && (
                    <motion.div
                      initial={{ scale: 1, opacity: 0.8 }}
                      animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeOut' }}
                      className="absolute inset-0 rounded-full border border-2 border-aegis-green/30 pointer-events-none"
                    />
                  )}
                </AnimatePresence>

              </motion.div>
              
              <span className="text-[10px] text-white font-mono font-bold tracking-widest mt-4 uppercase">Protected Vault</span>
              <span className="text-[8px] text-slate-500 font-mono mt-0.5 select-all">0xProtectedVault_Demo</span>
            </div>

            {/* Orbit Swarm Committee Agents - Spring Animated Spacing */}
            <div className="absolute inset-0 w-full h-full pointer-events-none z-10">
              {agents.map((agent) => {
                const isPulsing = currentActiveId === agent.id
                const hasVoted = votingAgents.includes(agent.id)
                
                const isNodeActive = isThreatActive && (
                  isPulsing ||
                  hasVoted ||
                  (agent.id === 'sentinel' && (demoState !== 'attack-entry' && demoState !== 'threat-expansion'))
                )

                const Icon = agent.icon

                return (
                  <motion.button
                    key={agent.id}
                    onClick={() => setSelectedAgentId(agent.id)}
                    animate={{
                      left: `${agent.x}%`,
                      top: `${agent.y}%`
                    }}
                    transition={{ type: 'spring', stiffness: 90, damping: 18 }}
                    className="absolute flex flex-col items-center pointer-events-auto transition-transform duration-300 hover:scale-105 group focus:outline-none"
                    style={{
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    <motion.div
                      animate={isPulsing ? { scale: [1, 1.15, 1] } : {}}
                      transition={{ duration: 1.2, repeat: Infinity }}
                      className="w-14 h-14 rounded-2xl bg-[#02050c]/98 border flex items-center justify-center shadow-glass-inner relative transition-colors duration-300"
                      style={{
                        borderColor: isPulsing
                          ? agent.color
                          : isNodeActive
                            ? 'rgba(255, 255, 255, 0.15)'
                            : 'rgba(255, 255, 255, 0.03)',
                        boxShadow: isPulsing
                          ? `0 0 20px ${agent.glow}`
                          : 'none'
                      }}
                    >
                      <Icon className="w-5 h-5" style={{ color: isPulsing || isNodeActive ? agent.color : '#475569' }} />
                      
                      {/* Check mark badge verified sign */}
                      {hasVoted && (
                        <motion.div 
                          initial={{ scale: 0 }} 
                          animate={{ scale: 1 }} 
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-aegis-green flex items-center justify-center border border-[#02050c] text-[8px] font-bold text-slate-950"
                        >
                          ✓
                        </motion.div>
                      )}
                    </motion.div>
                    
                    <span className={`text-[8px] font-mono mt-2 uppercase font-bold tracking-widest transition-colors duration-300 ${isPulsing || isNodeActive ? 'text-white' : 'text-slate-650 group-hover:text-slate-400'}`}>
                      {agent.name.split(' ')[0]}
                    </span>
                  </motion.button>
                )
              })}
            </div>

          </div>
        </div>

        {/* FLOATING LEFT HUD: CYBER INTEL SCANNER (Collapsible & Tabbed) */}
        <AnimatePresence>
          {showIntelHUD && (
            <motion.section 
              initial={{ x: -400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -400, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="w-[360px] h-[calc(100%-40px)] left-5 top-5 bottom-5 absolute z-15 glass rounded-3xl p-5 flex flex-col justify-between shadow-2xl backdrop-blur-md overflow-hidden text-left"
            >
              <div className="flex flex-col min-h-0 flex-1">
                
                {/* HUD Panel title */}
                <div className="flex items-center gap-2 mb-3 pb-1 border-b border-white/[0.04]">
                  <Terminal className="w-4 h-4 text-aegis-cyan" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-350">
                    Cyber Intel Scanner
                  </span>
                </div>

                {/* Inner Option Tabs to reduce messy stacking */}
                <div className="grid grid-cols-2 gap-1.5 bg-[#02040b]/75 p-1 rounded-xl border border-white/[0.04] mb-4">
                  <button
                    onClick={() => setLeftTab('mempool')}
                    className={`py-1.5 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer focus:outline-none ${
                      leftTab === 'mempool'
                        ? 'bg-white/[0.04] border border-white/[0.08] text-aegis-cyan font-bold'
                        : 'text-slate-500 hover:text-slate-300 border border-transparent'
                    }`}
                  >
                    Live Mempool
                  </button>
                  <button
                    onClick={() => setLeftTab('dossier')}
                    className={`py-1.5 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer focus:outline-none ${
                      leftTab === 'dossier'
                        ? 'bg-white/[0.04] border border-white/[0.08] text-aegis-cyan font-bold'
                        : 'text-slate-500 hover:text-slate-300 border border-transparent'
                    }`}
                  >
                    Threat Dossier
                  </button>
                </div>

                {/* Dynamic Content Display based on tabs */}
                <div className="flex-1 overflow-y-auto min-h-0 pr-1 custom-scrollbar">
                  <AnimatePresence mode="wait">
                    {leftTab === 'mempool' ? (
                      <motion.div
                        key="mempool"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="space-y-2 font-mono"
                      >
                        {mempoolList.map((tx) => {
                          const colorClass = 
                            tx.status === 'exploit' 
                              ? 'border-aegis-red/35 bg-aegis-red/5 text-aegis-red' 
                              : tx.status === 'mitigation'
                                ? 'border-aegis-green/35 bg-aegis-green/5 text-aegis-green'
                                : 'border-white/[0.03] bg-white/[0.005] text-slate-400'
                          return (
                            <div
                              key={tx.hash + tx.status}
                              className={`p-2 rounded-xl border text-[9px] leading-relaxed relative overflow-hidden flex flex-col gap-0.5 ${colorClass}`}
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-bold">{tx.hash}</span>
                                <span className="opacity-70">{tx.method}()</span>
                              </div>
                              <div className="flex justify-between items-center text-[8px] opacity-60">
                                <span>Val: {tx.value}</span>
                                <span>Gas: {tx.gasPrice}</span>
                              </div>
                              {tx.status === 'exploit' && <div className="absolute inset-y-0 right-0 w-1 bg-aegis-red" />}
                              {tx.status === 'mitigation' && <div className="absolute inset-y-0 right-0 w-1 bg-aegis-green" />}
                            </div>
                          )
                        })}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="dossier"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="space-y-4"
                      >
                        {/* Interactive Risk Indicator */}
                        <div className="bg-[#02050c]/80 border border-white/[0.04] p-4 rounded-2xl flex items-center gap-3">
                          <SeverityGauge score={getSeverity()} />
                        </div>

                        {/* Telemetry data grid */}
                        <div className="p-4 bg-gradient-to-br from-[#060a17]/80 to-[#02050c]/90 border border-white/[0.04] rounded-2xl text-[10px] font-mono space-y-3 shadow-glass-inner">
                          <div className="flex justify-between">
                            <span className="text-slate-500">EXPLOIT VECTOR:</span>
                            <span className={isThreatActive ? 'text-aegis-red font-bold animate-pulse' : 'text-slate-400'}>
                              {isThreatActive ? 'PROXY_REENTRANCY' : 'NONE DETECTED'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">ATTACK CONTRACT:</span>
                            <span className={isThreatActive ? 'text-white select-all' : 'text-slate-600'}>
                              {isThreatActive ? '0xAttackerContract' : 'STANDBY'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">TARGET STORAGE:</span>
                            <span className="text-white select-all">0xProtectedVault_Demo</span>
                          </div>
                          <div className="flex justify-between border-t border-white/[0.03] pt-2">
                            <span className="text-slate-500">PAUSE ESTIMATE:</span>
                            <span className="text-aegis-cyan font-bold">~120ms</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">MITIGATION TYPE:</span>
                            <span className="text-white">GAS_PRIORITY_BYPASS</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </div>

              {/* Dossier status bottom badge */}
              <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center justify-between text-[8px] font-mono text-slate-500">
                <span>SYSTEM BLOCK: {blockHeight}</span>
                <span>STATUS: {isThreatActive ? 'HAZARD ACTIVE' : 'SCANNING'}</span>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* FLOATING RIGHT HUD: SWARM QUORUM COMMITTEE (Collapsible & Tabbed) */}
        <AnimatePresence>
          {showChatHUD && (
            <motion.section 
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 400, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="w-[360px] h-[calc(100%-40px)] right-5 top-5 bottom-5 absolute z-15 glass rounded-3xl p-5 flex flex-col justify-between shadow-2xl backdrop-blur-md overflow-hidden text-left"
            >
              <div className="flex flex-col min-h-0 flex-1">
                
                {/* HUD Panel title */}
                <div className="flex items-center gap-2 mb-3 pb-1 border-b border-white/[0.04]">
                  <Users className="w-4 h-4 text-aegis-purple" />
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-350">
                    Swarm Quorum Room
                  </span>
                </div>

                {/* Option Tabs to clean visual noise */}
                <div className="grid grid-cols-2 gap-1.5 bg-[#02040b]/75 p-1 rounded-xl border border-white/[0.04] mb-4">
                  <button
                    onClick={() => setRightTab('ledger')}
                    className={`py-1.5 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer focus:outline-none ${
                      rightTab === 'ledger'
                        ? 'bg-white/[0.04] border border-white/[0.08] text-aegis-purple font-bold'
                        : 'text-slate-500 hover:text-slate-300 border border-transparent'
                    }`}
                  >
                    Quorum Ledger
                  </button>
                  <button
                    onClick={() => setRightTab('chat')}
                    className={`py-1.5 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider transition-all cursor-pointer focus:outline-none ${
                      rightTab === 'chat'
                        ? 'bg-white/[0.04] border border-white/[0.08] text-aegis-purple font-bold'
                        : 'text-slate-500 hover:text-slate-300 border border-transparent'
                    }`}
                  >
                    Debate Feed
                  </button>
                </div>

                {/* Dynamic Content Display based on tabs */}
                <div className="flex-1 overflow-y-auto min-h-0 pr-1 custom-scrollbar">
                  <AnimatePresence mode="wait">
                    {rightTab === 'ledger' ? (
                      <motion.div
                        key="ledger"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="space-y-3 text-[9px] font-mono"
                      >
                        <div className="text-slate-500 uppercase tracking-widest text-[8px] font-bold border-b border-white/[0.03] pb-1.5">
                          Cryptographic ballot verification checklist
                        </div>
                        
                        <div className="space-y-1.5">
                          {agents.map((agent) => {
                            const voted = votingAgents.includes(agent.id)
                            return (
                              <button
                                key={agent.id}
                                onClick={() => {
                                  setSelectedAgentId(agent.id)
                                }}
                                className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left cursor-pointer focus:outline-none transition-colors ${
                                  voted 
                                    ? 'border-aegis-green/20 bg-aegis-green/[0.02] text-white' 
                                    : 'border-white/[0.02] bg-white/[0.005] text-slate-500 hover:border-white/[0.08]'
                                }`}
                              >
                                <div>
                                  <span className="font-bold block text-[10px]">{agent.name}</span>
                                  <span className="text-[7.5px] opacity-50 block uppercase tracking-wider mt-0.5">{agent.role}</span>
                                </div>
                                <span className={`text-[8px] font-bold tracking-wider ${voted ? 'text-aegis-green' : 'text-slate-650'}`}>
                                  {voted ? 'SIGNED✓' : 'STANDBY'}
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="chat"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="h-full flex flex-col justify-end"
                      >
                        {/* Debate chat bubbles */}
                        <div ref={debateContainerRef} className="space-y-3 overflow-y-auto max-h-full pr-0.5 custom-scrollbar">
                          {debateMessages.length === 0 ? (
                            <div className="py-20 text-center space-y-2">
                              <MessageSquare className="w-8 h-8 text-slate-700 mx-auto animate-pulse" />
                              <span className="text-[8px] font-mono text-slate-650 uppercase tracking-widest block">
                                Awaiting consensus ballot initialization...
                              </span>
                            </div>
                          ) : (
                            debateMessages.map((msg, i) => (
                              <div
                                key={i}
                                className="p-3 rounded-2xl border border-white/[0.04] bg-white/[0.005] text-[10px] text-left leading-normal"
                              >
                                <div className="flex justify-between items-baseline gap-2 mb-1 border-b border-white/[0.02] pb-0.5">
                                  <span className="font-mono font-bold uppercase tracking-wide" style={{ color: msg.color }}>
                                    {msg.sender.split(' ')[0]} Node
                                  </span>
                                  <span className="text-[7px] font-mono text-slate-550 shrink-0">{msg.time}</span>
                                </div>
                                <p className="text-slate-300 font-light font-sans mt-1 leading-relaxed">{msg.message}</p>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </div>

              {/* Debate status bottom badge */}
              <div className="mt-4 pt-3 border-t border-white/[0.04] flex items-center justify-between text-[8px] font-mono text-slate-500">
                <span>QUORUM WEIGHT: {votingAgents.length}/7 SIGNATURES</span>
                <span>STATE: {votingAgents.length === 7 ? 'AUTHORIZED' : 'MONITORING'}</span>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

      </div>

      {/* ─── BOTTOM CONTROL DECK HUD PANEL ─── */}
      <footer className="h-24 px-6 border-t border-white/[0.04] bg-[#02050c]/90 backdrop-blur-md flex items-center justify-between z-20 sticky bottom-0">
        
        {/* KPI metrics overlay */}
        <div className="flex items-center gap-6 text-left">
          <div className="font-mono select-none">
            <span className="text-[8px] text-slate-500 uppercase tracking-widest block mb-0.5">TVL Protected</span>
            <span className="text-base font-bold text-aegis-cyan text-glow-cyan">{tvlProtected}</span>
          </div>
          <div className="h-7 w-[1px] bg-white/[0.08]" />
          
          <div className="font-mono select-none">
            <span className="text-[8px] text-slate-500 uppercase tracking-widest block mb-0.5">Pause Latency</span>
            <span className={`text-base font-bold transition-colors ${latencyMs > 0 ? 'text-aegis-amber text-glow-amber' : 'text-slate-400'}`}>
              {latencyMs > 0 ? `${latencyMs}ms` : '0ms'}
            </span>
          </div>
          <div className="h-7 w-[1px] bg-white/[0.08]" />

          <div className="font-mono select-none">
            <span className="text-[8px] text-slate-500 uppercase tracking-widest block mb-0.5">Mempool Gas Limit</span>
            <span className={`text-base font-bold transition-colors ${gasPriceGwei > 32 ? 'text-aegis-red text-glow-red' : 'text-slate-400'}`}>
              {gasPriceGwei} Gwei
            </span>
          </div>
        </div>

        {/* Timeline step checkpoints - Skippable navigation option */}
        <div className="hidden xl:flex items-center gap-1.5 bg-black/45 border border-white/[0.03] p-1.5 rounded-2xl max-w-2xl shadow-glass-inner">
          {timelineSteps.map((step, index) => {
            const isCompleted = index <= activeStepIndex && demoState !== 'idle'
            const isActive = demoState === step.state
            return (
              <button
                key={step.state}
                onClick={() => jumpToPhase(index)}
                className={`px-3 py-1.5 rounded-xl font-mono text-[9px] tracking-wider uppercase transition-all flex items-center gap-1 cursor-pointer focus:outline-none ${
                  isActive
                    ? 'bg-aegis-cyan text-slate-950 font-bold shadow-[0_0_12px_rgba(0,240,255,0.4)] border border-aegis-cyan/10'
                    : isCompleted
                      ? 'bg-white/5 border border-white/[0.03] text-white hover:bg-white/10'
                      : 'text-slate-600 hover:text-slate-400 border border-transparent'
                }`}
              >
                <span>0{index}</span>
                <span className="hidden xl:inline">{step.title.split(' ')[0]}</span>
              </button>
            )
          })}
        </div>

        {/* Control deck triggers */}
        <div className="flex items-center gap-4">
          
          {/* Speed Select Multiplier */}
          <div className="flex items-center gap-1 bg-[#02050c] border border-white/[0.05] p-1 rounded-xl font-mono text-[8px] tracking-wider shadow-glass-inner">
            {([0.5, 1, 2, 5] as const).map((spd) => (
              <button
                key={spd}
                onClick={() => setSimulationSpeed(spd)}
                className={`px-2 py-1.5 rounded-lg transition-colors cursor-pointer focus:outline-none ${
                  simulationSpeed === spd 
                    ? 'bg-white/5 text-aegis-cyan font-bold border border-white/[0.02]' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          <div className="h-6 w-[1px] bg-white/[0.08]" />

          {/* Reset Trigger */}
          <button
            onClick={resetSimulation}
            className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.15] hover:bg-white/[0.04] text-slate-350 hover:text-white transition-all cursor-pointer focus:outline-none"
            title="Reset Simulation State"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Launch Attack Trigger (Cinematic) */}
          <button
            onClick={startSimulation}
            disabled={isPlaying}
            className="relative overflow-hidden flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-aegis-red to-[#e11d48] text-white font-mono font-bold text-xs tracking-wider uppercase hover:shadow-[0_0_30px_rgba(244,63,94,0.45)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-40 disabled:scale-100 disabled:shadow-none cursor-pointer group focus:outline-none"
          >
            <Flame className="w-4 h-4 text-white fill-white animate-pulse" />
            <span>Inject Exploit</span>
            {/* Ambient hover light */}
            <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </button>

        </div>

      </footer>

    </div>
  )
}
