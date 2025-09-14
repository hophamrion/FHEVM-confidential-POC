import { ethers } from "hardhat";

async function main() {
  const contractAddress = "0x84dAEB476d3264c2f5C5f54c60DaaFA7D888DAD5";
  const testAddress = "0x8d30010878d95C7EeF78e543Ee2133db846633b8";
  
  console.log("Checking contract owner...");
  console.log("Contract address:", contractAddress);
  console.log("Test address:", testAddress);
  
  // Get the contract factory
  const ConfidentialTokenFactory = await ethers.getContractFactory("ConfidentialTokenFixed");
  
  // Attach to deployed contract
  const contract = ConfidentialTokenFactory.attach(contractAddress);
  
  try {
    // Check owner
    console.log("\n1. Checking contract owner...");
    const owner = await contract.owner();
    console.log("Contract owner:", owner);
    
    // Check caller
    const [deployer] = await ethers.getSigners();
    console.log("Current caller:", deployer.address);
    
    // Check if caller is owner
    const isOwner = owner.toLowerCase() === deployer.address.toLowerCase();
    console.log("Is caller the owner?", isOwner);
    
    if (!isOwner) {
      console.log("\n❌ ERROR: Caller is not the owner!");
      console.log("Solution: Use the owner wallet to call mint, or transfer ownership");
    } else {
      console.log("\n✅ Caller is the owner - can mint");
    }
    
  } catch (error) {
    console.error("Error checking owner:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
