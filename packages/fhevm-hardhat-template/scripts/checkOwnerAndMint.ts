import { ethers } from "hardhat";

async function main() {
  console.log("🔍 Checking contract owner and testing mint...");

  // Contract address
  const contractAddress = "0xd9394f0E08a2850E692425c85447e2aD37D35000";
  
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

  // Check if user can mint (should fail if not owner)
  try {
    console.log("\n🧪 Testing mint with deployer (should work if deployer is owner)...");
    // This is just a test call, won't actually mint
    await contract.connect(deployer).mintConfidential.staticCall(
      user.address,
      "0x0000000000000000000000000000000000000000000000000000000000000000", // dummy handle
      "0x" // dummy proof
    );
    console.log("✅ Deployer can mint");
  } catch (error) {
    console.log("❌ Deployer cannot mint:", error.message);
  }

  try {
    console.log("\n🧪 Testing mint with user (should fail if user is not owner)...");
    await contract.connect(user).mintConfidential.staticCall(
      user.address,
      "0x0000000000000000000000000000000000000000000000000000000000000000", // dummy handle
      "0x" // dummy proof
    );
    console.log("✅ User can mint");
  } catch (error) {
    console.log("❌ User cannot mint (expected):", error.message);
  }

  console.log("\n📝 Summary:");
  console.log("- If you're getting 'mint failed', make sure you're using the owner wallet");
  console.log("- Owner address:", owner);
  console.log("- Make sure your MetaMask is connected to the owner address");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
