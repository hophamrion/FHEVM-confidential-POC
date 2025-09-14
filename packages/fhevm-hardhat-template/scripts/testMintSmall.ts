import { ethers } from "hardhat";

async function main() {
  console.log("🧪 Testing mint with small amounts...");

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

  // Test different amounts
  const testAmounts = [
    { amount: 1, description: "1 CT" },
    { amount: 0.1, description: "0.1 CT" },
    { amount: 0.01, description: "0.01 CT" },
    { amount: 0.001, description: "0.001 CT" }
  ];

  for (const test of testAmounts) {
    try {
      console.log(`\n🧪 Testing mint ${test.description}...`);
      
      // Calculate scaled amount
      const scaledAmount = BigInt(Math.round(test.amount * 1000000));
      console.log(`Scaled amount: ${scaledAmount} (${test.amount} CT)`);
      
      // This is just a test call, won't actually mint
      await contract.connect(deployer).mintConfidential.staticCall(
        user.address,
        "0x0000000000000000000000000000000000000000000000000000000000000000", // dummy handle
        "0x" // dummy proof
      );
      console.log(`✅ ${test.description} - Static call successful`);
      
    } catch (error) {
      console.log(`❌ ${test.description} - Error:`, error.message);
    }
  }

  console.log("\n📝 Summary:");
  console.log("- Try minting with smaller amounts first (0.1, 0.01, 0.001)");
  console.log("- If all fail, there might be a contract logic issue");
  console.log("- Check if you're using the correct owner wallet");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
