import { ethers } from "hardhat";

async function main() {
  console.log("Checking specific slug...");

  const registryAddress = "0x851D13B5e0BCd5Ba9D0E921Dd721CE6cC124E856";
  const ownerAddress = "0xd8FF12Afb233f53666a22373e864c3e23DcF7495";
  const slug = "tomcat2389";

  const registry = await ethers.getContractAt("CTRegistry", registryAddress);

  try {
    const count = await registry.count(ownerAddress, slug);
    console.log(`Contract count for '${slug}' slug: ${count.toString()}`);
    
    if (count > 0) {
      const latest = await registry.latest(ownerAddress, slug);
      console.log(`Latest contract address: ${latest}`);
    } else {
      console.log(`No contracts found for slug '${slug}'`);
    }
  } catch (error) {
    console.error("Error checking slug:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
