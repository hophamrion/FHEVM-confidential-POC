import { execSync } from "child_process";
import { join } from "path";

async function main() {
  console.log("🚀 Deploying contracts and updating frontend...");

  try {
    // Step 1: Deploy contracts
    console.log("📦 Deploying CTRegistry and CTFactory...");
    execSync("npx hardhat run scripts/deploySimple.ts --network sepolia", { 
      stdio: "inherit",
      cwd: join(__dirname, "..")
    });

    // Step 2: Update frontend addresses
    console.log("🔄 Updating frontend addresses...");
    execSync("npx hardhat run scripts/updateFrontendAddresses.ts --network sepolia", { 
      stdio: "inherit",
      cwd: join(__dirname, "..")
    });

    console.log("✅ Deployment and frontend update completed!");
    console.log("🎉 You can now refresh your frontend to see the changes!");

  } catch (error) {
    console.error("❌ Error during deployment:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
