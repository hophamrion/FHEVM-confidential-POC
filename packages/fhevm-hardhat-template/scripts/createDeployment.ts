import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("Creating deployment file with ABI...");

  // Get contract factory to access ABI
  const ConfidentialTokenFixed = await ethers.getContractFactory("ConfidentialTokenFixed");
  const abi = ConfidentialTokenFixed.interface.format("json");
  
  console.log("ABI format:", typeof abi);
  console.log("ABI length:", abi.length);
  
  // Contract address from previous deployment
  const address = "0xAd7BdeEA688e28e1016Eb3598C15DD3f0D0ed748";
  
  // Create deployment info
  const deploymentInfo = {
    address: address,
    abi: abi,
    chainId: 11155111,
    chainName: "Sepolia",
    deployedAt: new Date().toISOString(),
    contractName: "ConfidentialTokenFixed"
  };

  // Save deployment info
  const deploymentDir = path.join(__dirname, '../deployments/sepolia');
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(deploymentDir, 'ConfidentialTokenFixed.json'),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("✅ Deployment file with ABI created!");
  console.log(`Address: ${address}`);
  console.log(`ABI length: ${deploymentInfo.abi.length} functions`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
