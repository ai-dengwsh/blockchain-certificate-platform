const Certificate = artifacts.require("Certificate");
const Market = artifacts.require("Market");

module.exports = async function(deployer) {
  // 部署凭证合约
  await deployer.deploy(Certificate);
  
  // 部署市场合约
  await deployer.deploy(Market);
};
