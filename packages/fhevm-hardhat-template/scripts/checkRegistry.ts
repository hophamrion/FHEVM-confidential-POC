import { ethers } from "hardhat";

async function main() {
  console.log("Checking Registry...");
  
  try {
    const [deployer] = await ethers.getSigners();
    console.log("Deployer address:", deployer.address);
    
    const network = await ethers.provider.getNetwork();
    console.log("Network:", network.name, network.chainId);
    
    // Registry address
    const registryAddress = "0x851D13B5e0BCd5Ba9D0E921Dd721CE6cC124E856";
    console.log("Registry address:", registryAddress);
    
    const registry = await ethers.getContractAt("CTRegistry", registryAddress);
    
    // Check if user has any contracts registered
    const count = await registry.count(deployer.address, "main");
    console.log("Contract count for 'main' slug:", count.toString());
    
    if (count > 0) {
      const latest = await registry.latest(deployer.address, "main");
      console.log("Latest contract address:", latest);
      
      // Get version details
      const version = await registry.getByVersion(deployer.address, "main", count - 1);
      console.log("Latest version details:", {
        token: version.token,
        chainId: version.chainId.toString(),
        createdAt: new Date(Number(version.createdAt.toString()) * 1000).toISOString()
      });
    } else {
      console.log("❌ No contracts found in Registry for slug 'main'");
    }
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
