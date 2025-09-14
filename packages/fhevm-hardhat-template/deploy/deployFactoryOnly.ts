import { ethers } from "hardhat";

async function main() {
  console.log("Deploying CTFactory only...");
  
  try {
    const [deployer] = await ethers.getSigners();
    console.log("Deployer address:", deployer.address);
    
    const network = await ethers.provider.getNetwork();
    console.log("Network:", network.name, network.chainId);
    
    // Registry address from previous deployment
    const registryAddress = "0x851D13B5e0BCd5Ba9D0E921Dd721CE6cC124E856";
    console.log("Using Registry address:", registryAddress);
    
    console.log("Deploying CTFactory...");
    const CTFactory = await ethers.getContractFactory("CTFactory");
    const factory = await CTFactory.deploy(registryAddress);
    
    console.log("Waiting for factory deployment...");
    await factory.waitForDeployment();
    
    const factoryAddress = await factory.getAddress();
    console.log("✅ CTFactory deployed to:", factoryAddress);
    
    console.log("Setting factory as registrar...");
    const registry = await ethers.getContractAt("CTRegistry", registryAddress);
    const setRegistrarTx = await registry.setRegistrar(factoryAddress, true);
    await setRegistrarTx.wait();
    console.log("✅ Factory registered as registrar");
    
    console.log("\n🎉 Factory Deployment Complete!");
    console.log("Registry Address:", registryAddress);
    console.log("Factory Address:", factoryAddress);
    console.log("Network:", network.name, network.chainId);
    console.log("Deployer:", deployer.address);
    
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
}

main()
  .then(() => {
    console.log("✅ Factory deployment completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Factory deployment failed:", error);
    process.exit(1);
  });
