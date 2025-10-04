#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

echo "📦 Installing project dependencies with pnpm..."
pnpm install

echo "---"
echo "🌐 Starting local Hardhat blockchain node in the background..."
pnpm hardhat node > hardhat-node.log 2>&1 &
NODE_PID=$!

# Give the node a moment to start up
echo "⏳ Waiting for the local node to initialize... (5 seconds)"
sleep 5

echo "---"
echo "📜 Deploying smart contracts to the local node..."
# The output of this command will show the contract addresses in the terminal
pnpm hardhat run scripts/deploy.ts --network localhost

# Set environment variables for the deployed contracts
# NOTE: This part is commented out because the addresses are dynamic on a local node.
# The user must copy these from the output above and set them in a .env.local file.
echo "---"
echo "✅ Deployment complete!"
echo "---"
echo "IMPORTANT: The script has deployed the contracts and printed their addresses above."
echo "You MUST now create a '.env.local' file and add the following lines, replacing the placeholder addresses with the actual addresses from the deployment output:"
echo ""
echo "NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS=0x..."
echo "NEXT_PUBLIC_PROVENANCE_CONTRACT_ADDRESS=0x..."
echo ""
echo "Hardhat node is running in the background (PID: $NODE_PID). You can view its logs in 'hardhat-node.log'."
echo "You can stop it by running: kill $NODE_PID"
echo ""
echo "🚀 You can now start the application with 'pnpm dev'"
