import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

async function main() {
  console.log("Updating frontend addresses...");

  // Read deployment artifacts
  const sepoliaDir = join(__dirname, "../deployments/sepolia");
  
  try {
    const registryArtifact = JSON.parse(readFileSync(join(sepoliaDir, "CTRegistry.json"), "utf8"));
    const factoryArtifact = JSON.parse(readFileSync(join(sepoliaDir, "CTFactory.json"), "utf8"));

    console.log("Found deployments:");
    console.log("Registry:", registryArtifact.address);
    console.log("Factory:", factoryArtifact.address);

    // Update Registry addresses
    const registryAddressesPath = join(__dirname, "../../site/abi/CTRegistryAddresses.ts");
    const registryAddressesContent = `export const CTRegistryAddresses = {
  "11155111": { // Sepolia
    address: "${registryArtifact.address}", // CTRegistry deployed address
    chainId: 11155111,
    name: "Sepolia"
  },
  "31337": { // Localhost
    address: "0x0000000000000000000000000000000000000000", // Placeholder
    chainId: 31337,
    name: "Localhost"
  }
};`;

    writeFileSync(registryAddressesPath, registryAddressesContent);
    console.log("✅ Updated CTRegistryAddresses.ts");

    // Update Factory addresses
    const factoryAddressesPath = join(__dirname, "../../site/abi/CTFactoryAddresses.ts");
    const factoryAddressesContent = `export const CTFactoryAddresses = {
  "11155111": { // Sepolia
    address: "${factoryArtifact.address}", // CTFactory deployed address
    chainId: 11155111,
    name: "Sepolia"
  },
  "31337": { // Localhost
    address: "0x0000000000000000000000000000000000000000", // Placeholder
    chainId: 31337,
    name: "Localhost"
  }
};`;

    writeFileSync(factoryAddressesPath, factoryAddressesContent);
    console.log("✅ Updated CTFactoryAddresses.ts");

    console.log("\n🎉 Frontend addresses updated successfully!");
    console.log("Registry:", registryArtifact.address);
    console.log("Factory:", factoryArtifact.address);

  } catch (error) {
    console.error("❌ Error updating frontend addresses:", error);
    console.log("Make sure you have deployed contracts first!");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
