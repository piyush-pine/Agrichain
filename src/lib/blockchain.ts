
import { ethers, Signer } from 'ethers';
import EscrowPayment from './blockchain-artifacts/EscrowPayment.json';
import ProductProvenance from './blockchain-artifacts/ProductProvenance.json';

// --- MOCK CONSTANTS FOR SIMULATION ---
const MOCK_ESCROW_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000001";
const MOCK_PROVENANCE_CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000002";

console.log("BLOCKCHAIN LIB LOADED IN SIMULATION MODE. REAL TRANSACTIONS WILL NOT BE SENT.");

// These functions now return a mock contract object with dummy methods.
export const getEscrowPaymentContract = (signerOrProvider: Signer | ethers.Provider) => {
    return {
        address: MOCK_ESCROW_CONTRACT_ADDRESS,
        initiateEscrow: async (orderId: string, seller: string, options: { value: any }) => {
            console.log(`[MOCK] Initiating Escrow for order ${orderId} to seller ${seller} with value ${ethers.formatEther(options.value)} ETH.`);
            return Promise.resolve({
                hash: `0x_mock_tx_hash_${Date.now()}`,
                wait: () => Promise.resolve({ status: 1, blockNumber: Math.floor(Date.now() / 10000) })
            });
        },
        confirmDelivery: async (orderId: string) => {
             console.log(`[MOCK] Confirming delivery for order ${orderId}.`);
             return Promise.resolve({
                hash: `0x_mock_tx_hash_${Date.now()}`,
                wait: () => Promise.resolve({ status: 1, blockNumber: Math.floor(Date.now() / 10000) })
            });
        }
    };
};

export const getProductProvenanceContract = (signerOrProvider: Signer | ethers.Provider) => {
    return {
        address: MOCK_PROVENANCE_CONTRACT_ADDRESS,
        registerProduct: async (productId: string, name: string, category: string) => {
            console.log(`[MOCK] Registering product ${productId} (${name}) on blockchain.`);
            return Promise.resolve({
                hash: `0x_mock_tx_hash_${Date.now()}`,
                wait: () => Promise.resolve({ status: 1, blockNumber: Math.floor(Date.now() / 10000) })
            });
        },
        updateHistory: async (productId: string, action: string) => {
            console.log(`[MOCK] Updating provenance for product ${productId} with action: "${action}".`);
            return Promise.resolve({
                hash: `0x_mock_tx_hash_${Date.now()}`,
                wait: () => Promise.resolve({ status: 1, blockNumber: Math.floor(Date.now() / 10000) })
            });
        }
    };
};


// This function simulates the payment release by calling the mock contract.
export const releasePaymentFromEscrow = async (signer: Signer, orderId: string) => {
    // The signer is not actually used, but kept for API consistency.
    const contract = getEscrowPaymentContract(signer);
    console.log("[MOCK] Simulating payment release from escrow for order:", orderId);
    const tx = await contract.confirmDelivery(orderId);
    return tx;
};

// This function now returns a hardcoded, realistic-looking history for any product.
export const getProductHistory = async (productId: string) => {
    console.log(`[MOCK] Fetching simulated product history for: ${productId}`);
    return Promise.resolve([
        { action: "Registered by Farmer", timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toLocaleString() },
        { action: `Sold in Order #${productId.slice(0,4)}...`, timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleString() },
        { action: "Picked up by Logistics", timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toLocaleString() },
    ]);
};
