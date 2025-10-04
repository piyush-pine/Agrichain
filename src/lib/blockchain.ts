
import { ethers, Signer } from 'ethers';
import EscrowPayment from './blockchain-artifacts/EscrowPayment.json';
import ProductProvenance from './blockchain-artifacts/ProductProvenance.json';

// This should be the address the contract was deployed to.
// You can get this from your deployment script output or Hardhat node.
const ESCROW_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const PROVENANCE_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_PROVENANCE_CONTRACT_ADDRESS || "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";


export const getEscrowPaymentContract = (signerOrProvider: Signer | ethers.Provider) => {
    return new ethers.Contract(ESCROW_CONTRACT_ADDRESS, EscrowPayment.abi, signerOrProvider);
};

export const getProductProvenanceContract = (signerOrProvider: Signer | ethers.Provider) => {
    return new ethers.Contract(PROVENANCE_CONTRACT_ADDRESS, ProductProvenance.abi, signerOrProvider);
};

export const releasePaymentFromEscrow = async (signer: Signer, orderId: string, sellerAddress: string) => {
    const contract = getEscrowPaymentContract(signer);
    // First, the buyer confirms they have received the delivery
    const confirmTx = await contract.confirmDelivery(orderId);
    await confirmTx.wait(); // Wait for confirmation to be mined

    // Second, after delivery is confirmed, release the payment
    const releaseTx = await contract.releasePayment(orderId);
    return releaseTx;
};

export const getProductHistory = async (productId: string) => {
    if(!process.env.NEXT_PUBLIC_PROVENANCE_CONTRACT_ADDRESS && !ethers.isAddress(PROVENANCE_CONTRACT_ADDRESS)) {
        console.error("Provenance contract address is not a valid address.");
        return [];
    }
    const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_POLYGON_MUMBAI_RPC_URL || "https://rpc.ankr.com/polygon_mumbai");
    const contract = getProductProvenanceContract(provider);
    try {
        const history = await contract.getProductHistory(productId);
        return history.map((entry: any) => ({
            action: entry.action,
            timestamp: new Date(Number(entry.timestamp) * 1000).toLocaleString()
        }));
    } catch (error) {
        console.error("Error fetching product history:", error);
        // It might fail if the product ID doesn't exist on-chain, which is a valid case.
        return [];
    }
};

    