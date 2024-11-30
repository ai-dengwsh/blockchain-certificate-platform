const Certificate = artifacts.require("Certificate");

contract("Certificate", accounts => {
  let certificate;
  const owner = accounts[0];
  const user = accounts[1];
  const ipfsHash = "QmXgm5QVTy8pRtKrTPmoMAQGXWPii1yeDkQaR9KKQbqKx8";

  beforeEach(async () => {
    certificate = await Certificate.new({ from: owner });
  });

  describe("Certificate Operations", () => {
    it("should create a new certificate", async () => {
      const result = await certificate.createCertificate(user, ipfsHash, { from: owner });
      assert.equal(result.logs[0].event, "Transfer", "Should emit Transfer event");
      
      const tokenId = result.logs[0].args.tokenId;
      const certData = await certificate.getCertificate(tokenId);
      
      assert.equal(certData[0], ipfsHash, "IPFS hash should match");
      assert.equal(certData[2], true, "Certificate should be valid");
    });

    it("should invalidate a certificate", async () => {
      const result = await certificate.createCertificate(user, ipfsHash, { from: owner });
      const tokenId = result.logs[0].args.tokenId;
      
      await certificate.invalidateCertificate(tokenId, { from: owner });
      const certData = await certificate.getCertificate(tokenId);
      
      assert.equal(certData[2], false, "Certificate should be invalid");
    });

    it("should not allow non-owner to create certificate", async () => {
      try {
        await certificate.createCertificate(user, ipfsHash, { from: user });
        assert.fail("Should have thrown an error");
      } catch (error) {
        assert(error.message.includes("Ownable: caller is not the owner"), "Wrong error message");
      }
    });

    it("should verify certificate validity", async () => {
      const result = await certificate.createCertificate(user, ipfsHash, { from: owner });
      const tokenId = result.logs[0].args.tokenId;
      
      const isValid = await certificate.isValidCertificate(tokenId);
      assert.equal(isValid, true, "Certificate should be valid");
    });
  });
});
