import fs from 'fs';
import path from 'path';

const DEPLOYMENTS_DIR = path.join(process.cwd(), '../fhevm-hardhat-template/deployments');
const OUTPUT_DIR = path.join(process.cwd(), 'abi');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function generateABI() {
  console.log('🔍 Looking for ConfidentialTokenExtended deployments...');
  
  const networks = fs.readdirSync(DEPLOYMENTS_DIR);
  const addresses = {};
  
  for (const network of networks) {
    const networkPath = path.join(DEPLOYMENTS_DIR, network);
    if (!fs.statSync(networkPath).isDirectory()) continue;
    
    const contractFile = path.join(networkPath, 'ConfidentialTokenExtended.json');
    if (fs.existsSync(contractFile)) {
      const deployment = JSON.parse(fs.readFileSync(contractFile, 'utf8'));
      
      addresses[deployment.chainId] = {
        address: deployment.address,
        chainId: deployment.chainId,
        chainName: network,
        deployedAt: deployment.receipt?.blockNumber || 'unknown'
      };
      
      console.log(`✅ Found deployment on ${network} (Chain ID: ${deployment.chainId})`);
      console.log(`   Address: ${deployment.address}`);
    }
  }
  
  // Generate addresses file
  const addressesContent = `// Auto-generated from deployments
export const ConfidentialTokenExtendedAddresses = ${JSON.stringify(addresses, null, 2)};
`;
  
  fs.writeFileSync(path.join(OUTPUT_DIR, 'ConfidentialTokenExtendedAddresses.ts'), addressesContent);
  
  // Generate ABI file from artifacts
  const artifactsPath = path.join(process.cwd(), '../fhevm-hardhat-template/artifacts/contracts/ConfidentialTokenExtended.sol/ConfidentialTokenExtended.json');
  let abiContent;
  
  if (fs.existsSync(artifactsPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactsPath, 'utf8'));
    abiContent = `// Auto-generated ABI for ConfidentialTokenExtended
export const ConfidentialTokenExtendedABI = {
  abi: ${JSON.stringify(artifact.abi, null, 4)}
};
`;
    console.log('✅ Copied ABI from artifacts');
  } else {
    abiContent = `// Auto-generated ABI for ConfidentialTokenExtended
export const ConfidentialTokenExtendedABI = {
  abi: [
    // ABI not found in artifacts - please compile the contract first
  ]
};
`;
    console.log('⚠️  ABI not found in artifacts');
  }
  
  fs.writeFileSync(path.join(OUTPUT_DIR, 'ConfidentialTokenExtendedABI.ts'), abiContent);
  
  console.log('📝 Generated ABI files:');
  console.log(`   - ${path.join(OUTPUT_DIR, 'ConfidentialTokenExtendedAddresses.ts')}`);
  console.log(`   - ${path.join(OUTPUT_DIR, 'ConfidentialTokenExtendedABI.ts')}`);
  
  if (Object.keys(addresses).length === 0) {
    console.log('⚠️  No deployments found. Make sure to deploy the contract first.');
  }
}

generateABI();
