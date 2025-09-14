import { ethers } from "hardhat";

async function main() {
  console.log("Deploying CTRegistry only...");
  
  try {
    const [deployer] = await ethers.getSigners();
    console.log("Deployer address:", deployer.address);
    
    const network = await ethers.provider.getNetwork();
    console.log("Network:", network.name, network.chainId);
    
    console.log("Deploying CTRegistry...");
    const CTRegistry = await ethers.getContractFactory("CTRegistry");
    const registry = await CTRegistry.deploy();
    
    console.log("Waiting for deployment...");
    await registry.waitForDeployment();
    
    const registryAddress = await registry.getAddress();
    console.log("✅ CTRegistry deployed to:", registryAddress);
    
    console.log("\n🎉 Registry Deployment Complete!");
    console.log("Registry Address:", registryAddress);
    console.log("Network:", network.name, network.chainId);
    console.log("Deployer:", deployer.address);
    
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
}

main()
  .then(() => {
    console.log("✅ Registry deployment completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Registry deployment failed:", error);
    process.exit(1);
  });
