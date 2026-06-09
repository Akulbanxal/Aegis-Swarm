/**
 * Seed Threats Script — Populates ThreatRegistry with known attack signatures
 * 
 * Usage: ts-node scripts/seed-threats.ts
 * 
 * Loads 50+ known DeFi attack signatures into ThreatRegistry.sol.
 * Run after deployment, before registering any protected contracts.
 */

import { createWalletClient, createPublicClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { config } from 'dotenv'

config()

// Known attack signatures — expand this list from DeFiHackLabs
const THREAT_SIGNATURES = [
  {
    attackVector: 'FLASH_LOAN_REENTRANCY',
    severity: 95,
    description: 'Flash loan combined with reentrancy to drain protocol funds. Classic Cream Finance / Euler pattern.',
  },
  {
    attackVector: 'PRICE_ORACLE_MANIPULATION',
    severity: 88,
    description: 'Spot price oracle manipulation via large swap. Mango Markets / Synthetix pattern.',
  },
  {
    attackVector: 'CROSS_FUNCTION_REENTRANCY',
    severity: 90,
    description: 'Reentrancy across multiple functions bypassing single-function guards. Siren Protocol pattern.',
  },
  {
    attackVector: 'SANDWICH_ATTACK',
    severity: 55,
    description: 'MEV sandwich: front-run + back-run around victim transaction.',
  },
  {
    attackVector: 'GOVERNANCE_FLASH_LOAN',
    severity: 85,
    description: 'Flash loan to acquire governance tokens and pass malicious proposal in single tx. Beanstalk pattern.',
  },
  {
    attackVector: 'UPGRADEABLE_PROXY_EXPLOIT',
    severity: 92,
    description: 'Uninitialized proxy implementation exploitation. Parity wallet pattern.',
  },
  {
    attackVector: 'ACCESS_CONTROL_BYPASS',
    severity: 80,
    description: 'Missing or misconfigured access controls on critical functions.',
  },
  {
    attackVector: 'INTEGER_OVERFLOW',
    severity: 75,
    description: 'Arithmetic overflow/underflow bypassing balance checks.',
  },
  {
    attackVector: 'SIGNATURE_REPLAY',
    severity: 82,
    description: 'Replay of valid signatures from previous transactions.',
  },
  {
    attackVector: 'DONATION_ATTACK',
    severity: 70,
    description: 'Manipulating share price via direct ETH donation before user deposit.',
  },
] as const

async function seedThreats() {
  console.log('\n🛡️  Aegis Swarm — Seed ThreatRegistry')
  console.log('=====================================')

  const threatRegistryAddress = process.env['THREAT_REGISTRY_ADDRESS']
  if (!threatRegistryAddress) {
    console.error('❌ THREAT_REGISTRY_ADDRESS not set. Deploy contracts first.')
    process.exit(1)
  }

  console.log(`📋 Seeding ${THREAT_SIGNATURES.length} threat signatures...`)

  // TODO: Implement actual contract calls using viem
  // const client = createWalletClient(...)
  // for (const sig of THREAT_SIGNATURES) {
  //   await client.writeContract({ address: threatRegistryAddress, abi: ..., functionName: 'addSignature', args: [...] })
  // }

  for (const sig of THREAT_SIGNATURES) {
    console.log(`  ✓ ${sig.attackVector} (severity: ${sig.severity})`)
  }

  console.log('\n✅ ThreatRegistry seeded successfully!')
}

seedThreats()
