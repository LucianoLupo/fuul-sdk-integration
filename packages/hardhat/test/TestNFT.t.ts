import { expect } from "chai";
import { ethers } from "hardhat";
import { TestNFT } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("TestNFT", () => {
  let testNFT: TestNFT;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;

  const baseURI = "https://api.testnft.com/";

  beforeEach(async () => {
    [owner, addr1, addr2] = await ethers.getSigners();
    const TestNFTFactory = await ethers.getContractFactory("TestNFT");
    testNFT = (await TestNFTFactory.deploy(baseURI, owner)) as TestNFT;
  });

  describe("Deployment", () => {
    it("Should set the right owner", async () => {
      expect(await testNFT.owner()).to.equal(owner.address);
    });
  });

  describe("NFT Creation", () => {
    it("Should create a new NFT type", async () => {
      const tokenId = 1;
      const category = 0; // Art
      const maxSupply = 100;
      const price = ethers.parseEther("0.1");

      await expect(testNFT.createNFT(tokenId, category, maxSupply, price))
        .to.emit(testNFT, "NFTCreated")
        .withArgs(tokenId, category, maxSupply);

      const nftInfo = await testNFT.nftInfo(tokenId);
      expect(nftInfo.category).to.equal(category);
      expect(nftInfo.maxSupply).to.equal(maxSupply);
      expect(nftInfo.price).to.equal(price);
      expect(nftInfo.active).to.equal(true);
    });

    it("Should prevent creating duplicate NFTs", async () => {
      const tokenId = 1;
      await testNFT.createNFT(tokenId, 0, 100, ethers.parseEther("0.1"));

      await expect(testNFT.createNFT(tokenId, 0, 100, ethers.parseEther("0.1"))).to.be.revertedWith(
        "NFT already exists",
      );
    });
  });

  describe("Minting", () => {
    const tokenId = 1;
    const price = ethers.parseEther("0.1");

    beforeEach(async () => {
      await testNFT.createNFT(tokenId, 0, 100, price);
    });

    it("Should mint an NFT when sufficient payment is made", async () => {
      await expect(testNFT.connect(addr1).mint(tokenId, { value: price }))
        .to.emit(testNFT, "NFTMinted")
        .withArgs(addr1.address, tokenId);

      expect(await testNFT.balanceOf(addr1.address, tokenId)).to.equal(1);
    });

    it("Should enforce category limits", async () => {
      const tokenId2 = 2;
      await testNFT.createNFT(tokenId2, 0, 100, price); // Another Art NFT

      await testNFT.connect(addr1).mint(tokenId, { value: price });
      await testNFT.connect(addr1).mint(tokenId2, { value: price });

      await expect(testNFT.connect(addr1).mint(tokenId, { value: price })).to.be.revertedWith("Category limit reached");
    });

    it("Should enforce max supply", async () => {
      const lowSupplyTokenId = 3;
      await testNFT.createNFT(lowSupplyTokenId, 0, 1, price);

      await testNFT.connect(addr1).mint(lowSupplyTokenId, { value: price });

      await expect(testNFT.connect(addr2).mint(lowSupplyTokenId, { value: price })).to.be.revertedWith(
        "Max supply reached",
      );
    });

    it("Should reject insufficient payment", async () => {
      await expect(testNFT.connect(addr1).mint(tokenId, { value: ethers.parseEther("0.05") })).to.be.revertedWith(
        "Insufficient payment",
      );
    });
  });

  describe("URI Handling", () => {
    it("Should return correct token URI", async () => {
      const tokenId = 1;
      await testNFT.createNFT(tokenId, 0, 100, ethers.parseEther("0.1"));

      expect(await testNFT.uri(tokenId)).to.equal(`${baseURI}${tokenId}.json`);
    });

    it("Should allow owner to update base URI", async () => {
      const newBaseURI = "https://new.testnft.com/";
      await testNFT.setBaseURI(newBaseURI);

      const tokenId = 1;
      await testNFT.createNFT(tokenId, 0, 100, ethers.parseEther("0.1"));

      expect(await testNFT.uri(tokenId)).to.equal(`${newBaseURI}${tokenId}.json`);
    });
  });

  describe("Withdrawal", () => {
    it("Should prevent non-owners from withdrawing", async () => {
      await expect(testNFT.connect(addr2).withdraw()).to.be.reverted;
    });
  });
});
