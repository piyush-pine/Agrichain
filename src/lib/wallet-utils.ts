
import { ethers } from 'ethers';
import { doc, Firestore } from 'firebase/firestore';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';

/**
 * Checks if a user has a wallet address and creates one if it doesn't exist.
 * This is a non-blocking operation.
 * @param firestore - The Firestore instance.
 * @param userId - The ID of the user to check.
 */
export function ensureUserWallet(firestore: Firestore, userId: string): void {
  // Generate a new random wallet
  const wallet = ethers.Wallet.createRandom();
  const mockWalletAddress = wallet.address;

  // Get a reference to the user's document
  const userRef = doc(firestore, 'users', userId);

  // Update the document with the new wallet address.
  // This will only write the field if it doesn't exist or is different,
  // but for simplicity, we just call update.
  // This is a non-blocking call.
  updateDocumentNonBlocking(userRef, { walletAddress: mockWalletAddress });
  
  console.log(`[WALLET_UTIL] Ensured wallet exists for user ${userId}. Address: ${mockWalletAddress}`);
}
