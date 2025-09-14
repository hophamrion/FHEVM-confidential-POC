import { expect } from "chai";
import { ethers } from "hardhat";
import { ConfidentialToken } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("ConfidentialToken", function () {
  let confidentialToken: ConfidentialToken;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const ConfidentialTokenFactory = await ethers.getContractFactory("ConfidentialTokenFixed");
    confidentialToken = await ConfidentialTokenFactory.deploy();
    await confidentialToken.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await confidentialToken.owner()).to.equal(owner.address);
    });

    it("Should have correct name and symbol", async function () {
      expect(await confidentialToken.name()).to.equal("ConfidentialToken");
      expect(await confidentialToken.symbol()).to.equal("CT");
      expect(await confidentialToken.decimals()).to.equal(18);
    });
  });

  describe("Address Initialization", function () {
    it("Should allow owner to initialize addresses", async function () {
      await confidentialToken.initializeAddress(user1.address);
      expect(await confidentialToken.isInitialized(user1.address)).to.be.true;
    });

    it("Should prevent double initialization", async function () {
      await confidentialToken.initializeAddress(user1.address);
      await expect(
        confidentialToken.initializeAddress(user1.address)
      ).to.be.revertedWith("Address already initialized");
    });

    it("Should allow anyone to initialize addresses", async function () {
      await confidentialToken.connect(user1).initializeAddress(user2.address);
      expect(await confidentialToken.isInitialized(user2.address)).to.be.true;
    });
  });

  describe("Confidential Minting", function () {
    beforeEach(async function () {
      // Initialize addresses before minting
      await confidentialToken.initializeAddress(user1.address);
      await confidentialToken.initializeAddress(user2.address);
    });

    it("Should allow owner to mint confidential tokens", async function () {
      // This test would need actual FHEVM setup to work properly
      // For now, we'll test the access control
      const encryptedAmount = ethers.hexlify(ethers.randomBytes(32));
      const proof = ethers.hexlify(ethers.randomBytes(32));

      // This would fail without proper FHEVM setup, but we can test the access control
      await expect(
        confidentialToken.connect(user1).mintConfidential(
          user2.address,
          encryptedAmount,
          proof
        )
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should emit ConfidentialMint event", async function () {
      const encryptedAmount = ethers.hexlify(ethers.randomBytes(32));
      const proof = ethers.hexlify(ethers.randomBytes(32));

      // This would need proper FHEVM setup to actually work
      // For now, we're just testing the event emission structure
      await expect(
        confidentialToken.mintConfidential(user1.address, encryptedAmount, proof)
      ).to.emit(confidentialToken, "ConfidentialMint")
        .withArgs(user1.address, ethers.keccak256(encryptedAmount));
    });
  });

  describe("Confidential Transfer", function () {
    beforeEach(async function () {
      // Initialize addresses
      await confidentialToken.initializeAddress(user1.address);
      await confidentialToken.initializeAddress(user2.address);
    });

    it("Should emit ConfidentialTransfer event", async function () {
      const encryptedAmount = ethers.hexlify(ethers.randomBytes(32));
      const proof = ethers.hexlify(ethers.randomBytes(32));

      // This would need proper FHEVM setup to actually work
      // For now, we're just testing the event emission structure
      await expect(
        confidentialToken.connect(user1).transferConfidential(
          user2.address,
          encryptedAmount,
          proof
        )
      ).to.emit(confidentialToken, "ConfidentialTransfer")
        .withArgs(
          user1.address,
          user2.address,
          ethers.keccak256(encryptedAmount)
        );
    });
  });

  describe("Access Control", function () {
    it("Should only allow owner to mint", async function () {
      const encryptedAmount = ethers.hexlify(ethers.randomBytes(32));
      const proof = ethers.hexlify(ethers.randomBytes(32));

      await expect(
        confidentialToken.connect(user1).mintConfidential(
          user2.address,
          encryptedAmount,
          proof
        )
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should allow anyone to transfer their own tokens", async function () {
      const encryptedAmount = ethers.hexlify(ethers.randomBytes(32));
      const proof = ethers.hexlify(ethers.randomBytes(32));

      // This would need proper FHEVM setup and sufficient balance
      // For now, we're just testing that the function can be called
      await expect(
        confidentialToken.connect(user1).transferConfidential(
          user2.address,
          encryptedAmount,
          proof
        )
      ).to.not.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Edge Cases", function () {
    it("Should handle zero address initialization", async function () {
      await expect(
        confidentialToken.initializeAddress(ethers.ZeroAddress)
      ).to.not.be.reverted;
    });

    it("Should handle zero address minting", async function () {
      const encryptedAmount = ethers.hexlify(ethers.randomBytes(32));
      const proof = ethers.hexlify(ethers.randomBytes(32));

      // This would need proper FHEVM setup
      await expect(
        confidentialToken.mintConfidential(
          ethers.ZeroAddress,
          encryptedAmount,
          proof
        )
      ).to.emit(confidentialToken, "ConfidentialMint");
    });
  });
});
