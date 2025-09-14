import { ethers } from "hardhat";

async function main() {
  console.log("🔍 Debugging contract...");

  // Contract address
  const contractAddress = "0x85A4e321245EF50f01f8E88Cefb16cdE690E0889";
  
  // Get signers
  const [deployer, user] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);
  console.log("User address:", user.address);

  // Get contract
  const ConfidentialTokenFixed = await ethers.getContractFactory("ConfidentialTokenFixed");
  const contract = ConfidentialTokenFixed.attach(contractAddress);

  // Check owner
  const owner = await contract.owner();
  console.log("Contract owner:", owner);
  console.log("Deployer is owner?", owner.toLowerCase() === deployer.address.toLowerCase());
  console.log("User is owner?", owner.toLowerCase() === user.address.toLowerCase());

  // Check if user is initialized
  try {
    const isInit = await contract.isInitialized(user.address);
    console.log("User initialized?", isInit);
  } catch (error) {
    console.log("Error checking initialization:", error.message);
  }

  // Check contract name, symbol, decimals
  try {
    const name = await contract.name();
    const symbol = await contract.symbol();
    const decimals = await contract.decimals();
    console.log("Contract info:", { name, symbol, decimals });
  } catch (error) {
    console.log("Error getting contract info:", error.message);
  }

  // Try to call a simple view function
  try {
    const balance = await contract.getEncryptedBalance(user.address);
    console.log("Encrypted balance (handle):", balance);
  } catch (error) {
    console.log("Error getting encrypted balance:", error.message);
  }

  console.log("\n📝 Summary:");
  console.log("- If deployer is not owner, you need to use the correct wallet");
  console.log("- If user is not initialized, that might cause issues");
  console.log("- Check if contract is properly deployed");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });

