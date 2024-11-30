# Blockchain Certificate Platform

A comprehensive blockchain-based platform for secure digital certificate creation, trading, and management.

## Features

- Create and manage digital certificates as NFTs
- Trade certificates on a decentralized marketplace
- Secure authentication and authorization
- User-friendly web interface
- Smart contract based security

## Tech Stack

- Frontend: Vue.js 3 + Pinia
- Backend: Node.js + Express
- Blockchain: Ethereum + Solidity
- Database: MySQL
- Testing: Jest, Hardhat, Chai

## Prerequisites

- Node.js >= 16.0.0
- npm >= 8.0.0
- MySQL
- MetaMask or similar Web3 wallet

## Installation

1. Clone the repository:
```bash
git clone https://github.com/ai-dengwsh/blockchain-certificate-platform.git
cd blockchain-certificate-platform
```

2. Install dependencies:
```bash
npm install
cd frontend && npm install
cd ../backend && npm install
cd ../smart-contracts && npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Compile smart contracts:
```bash
cd smart-contracts
npx hardhat compile
```

5. Start development servers:
```bash
# In the root directory
npm run dev
```

## Testing

Run all tests:
```bash
npm test
```

Or run specific test suites:
```bash
npm run test:contracts   # Smart contract tests
npm run test:backend    # Backend API tests
npm run test:frontend   # Frontend component tests
```

## Deployment

See [deployment guide](docs/deployment.md) for detailed instructions.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Authors

- **ai-dengwsh** - *Initial work*

## Acknowledgments

- OpenZeppelin for smart contract libraries
- Hardhat development environment
- Vue.js and its ecosystem
- Node.js community
