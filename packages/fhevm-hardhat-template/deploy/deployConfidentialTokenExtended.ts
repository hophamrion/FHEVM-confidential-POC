import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { execSync } from "child_process";
import path from "path";

const deployConfidentialTokenExtended: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("Deploying ConfidentialTokenExtended...");

  const confidentialToken = await deploy("ConfidentialTokenExtended", {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: 3, // Increased for Sepolia
  });

  console.log(`ConfidentialTokenExtended deployed at: ${confidentialToken.address}`);

  // Auto-generate ABI for frontend
  try {
    console.log("Generating ABI for frontend...");
    const sitePath = path.join(__dirname, "../../site");
    execSync("npm run genabi:confidential", { 
      cwd: sitePath, 
      stdio: "inherit" 
    });
    console.log("✅ ABI generated successfully!");
  } catch (error) {
    console.log("⚠️ ABI generation failed:", error);
  }

  // Verify the contract on Etherscan if not on localhost
  if (hre.network.name !== "localhost" && hre.network.name !== "hardhat") {
    try {
      await hre.run("verify:verify", {
        address: confidentialToken.address,
        constructorArguments: [],
      });
      console.log("Contract verified on Etherscan");
    } catch (error) {
      console.log("Verification failed:", error);
    }
  }
};

export default deployConfidentialTokenExtended;
deployConfidentialTokenExtended.tags = ["ConfidentialTokenExtended"];
