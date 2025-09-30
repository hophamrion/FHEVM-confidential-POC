# FHEVM Confidential Token POC

A comprehensive Proof of Concept (POC) for building confidential token applications using Fully Homomorphic Encryption for Ethereum Virtual Machine (FHEVM). This project demonstrates the implementation of privacy-preserving token operations including minting, transferring, burning, and batch operations with encrypted balances.

## Overview

This project consists of two main components:
1. **Smart Contract Layer**: Hardhat-based Solidity contracts implementing confidential token functionality
2. **Frontend Layer**: Next.js React application providing a user-friendly interface for interacting with confidential tokens

The system enables users to perform token operations while keeping balances and amounts encrypted, ensuring complete privacy in financial transactions.

## Key Features

- **Confidential Token Operations**: Mint, transfer, burn, and batch operations with encrypted balances
- **Factory Pattern**: Deploy new confidential tokens with custom slugs
- **Registry System**: Track and manage multiple token deployments
- **Allowance System**: Support for approved spending with encrypted amounts
- **Batch Operations**: Efficient batch transfers for multiple recipients
- **Cross-Chain Support**: Deployed on both Sepolia testnet and local Hardhat networks

## Smart Contracts

### Core Contracts

1. **ConfidentialTokenExtended.sol** - Main confidential token contract
   - Implements ERC-20-like functionality with encrypted balances
   - Supports minting, transferring, burning, and batch operations
   - Uses `euint64` for encrypted amounts with 6 decimal precision

2. **CTFactory.sol** - Factory contract for deploying new tokens
   - Allows users to deploy new confidential tokens with custom slugs
   - Automatically transfers ownership to the deployer
   - Registers tokens in the registry system

3. **CTRegistry.sol** - Registry system for token management
   - Tracks token deployments by owner and slug
   - Supports versioning of token deployments
   - Manages registrar permissions for factory operations

### Deployed Contract Addresses

#### Sepolia Testnet (Chain ID: 11155111)
- **CTFactory**: `0x17AcAd1F404f0177B3fAEFd89Ad7977be595703E`
- **CTRegistry**: `0x6992bB20B35F30D1F3d6450fAc460dA629535e97`

> **Note**: ConfidentialToken instances are created dynamically through the Factory contract when users call `deployAndRegister()`. Each user can create their own token with a custom slug.

#### Local Hardhat Network (Chain ID: 31337)
- **ConfidentialToken**: `0x90791c8472d9262395d72c76572c8d6728F0dfF2`
- **ConfidentialTokenExtended**: `0x90791c8472d9262395d72c76572c8d6728F0dfF2`

## Technology Stack

- **@zama-fhe/relayer-sdk**: Fully Homomorphic Encryption for Ethereum Virtual Machine
- **React**: Modern UI framework for building interactive interfaces
- **Next.js**: Next-generation frontend build tool
- **Tailwind**: Utility-first CSS framework for rapid UI development
- **Hardhat**: Ethereum development environment
- **TypeScript**: Type-safe JavaScript development

## Requirements

- You need to have Metamask browser extension installed on your browser.

## Local Hardhat Network (to add in MetaMask)

Follow the step-by-step guide in the [Hardhat + MetaMask](https://docs.metamask.io/wallet/how-to/run-devnet/) documentation to set up your local devnet using Hardhat and MetaMask.

- Name: Hardhat
- RPC URL: http://127.0.0.1:8545
- Chain ID: 31337
- Currency symbol: ETH

## Install

### Automatic install

1. Clone this repository.
2. From the repo root, run:

```sh
# - git clone "https://github.com/zama-ai/fhevm-hardhat-template.git" into <root>/packages
# - npm install
# - auto-depoy on hardhat node
node ./scripts/install.mjs
```

### Manual install

1. Clone this repository.
2. From the repo root, execute the following:

```sh
cd ./packages
git clone "https://github.com/zama-ai/fhevm-hardhat-template.git"
cd ..
npm install
```

## Setup

1. Setup your hardhat environment variables:

Follow the detailed instructions in the [FHEVM documentation](https://docs.zama.ai/protocol/solidity-guides/getting-started/setup#set-up-the-hardhat-configuration-variables-optional) to setup `MNEMONIC` + `INFURA_API_KEY` Hardhat environment variables

2. Start a local Hardhat node (new terminal):

```sh
cd packages/fhevm-hardhat-template
npx hardhat node --verbose
# Default RPC: http://127.0.0.1:8545  | chainId: 31337
```

3. Deploy `FHECounter` to the local node:

```sh
# still in packages/fhevm-hardhat-template
npx hardhat deploy --network localhost
```

4. Deploy to Sepolia:

Follows instructions in the [FHEVM documentation to setup your Hardhat project for Sepolia](https://docs.zama.ai/protocol/solidity-guides/getting-started/setup#set-up-the-hardhat-configuration-variables-optional)

```sh
# still in packages/fhevm-hardhat-template
npx hardhat deploy --network sepolia
```

## Run frontend in mock mode

1. Start a local Hardhat node (new terminal):

```sh
cd packages/fhevm-hardhat-template
npx hardhat node --verbose
```

2. From the `<root>/packages/site` run

```sh
npm run dev:mock
```

3. In your browser open `http://localhost:3000`

4. Open Metamask connect to local Hardhat node
   i. Select Add network.
   ii. Select Add a network manually.
   iii. Enter your Hardhat Network RPC URL, http://127.0.0.1:8545/ (or http://localhost:8545).
   iv. Enter your Hardhat Network chain ID, 31337 (or 0x539 in hexadecimal format).

## How to fix Hardhat Node + Metamask Errors ?

When using MetaMask as a wallet provider with a development node like Hardhat, you may encounter two common types of errors:

### 1. ⚠️ Nonce Mismatch ❌💥

MetaMask tracks wallet nonces (the number of transactions sent from a wallet). However, if you restart your Hardhat node, the nonce is reset on the dev node, but MetaMask does not update its internal nonce tracking. This discrepancy causes a nonce mismatch error.

### 2. ⚠️ View Function Call Result Mismatch ❌💥

MetaMask caches the results of view function calls. If you restart your Hardhat node, MetaMask may return outdated cached data corresponding to a previous instance of the node, leading to incorrect results.

### ✅ How to Fix Nonce Mismatch:

To fix the nonce mismatch error, simply clear the MetaMask cache:

1. Open the MetaMask browser extension.
2. Select the Hardhat network.
3. Go to Settings > Advanced.
4. Click the "Clear Activity Tab" red button to reset the nonce tracking.

The correct way to do this is also explained [here](https://docs.metamask.io/wallet/how-to/run-devnet/).

### ✅ How to Fix View Function Return Value Mismatch:

To fix the view function result mismatch:

1. Restart the entire browser. MetaMask stores its cache in the extension's memory, which cannot be cleared by simply clearing the browser cache or using MetaMask's built-in cache cleaning options.

By following these steps, you can ensure that MetaMask syncs correctly with your Hardhat node and avoid potential issues related to nonces and cached view function results.

## Project Structure

### Architecture

```
FHEVM-confidential-POC/
├── packages/
│   ├── fhevm-hardhat-template/     # Smart contract development
│   │   ├── contracts/              # Solidity contracts
│   │   ├── deploy/                 # Deployment scripts
│   │   ├── scripts/                # Utility scripts
│   │   └── test/                   # Contract tests
│   └── site/                       # Frontend application
│       ├── app/                    # Next.js app router
│       ├── components/            # React components
│       ├── fhevm/                  # FHEVM integration hooks
│       ├── hooks/                  # Custom React hooks
│       └── abi/                    # Contract ABIs and addresses
```

### Key Components

#### Smart Contract Layer (`packages/fhevm-hardhat-template/`)
- **Contracts**: Confidential token implementations with FHEVM integration
- **Deploy Scripts**: Automated deployment for multiple networks
- **Tests**: Comprehensive test suite for contract functionality

#### Frontend Layer (`packages/site/`)
- **FHEVM Integration**: Essential hooks for FHEVM contract interaction
- **UI Components**: Modern React components for token operations
- **Wallet Integration**: MetaMask and other wallet provider support
- **Token Management**: Interface for minting, transferring, and burning tokens

### Development Workflow

1. **Contract Development**: Write and test Solidity contracts in `fhevm-hardhat-template`
2. **Deployment**: Deploy contracts to local or test networks
3. **Frontend Integration**: Use generated ABIs and addresses in the React app
4. **Testing**: Test confidential operations through the web interface

## Documentation

- [Hardhat + MetaMask](https://docs.metamask.io/wallet/how-to/run-devnet/): Set up your local devnet step by step using Hardhat and MetaMask.
- [FHEVM Documentation](https://docs.zama.ai/protocol/solidity-guides/)
- [FHEVM Hardhat](https://docs.zama.ai/protocol/solidity-guides/development-guide/hardhat)
- [@zama-fhe/relayer-sdk Documentation](https://docs.zama.ai/protocol/relayer-sdk-guides/)
- [Setting up MNEMONIC and INFURA_API_KEY](https://docs.zama.ai/protocol/solidity-guides/getting-started/setup#set-up-the-hardhat-configuration-variables-optional)
- [React Documentation](https://reactjs.org/)
- [FHEVM Discord Community](https://discord.com/invite/zama)
- [GitHub Issues](https://github.com/zama-ai/fhevm-react-template/issues)

## License

This project is licensed under the BSD-3-Clause-Clear License - see the LICENSE file for details.
