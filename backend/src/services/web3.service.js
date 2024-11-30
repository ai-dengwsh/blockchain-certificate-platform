const Web3 = require('web3');
const config = require('../config/config');
const CertificateABI = require('../contracts/Certificate.json').abi;

class Web3Service {
  constructor() {
    this.web3 = new Web3(config.ethereum.providerUrl);
    this.contract = new this.web3.eth.Contract(
      CertificateABI,
      config.ethereum.certificateContractAddress
    );
  }

  // 获取合约地址
  getContractAddress() {
    return this.contract.options.address;
  }

  // 铸造新凭证
  async mintCertificate(ownerAddress, ipfsHash) {
    const adminAccount = this.web3.eth.accounts.privateKeyToAccount(
      config.ethereum.adminPrivateKey
    );

    const data = this.contract.methods.mint(ownerAddress, ipfsHash).encodeABI();
    const gasPrice = await this.web3.eth.getGasPrice();
    const gasLimit = await this.contract.methods
      .mint(ownerAddress, ipfsHash)
      .estimateGas({ from: adminAccount.address });

    const tx = {
      from: adminAccount.address,
      to: this.contract.options.address,
      gas: gasLimit,
      gasPrice: gasPrice,
      data: data
    };

    const signedTx = await adminAccount.signTransaction(tx);
    const receipt = await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    return {
      transactionHash: receipt.transactionHash,
      tokenId: receipt.events.Transfer.returnValues.tokenId,
      gasUsed: receipt.gasUsed,
      gasPrice: gasPrice
    };
  }

  // 验证凭证
  async verifyCertificate(tokenId) {
    const owner = await this.contract.methods.ownerOf(tokenId).call();
    const tokenURI = await this.contract.methods.tokenURI(tokenId).call();
    return { owner, tokenURI };
  }

  // 转移凭证
  async transferCertificate(fromAddress, toAddress, tokenId) {
    const gasPrice = await this.web3.eth.getGasPrice();
    const gasLimit = await this.contract.methods
      .transferFrom(fromAddress, toAddress, tokenId)
      .estimateGas({ from: fromAddress });

    const data = this.contract.methods
      .transferFrom(fromAddress, toAddress, tokenId)
      .encodeABI();

    const tx = {
      from: fromAddress,
      to: this.contract.options.address,
      gas: gasLimit,
      gasPrice: gasPrice,
      data: data
    };

    const receipt = await this.web3.eth.sendTransaction(tx);

    return {
      transactionHash: receipt.transactionHash,
      gasUsed: receipt.gasUsed,
      gasPrice: gasPrice
    };
  }
}

module.exports = Web3Service;
