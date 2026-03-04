# ALU Logo Blockchain Protection System

## About This Project

This project use the Ethereum blockchain to protect the official ALU logo from being copied or falsely claimed by unauthorised parties. We built two smart contracts that work together — the first one is `ALUAssetRegistry` which register the logo as a unique NFT on the blockchain so there is a permanent record of ownership. The second one is `ALULogoToken` which split that ownership into 1,000,000 digital tokens (ALUT) so that ALU can distribute shares of the logo to faculty, students, or administrators. Together these two contracts form a complete digital ownership system that nobody can tamper with.

---

## SHA-256 Hash of the ALU Logo

This is the hash of the official ALU logo file that was registered on the blockchain. Anyone can hash the logo file themselves and compare it to this value to verify authenticity:

```
0x10c50a139c35cc94ef6bd716e43ddddb199eb1a0b844f5854bad3c30655c4ccc
```

---

## Project Structure

```
alu-logo-blockchain/
├── contracts/
│   ├── ALUAssetRegistry.sol     ← ERC-721 NFT registration contract
│   └── ALULogoToken.sol         ← ERC-20 ownership token contract
├── scripts/
│   └── deploy.js                ← deploys both contracts to blockchain
├── test/
│   └── ALUAssetRegistry.test.js ← all 8 automated tests
├── alu-logo.png                 ← the actual ALU logo file
├── hardhat.config.js            ← hardhat configuration
├── .env                         ← private keys and RPC URL (never commit this)
└── package.json                 ← project dependencies
```

---

## How to Install and Run

### Step 1 — Install Node.js
Make sure you have Node.js version 18 or higher installed on your machine:
```bash
node --version
npm --version
```

### Step 2 — Clone the project and install dependencies
```bash
git clone <your-github-repo-link>
cd alu-logo-blockchain
npm install
```

### Step 3 — Set up your environment variables
Create a `.env` file in the root folder with these values:
```
SEPOLIA_RPC_URL=your_alchemy_sepolia_url_here
SEPOLIA_PRIVATE_KEY=your_metamask_private_key_here
```
You can get a free Alchemy RPC URL from alchemy.com and a Sepolia private key from MetaMask.

### Step 4 — Compile the contracts
```bash
npx hardhat compile
```
You should see: `Compiled X Solidity files successfully`

### Step 5 — Run the automated tests
```bash
npx hardhat test
```
All 8 tests should pass with green checkmarks.

### Step 6 — Generate the ALU logo SHA-256 hash
Make sure the `alu-logo.png` file is in the root folder, then run:
```bash
node -e "const crypto=require('crypto'),fs=require('fs');console.log('0x'+crypto.createHash('sha256').update(fs.readFileSync('alu-logo.png')).digest('hex'));"
```

### Step 7 — Deploy to local blockchain (for testing)
Open a new terminal and start the local node:
```bash
npx hardhat node
```
Then in original terminal run:
```bash
npx hardhat run scripts/deploy.js --network localhost
```

### Step 8 — Deploy to Sepolia Testnet (real deployment)
```bash
npx hardhat run scripts/deploy.js --network sepolia
```
Make sure you have Sepolia test ETH from sepoliafaucet.com before doing this.

---

## Versions Used

| Tool | Version |
|------|---------|
| Solidity | 0.8.20 |
| Hardhat | Latest (v2+) |
| Node.js | 20.x |
| OpenZeppelin Contracts | 5.x |

---

## Problems We Ran Into and How We Fixed Them

**Problem 1** — When we first tried to run Hardhat, we got the error `require is not defined in ES module scope`. This happen because the `package.json` had `"type": "module"` which force all JS files to use ES module syntax. We fixed it by removing that line from `package.json`.

**Problem 2** — The test file was saved as `.ts` (TypeScript) instead of `.js` (JavaScript). This cause TypeScript errors about missing types. We deleted the `.ts` file and created a fresh `.js` version.

**Problem 3** — The deploy script was using `import` and top-level `await` which only work in TypeScript. We rewrote it using `require()` and wrapped everything in an `async function main()`.

**Problem 4** — When deploying to Sepolia, we got `Expected a URL` error because `.env` file had a typo — `EPOLIA_RPC_URL` instead of `SEPOLIA_RPC_URL` (missing the S). Fixed by correcting the variable name. 