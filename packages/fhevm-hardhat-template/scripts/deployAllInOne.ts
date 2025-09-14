import { ethers } from "hardhat";
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("🚀 Deploying ConfidentialTokenFixed (All-in-One)...");

  // 1. Deploy contract
  const ConfidentialTokenFixed = await ethers.getContractFactory("ConfidentialTokenFixed");
  const confidentialToken = await ConfidentialTokenFixed.deploy();
  await confidentialToken.waitForDeployment();

  const address = await confidentialToken.getAddress();
  console.log(`✅ Contract deployed to: ${address}`);

  // 2. Get ABI
  const abi = ConfidentialTokenFixed.interface.format("json");
  console.log(`✅ ABI extracted: ${abi.length} functions`);

  // 3. Create deployment file with ABI
  const deploymentInfo = {
    address: address,
    abi: abi,
    chainId: 11155111,
    chainName: "Sepolia",
    deployedAt: new Date().toISOString(),
    contractName: "ConfidentialTokenFixed"
  };

  const deploymentDir = path.join(__dirname, '../deployments/sepolia');
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(deploymentDir, 'ConfidentialTokenFixed.json'),
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("✅ Deployment file created with ABI");

  // 4. Auto-generate ABI for frontend
  try {
    console.log("🔄 Generating ABI for frontend...");
    const sitePath = path.join(__dirname, "../../site");
    execSync("npm run genabi:confidential", { 
      cwd: sitePath, 
      stdio: "inherit" 
    });
    console.log("✅ ABI generated for frontend!");
  } catch (error) {
    console.log("⚠️ ABI generation failed:", error);
  }

  // 5. Skip verification (not needed for PoC)
  console.log("⏭️ Skipping contract verification (not needed for PoC)");

  console.log("\n🎉 DEPLOYMENT COMPLETE!");
  console.log(`📄 Contract: ${address}`);
  console.log(`🔗 Etherscan: https://sepolia.etherscan.io/address/${address}`);
  console.log("🚀 Frontend ready to use!");
  console.log("\n📝 Next steps:");
  console.log("1. Update frontend to use amount * 10^6 (decimals = 6)");
  console.log("2. Test mint function");
  console.log("3. Test transfer function");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
