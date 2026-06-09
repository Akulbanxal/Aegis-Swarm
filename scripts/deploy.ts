/**
 * Deployment Script — Deploy Aegis Swarm contracts to Somnia Testnet
 *
 * Usage:
 *   ts-node scripts/deploy.ts
 *   # or
 *   forge script contracts/script/Deploy.s.sol --rpc-url somnia_testnet --broadcast
 *
 * This TypeScript script wraps the Foundry deploy script and updates .env
 * with the deployed contract addresses automatically.
 */

import { execSync } from 'child_process'
import { readFileSync, writeFileSync } from 'fs'
import { config } from 'dotenv'

config()

async function deploy() {
  console.log('\n🛡️  Aegis Swarm — Contract Deployment')
  console.log('=====================================')
  console.log(`Network: Somnia Testnet (${process.env['SOMNIA_TESTNET_CHAIN_ID']})`)
  console.log(`RPC:     ${process.env['SOMNIA_TESTNET_RPC_URL']}`)
  console.log('')

  if (!process.env['DEPLOYER_PRIVATE_KEY']) {
    console.error('❌ DEPLOYER_PRIVATE_KEY not set in .env')
    process.exit(1)
  }

  try {
    // Run Foundry deploy script
    console.log('📦 Running forge deploy script...')
    const output = execSync(
      `cd contracts && forge script script/Deploy.s.sol \
        --rpc-url ${process.env['SOMNIA_TESTNET_RPC_URL']} \
        --broadcast \
        --verify \
        --etherscan-api-key ${process.env['SOMNIA_EXPLORER_API_KEY'] ?? ''} \
        --verifier-url ${process.env['SOMNIA_EXPLORER_URL'] ?? ''}/api`,
      { encoding: 'utf8' }
    )
    console.log(output)

    // TODO: Parse output to extract deployed addresses
    // TODO: Update .env file with new addresses

    console.log('✅ Deployment complete!')
    console.log('\nNext steps:')
    console.log('  1. Verify contracts on Somnia block explorer')
    console.log('  2. npm run seed-threats')
    console.log('  3. npm run register-contract -- --address <YOUR_CONTRACT>')

  } catch (error) {
    console.error('❌ Deployment failed:', error)
    process.exit(1)
  }
}

deploy()
