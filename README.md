# MusicChain: A Decentralized Music NFT Platform

MusicChain is a proof-of-concept decentralized application (dApp) built on the Ethereum blockchain that reimagines the music industry. It empowers artists by giving them direct ownership of their music as NFTs, ensuring automated, transparent royalty payments every time their work is resold.

This project was developed as an academic requirement to demonstrate a viable solution to the copyright and royalty challenges outlined in the modern, centralized music industry.

# Demo Video
https://youtu.be/_pCvqRDxMIY?si=RLlFeFC2BRLFOa-H

# Core Features

Artist & Audience Roles: Users can register as an "Audience" or stake 0.1 ETH to unlock "Artist" privileges.

NFT Minting: Artists can mint their songs as NFTs, embedding metadata and royalty information directly into the smart contract.

Decentralized Storage: All music files and metadata are stored on IPFS, ensuring they are permanent and censorship-resistant.

Primary Marketplace: An "Audience Dashboard" where users can browse and purchase newly minted NFTs directly from artists.

Secondary Market (Resale): Owners of a music NFT can list it for sale on a secondary "Marketplace" at any price they set.

Automated Royalties: The smart contract automatically enforces a royalty (e.g., 7%) on every secondary sale, paying the original artist instantly and transparently.

On-Chain Auditing: A "Transactions" page provides an immutable, transparent history of all actions (Create, Buy, Sell, Royalty Earned) for each user.

Personal Library: A "My Songs" page allows users to view and play all the music NFTs they own.

# Technology Stack

Frontend: React (with React Router and Tailwind CSS)

Blockchain: Solidity

Development Environment: Hardhat

Smart Contracts: ERC-1155 (for NFTs) & a custom Marketplace contract

Wallet / Provider: MetaMask

Decentralized Storage: InterPlanetary File System (IPFS)

Node.js Libraries: Ethers.js

# System Architecture

This dApp follows a standard decentralized architecture:

Frontend (React): The user interface that you see in the browser. It communicates with MetaMask to read data and send transactions to the blockchain.

Smart Contract (Solidity): The "backend" logic that lives on the Ethereum blockchain. It controls all the rules: who owns what, how much a song costs, and how royalties are paid.

IPFS (Storage): The music files (.mp3) and metadata files (.json) are too large to store on the blockchain. They are uploaded to IPFS, and the smart contract only stores the unique IPFS hash (a CID) for each song.

# Getting Started: Local Setup

Follow these instructions to run the project on your local machine for development and testing.

Prerequisites

Node.js (v18 or later): https://nodejs.org/

Git: https://git-scm.com/

MetaMask: A browser extension wallet. https://metamask.io/

Step 1: Clone the Repository

Open your terminal and clone the project:

git clone https://github.com/selvavinayagamkamaraj/Blockchain-Based-Music-Streaming-Platform-MusicChain-.git 
cd folder name


Step 2: Set Up the Smart Contract (Backend)

In one terminal, set up and run your local blockchain.

# Navigate to the blockchain directory
cd blockchain

# Install all the development dependencies
npm install

# Compile the smart contracts
npx hardhat compile

# Run a local Hardhat blockchain node
npx hardhat node


Note: If you are running this in a virtual environment, a container (like Docker), or WSL2, you may need to use npx hardhat node --hostname 0.0.0.0 to make the node accessible to your browser.

This will start a local blockchain and give you 20 test accounts, each with 10000 fake ETH. Keep this terminal running.

Step 3: Deploy the Smart Contract

In a second, new terminal, deploy your contract to the local node you just started.

# Navigate to the blockchain directory again
cd blockchain

# Run the deployment script on the 'localhost' network
npx hardhat run scripts/deploy.js --network localhost


This will deploy your MusicChain.sol (or similarly named) contract. The terminal will print the deployed contract address. Copy this address.

Example output:
MusicChain contract deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3

Step 4: Set Up the Frontend

Go to your src/ folder in your React app (e.g., frontend/src/).

Find the file that holds your contract address and ABI. This might be in src/App.js or src/context/AuthContext.js.

Paste the contract address you just copied.

Copy the contract's ABI from blockchain/artifacts/contracts/MusicChain.sol/MusicChain.json and paste it into the abi variable in your frontend code.

Step 5: Run the Frontend

In a third, new terminal, run your React app.

# Navigate to the frontend directory
cd frontend

# Install all the React dependencies
npm install

# Start the application
npm start


Your browser will open to http://localhost:3000, and you can now interact with your dApp.

Step 6: Connect MetaMask to Localhost

Open MetaMask and click the network selector at the top.

Select "Add network" -> "Add a network manually."

Use the following details:

Network Name: Localhost 8545

New RPC URL: http://127.0.0.1:8545

Chain ID: 31337

Currency Symbol: ETH

Import one of the test accounts from your npx hardhat node terminal (copy a "Private Key") into MetaMask to have test ETH to use the app.

# Project Screenshots

# Login Page

<img width="1917" height="824" alt="image" src="https://github.com/user-attachments/assets/d6d4d5a5-e7ea-46fc-8901-fb9e22a6299f" />

# Role Selection

<img width="1919" height="735" alt="image" src="https://github.com/user-attachments/assets/8fa62c04-210d-49d7-bc8b-44e20fa9df68" />

# Artist Dashboard

<img width="1919" height="863" alt="image" src="https://github.com/user-attachments/assets/7331c874-4c9c-4ddf-996a-81413c8f9df9" />

# Marketplace

<img width="1919" height="859" alt="image" src="https://github.com/user-attachments/assets/c53c2a64-90bf-4f7f-b34c-82cdee89702a" />

# Transaction History

<img width="1919" height="728" alt="image" src="https://github.com/user-attachments/assets/9f0f6c23-74a7-430e-91bb-17e7eca07dc7" />

# Portfolio (Our Team)

<img width="1919" height="914" alt="image" src="https://github.com/user-attachments/assets/44ac06d9-47b5-4901-a9ae-76b52f87b40e" />

# Team Members

Girinath S

Selva Vinayagam Kamaraj

Abhinand S

Shahil Yousuf S

Hariprem K
