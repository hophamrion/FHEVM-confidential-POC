const fs = require('fs');
const path = require('path');

// Read the artifact file
const artifactPath = path.join(__dirname, '../artifacts/contracts/ConfidentialTokenFixed.sol/ConfidentialTokenFixed.json');
const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

console.log('Contract Name:', artifact.contractName);
console.log('Bytecode Length:', artifact.bytecode.length);
console.log('Bytecode (first 100 chars):', artifact.bytecode.substring(0, 100));
console.log('Bytecode (last 100 chars):', artifact.bytecode.substring(artifact.bytecode.length - 100));

// Check if bytecode is complete
if (artifact.bytecode.endsWith('...')) {
  console.log('❌ Bytecode is truncated!');
} else {
  console.log('✅ Bytecode is complete');
}

// Write to frontend
const frontendPath = path.join(__dirname, '../../site/abi/ConfidentialTokenFixed.json');
const frontendArtifact = {
  ...artifact,
  bytecode: artifact.bytecode // Full bytecode
};

fs.writeFileSync(frontendPath, JSON.stringify(frontendArtifact, null, 2));
console.log('✅ Updated frontend artifact with full bytecode');
