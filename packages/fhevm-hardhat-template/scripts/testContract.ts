import { ethers } from "hardhat";

async function main() {
  const contractAddress = "0x84dAEB476d3264c2f5C5f54c60DaaFA7D888DAD5";
  const testAddress = "0x8d30010878d95C7EeF78e543Ee2133db846633b8";
  
  console.log("Testing contract at:", contractAddress);
  console.log("Test address:", testAddress);
  
  // Get the contract factory
  const ConfidentialTokenFactory = await ethers.getContractFactory("ConfidentialTokenFixed");
  
  // Attach to deployed contract
  const contract = ConfidentialTokenFactory.attach(contractAddress);
  
  try {
    // Test basic contract functions
    console.log("\n1. Testing contract name...");
    const name = await contract.name();
    console.log("Contract name:", name);
    
    console.log("\n2. Testing contract symbol...");
    const symbol = await contract.symbol();
    console.log("Contract symbol:", symbol);
    
    console.log("\n3. Testing isInitialized...");
    const isInit = await contract.isInitialized(testAddress);
    console.log("Is initialized:", isInit);
    
    console.log("\n4. Testing getEncryptedBalance...");
    const balance = await contract.getEncryptedBalance(testAddress);
    console.log("Encrypted balance:", balance);
    
    console.log("\n5. Testing initializeAddress...");
    const tx = await contract.initializeAddress(testAddress);
    console.log("Initialize tx hash:", tx.hash);
    
    const receipt = await tx.wait();
    console.log("Initialize receipt status:", receipt?.status);
    
    console.log("\n6. Testing isInitialized again...");
    const isInit2 = await contract.isInitialized(testAddress);
    console.log("Is initialized after:", isInit2);
    
  } catch (error) {
    console.error("Error testing contract:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
