import { ethers } from "hardhat";

async function main() {
  console.log("Deploying with specific wallet...");

  // Get the deployer address from command line or environment
  const deployerAddress = process.env.DEPLOYER_ADDRESS;
  
  if (!deployerAddress) {
    console.error("❌ Please set DEPLOYER_ADDRESS environment variable");
    console.log("Example: DEPLOYER_ADDRESS=0x... npx hardhat run scripts/deployWithWallet.ts --network sepolia");
    process.exit(1);
  }

  console.log("Deployer address:", deployerAddress);

  // Get signer for the specific address
  const signer = await ethers.getSigner(deployerAddress);
  console.log("Using signer:", await signer.getAddress());

  // Deploy CTRegistry
  console.log("Deploying CTRegistry...");
  const CTRegistry = await ethers.getContractFactory("CTRegistry", signer);
  const registry = await CTRegistry.deploy();
  await registry.waitForDeployment();

  const registryAddress = await registry.getAddress();
  console.log("CTRegistry deployed to:", registryAddress);

  // Deploy CTFactory
  console.log("Deploying CTFactory...");
  const CTFactory = await ethers.getContractFactory("CTFactory", signer);
  const factory = await CTFactory.deploy(registryAddress);
  await factory.waitForDeployment();

  const factoryAddress = await factory.getAddress();
  console.log("CTFactory deployed to:", factoryAddress);

  // Set factory as registrar
  console.log("Setting factory as registrar...");
  const setRegistrarTx = await registry.setRegistrar(factoryAddress, true);
  await setRegistrarTx.wait();
  console.log("Factory registered as registrar");

  // Verify setup
  const isRegistered = await registry.isRegistrar(factoryAddress);
  console.log("Factory is registrar:", isRegistered);

  console.log("\n=== Deployment Summary ===");
  console.log("Deployer:", deployerAddress);
  console.log("CTRegistry:", registryAddress);
  console.log("CTFactory:", factoryAddress);
  console.log("Network:", await ethers.provider.getNetwork());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
