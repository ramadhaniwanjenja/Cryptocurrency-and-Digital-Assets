// Full ABI for ALUAssetRegistry contract
const ALUAssetRegistryABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {"internalType": "string","name": "assetName","type": "string"},
      {"internalType": "string","name": "fileType","type": "string"},
      {"internalType": "bytes32","name": "contentHash","type": "bytes32"}
    ],
    "name": "registerAsset",
    "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256","name": "tokenId","type": "uint256"},
      {"internalType": "bytes32","name": "contentHash","type": "bytes32"}
    ],
    "name": "verifyLogoIntegrity",
    "outputs": [
      {"internalType": "bool","name": "isAuthentic","type": "bool"},
      {"internalType": "string","name": "message","type": "string"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256","name": "tokenId","type": "uint256"}],
    "name": "getAsset",
    "outputs": [
      {
        "components": [
          {"internalType": "string","name": "assetName","type": "string"},
          {"internalType": "string","name": "fileType","type": "string"},
          {"internalType": "bytes32","name": "contentHash","type": "bytes32"},
          {"internalType": "address","name": "registeredBy","type": "address"},
          {"internalType": "uint256","name": "timestamp","type": "uint256"}
        ],
        "internalType": "struct ALUAssetRegistry.AssetMetadata",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalRegistered",
    "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256","name": "tokenId","type": "uint256"}],
    "name": "ownerOf",
    "outputs": [{"internalType": "address","name": "","type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true,"internalType": "uint256","name": "tokenId","type": "uint256"},
      {"indexed": false,"internalType": "string","name": "assetName","type": "string"},
      {"indexed": true,"internalType": "bytes32","name": "contentHash","type": "bytes32"},
      {"indexed": true,"internalType": "address","name": "registeredBy","type": "address"},
      {"indexed": false,"internalType": "uint256","name": "timestamp","type": "uint256"}
    ],
    "name": "AssetRegistered",
    "type": "event"
  }
];

export default ALUAssetRegistryABI;