'use client'

import { useSocket } from '@/components/providers/SocketProvider'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Shield, Zap, AlertTriangle, Database, Users, FileText, RefreshCw, Radio, CheckCircle, Lock, Layers, Sparkles, MessageSquare, Server, CheckSquare } from 'lucide-react'

type DebateState = 'idle' | 'sentinel-vote' | 'investigator-vote' | 'analyst-vote' | 'consensus-vote' | 'responder-vote' | 'reporter-vote' | 'recovery-vote' | 'consensus-complete'

export default function AgentFeedsPage() {
  const { incidents } = useSocket()
  const latest = incidents[0]
  const isRealThreatActive = latest && latest.status === 'OPEN'
  const isResolved = latest && (latest.status === 'RESOLVED' || latest.status === 'RECOVERED')

  // Selected agent for detailed dossier inspection
  const [selectedAgentId, setSelectedAgentId] = useState<string>('sentinel')
  
  // Local debate loop state for WOW presentations
  const [debateState, setDebateState] = useState<DebateState>('idle')
  const [debateMessages, setDebateMessages] = useState<Array<{ sender: string, role: string, message: string, color: string, icon: any, time: string }>>([])
  const [confirmedVotes, setConfirmedVotes] = useState<string[]>([])

  // Setup agents list
  const agents = [
    { 
      id: 'sentinel', 
      name: 'Sentinel Agent', 
      role: 'Mempool Scanner', 
      icon: Shield, 
      color: 'rgb(0, 240, 255)', 
      glow: 'rgba(0, 240, 255, 0.4)', 
      x: 78.1, 
      y: 50.0, 
      confidence: 100, 
      sig: '0x88ea...41fa',
      desc: 'Constantly audits pending block streams. Heuristically frontruns zero-day exploit payloads using pattern classification rules.'
    },
    { 
      id: 'investigator', 
      name: 'Investigation Agent', 
      role: 'Transaction Tracer', 
      icon: Database, 
      color: 'rgb(168, 85, 247)', 
      glow: 'rgba(168, 85, 247, 0.4)', 
      x: 67.5, 
      y: 71.9, 
      confidence: 98, 
      sig: '0x992b...12ca',
      desc: 'Spawns sandboxed state fork simulations on-demand to trace execution call stacks, identify hacker origin contracts, and compute volume impacts.'
    },
    { 
      id: 'analyst', 
      name: 'Threat Analyst Agent', 
      role: 'Exploit Classifier', 
      icon: AlertTriangle, 
      color: 'rgb(251, 191, 36)', 
      glow: 'rgba(251, 191, 36, 0.4)', 
      x: 43.8, 
      y: 77.4, 
      confidence: 96, 
      sig: '0x221c...fa88',
      desc: 'Cross-checks trace variables against CVE match databases, dynamically rates threat severity index values, and recommends pausing variables.'
    },
    { 
      id: 'consensus', 
      name: 'Consensus Agent', 
      role: 'Quorum Validator', 
      icon: Users, 
      color: 'rgb(236, 72, 153)', 
      glow: 'rgba(236, 72, 153, 0.4)', 
      x: 24.7, 
      y: 62.3, 
      confidence: 100, 
      sig: '0xbb2a...991e',
      desc: 'Manages the cryptographic ballot chamber. Gathers signatures across all 7 nodes, authenticating quorum before pauses deploy.'
    },
    { 
      id: 'responder', 
      name: 'Response Agent', 
      role: 'Mitigation Executor', 
      icon: Zap, 
      color: 'rgb(244, 63, 94)', 
      glow: 'rgba(244, 63, 94, 0.4)', 
      x: 24.7, 
      y: 37.7, 
      confidence: 100, 
      sig: '0xaa4f...611b',
      desc: 'Builds secure circuit-breaker transaction payloads, overrides locking state parameters, and executes emergency pause calls on-chain.'
    },
    { 
      id: 'reporter', 
      name: 'Reporting Agent', 
      role: 'Ledger Archiver', 
      icon: FileText, 
      color: 'rgb(6, 182, 212)', 
      glow: 'rgba(6, 182, 212, 0.4)', 
      x: 43.8, 
      y: 22.6, 
      confidence: 100, 
      sig: '0xcc8e...77ab',
      desc: 'Indexes exploit variables, signatures, and call stacks, compiling dynamic PDF security advisories and synchronizing webhook notification alerts.'
    },
    { 
      id: 'recovery', 
      name: 'Recovery Agent', 
      role: 'Restoration Coordinator', 
      icon: RefreshCw, 
      color: 'rgb(16, 185, 129)', 
      glow: 'rgba(16, 185, 129, 0.4)', 
      x: 67.5, 
      y: 28.1, 
      confidence: 95, 
      sig: '0xdd1a...992e',
      desc: 'Validates post-exploit vulnerability neutralization states and stages safe admin unpause proposals requiring multi-sig signature authentication.'
    }
  ]

  // Running the client-side cinematic debate simulation
  const startConsensusDebate = () => {
    setConfirmedVotes([])
    setDebateMessages([])
    
    const timeNow = () => new Date().toTimeString().split(' ')[0]

    const dialogTimeline = [
      {
        state: 'sentinel-vote',
        agentId: 'sentinel',
        msg: '🚨 Alert: transaction signature pattern anomaly scanned in live mempool payload. Reentrancy footprint matched.',
        delay: 0
      },
      {
        state: 'investigator-vote',
        agentId: 'investigator',
        msg: '🔍 Spawning state trace forks... Investigator Node confirms call path caller: 0xAttackerContract, depth stack: 12.',
        delay: 2000
      },
      {
        state: 'analyst-vote',
        agentId: 'analyst',
        msg: '⚡ Exploitation vector classified: FLASH_LOAN_REENTRANCY. Threat risk rating calculated at 94/100.',
        delay: 4500
      },
      {
        state: 'consensus-vote',
        agentId: 'consensus',
        msg: '🗳️ Committee ballot initialised. Collecting node signatures... Quorum weights validated at 100%.',
        delay: 7000
      },
      {
        state: 'responder-vote',
        agentId: 'responder',
        msg: '🛡️ Quorum verified. Dispatched mitigation bytecode freeze. Contract variables PAUSED on-chain successfully.',
        delay: 9500
      },
      {
        state: 'reporter-vote',
        agentId: 'reporter',
        msg: '📄 Mitigation transaction index complete. Webhook alerts committed. Telemetry hash stored on ledger.',
        delay: 11500
      },
      {
        state: 'recovery-vote',
        agentId: 'recovery',
        msg: 'Unpause parameters staged. Neutralized clean block verified. Staging recovery unpause proposal.',
        delay: 13500
      },
      {
        state: 'consensus-complete',
        agentId: '',
        msg: '🔒 Swarm operations ballot locked. Vault assets protected. Security state: RESOLVED.',
        delay: 15500
      }
    ]

    dialogTimeline.forEach(step => {
      setTimeout(() => {
        setDebateState(step.state as any)
        if (step.agentId) {
          const agentObj = agents.find(a => a.id === step.agentId)!
          setDebateMessages(prev => [...prev, {
            sender: agentObj.name,
            role: agentObj.role,
            message: step.msg,
            color: agentObj.color,
            icon: agentObj.icon,
            time: timeNow()
          }])
          setConfirmedVotes(prev => [...prev, step.agentId])
          setSelectedAgentId(step.agentId)
        } else {
          // Final complete message
          setDebateMessages(prev => [...prev, {
            sender: 'Swarm Committee',
            role: 'System Quorum',
            message: step.msg,
            color: 'rgb(0, 240, 255)',
            icon: Shield,
            time: timeNow()
          }])
        }
      }, step.delay)
    })
  }

  const isDebateRunning = debateState !== 'idle' && debateState !== 'consensus-complete'

  return (
    <div className="space-y-8 animate-fade-in-up text-left">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/[0.04] pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Radio className="w-3.5 h-3.5 text-aegis-cyan animate-pulse" />
            <span className="text-[9px] font-mono font-bold tracking-widest text-aegis-cyan uppercase">
              Swarm Committee Operations
            </span>
          </div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">Swarm Quorum Ballot Chamber</h1>
          <p className="text-xs text-slate-400 mt-1 font-light">
            Live agent coordination interface, dynamic consensus voting pathways, and raw conversation telemetry logs.
          </p>
        </div>

        {/* Demo trigger */}
        <button 
          onClick={startConsensusDebate}
          disabled={isDebateRunning}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-aegis-cyan to-[#0284c7] text-slate-950 font-mono font-bold text-xs tracking-wider uppercase hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 cursor-pointer shadow-md"
        >
          <Sparkles className="w-4 h-4 text-slate-950" />
          <span>Trigger Swarm Debate</span>
        </button>
      </div>

      {/* Main Quorum Split Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: 7-Agent Orbit Room & Details (col-span-7) */}
        <div className="lg:col-span-7 space-y-8 flex flex-col">
          
          {/* Orbital Ballot Chamber centerpiece */}
          <div className="p-6 bg-gradient-to-br from-white/[0.015] to-white/[0.002] border border-white/[0.04] rounded-3xl shadow-glass-inner backdrop-blur-md overflow-hidden relative min-h-[440px] flex flex-col justify-between">
            <div className="absolute top-0 left-0 w-36 h-36 bg-aegis-cyan/[0.01] blur-2xl pointer-events-none rounded-full" />
            
            <div className="flex justify-between items-center border-b border-white/[0.03] pb-3 mb-4 z-10 relative">
              <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">ballot consensus arena</span>
              <span className="text-[8px] font-mono text-aegis-cyan uppercase tracking-wider">
                {confirmedVotes.length === 7 ? '🗳️ QUORUM SIGNED' : isDebateRunning ? '🗳️ BALLOT COLLECTING' : '📡 SYNCED'}
              </span>
            </div>

            {/* Orbit Graph Container */}
            <div className="flex-1 flex items-center justify-center min-h-[260px] relative py-8 select-none">
              
              {/* Orbit Paths */}
              <div className="absolute w-[300px] h-[300px] border border-white/[0.01] rounded-full flex items-center justify-center">
                <div className="absolute w-[220px] h-[220px] border border-dashed border-white/[0.03] animate-[spin_35s_linear_infinite]" />
                <div className="absolute w-[140px] h-[140px] border border-dotted border-white/[0.04] animate-[spin_15s_linear_infinite_reverse]" />
              </div>

              {/* Dynamic Connecting Laser Rays */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                {agents.map(agent => {
                  const isAgentVoting = confirmedVotes.includes(agent.id)
                  const isActive = selectedAgentId === agent.id
                  const pathColor = isActive ? agent.color : isAgentVoting ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.02)'
                  return (
                    <g key={agent.id}>
                      <line
                        x1="50%"
                        y1="50%"
                        x2={`${agent.x}%`}
                        y2={`${agent.y}%`}
                        stroke={pathColor}
                        strokeWidth={isActive ? 2 : 1}
                        className="transition-all duration-300"
                      />
                      
                      {/* Laser packet flow toward center on vote cast */}
                      {isAgentVoting && !isResolved && (
                        <motion.circle
                          cx={`${agent.x}%`}
                          cy={`${agent.y}%`}
                          r="2.5"
                          fill="rgb(16, 185, 129)"
                          animate={{
                            cx: [`${agent.x}%`, `50%`],
                            cy: [`${agent.y}%`, `50%`]
                          }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeIn' }}
                        />
                      )}
                    </g>
                  )
                })}
              </svg>

              {/* Central Ballot Ledger Node */}
              <div className="relative z-10 flex flex-col items-center">
                <motion.div 
                  animate={isDebateRunning 
                    ? { scale: [1, 1.08, 1], borderColor: ['rgba(0,240,255,0.2)', 'rgba(0,240,255,0.7)', 'rgba(0,240,255,0.2)'] }
                    : { scale: [1, 1.03, 1], borderColor: ['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.15)', 'rgba(255,255,255,0.06)'] }
                  }
                  transition={{ duration: 3, repeat: Infinity }}
                  className={`w-24 h-24 rounded-full border bg-[#050814]/95 flex flex-col items-center justify-center shadow-glass-inner relative transition-all duration-500`}
                >
                  <Layers className={`w-7 h-7 text-aegis-cyan ${isDebateRunning ? 'animate-[spin_6s_linear_infinite]' : ''}`} />
                  <span className="text-[9px] font-mono text-white mt-1.5 font-bold tracking-wider">{confirmedVotes.length} / 7</span>
                </motion.div>
                <span className="text-[8px] text-slate-500 font-mono mt-1.5 uppercase tracking-widest block">quorum weights</span>
              </div>

              {/* Orbital Agents Ring */}
              <div className="absolute inset-0 w-full h-full pointer-events-none z-10">
                {agents.map((agent) => {
                  const isSelected = selectedAgentId === agent.id
                  const isAgentVoting = confirmedVotes.includes(agent.id)
                  
                  // Color codes
                  const borderCol = isSelected 
                    ? agent.color 
                    : isAgentVoting 
                      ? 'rgb(16, 185, 129)' 
                      : 'rgba(255, 255, 255, 0.03)'
                  
                  const bgCol = isSelected 
                    ? `${agent.color}08` 
                    : isAgentVoting 
                      ? 'rgba(16, 185, 129, 0.05)' 
                      : '#060a17'

                  const Icon = agent.icon

                  return (
                    <button
                      key={agent.id}
                      onClick={() => setSelectedAgentId(agent.id)}
                      className="absolute flex flex-col items-center pointer-events-auto transition-all duration-300 group focus:outline-none"
                      style={{
                        left: `${agent.x}%`,
                        top: `${agent.y}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      <div
                        className="w-10 h-10 rounded-2xl border flex items-center justify-center shadow-glass-inner relative transition-all duration-300"
                        style={{ borderColor: borderCol, backgroundColor: bgCol }}
                      >
                        <Icon className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" style={{ color: isSelected || isAgentVoting ? agent.color : '#475569' }} />
                        
                        {/* Vote tick mark status */}
                        {isAgentVoting && (
                          <div className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-aegis-green border border-[#040714] flex items-center justify-center text-[7px] font-bold text-[#040714]">
                            ✓
                          </div>
                        )}
                      </div>
                      
                      <span className={`text-[7px] font-mono mt-1.5 uppercase font-bold tracking-wider transition-colors duration-300 ${isSelected || isAgentVoting ? 'text-white' : 'text-slate-600 group-hover:text-slate-400'}`}>
                        {agent.name.split(' ')[0]}
                      </span>
                    </button>
                  )
                })}
              </div>

            </div>

            {/* Orbit panel bottom syncing block */}
            <div className="border-t border-white/[0.03] pt-3 flex justify-between items-center text-[9px] font-mono text-slate-500 z-10 relative">
              <span className="flex items-center gap-1"><Server className="w-3 h-3" /> consensus connection synced</span>
              <span>quorums verified in real-time</span>
            </div>
          </div>

          {/* Dossier inspection Panel (Click node to see dossier details) */}
          <div className="p-6 bg-gradient-to-br from-white/[0.015] to-white/[0.002] border border-white/[0.04] rounded-3xl shadow-glass-inner backdrop-blur-md text-left">
            <AnimatePresence mode="wait">
              {(() => {
                const agentObj = agents.find(a => a.id === selectedAgentId)!
                const Icon = agentObj.icon
                const hasVoted = confirmedVotes.includes(selectedAgentId)
                return (
                  <motion.div
                    key={selectedAgentId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="flex justify-between items-center border-b border-white/[0.03] pb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl border border-white/5 bg-[#050814] text-aegis-cyan">
                          <Icon className="w-5.5 h-5.5" style={{ color: agentObj.color }} />
                        </div>
                        <div>
                          <h4 className="text-sm font-display font-bold text-white uppercase tracking-wider">{agentObj.name}</h4>
                          <span className="text-[9px] text-slate-500 font-mono uppercase tracking-widest">{agentObj.role}</span>
                        </div>
                      </div>

                      <span className={`text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                        hasVoted ? 'bg-aegis-green/10 text-aegis-green border-aegis-green/20' : 'bg-white/5 text-slate-500 border-white/5'
                      }`}>
                        {hasVoted ? 'SIGNED BALLOT' : 'STANDBY'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 font-sans leading-relaxed font-light">
                      {agentObj.desc}
                    </p>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="p-3 bg-[#050814]/80 border border-white/[0.03] rounded-xl font-mono text-[9px]">
                        <span className="text-slate-500 uppercase tracking-wider block mb-1">Cryptographic key identity</span>
                        <span className="text-white font-bold select-all">{agentObj.sig}</span>
                      </div>
                      <div className="p-3 bg-[#050814]/80 border border-white/[0.03] rounded-xl font-mono text-[9px]">
                        <span className="text-slate-500 uppercase tracking-wider block mb-1">verification threshold</span>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="h-1.5 w-24 bg-white/[0.03] rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-aegis-cyan to-aegis-purple rounded-full" style={{ width: `${agentObj.confidence}%` }} />
                          </div>
                          <span className="text-white font-bold">{agentObj.confidence}%</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })()}
            </AnimatePresence>
          </div>

        </div>

        {/* Right Column: Live Swarm Debate Feed (col-span-5) */}
        <div className="lg:col-span-5 h-full flex flex-col">
          
          <div className="p-6 bg-gradient-to-br from-white/[0.015] to-white/[0.002] border border-white/[0.04] rounded-3xl shadow-glass-inner backdrop-blur-md flex-1 flex flex-col justify-between min-h-[600px] max-h-[780px]">
            
            {/* Header info */}
            <div className="border-b border-white/[0.03] pb-3 mb-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-aegis-cyan animate-pulse" />
                <h3 className="text-xs font-mono font-bold text-white uppercase tracking-widest">
                  Live Swarm Debate Room
                </h3>
              </div>
              <span className="text-[8px] font-mono text-slate-500 uppercase">
                {isDebateRunning ? 'Active conversation' : 'Registry standby'}
              </span>
            </div>

            {/* Chat feed messages list */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar min-h-[440px] flex flex-col justify-end">
              <div className="space-y-4">
                <AnimatePresence>
                  {debateMessages.length === 0 ? (
                    <div className="py-24 text-center space-y-3">
                      <span className="text-3xl animate-pulse block">💬</span>
                      <p className="text-xs font-mono text-slate-500 uppercase tracking-widest leading-relaxed max-w-[200px] mx-auto">
                        No active debate logs in the telemetry buffer.
                      </p>
                    </div>
                  ) : (
                    debateMessages.map((msg, index) => {
                      const Icon = msg.icon
                      const isSystem = msg.sender === 'Swarm Committee'
                      const alignStyle = isSystem ? 'justify-center' : 'justify-start'
                      return (
                        <motion.div
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          key={index}
                          className={`flex ${alignStyle} gap-3`}
                        >
                          {!isSystem && (
                            <div className="w-8 h-8 rounded-xl border border-white/5 bg-[#050814] flex items-center justify-center shrink-0" style={{ color: msg.color }}>
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                          )}

                          <div className={`p-3.5 rounded-2xl border ${
                            isSystem 
                              ? 'border-aegis-cyan/25 bg-aegis-cyan/[0.02] text-center w-full shadow-glass-inner' 
                              : 'border-white/[0.04] bg-[#02050c]/80 text-left max-w-[85%]'
                          }`}>
                            {!isSystem && (
                              <div className="flex justify-between items-baseline gap-4 mb-1">
                                <span className="text-[10px] font-mono font-bold text-white uppercase truncate">{msg.sender.split(' ')[0]} Node</span>
                                <span className="text-[8px] font-mono text-slate-500 shrink-0">{msg.time}</span>
                              </div>
                            )}
                            <p className={`text-slate-300 font-sans text-xs leading-relaxed font-light ${isSystem ? 'font-mono text-[10px] text-aegis-cyan font-bold' : ''}`}>
                              {msg.message}
                            </p>
                          </div>
                        </motion.div>
                      )
                    })
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Input mock bar (just visual context) */}
            <div className="border-t border-white/[0.03] pt-4 mt-4 flex items-center gap-2">
              <div className="flex-1 bg-[#02040b] border border-white/[0.04] p-3 rounded-2xl flex items-center justify-between text-slate-500 text-[10px] font-mono">
                <span>&gt; Swarm communication socket encrypted...</span>
                <span className="text-[8px] text-slate-600 select-none">AES-256</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}
