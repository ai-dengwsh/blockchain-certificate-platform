const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('CertificateNFT', function () {
  let CertificateNFT;
  let certificateNFT;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    // Get contract factory and signers
    CertificateNFT = await ethers.getContractFactory('CertificateNFT');
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy contract
    certificateNFT = await CertificateNFT.deploy('Certificate NFT', 'CERT');
    await certificateNFT.deployed();
  });

  describe('Deployment', function () {
    it('Should set the right owner', async function () {
      expect(await certificateNFT.owner()).to.equal(owner.address);
    });

    it('Should set the correct name and symbol', async function () {
      expect(await certificateNFT.name()).to.equal('Certificate NFT');
      expect(await certificateNFT.symbol()).to.equal('CERT');
    });
  });

  describe('Minting', function () {
    it('Should mint a new token', async function () {
      const tokenURI = 'https://example.com/metadata/1';
      await certificateNFT.mint(addr1.address, tokenURI);

      expect(await certificateNFT.ownerOf(1)).to.equal(addr1.address);
      expect(await certificateNFT.tokenURI(1)).to.equal(tokenURI);
    });

    it('Should only allow owner to mint', async function () {
      const tokenURI = 'https://example.com/metadata/1';
      await expect(
        certificateNFT.connect(addr1).mint(addr2.address, tokenURI)
      ).to.be.revertedWith('Ownable: caller is not the owner');
    });
  });

  describe('Token Transfer', function () {
    beforeEach(async function () {
      await certificateNFT.mint(addr1.address, 'https://example.com/metadata/1');
    });

    it('Should transfer token between accounts', async function () {
      await certificateNFT.connect(addr1).transferFrom(addr1.address, addr2.address, 1);
      expect(await certificateNFT.ownerOf(1)).to.equal(addr2.address);
    });

    it('Should fail if sender is not owner', async function () {
      await expect(
        certificateNFT.connect(addr2).transferFrom(addr1.address, addr2.address, 1)
      ).to.be.revertedWith('ERC721: caller is not token owner or approved');
    });
  });

  describe('Token Burning', function () {
    beforeEach(async function () {
      await certificateNFT.mint(addr1.address, 'https://example.com/metadata/1');
    });

    it('Should allow token owner to burn their token', async function () {
      await certificateNFT.connect(addr1).burn(1);
      await expect(certificateNFT.ownerOf(1)).to.be.revertedWith('ERC721: invalid token ID');
    });

    it('Should not allow non-owner to burn token', async function () {
      await expect(
        certificateNFT.connect(addr2).burn(1)
      ).to.be.revertedWith('ERC721: caller is not token owner or approved');
    });
  });

  describe('Token URI', function () {
    it('Should return correct token URI', async function () {
      const tokenURI = 'https://example.com/metadata/1';
      await certificateNFT.mint(addr1.address, tokenURI);
      expect(await certificateNFT.tokenURI(1)).to.equal(tokenURI);
    });

    it('Should fail for non-existent token', async function () {
      await expect(
        certificateNFT.tokenURI(99)
      ).to.be.revertedWith('ERC721: invalid token ID');
    });
  });

  describe('Batch Operations', function () {
    it('Should mint multiple tokens', async function () {
      const tokenURIs = [
        'https://example.com/metadata/1',
        'https://example.com/metadata/2',
        'https://example.com/metadata/3'
      ];

      for (let i = 0; i < tokenURIs.length; i++) {
        await certificateNFT.mint(addr1.address, tokenURIs[i]);
        expect(await certificateNFT.ownerOf(i + 1)).to.equal(addr1.address);
        expect(await certificateNFT.tokenURI(i + 1)).to.equal(tokenURIs[i]);
      }
    });
  });
});
