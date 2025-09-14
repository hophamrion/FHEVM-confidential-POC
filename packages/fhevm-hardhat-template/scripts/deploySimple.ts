import { ethers } from "hardhat";

async function main() {
  console.log("Deploying ConfidentialTokenFixed...");

  const ConfidentialTokenFixed = await ethers.getContractFactory("ConfidentialTokenFixed");
  const confidentialToken = await ConfidentialTokenFixed.deploy();

  await confidentialToken.waitForDeployment();

  const address = await confidentialToken.getAddress();
  console.log(`ConfidentialTokenFixed deployed to: ${address}`);

  // Save deployment info
  const fs = require('fs');
  const path = require('path');
  
  const deploymentDir = path.join(__dirname, '../deployments/sepolia');
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }

  const deploymentInfo = {
    address: address,
    chainId: 11155111,
    chainName: "Sepolia",
    deployedAt: new Date().toISOString(),
    contractName: "ConfidentialTokenFixed"
  };

  fs.writeFileSync(
    path.join(deploymentDir, 'ConfidentialTokenFixed.json'),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("✅ Deployment info saved!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
