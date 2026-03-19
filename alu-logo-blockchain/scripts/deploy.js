// deployment script for ALUAssetRegistry and ALULogoToken
// run with: npx hardhat compile && npx hardhat run scripts/deploy.js --network sepolia

import { config as loadEnv } from "dotenv";
import { ethers } from "ethers";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

loadEnv();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const artifactsPath = path.join(__dirname, "..", "artifacts", "contracts");

function loadArtifact(contractFile, contractName) {
  const fullPath = path.join(artifactsPath, contractFile, `${contractName}.json`);
  const raw = fs.readFileSync(fullPath, "utf8");
  const json = JSON.parse(raw);
  return { abi: json.abi, bytecode: json.bytecode };
}

async function main() {
  const rpcUrl = process.env.SEPOLIA_RPC_URL;
  const privateKey = process.env.SEPOLIA_PRIVATE_KEY;

  if (!rpcUrl || !privateKey) {
    throw new Error("Missing SEPOLIA_RPC_URL or SEPOLIA_PRIVATE_KEY in .env");
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  const deployerAddress = await wallet.getAddress();
  console.log("Deploying with wallet:", deployerAddress);

  // deploy ALUAssetRegistry
  console.log("\n--- Deploying ALUAssetRegistry ---");
  const registryArtifact = loadArtifact("ALUAssetRegistry.sol", "ALUAssetRegistry");
  const RegistryFactory = new ethers.ContractFactory(
    registryArtifact.abi,
    registryArtifact.bytecode,
    wallet
  );
  const registry = await RegistryFactory.deploy();
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log("ALUAssetRegistry deployed to:", registryAddress);

  // register the ALU logo - this is the real SHA256 hash of alu-logo.png
  console.log("\n--- Registering ALU Logo ---");
  const logoHash = "0x10c50a139c35cc94ef6bd716e43ddddb199eb1a0b844f5854bad3c30655c4ccc";
  const tx = await registry.registerAsset("ALU Official Logo", "PNG", logoHash);
  await tx.wait();
  console.log("ALU Logo registered! tx:", tx.hash);

  // deploy ALULogoToken
  console.log("\n--- Deploying ALULogoToken ---");
  const tokenArtifact = loadArtifact("ALULogoToken.sol", "ALULogoToken");
  const TokenFactory = new ethers.ContractFactory(
    tokenArtifact.abi,
    tokenArtifact.bytecode,
    wallet
  );
  const token = await TokenFactory.deploy(deployerAddress);
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("ALULogoToken deployed to:", tokenAddress);

  const balance = await token.balanceOf(deployerAddress);
  console.log("Token balance:", ethers.formatUnits(balance, 18), "ALUT");

  console.log("\n✅ DONE! Save these addresses:");
  console.log("ALUAssetRegistry:", registryAddress);
  console.log("ALULogoToken:", tokenAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});