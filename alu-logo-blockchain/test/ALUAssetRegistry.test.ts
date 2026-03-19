import { expect } from "chai";
import { ethers } from "ethers";

const FAKE_LOGO_HASH = "0xa1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2";
const WRONG_HASH     = "0x1111111111111111111111111111111111111111111111111111111111111111";
const TOTAL_SUPPLY   = ethers.parseUnits("1000000", 18);

// we use dynamic import inside tests to avoid top level await issues
async function getConn() {
  const { network } = await import("hardhat");
  return network.connect();
}

// ================================================================
// ORIGINAL 8 TESTS FROM ASSIGNMENT 1
// ================================================================

describe("ALUAssetRegistry - NFT Contract Tests", function () {

  let registry: any;
  let owner: any;
  let otherUser: any;

  beforeEach(async function () {
    const conn = await getConn();
    [owner, otherUser] = await conn.ethers.getSigners();
    registry = await conn.ethers.deployContract("ALUAssetRegistry");
    await registry.waitForDeployment();
  });

  it("Test 1: ALU logo should register successfully and return token ID", async function () {
    await registry.registerAsset("ALU Official Logo", "PNG", FAKE_LOGO_HASH);
    expect(await registry.ownerOf(1n)).to.equal(owner.address);
    expect(await registry.totalRegistered()).to.equal(1n);
  });

  it("Test 2: Registering same hash twice should be rejected with error", async function () {
    await registry.registerAsset("ALU Official Logo", "PNG", FAKE_LOGO_HASH);
    await expect(
      registry.registerAsset("ALU Official Logo Copy", "PNG", FAKE_LOGO_HASH)
    ).to.be.rejectedWith("Asset with this hash already registered");
  });

  it("Test 3: verifyLogoIntegrity should return true for correct hash", async function () {
    await registry.registerAsset("ALU Official Logo", "PNG", FAKE_LOGO_HASH);
    const [isAuthentic, message] = await registry.verifyLogoIntegrity(1n, FAKE_LOGO_HASH);
    expect(isAuthentic).to.equal(true);
    expect(message).to.equal("Logo is authentic.");
  });

  it("Test 4: verifyLogoIntegrity should return false for incorrect hash", async function () {
    await registry.registerAsset("ALU Official Logo", "PNG", FAKE_LOGO_HASH);
    const [isAuthentic, message] = await registry.verifyLogoIntegrity(1n, WRONG_HASH);
    expect(isAuthentic).to.equal(false);
    expect(message).to.equal("Warning: logo does not match.");
  });

  it("Test 5: getAsset should return correct asset name and file type", async function () {
    await registry.registerAsset("ALU Official Logo", "PNG", FAKE_LOGO_HASH);
    const asset = await registry.getAsset(1n);
    expect(asset.assetName).to.equal("ALU Official Logo");
    expect(asset.fileType).to.equal("PNG");
  });

});

describe("ALULogoToken - ERC20 Token Contract Tests", function () {

  let token: any;
  let owner: any;
  let recipient: any;

  beforeEach(async function () {
    const conn = await getConn();
    [owner, recipient] = await conn.ethers.getSigners();
    token = await conn.ethers.deployContract("ALULogoToken", [owner.address]);
    await token.waitForDeployment();
  });

  it("Test 6: Full supply of 1,000,000 ALUT should be minted to logo owner", async function () {
    const balance = await token.balanceOf(owner.address);
    expect(balance).to.equal(TOTAL_SUPPLY);
  });

  it("Test 7: distributeShares should transfer tokens to recipient", async function () {
    const shareAmount = ethers.parseUnits("100000", 18);
    await token.distributeShares(recipient.address, shareAmount);
    const recipientBalance = await token.balanceOf(recipient.address);
    expect(recipientBalance).to.equal(shareAmount);
  });

  it("Test 8: ownershipPercentage should return correct percentage value", async function () {
    const shareAmount = ethers.parseUnits("500000", 18);
    await token.distributeShares(recipient.address, shareAmount);
    const percentage = await token.ownershipPercentage(recipient.address);
    expect(percentage).to.equal(50n);
  });

});

// ================================================================
// 5 NEW FRONTEND INTEGRATION TESTS FOR ASSIGNMENT 2
// ================================================================

describe("Frontend Integration Tests - Assignment 2", function () {

  let registry: any;
  let token: any;
  let owner: any;
  let recipient: any;

  beforeEach(async function () {
    const conn = await getConn();
    [owner, recipient] = await conn.ethers.getSigners();
    registry = await conn.ethers.deployContract("ALUAssetRegistry");
    await registry.waitForDeployment();
    token = await conn.ethers.deployContract("ALULogoToken", [owner.address]);
    await token.waitForDeployment();
  });

  it("Test 9: Frontend reads total ALUT supply from contract and it equals 1,000,000", async function () {
    const rawSupply = await token.totalSupply();
    const formattedSupply = ethers.formatUnits(rawSupply, 18);
    expect(formattedSupply).to.equal("1000000.0");
    expect(rawSupply).to.equal(TOTAL_SUPPLY);
  });

  it("Test 10: SHA256 hashing function returns correct bytes32 format", async function () {
    const { createHash } = await import("crypto");
    const fakeFileContent = Buffer.from("ALU Official Logo PNG file content simulation");
    const hashHex = createHash("sha256").update(fakeFileContent).digest("hex");
    const bytes32Hash = "0x" + hashHex;
    expect(bytes32Hash).to.have.lengthOf(66);
    expect(bytes32Hash.startsWith("0x")).to.equal(true);
    const tx = await registry.registerAsset("Test Logo", "PNG", bytes32Hash);
    await tx.wait();
    expect(await registry.ownerOf(1n)).to.equal(owner.address);
  });

  it("Test 11: Frontend verify shows success when correct hash is provided", async function () {
    await registry.registerAsset("ALU Official Logo", "PNG", FAKE_LOGO_HASH);
    const [isAuthentic, message] = await registry.verifyLogoIntegrity(1n, FAKE_LOGO_HASH);
    expect(isAuthentic).to.equal(true);
    expect(message).to.equal("Logo is authentic.");
    const asset = await registry.getAsset(1n);
    expect(asset.assetName).to.equal("ALU Official Logo");
    expect(asset.registeredBy).to.equal(owner.address);
  });

  it("Test 12: Frontend verify shows failure when incorrect hash is provided", async function () {
    await registry.registerAsset("ALU Official Logo", "PNG", FAKE_LOGO_HASH);
    const [isAuthentic, message] = await registry.verifyLogoIntegrity(1n, WRONG_HASH);
    expect(isAuthentic).to.equal(false);
    expect(message).to.equal("Warning: logo does not match.");
  });

  it("Test 13: distributeShares updates recipient balance correctly after transfer", async function () {
    const balanceBefore = await token.balanceOf(recipient.address);
    expect(balanceBefore).to.equal(0n);
    const distributeAmount = ethers.parseUnits("250000", 18);
    const tx = await token.distributeShares(recipient.address, distributeAmount);
    await tx.wait();
    const balanceAfter = await token.balanceOf(recipient.address);
    expect(balanceAfter).to.equal(distributeAmount);
    const percentage = await token.ownershipPercentage(recipient.address);
    expect(percentage).to.equal(25n);
    const ownerBalance = await token.balanceOf(owner.address);
    expect(ownerBalance).to.equal(ethers.parseUnits("750000", 18));
  });

});