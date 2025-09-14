import { ethers } from "hardhat";

async function main() {
  console.log("🔍 Checking Registry entries...");
  
  // Registry address on Sepolia
  const registryAddress = "0x851D13B5e0BCd5Ba9D0E921Dd721CE6cC124E856";
  
  // Get signer
  const [signer] = await ethers.getSigners();
  console.log("Current signer:", signer.address);
  
  // Create registry contract
  const registryABI = [
    "function latest(address owner, string calldata slug) external view returns (address)",
    "function count(address owner, string calldata slug) external view returns (uint256)"
  ];
  
  const registry = new ethers.Contract(registryAddress, registryABI, signer);
  
  // Check for both accounts
  const accounts = [
    "0x8d30010878d95C7EeF78e543Ee2133db846633b8", // Original deployer
    "0xd8FF12Afb233f53666a22373e864c3e23DcF7495"  // Current account
  ];
  
  for (const account of accounts) {
    try {
      const count = await registry.count(account, "main");
      console.log(`\n📋 Account ${account}:`);
      console.log(`   Entries: ${count}`);
      
      if (count > 0) {
        const latest = await registry.latest(account, "main");
        console.log(`   Latest contract: ${latest}`);
      }
    } catch (error) {
      console.log(`\n❌ Account ${account}: Error - ${error.message}`);
    }
  }
}

main().catch(console.error);
