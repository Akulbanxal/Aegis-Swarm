import { execSync, spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const ANVIL_URL = 'http://127.0.0.1:8545';
const PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'; // Default Anvil key

async function main() {
  console.log('🛡️  Starting Aegis Swarm Demo Simulator...\n');

  // 1. Check if Anvil is running. If not, start it.
  let anvilProcess: any = null;
  try {
    execSync(`curl -s -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' ${ANVIL_URL}`);
    console.log('✅ Anvil is already running.');
  } catch (e) {
    console.log('🔄 Starting local Anvil node...');
    anvilProcess = spawn('anvil', [], { detached: true, stdio: 'ignore' });
    anvilProcess.unref();
    await new Promise(r => setTimeout(r, 2000)); // Wait for it to boot
  }

  // 1.5 Start the Backend Server (if not running)
  console.log('🔄 Starting Aegis Swarm Backend...');
  const backendProcess = spawn('npm', ['start'], { 
    cwd: path.resolve(process.cwd(), 'backend'),
    detached: true,
    stdio: 'ignore' // We ignore stdio so the demo terminal stays clean
  });
  backendProcess.unref();
  await new Promise(r => setTimeout(r, 2000)); // Wait for backend to initialize

  // 2. Deploy Contracts
  console.log('\n🚀 Deploying Smart Contracts...');
  try {
    execSync('forge script script/Deploy.s.sol:Deploy --rpc-url http://localhost:8545 --broadcast', { 
      cwd: path.resolve(process.cwd(), 'contracts'), 
      stdio: 'inherit',
      env: {
        ...process.env,
        DEPLOYER_PRIVATE_KEY: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
      }
    });
  } catch (e) {
    console.error('❌ Deployment failed. Make sure you have foundry installed.');
    if (anvilProcess) anvilProcess.kill();
    if (backendProcess) backendProcess.kill();
    process.exit(1);
  }

  // 3. Read Broadcast to find MockAttacker
  const broadcastPath = path.resolve(process.cwd(), 'contracts/broadcast/Deploy.s.sol/31337/run-latest.json');
  const broadcastData = JSON.parse(fs.readFileSync(broadcastPath, 'utf-8'));
  const attackerTx = broadcastData.transactions.find((tx: any) => tx.contractName === 'MockAttacker');
  const vaultTx = broadcastData.transactions.find((tx: any) => tx.contractName === 'ProtectedVault');

  const attackerAddress = attackerTx.contractAddress;
  const vaultAddress = vaultTx.contractAddress;

  console.log(`\n✅ Deployed Successfully:
  - ProtectedVault: ${vaultAddress}
  - MockAttacker: ${attackerAddress}`);

  console.log('\n=============================================');
  console.log('🚨 ATTACK SIMULATION READY 🚨');
  console.log('The backend server is watching for anomalies.');
  console.log('Go to your frontend dashboard to watch the agents act in real-time!');
  console.log('=============================================\n');

  console.log('⏳ Launching automated attack in 10 seconds...');
  
  // Countdown
  for (let i = 10; i > 0; i--) {
    process.stdout.write(`\rLaunching in ${i}... `);
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log('\n\n💥 EXECUTING MOCK EXPLOIT (launchAttack)...');
  
  try {
    execSync(`cast send ${attackerAddress} "launchAttack()" --private-key ${PRIVATE_KEY} --rpc-url ${ANVIL_URL}`, {
      stdio: 'inherit'
    });
    console.log('✅ Exploit transaction submitted to Anvil mempool/blockchain!');
    console.log('Check the terminal of your backend/frontend or the dashboard UI to see the Swarm neutralize it!');
  } catch (e) {
    console.error('❌ Exploit failed to send.');
  }

  if (anvilProcess) {
    console.log('\n🛑 Note: Anvil is still running in the background. Use `killall anvil` to stop it.');
  }
  console.log('🛑 Note: Backend is running in the background. Use `killall node` to stop it when done.');
}

main().catch(console.error);
