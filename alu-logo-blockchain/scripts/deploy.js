// Deployment script for ALUAssetRegistry and ALULogoToken on any network
// Run with: npx hardhat run scripts/deploy.js --network <network>

import hre from "hardhat";

const { ethers } = await hre.network.connect();

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with wallet:", deployer.address);

  console.log("\n--- Deploying ALUAssetRegistry ---");
  const registry = await ethers.deployContract("ALUAssetRegistry");
  const registryAddress = await registry.getAddress();
  console.log("ALUAssetRegistry deployed to:", registryAddress);

  console.log("\n--- Registering ALU Logo ---");
  const logoHash =
    "0x10c50a139c35cc94ef6bd716e43ddddb199eb1a0b844f5854bad3c30655c4ccc";

  const tx = await registry.registerAsset(
    "ALU Official Logo",
    "PNG",
    logoHash,
  );
  await tx.wait();
  console.log("ALU Logo registered! Transaction hash:", tx.hash);

  console.log("\n--- Deploying ALULogoToken ---");
  const token = await ethers.deployContract("ALULogoToken", [deployer.address]);
  const tokenAddress = await token.getAddress();
  console.log("ALULogoToken deployed to:", tokenAddress);

  const balance = await token.balanceOf(deployer.address);
  console.log("Deployer token balance:", ethers.formatUnits(balance, 18), "ALUT");

  console.log("\n✅ All done! Both contracts deployed and logo registered.");
  console.log("Registry contract:", registryAddress);
  console.log("Token contract:", tokenAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});