'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from 'recharts'
import { motion } from 'framer-motion'
import { Shield, Zap, TrendingUp, TrendingDown, ArrowUpRight, ShieldAlert, Cpu } from 'lucide-react'

export default function AnalyticsPage() {
  const mockData = [
    { name: 'Mon', threats: 12, resolved: 12 },
    { name: 'Tue', threats: 19, resolved: 19 },
    { name: 'Wed', threats: 15, resolved: 15 },
    { name: 'Thu', threats: 25, resolved: 24 },
    { name: 'Fri', threats: 10, resolved: 10 },
    { name: 'Sat', threats: 5, resolved: 5 },
    { name: 'Sun', threats: 45, resolved: 45 },
  ]

  const vectorData = [
    { name: 'Flash Loan', value: 65 },
    { name: 'Reentrancy', value: 20 },
    { name: 'Oracle Manipulation', value: 10 },
    { name: 'Slippage Arbitrage', value: 5 },
  ]

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-aegis-cyan" />
          <span className="text-[9px] font-mono font-bold tracking-widest text-aegis-cyan uppercase">
            Performance Analytics Hub
          </span>
        </div>
        <h1 className="text-3xl font-display font-bold text-white tracking-tight">Threat Analytics</h1>
        <p className="text-sm text-aegis-muted mt-2 max-w-2xl font-light leading-relaxed">
          Historical trends, consensus latency records, and exploit vector classification streams mapped by Aegis Swarm.
        </p>
      </div>

      {/* High-End Stripe Style Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard 
          title="Total Threats Prevented" 
          value="131" 
          change="+12.4%" 
          isPositive={true} 
          desc="Mitigations finalized this week" 
          icon={Shield}
          delay={0.05} 
        />
        <MetricCard 
          title="Avg. Response Time" 
          value="1.2s" 
          change="-24.8%" 
          isPositive={true} 
          desc="Circuit breaker broadcast speed" 
          icon={Zap}
          delay={0.1} 
        />
        <MetricCard 
          title="Value Secured (TVL)" 
          value="$42.5M" 
          change="+5.2%" 
          isPositive={true} 
          desc="Assets inside guarded contracts" 
          icon={Cpu}
          delay={0.15} 
        />
      </div>

      {/* Visual Analytics Charts Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Threat Volume Area Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }} 
          className="p-6 md:p-8 bg-[#090f1d]/45 border border-white/[0.04] shadow-glass-inner rounded-2xl backdrop-blur-md relative"
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">Threat Volume (7 Days)</h3>
              <p className="text-[11px] text-slate-500 font-normal mt-0.5">Real-time alerts triggered versus mitigations completed.</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-aegis-red" />
                <span className="text-slate-400">Alerts</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-aegis-cyan" />
                <span className="text-slate-400">Resolved</span>
              </div>
            </div>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockData} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-aegis-red)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--color-aegis-red)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-aegis-cyan)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--color-aegis-cyan)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="rgba(255,255,255,0.2)" 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: '#64748b' }} 
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.2)" 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: '#64748b' }} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="threats" 
                  stroke="var(--color-aegis-red)" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#colorThreats)" 
                  name="Alerts"
                />
                <Area 
                  type="monotone" 
                  dataKey="resolved" 
                  stroke="var(--color-aegis-cyan)" 
                  strokeWidth={2} 
                  fillOpacity={1} 
                  fill="url(#colorResolved)" 
                  name="Resolved"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Vector Classifications Bar Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.25 }} 
          className="p-6 md:p-8 bg-[#090f1d]/45 border border-white/[0.04] shadow-glass-inner rounded-2xl backdrop-blur-md relative"
        >
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider font-mono">Attack Vectors (Epoch % )</h3>
            <p className="text-[11px] text-slate-500 font-normal mt-0.5">Exploit classification percentages tracked by Sentinel agents.</p>
          </div>

          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vectorData} layout="vertical" margin={{ left: 10, right: 10, top: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" horizontal={false} />
                <XAxis 
                  type="number" 
                  stroke="rgba(255,255,255,0.2)" 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: '#64748b' }} 
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  stroke="rgba(255,255,255,0.2)" 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: '#94a3b8' }} 
                  width={110} 
                />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} content={<CustomTooltip />} />
                <Bar 
                  dataKey="value" 
                  fill="var(--color-aegis-purple)" 
                  radius={[0, 6, 6, 0]} 
                  barSize={16} 
                  name="Share %"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

function MetricCard({ title, value, change, isPositive, desc, icon: Icon, delay }: { 
  title: string, 
  value: string, 
  change: string, 
  isPositive: boolean, 
  desc: string,
  icon: any,
  delay: number 
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ delay }}
      className="p-6 bg-[#090f1d]/45 border border-white/[0.04] shadow-glass-inner rounded-2xl backdrop-blur-md hover:border-white/10 hover:shadow-lg transition-all duration-300 group"
    >
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500 font-mono">{title}</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-display font-bold text-white tracking-tight">{value}</span>
            <span className={`text-[10px] font-mono font-bold flex items-center gap-0.5 ${isPositive ? 'text-aegis-green bg-aegis-green/10' : 'text-aegis-red bg-aegis-red/10'} px-1.5 py-0.5 rounded`}>
              {isPositive ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
              {change}
            </span>
          </div>
        </div>
        <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-slate-400 group-hover:text-aegis-cyan group-hover:border-aegis-cyan/20 transition-all duration-300">
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="mt-4 text-[10px] text-slate-500 font-normal leading-normal">{desc}</p>
    </motion.div>
  )
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#090f1d]/90 border border-white/[0.08] p-3.5 rounded-xl shadow-glass-inner backdrop-blur-md z-50">
        <p className="text-[9px] font-mono text-slate-500 uppercase tracking-widest mb-2 font-bold">{label}</p>
        <div className="space-y-1.5">
          {payload.map((item: any, index: number) => (
            <div key={index} className="flex items-center gap-2.5 text-[11px] font-mono">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.stroke || item.fill }} />
              <span className="text-slate-400">{item.name}:</span>
              <span className="font-bold text-white ml-auto">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return null
}
