import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployFactoryExtended: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, ethers } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("Deploying CTFactory with ConfidentialTokenExtended...");

  // Get registry address
  const registry = await deployments.get("CTRegistry");
  console.log("Registry address:", registry.address);

  // Deploy factory
  const factory = await deploy("CTFactory", {
    from: deployer,
    args: [registry.address],
    log: true,
  });

  console.log("Factory deployed at:", factory.address);

  // Set factory as registrar
  const registryContract = await ethers.getContractAt("CTRegistry", registry.address);
  const factoryContract = await ethers.getContractAt("CTFactory", factory.address);
  
  console.log("Setting factory as registrar...");
  const setRegistrarTx = await registryContract.setRegistrar(factory.address, true);
  await setRegistrarTx.wait();
  
  console.log("Factory is now registered as registrar");
  console.log("Factory can deploy and register tokens");
};

export default deployFactoryExtended;
deployFactoryExtended.tags = ["CTFactory"];
deployFactoryExtended.dependencies = ["CTRegistry"];

