// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// importing ERC721 standard from openzeppelin for NFT functionality
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
// importing ownable so only the owner can do certain things
import "@openzeppelin/contracts/access/Ownable.sol";
// importing reentrancy guard to prevent reentrancy attacks
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title ALUAssetRegistry
/// @notice This contract register the ALU logo as a unique NFT on ethereum blockchain
/// @dev Extends ERC721 standard from OpenZeppelin with security features
contract ALUAssetRegistry is ERC721, Ownable, ReentrancyGuard {

    // counter to track how many assets has been registered
    // we start from 0 and increment before minting so first token ID is 1
    uint256 private _tokenIdCounter;

    /// @notice This struct store all informations about each registered asset
    /// @dev Packed into a single storage slot where possible for gas efficiency
    struct AssetMetadata {
        string assetName;        // the name of the asset e.g "ALU Official Logo"
        string fileType;         // the file type e.g "PNG" or "SVG"
        bytes32 contentHash;     // SHA256 fingerprint of the actual file
        address registeredBy;    // wallet address of who registered this asset
        uint256 timestamp;       // unix timestamp of when it was registered
    }

    // mapping from token ID to its full metadata struct
    // anyone can lookup a token and see all its registration details
    mapping(uint256 => AssetMetadata) private _assetData;

    // mapping to check if a content hash already been registered
    // this prevent same file from being registered more than one time
    mapping(bytes32 => bool) private _hashExists;

    /// @notice Event emitted every time a new asset is successfully registered
    /// @dev Indexed fields allow efficient filtering in event logs
    event AssetRegistered(
        uint256 indexed tokenId,
        string assetName,
        bytes32 indexed contentHash,
        address indexed registeredBy,
        uint256 timestamp
    );

    /// @notice Constructor runs once when contract is deployed
    /// @dev Sets the NFT collection name, symbol, and the contract owner
    constructor() ERC721("ALU Asset Registry", "ALUAR") Ownable(msg.sender) {}

    /// @notice Register a new digital asset on the blockchain as NFT
    /// @dev Mints ERC721 token and stores metadata permanently on chain
    /// @param assetName The name of the asset being registered
    /// @param fileType The file type of the asset e.g PNG
    /// @param contentHash The SHA256 hash of the actual file as bytes32
    /// @return newTokenId The ID of the newly minted NFT token
    function registerAsset(
        string memory assetName,
        string memory fileType,
        bytes32 contentHash
    ) public nonReentrant returns (uint256) {

        // security check: make sure asset name is not empty string
        require(bytes(assetName).length > 0, "Asset name cannot be empty");

        // security check: make sure file type is not empty string
        require(bytes(fileType).length > 0, "File type cannot be empty");

        // security check: make sure the content hash is not zero value
        require(contentHash != bytes32(0), "Content hash cannot be zero");

        // security check: reject if this exact file was already registered before
        // this prevent someone from registering the same logo twice
        require(!_hashExists[contentHash], "Asset with this hash already registered");

        // increment counter first before minting (checks-effects-interactions pattern)
        _tokenIdCounter += 1;
        uint256 newTokenId = _tokenIdCounter;

        // mint the NFT to the person who calling this function
        // _safeMint checks that receiver can handle ERC721 tokens safely
        _safeMint(msg.sender, newTokenId);

        // store all the metadata for this token permanently on blockchain
        _assetData[newTokenId] = AssetMetadata({
            assetName: assetName,
            fileType: fileType,
            contentHash: contentHash,
            registeredBy: msg.sender,
            timestamp: block.timestamp
        });

        // mark this hash as used so nobody can register same file again
        _hashExists[contentHash] = true;

        // emit the event so the registration is permanently logged
        emit AssetRegistered(newTokenId, assetName, contentHash, msg.sender, block.timestamp);

        return newTokenId;
    }

    /// @notice Verify whether a logo file is the authentic registered version
    /// @dev Pure comparison between stored hash and provided hash, no gas cost
    /// @param tokenId The token ID of the registered asset to check against
    /// @param contentHash The SHA256 hash of the file you want to verify
    /// @return isAuthentic True if hashes match, false if they dont
    /// @return message Human readable result message
    function verifyLogoIntegrity(
        uint256 tokenId,
        bytes32 contentHash
    ) public view returns (bool isAuthentic, string memory message) {

        // get the hash that was stored when the asset was originally registered
        bytes32 storedHash = _assetData[tokenId].contentHash;

        // compare the stored hash with the hash the caller provided
        if (storedHash == contentHash) {
            return (true, "Logo is authentic.");
        } else {
            return (false, "Warning: logo does not match.");
        }
    }

    /// @notice Get all metadata for a registered asset by its token ID
    /// @dev Returns the full AssetMetadata struct for public lookup
    /// @param tokenId The token ID to look up
    /// @return The full AssetMetadata struct with all registration details
    function getAsset(uint256 tokenId) public view returns (AssetMetadata memory) {
        // security check: make sure this token actually exist before returning data
        require(_tokenIdCounter >= tokenId && tokenId > 0, "Token does not exist");
        return _assetData[tokenId];
    }

    /// @notice Get the total number of assets registered so far
    /// @return The current token counter value
    function totalRegistered() public view returns (uint256) {
        return _tokenIdCounter;
    }
}
