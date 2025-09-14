import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = path.join(process.cwd(), '../fhevm-hardhat-template/artifacts');
const OUTPUT_FILE = path.join(process.cwd(), 'lib/contractArtifacts.ts');

function loadContractArtifacts() {
  console.log('🔍 Loading contract artifacts...');
  
  const contractPath = path.join(ARTIFACTS_DIR, 'contracts/ConfidentialTokenExtended.sol/ConfidentialTokenExtended.json');
  
  if (!fs.existsSync(contractPath)) {
    console.log('❌ Contract artifacts not found. Please compile the contract first:');
    console.log('   cd packages/fhevm-hardhat-template && npx hardhat compile');
    return;
  }
  
  const artifact = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
  
  const output = `// Auto-generated from Hardhat artifacts
export const CONTRACT_ABI = ${JSON.stringify(artifact.abi, null, 2)};

export const CONTRACT_BYTECODE = "${artifact.bytecode}";

export const CONTRACT_DEPLOYED_BYTECODE = "${artifact.deployedBytecode}";
`;
  
  fs.writeFileSync(OUTPUT_FILE, output);
  
  console.log('✅ Contract artifacts loaded successfully!');
  console.log(`   ABI: ${artifact.abi.length} functions`);
  console.log(`   Bytecode: ${artifact.bytecode.length} characters`);
  console.log(`   Output: ${OUTPUT_FILE}`);
}

loadContractArtifacts();
