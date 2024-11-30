const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('CertificateMarket', function () {
  let CertificateNFT;
  let certificateNFT;
  let CertificateMarket;
  let market;
  let owner;
  let seller;
  let buyer;
  let feeAccount;

  const TOKEN_ID = 1;
  const PRICE = ethers.utils.parseEther('1.0');
  const LISTING_FEE = ethers.utils.parseEther('0.01');

  beforeEach(async function () {
    // Get contract factories and signers
    [owner, seller, buyer, feeAccount] = await ethers.getSigners();
    
    CertificateNFT = await ethers.getContractFactory('CertificateNFT');
    CertificateMarket = await ethers.getContractFactory('CertificateMarket');

    // Deploy contracts
    certificateNFT = await CertificateNFT.deploy('Certificate NFT', 'CERT');
    await certificateNFT.deployed();

    market = await CertificateMarket.deploy(certificateNFT.address, feeAccount.address, LISTING_FEE);
    await market.deployed();

    // Mint NFT to seller
    await certificateNFT.mint(seller.address, 'https://example.com/metadata/1');
    
    // Approve market contract
    await certificateNFT.connect(seller).approve(market.address, TOKEN_ID);
  });

  describe('Deployment', function () {
    it('Should set the correct NFT contract address', async function () {
      expect(await market.nftContract()).to.equal(certificateNFT.address);
    });

    it('Should set the correct fee account', async function () {
      expect(await market.feeAccount()).to.equal(feeAccount.address);
    });

    it('Should set the correct listing fee', async function () {
      expect(await market.listingFee()).to.equal(LISTING_FEE);
    });
  });

  describe('Listing', function () {
    it('Should create listing with correct price', async function () {
      await market.connect(seller).createListing(TOKEN_ID, PRICE, { value: LISTING_FEE });
      
      const listing = await market.getListing(TOKEN_ID);
      expect(listing.seller).to.equal(seller.address);
      expect(listing.price).to.equal(PRICE);
      expect(listing.active).to.be.true;
    });

    it('Should fail if listing fee is not paid', async function () {
      await expect(
        market.connect(seller).createListing(TOKEN_ID, PRICE)
      ).to.be.revertedWith('Must pay listing fee');
    });

    it('Should fail if seller is not token owner', async function () {
      await expect(
        market.connect(buyer).createListing(TOKEN_ID, PRICE, { value: LISTING_FEE })
      ).to.be.revertedWith('Must be token owner');
    });
  });

  describe('Purchasing', function () {
    beforeEach(async function () {
      await market.connect(seller).createListing(TOKEN_ID, PRICE, { value: LISTING_FEE });
    });

    it('Should transfer NFT and funds correctly', async function () {
      await market.connect(buyer).purchaseCertificate(TOKEN_ID, { value: PRICE });
      
      expect(await certificateNFT.ownerOf(TOKEN_ID)).to.equal(buyer.address);
      
      const listing = await market.getListing(TOKEN_ID);
      expect(listing.active).to.be.false;
    });

    it('Should fail if payment amount is incorrect', async function () {
      await expect(
        market.connect(buyer).purchaseCertificate(TOKEN_ID, { value: PRICE.sub(1) })
      ).to.be.revertedWith('Must pay the exact price');
    });

    it('Should fail if listing is not active', async function () {
      await market.connect(seller).cancelListing(TOKEN_ID);
      
      await expect(
        market.connect(buyer).purchaseCertificate(TOKEN_ID, { value: PRICE })
      ).to.be.revertedWith('Listing is not active');
    });
  });

  describe('Cancelling', function () {
    beforeEach(async function () {
      await market.connect(seller).createListing(TOKEN_ID, PRICE, { value: LISTING_FEE });
    });

    it('Should allow seller to cancel listing', async function () {
      await market.connect(seller).cancelListing(TOKEN_ID);
      
      const listing = await market.getListing(TOKEN_ID);
      expect(listing.active).to.be.false;
    });

    it('Should fail if caller is not seller', async function () {
      await expect(
        market.connect(buyer).cancelListing(TOKEN_ID)
      ).to.be.revertedWith('Must be listing seller');
    });
  });

  describe('Market Statistics', function () {
    it('Should track total volume', async function () {
      await market.connect(seller).createListing(TOKEN_ID, PRICE, { value: LISTING_FEE });
      await market.connect(buyer).purchaseCertificate(TOKEN_ID, { value: PRICE });
      
      expect(await market.totalVolume()).to.equal(PRICE);
    });

    it('Should track active listings count', async function () {
      await market.connect(seller).createListing(TOKEN_ID, PRICE, { value: LISTING_FEE });
      expect(await market.activeListingsCount()).to.equal(1);
      
      await market.connect(buyer).purchaseCertificate(TOKEN_ID, { value: PRICE });
      expect(await market.activeListingsCount()).to.equal(0);
    });
  });
});
