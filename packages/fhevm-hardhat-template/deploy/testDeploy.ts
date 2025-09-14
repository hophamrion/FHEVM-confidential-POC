import { ethers } from "hardhat";

async function main() {
  console.log("Starting deployment test...");
  
  try {
    console.log("Getting signer...");
    const [deployer] = await ethers.getSigners();
    console.log("Deployer address:", deployer.address);
    
    console.log("Getting network...");
    const network = await ethers.provider.getNetwork();
    console.log("Network:", network.name, network.chainId);
    
    console.log("Deploying CTRegistry...");
    const CTRegistry = await ethers.getContractFactory("CTRegistry");
    const registry = await CTRegistry.deploy();
    
    console.log("Waiting for deployment...");
    await registry.waitForDeployment();
    
    const registryAddress = await registry.getAddress();
    console.log("✅ CTRegistry deployed to:", registryAddress);
    
    console.log("Deploying CTFactory...");
    const CTFactory = await ethers.getContractFactory("CTFactory");
    const factory = await CTFactory.deploy(registryAddress);
    
    console.log("Waiting for factory deployment...");
    await factory.waitForDeployment();
    
    const factoryAddress = await factory.getAddress();
    console.log("✅ CTFactory deployed to:", factoryAddress);
    
    console.log("Setting factory as registrar...");
    const setRegistrarTx = await registry.setRegistrar(factoryAddress, true);
    await setRegistrarTx.wait();
    console.log("✅ Factory registered as registrar");
    
    console.log("\n🎉 Deployment Summary:");
    console.log("CTRegistry:", registryAddress);
    console.log("CTFactory:", factoryAddress);
    console.log("Network:", network.name, network.chainId);
    console.log("Deployer:", deployer.address);
    
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
}

main()
  .then(() => {
    console.log("✅ Deployment completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
