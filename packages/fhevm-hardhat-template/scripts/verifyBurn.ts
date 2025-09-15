import { ethers } from "hardhat";

async function main() {
  console.log("Verifying burn functionality...");

  // Get contract addresses
  const registryAddress = "0x6992bB20B35F30D1F3d6450fAc460dA629535e97";
  const userAddress = "0xd8FF12Afb233f53666a22373e864c3e23DcF7495";
  const slug = "main";

  // Get Registry contract
  const registry = await ethers.getContractAt("CTRegistry", registryAddress);
  
  // Get latest token address
  const tokenAddress = await registry.latest(userAddress, slug);
  console.log("Token address:", tokenAddress);

  // Get token contract
  const token = await ethers.getContractAt("ConfidentialTokenExtended", tokenAddress);

  // Get deployer (for testing)
  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  // Check if address is initialized
  const isInitialized = await token.isInitialized(deployer.address);
  console.log("Address initialized:", isInitialized);

  if (!isInitialized) {
    console.log("Initializing address...");
    const initTx = await token.initializeAddress();
    await initTx.wait();
    console.log("Address initialized");
  }

  // Get balance before burn
  const balanceBefore = await token.balanceOf(deployer.address);
  console.log("Balance before burn:", balanceBefore.toString());

  // Get total supply before burn
  const supplyBefore = await token.totalSupply();
  console.log("Total supply before burn:", supplyBefore.toString());

  // Test burn (if you have tokens)
  if (balanceBefore > 0) {
    console.log("Testing burn...");
    
    // Note: This is a simplified test - actual burn requires FHEVM encryption
    // In real scenario, you'd need to use the frontend with proper encryption
    
    console.log("Burn test completed (simplified)");
  } else {
    console.log("No tokens to burn");
  }

  // Check final state
  const balanceAfter = await token.balanceOf(deployer.address);
  const supplyAfter = await token.totalSupply();
  
  console.log("\n=== Burn Verification ===");
  console.log("Balance before:", balanceBefore.toString());
  console.log("Balance after:", balanceAfter.toString());
  console.log("Total supply before:", supplyBefore.toString());
  console.log("Total supply after:", supplyAfter.toString());
  
  if (balanceBefore > balanceAfter) {
    console.log("✅ Burn successful - balance decreased");
  } else {
    console.log("❌ Burn failed - balance unchanged");
  }
  
  if (supplyBefore > supplyAfter) {
    console.log("✅ Burn successful - total supply decreased");
  } else {
    console.log("❌ Burn failed - total supply unchanged");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
