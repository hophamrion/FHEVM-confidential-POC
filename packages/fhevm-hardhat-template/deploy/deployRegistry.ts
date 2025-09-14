import { ethers } from "hardhat";

async function main() {
  console.log("Deploying CTRegistry...");

  // Deploy CTRegistry
  const CTRegistry = await ethers.getContractFactory("CTRegistry");
  const registry = await CTRegistry.deploy();
  await registry.waitForDeployment();

  const registryAddress = await registry.getAddress();
  console.log("CTRegistry deployed to:", registryAddress);

  // Deploy CTFactory
  console.log("Deploying CTFactory...");
  const CTFactory = await ethers.getContractFactory("CTFactory");
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
  console.log("CTRegistry:", registryAddress);
  console.log("CTFactory:", factoryAddress);
  console.log("Network:", await ethers.provider.getNetwork());
  console.log("Deployer:", await ethers.provider.getSigner().getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
