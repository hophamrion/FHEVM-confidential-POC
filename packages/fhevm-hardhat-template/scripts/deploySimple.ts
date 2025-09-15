import { ethers } from "hardhat";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

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

  // Get network info
  const network = await ethers.provider.getNetwork();
  const deployer = await (await ethers.provider.getSigner()).getAddress();

  console.log("\n=== Deployment Summary ===");
  console.log("CTRegistry:", registryAddress);
  console.log("CTFactory:", factoryAddress);
  console.log("Network:", network);
  console.log("Deployer:", deployer);

  // Create deployment artifacts
  const deploymentsDir = join(__dirname, "../deployments", network.name);
  mkdirSync(deploymentsDir, { recursive: true });

  // Save Registry deployment
  const registryArtifact = {
    address: registryAddress,
    abi: CTRegistry.interface.format("json"),
    transactionHash: registry.deploymentTransaction()?.hash,
    receipt: await registry.deploymentTransaction()?.wait(),
    args: [],
    bytecode: CTRegistry.bytecode,
    deployedBytecode: await ethers.provider.getCode(registryAddress),
    linkReferences: {},
    deployedLinkReferences: {}
  };

  writeFileSync(
    join(deploymentsDir, "CTRegistry.json"),
    JSON.stringify(registryArtifact, null, 2)
  );

  // Save Factory deployment
  const factoryArtifact = {
    address: factoryAddress,
    abi: CTFactory.interface.format("json"),
    transactionHash: factory.deploymentTransaction()?.hash,
    receipt: await factory.deploymentTransaction()?.wait(),
    args: [registryAddress],
    bytecode: CTFactory.bytecode,
    deployedBytecode: await ethers.provider.getCode(factoryAddress),
    linkReferences: {},
    deployedLinkReferences: {}
  };

  writeFileSync(
    join(deploymentsDir, "CTFactory.json"),
    JSON.stringify(factoryArtifact, null, 2)
  );

  console.log("\n=== Deployment Artifacts Created ===");
  console.log("Registry artifact:", join(deploymentsDir, "CTRegistry.json"));
  console.log("Factory artifact:", join(deploymentsDir, "CTFactory.json"));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });