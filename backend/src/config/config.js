require('dotenv').config();

module.exports = {
  app: {
    port: process.env.PORT || 3000,
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },
  database: {
    name: process.env.DB_NAME || 'blockchain_db',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    logging: process.env.DB_LOGGING === 'true'
  },
  ethereum: {
    network: process.env.ETH_NETWORK || 'development',
    nodeUrl: process.env.ETH_NODE_URL || 'http://localhost:7545',
    contractAddress: {
      certificate: process.env.CERTIFICATE_CONTRACT_ADDRESS,
      market: process.env.MARKET_CONTRACT_ADDRESS
    }
  },
  ipfs: {
    host: process.env.IPFS_HOST || 'ipfs.infura.io',
    port: process.env.IPFS_PORT || 5001,
    protocol: process.env.IPFS_PROTOCOL || 'https'
  }
};
