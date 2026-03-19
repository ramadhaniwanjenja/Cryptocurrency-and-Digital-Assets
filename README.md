# ALU Logo Blockchain dApp — Assignment 2

## About This Project

This project is a fully working decentralised application (dApp) that connect to the two smart contracts we built in Assignment 1. The frontend is built using React and ethers.js, and it allow any user to connect their MetaMask wallet, upload the ALU logo, verify its authenticity, and see who holds ownership shares — all from a clean web interface. The two contracts — ALUAssetRegistry (ERC-721) and ALULogoToken (ERC-20) — serve as the backend, and this React app is the front door that make them accessible to real users without any technical knowledge.

---

## SHA-256 Hash of the ALU Logo

This is the hash of the official ALU logo file registered on Sepolia testnet. Anyone can hash the logo file and compare:

```
0x10c50a139c35cc94ef6bd716e43ddddb199eb1a0b844f5854bad3c30655c4ccc
```

---

## Deployed Contract Addresses (Sepolia Testnet)

| Contract | Address |
|----------|---------|
| ALUAssetRegistry | 0xE20DD6c3C8DAfEf4c46298Dc4dff097329daB2D7 |
| ALULogoToken | 0xA6b287cc2d6df505a10a12f50637657F362C1418 |

---

## Project Structure

```
alu-logo-blockchain/
├── contracts/
│   ├── ALUAssetRegistry.sol      ← ERC-721 NFT registration contract
│   └── ALULogoToken.sol          ← ERC-20 ownership token contract
├── scripts/
│   └── deploy.js                 ← deploys both contracts
├── test/
│   └── ALUAssetRegistry.test.ts  ← all 13 automated tests
├── frontend/
│   ├── src/
│   │   ├── App.jsx               ← main app with routing
│   │   ├── components/
│   │   │   └── Navbar.jsx        ← navigation and wallet connection
│   │   ├── pages/
│   │   │   ├── Home.jsx          ← landing page
│   │   │   ├── Register.jsx      ← asset registration page
│   │   │   ├── Verify.jsx        ← logo verification page
│   │   │   └── Dashboard.jsx     ← token ownership dashboard
│   │   └── utils/
│   │       ├── contracts.js      ← ethers.js helpers and hashing
│   │       ├── contractAddresses.js ← deployed contract addresses
│   │       ├── ALUAssetRegistryABI.js ← registry contract ABI
│   │       └── ALULogoTokenABI.js    ← token contract ABI
│   └── package.json
├── alu-logo.png                  ← the actual ALU logo file
├── hardhat.config.ts             ← hardhat configuration
├── .env                          ← private keys (never commit this)
└── package.json
```

---

## How the Frontend Connects to the Contracts

The frontend use ethers.js to create contract instances using the ABI and deployed address of each contract. When a user connect their MetaMask wallet, ethers.js use the wallet as a signer so any transaction the user send is signed by their private key. Read-only calls like verifyLogoIntegrity go through a public RPC provider and cost no gas.

---

## How to Install and Run

### Step 1 — Make sure you have Node.js 22
```bash
node --version  # should show v22.x.x
```

### Step 2 — Clone the repo and install root dependencies
```bash
git clone https://github.com/yourusername/alu-logo-blockchain
cd alu-logo-blockchain
npm install
```

### Step 3 — Set up environment variables
Create a `.env` file in the root folder:
```
SEPOLIA_RPC_URL=your_alchemy_sepolia_url
SEPOLIA_PRIVATE_KEY=your_metamask_private_key
```

### Step 4 — Compile the contracts
```bash
npx hardhat compile
```

### Step 5 — Run all 13 tests
```bash
export PATH="$HOME/.nvm/versions/node/v22.22.1/bin:$PATH"
npx hardhat test
```

All 13 tests should pass with green checkmarks.

### Step 6 — Install frontend dependencies
```bash
cd frontend
npm install
```

### Step 7 — Run the frontend development server
```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

### Step 8 — Deploy to Sepolia (optional, already deployed)
```bash
cd ..
npx hardhat run scripts/deploy.js --network sepolia
```

---

## How to Connect Wallet and Use Each Feature

### Connecting Your Wallet
1. Install MetaMask browser extension from metamask.io
2. Switch MetaMask to Sepolia testnet
3. Get free Sepolia ETH from sepoliafaucet.com
4. Click "Connect Wallet" in the navbar
5. Approve the connection in MetaMask

### Register Page
1. Go to `/register`
2. Upload any image file
3. The SHA-256 hash is computed automatically in your browser
4. Enter an asset name and confirm the file type
5. Click "Register Asset" and approve the MetaMask transaction
6. You will receive an NFT as proof of registration

### Verify Page
1. Go to `/verify` — no wallet needed
2. Upload any logo file you want to check
3. The hash is computed in the browser automatically
4. Click "Verify Now" to check against the blockchain
5. Green checkmark means authentic, red warning means fake or modified

### Dashboard Page
1. Go to `/dashboard`
2. Connect your wallet to see your token balance and ownership percentage
3. If you are the contract owner you will see the distribution form
4. Enter a recipient address and amount to distribute ALUT tokens

---

## Versions Used

| Tool | Version |
|------|---------|
| Solidity | 0.8.28 |
| Hardhat | 3.1.10 |
| Node.js | 22.22.1 |
| React | 18+ |
| ethers.js | 6.x |
| Vite | 8.x |
| OpenZeppelin Contracts | 5.x |

---

## Known Issues and Limitations

1. **MetaMask network detection** — After connecting, if MetaMask is on the wrong network, the app show a yellow warning banner. User must manually switch to Sepolia in MetaMask and reconnect.

2. **Node version sensitivity** — This project require exactly Node 22. Node 24 cause a top-level await warning in Hardhat v3. Use nvm to switch: `nvm use 22`.

3. **balanceOf error on wrong network** — If MetaMask is on Ethereum mainnet instead of Sepolia, the balanceOf call will fail with a BAD_DATA error. We handle this gracefully and show 0 ALUT balance instead of crashing.

4. **Read-only verification** — The verify page use a hardcoded Alchemy RPC URL. In production this should be an environment variable.

---

## Problems We Ran Into and How We Fixed Them

**Problem 1** — `package.json` had `"type": "module"` which conflict with CommonJS require syntax. We had to rewrite all scripts and configs to use proper ESM syntax.

**Problem 2** — Node.js v24 is not supported by Hardhat v3. We use nvm to switch to Node 22 which is the required LTS version.

**Problem 3** — The test file was originally in JavaScript but the project is TypeScript. We rewrote it in TypeScript using the correct `network.connect()` API from hardhat-ethers.

**Problem 4** — MetaMask was connecting on Ethereum mainnet instead of Sepolia, causing all contract calls to fail. Fixed by adding a network detection check and showing a warning banner.

**Problem 5** — `revertedWith` chai matcher does not exist in this version of hardhat-ethers-chai-matchers. We changed all assertions to use `rejectedWith` instead.
