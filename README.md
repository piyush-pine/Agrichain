# AgriClear: A Blockchain-Powered Agricultural Supply Chain Platform

AgriClear is a next-generation platform designed to bring transparency, fairness, and efficiency to the agricultural supply chain. By leveraging blockchain technology, IoT, and AI, it connects farmers directly with buyers, eliminates intermediaries, and provides an immutable record of a product's journey from farm to fork.

## ✨ Features

- **Role-Based Dashboards:** Separate, feature-rich dashboards for Farmers, Buyers, Logistics Partners, and Admins.
- **Digital Marketplace:** Farmers can list products with images and descriptions, and buyers can browse, add items to a cart, and purchase them.
- **Blockchain Provenance:** Every product is registered on the blockchain, and its journey (sale, shipment) is tracked as immutable transactions.
- **QR Code Transparency:** Consumers can scan a QR code on a product to view its entire on-chain history.
- **Smart Contract Escrow:** Buyer payments are secured in a smart contract and automatically released to the farmer upon delivery confirmation.
- **User & Shipment Management:** Admin and Logistics roles have dedicated interfaces to manage users and track shipments.

## 🛠️ Tech Stack

- **Frontend:** Next.js, React, TypeScript
- **Styling:** Tailwind CSS, ShadCN UI
- **Blockchain:** Hardhat, Ethers.js, Solidity
- **Backend & Database:** Firebase (Firestore, Authentication, Storage)

---

## 🚀 Getting Started

Follow these steps to set up and run the project locally.

### 1. Prerequisites

- **Node.js:** v20.x or higher
- **pnpm:** This project uses `pnpm` as the package manager. If you don't have it, install it globally:
  ```bash
  npm install -g pnpm
  ```
- **MetaMask:** A browser extension wallet for interacting with the blockchain.

### 2. Firebase Setup

You need a Firebase project to handle authentication, database, and file storage.

1.  Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  Inside your project, create a new **Web App**.
3.  After creating the app, Firebase will give you a `firebaseConfig` object. Copy this object.
4.  Paste the copied configuration into `src/firebase/config.ts`, replacing the existing placeholder object.
5.  In the Firebase console, go to **Build > Firestore Database** and create a database in **Test mode**.
6.  Go to **Build > Authentication** and enable the **Email/Password** sign-in provider.
7.  Go to **Build > Storage** and create a storage bucket.

### 3. Project Installation

Clone the repository and run the installation script. This script will install dependencies and deploy the smart contracts to a local blockchain instance.

```bash
git clone <repository_url>
cd <repository_directory>
chmod +x install.sh
./install.sh
```

The script performs the following actions:
1.  Installs all `npm` dependencies using `pnpm`.
2.  Starts a local Hardhat blockchain node in the background.
3.  Waits a few seconds for the node to initialize.
4.  Deploys the smart contracts to the local node and prints their addresses.

### 4. Configure MetaMask

1.  Open your MetaMask extension.
2.  Click on the network dropdown and select **"Add network"** > **"Add a network manually"**.
3.  Enter the following details for the local Hardhat network:
    *   **Network Name:** `Hardhat Localhost`
    *   **New RPC URL:** `http://127.0.0.1:8545`
    *   **Chain ID:** `31337`
    *   **Currency Symbol:** `ETH`
4.  After starting the Hardhat node (`pnpm hardhat node`), it will display a list of accounts and their private keys. Import one of these accounts into MetaMask to have test ETH for transactions.

### 5. Run the Application

Once the installation is complete and contracts are deployed, start the Next.js development server:

```bash
pnpm dev
```

The application will be available at [http://localhost:9002](http://localhost:9002).

### 6. Using the Application

1.  **Register Users:** Register new accounts for each role (Farmer, Buyer, Logistics, Admin).
2.  **Connect Wallet:** For Farmer and Buyer roles, you will be prompted on the dashboard to connect your MetaMask wallet. This is required to interact with the blockchain.
3.  **List a Product:** As a Farmer, add a new product. This will trigger a transaction to register the product on the blockchain.
4.  **Place an Order:** As a Buyer, add a product to your cart and proceed to checkout. This will trigger a transaction to place funds in the escrow contract.
5.  **Manage Shipments:** As a Farmer, assign a logistics partner and mark the order as shipped. As a Logistics partner, you can then see the shipment and update its status.
6.  **Confirm Delivery:** As a Buyer, confirm the delivery of an order. This will trigger the final transaction to release the escrowed payment to the farmer.
