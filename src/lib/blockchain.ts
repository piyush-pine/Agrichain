
import { ethers, Signer } from 'ethers';
import EscrowPayment from '../../artifacts/contracts/EscrowPayment.sol/EscrowPayment.json';

// This should be the address the contract was deployed to.
// You can get this from your deployment script output or Hardhat node.
// For now, it's a placeholder.
const ESCROW_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export const getEscrowPaymentContract = (signerOrProvider: Signer | ethers.Provider) => {
    return new ethers.Contract(ESCROW_CONTRACT_ADDRESS, EscrowPayment.abi, signerOrProvider);
};
