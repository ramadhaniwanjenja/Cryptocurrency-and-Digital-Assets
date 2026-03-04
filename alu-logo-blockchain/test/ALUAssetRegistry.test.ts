import { expect } from "chai";
import hre from "hardhat";

const { ethers } = await hre.network.connect();

const FAKE_LOGO_HASH =
  "0xa1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2";
const WRONG_HASH =
  "0x1111111111111111111111111111111111111111111111111111111111111111";

describe("ALUAssetRegistry - NFT Contract Tests", function () {
  let registry: any;
  let owner: any;
  let otherUser: any;

  beforeEach(async function () {
    [owner, otherUser] = await ethers.getSigners();
    registry = await ethers.deployContract("ALUAssetRegistry");
  });

  it("Test 1: ALU logo should register successfully and return token ID", async function () {
    await registry.registerAsset("ALU Official Logo", "PNG", FAKE_LOGO_HASH);
    expect(await registry.ownerOf(1n)).to.equal(owner.address);
    expect(await registry.totalRegistered()).to.equal(1n);
  });

  it("Test 2: Registering same hash twice should be rejected with error", async function () {
    await registry.registerAsset("ALU Official Logo", "PNG", FAKE_LOGO_HASH);
    await expect(
      registry.registerAsset("ALU Official Logo Copy", "PNG", FAKE_LOGO_HASH),
    ).to.be.revertedWith("Asset with this hash already registered");
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

  const TOTAL_SUPPLY = ethers.parseUnits("1000000", 18);

  beforeEach(async function () {
    [owner, recipient] = await ethers.getSigners();
    token = await ethers.deployContract("ALULogoToken", [owner.address]);
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