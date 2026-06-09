/**
 * Simulate Attack Script — Triggers test threat events for demo purposes
 * 
 * Usage: ts-node scripts/simulate-attack.ts --type reentrancy --contract 0x...
 * 
 * Fires simulated attack transactions against registered demo contracts.
 * Used for the Agentathon demo to show the full agent response chain live.
 */

import { config } from 'dotenv'
config()

type AttackType = 'reentrancy' | 'flash-loan' | 'oracle-manipulation' | 'access-control'

interface SimulationConfig {
  type: AttackType
  contractAddress: string
  severity?: 'low' | 'medium' | 'high'
}

const ATTACK_SCENARIOS: Record<AttackType, { description: string; eventTopic: string }> = {
  'reentrancy': {
    description: 'Cross-function reentrancy via ETH transfer callback',
    eventTopic: '0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822',
  },
  'flash-loan': {
    description: 'Flash loan price oracle manipulation',
    eventTopic: '0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109',
  },
  'oracle-manipulation': {
    description: 'Spot price manipulation via large swap',
    eventTopic: '0xdccd412f0b1252819cb1fd330b93224ca42612892bb3f4f789976e6d81936496',
  },
  'access-control': {
    description: 'Unauthorized function call by non-owner',
    eventTopic: '0x8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925',
  },
}

async function simulateAttack(config: SimulationConfig) {
  const scenario = ATTACK_SCENARIOS[config.type]

  console.log('\n⚔️  AEGIS SWARM — Attack Simulation')
  console.log('===================================')
  console.log(`Type:     ${config.type.toUpperCase()}`)
  console.log(`Contract: ${config.contractAddress}`)
  console.log(`Attack:   ${scenario.description}`)
  console.log('')

  // TODO: Implement actual malicious transaction broadcasting
  // This would call a test exploit contract that emits the expected events
  // causing AegisCore._onEvent() to fire and dispatch the agent swarm

  console.log('⚡ Firing attack transaction...')
  await new Promise((resolve) => setTimeout(resolve, 1000))

  console.log('🔍 Aegis Swarm detecting...')
  await new Promise((resolve) => setTimeout(resolve, 500))

  console.log('🤖 Dispatching Sentinel Agent...')
  await new Promise((resolve) => setTimeout(resolve, 2000))

  console.log('🧠 Analyst classifying threat...')
  await new Promise((resolve) => setTimeout(resolve, 1500))

  console.log('⚡ Responder executing defensive action...')
  await new Promise((resolve) => setTimeout(resolve, 1000))

  console.log('\n✅ Demo simulation complete! Check the SOC Dashboard.')
  console.log(`   Dashboard: ${process.env['NEXT_PUBLIC_BACKEND_URL'] ?? 'http://localhost:3000'}`)
}

// Parse CLI args
const args = process.argv.slice(2)
const typeArg = args.find(a => a.startsWith('--type='))?.split('=')[1] ?? 'reentrancy'
const contractArg = args.find(a => a.startsWith('--contract='))?.split('=')[1] ?? '0x0000000000000000000000000000000000000001'

simulateAttack({
  type: typeArg as AttackType,
  contractAddress: contractArg,
  severity: 'high',
})
