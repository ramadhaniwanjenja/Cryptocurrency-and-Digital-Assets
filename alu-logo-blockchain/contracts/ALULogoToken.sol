// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// importing ERC20 standard from openzeppelin for fungible token functionality
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// importing ownable so only the contract owner can distribute shares
import "@openzeppelin/contracts/access/Ownable.sol";
// importing reentrancy guard to protect against reentrancy attacks
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @title ALULogoToken
/// @notice This contract create ownership share tokens for the ALU logo
/// @dev Extends ERC20 standard. 1,000,000 tokens represent 100% ownership of logo
contract ALULogoToken is ERC20, Ownable, ReentrancyGuard {

    // the total supply is fixed at exactly 1 million tokens
    // we multiply by 10**18 because ERC20 tokens have 18 decimal places
    // this number never change after the contract is deployed
    uint256 public constant TOTAL_SUPPLY = 1_000_000 * 10 ** 18;

    /// @notice Event emitted when owner distribute shares to someone
    /// @dev Helps track all share distributions transparently on blockchain
    event SharesDistributed(
        address indexed recipient,
        uint256 amount,
        uint256 timestamp
    );

    /// @notice Constructor runs once when contract is deployed
    /// @dev Mints all 1 million tokens to the logoOwner address immediately
    /// @param logoOwner The wallet address that will receive all tokens (ALU)
    constructor(address logoOwner)
        ERC20("ALU Logo Token", "ALUT")
        Ownable(logoOwner)
    {
        // security check: make sure the logo owner is not zero address
        require(logoOwner != address(0), "Logo owner cannot be zero address");

        // mint all 1 million tokens to the logo owner right away
        // this mean ALU start with 100% ownership of the logo
        _mint(logoOwner, TOTAL_SUPPLY);
    }

    /// @notice Distribute ownership shares to a recipient wallet
    /// @dev Only the contract owner (ALU) can call this function
    /// @param recipient The wallet address to receive the shares
    /// @param amount The number of ALUT tokens to transfer (include 18 decimals)
    function distributeShares(
        address recipient,
        uint256 amount
    ) public onlyOwner nonReentrant {

        // security check: make sure recipient is not the zero address
        require(recipient != address(0), "Recipient cannot be zero address");

        // security check: amount must be more than zero
        // it dont make sense to distribute nothing
        require(amount > 0, "Amount must be greater than zero");

        // security check: owner must have enough tokens to distribute
        require(balanceOf(owner()) >= amount, "Not enough tokens to distribute");

        // transfer tokens from owner balance to the recipient wallet
        // this is how ALU hand over a portion of logo ownership to stakeholders
        _transfer(owner(), recipient, amount);

        // emit event to log this distribution permanently on blockchain
        emit SharesDistributed(recipient, amount, block.timestamp);
    }

    /// @notice Calculate the ownership percentage of any wallet address
    /// @dev Returns whole number percentage based on token balance vs total supply
    /// @param wallet The wallet address to check ownership for
    /// @return The ownership percentage as a whole number (e.g 50 means 50%)
    function ownershipPercentage(address wallet) public view returns (uint256) {

        // get the current token balance of this wallet
        uint256 balance = balanceOf(wallet);

        // if balance is zero just return 0 immediately, no need to calculate
        if (balance == 0) return 0;

        // calculate percentage: (balance / total supply) * 100
        // we multiply first before dividing to avoid losing precision
        uint256 percentage = (balance * 100) / TOTAL_SUPPLY;

        return percentage;
    }
}
