const Market = artifacts.require("Market");
const Certificate = artifacts.require("Certificate");

contract("Market", accounts => {
  let market;
  let certificate;
  const owner = accounts[0];
  const seller = accounts[1];
  const buyer = accounts[2];
  const price = web3.utils.toWei("1", "ether");
  const ipfsHash = "QmXgm5QVTy8pRtKrTPmoMAQGXWPii1yeDkQaR9KKQbqKx8";

  beforeEach(async () => {
    market = await Market.new();
    certificate = await Certificate.new();
    
    // 创建一个凭证用于测试
    await certificate.createCertificate(seller, ipfsHash, { from: owner });
  });

  describe("Market Operations", () => {
    it("should create a listing", async () => {
      const tokenId = 1;
      await certificate.approve(market.address, tokenId, { from: seller });
      
      const result = await market.createListing(
        certificate.address,
        tokenId,
        price,
        { from: seller }
      );

      assert.equal(result.logs[0].event, "Listed", "Should emit Listed event");
      
      const listing = await market.getListing(1);
      assert.equal(listing.seller, seller, "Seller should match");
      assert.equal(listing.price.toString(), price, "Price should match");
      assert.equal(listing.isActive, true, "Listing should be active");
    });

    it("should execute a sale", async () => {
      const tokenId = 1;
      await certificate.approve(market.address, tokenId, { from: seller });
      
      await market.createListing(
        certificate.address,
        tokenId,
        price,
        { from: seller }
      );

      const result = await market.buy(1, { 
        from: buyer,
        value: price
      });

      assert.equal(result.logs[0].event, "Sale", "Should emit Sale event");
      
      const newOwner = await certificate.ownerOf(tokenId);
      assert.equal(newOwner, buyer, "Buyer should now own the token");
      
      const listing = await market.getListing(1);
      assert.equal(listing.isActive, false, "Listing should be inactive");
    });

    it("should cancel a listing", async () => {
      const tokenId = 1;
      await certificate.approve(market.address, tokenId, { from: seller });
      
      await market.createListing(
        certificate.address,
        tokenId,
        price,
        { from: seller }
      );

      const result = await market.cancelListing(1, { from: seller });
      assert.equal(result.logs[0].event, "Canceled", "Should emit Canceled event");
      
      const listing = await market.getListing(1);
      assert.equal(listing.isActive, false, "Listing should be inactive");
    });

    it("should not allow unauthorized cancellation", async () => {
      const tokenId = 1;
      await certificate.approve(market.address, tokenId, { from: seller });
      
      await market.createListing(
        certificate.address,
        tokenId,
        price,
        { from: seller }
      );

      try {
        await market.cancelListing(1, { from: buyer });
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert(error.message.includes("Not the seller"), "Wrong error message");
      }
    });
  });
});
