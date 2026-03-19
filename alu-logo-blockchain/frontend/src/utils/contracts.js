import { ethers } from "ethers";
import ALUAssetRegistryABI from "./ALUAssetRegistryABI";
import ALULogoTokenABI from "./ALULogoTokenABI";
import CONTRACT_ADDRESSES from "./contractAddresses";

// this function check if metamask is installed in the browser
export function isWalletInstalled() {
  return typeof window.ethereum !== "undefined";
}

// this function connect to the user wallet and return the provider and signer
// provider = read only connection to blockchain
// signer = connection with user wallet that can send transactions
export async function connectWallet() {
  if (!isWalletInstalled()) {
    throw new Error("No wallet found. Please install MetaMask.");
  }

  // this ask the user to approve the wallet connection popup
  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();

  return { provider, signer, address };
}

// this function return the ALUAssetRegistry contract instance
// if signer is passed it can write transactions
// if only provider is passed it is read only
export function getRegistryContract(signerOrProvider) {
  return new ethers.Contract(
    CONTRACT_ADDRESSES.ALUAssetRegistry,
    ALUAssetRegistryABI,
    signerOrProvider
  );
}

// this function return the ALULogoToken contract instance
export function getTokenContract(signerOrProvider) {
  return new ethers.Contract(
    CONTRACT_ADDRESSES.ALULogoToken,
    ALULogoTokenABI,
    signerOrProvider
  );
}

// this function hash a file in the browser using Web Crypto API
// no server needed - everything happen locally
export async function hashFile(file) {
  // read the file as an array buffer (raw bytes)
  const arrayBuffer = await file.arrayBuffer();

  // use the browser built-in crypto to compute SHA256 hash
  const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);

  // convert the hash buffer to a hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

  // return with 0x prefix so it work as bytes32 in solidity
  return "0x" + hashHex;
}

// this function shorten a wallet address for display
// turns 0x1234567890abcdef into 0x1234...cdef
export function shortenAddress(address) {
  if (!address) return "";
  return address.slice(0, 6) + "..." + address.slice(-4);
}

// this function format a unix timestamp to readable date
export function formatDate(timestamp) {
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
