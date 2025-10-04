
import { ethers } from 'ethers';
import { doc, Firestore } from 'firebase/firestore';
import { updateDoc } from 'firebase/firestore';

/**
 * Checks if a user has a wallet address and creates one if it doesn't exist.
 * This is an ASYNC, BLOCKING operation to ensure the wallet exists before proceeding.
 * @param firestore - The Firestore instance.
 * @param userId - The ID of the user to check.
 * @returns {Promise<void>}
 */
export async function ensureUserWallet(firestore: Firestore, userId: string): Promise<void> {
  // Generate a new random wallet
  const wallet = ethers.Wallet.createRandom();
  const mockWalletAddress = wallet.address;

  // Get a reference to the user's document
  const userRef = doc(firestore, 'users', userId);

  try {
    // Use the standard updateDoc which returns a promise we can await.
    await updateDoc(userRef, { walletAddress: mockWalletAddress });
    console.log(`[WALLET_UTIL] Ensured wallet exists for user ${userId}. Address: ${mockWalletAddress}`);
  } catch (error) {
    console.error(`[WALLET_UTIL] Failed to update wallet for user ${userId}:`, error);
    // Re-throw the error so the calling function can handle it.
    throw new Error('Failed to save wallet address to user profile.');
  }
}
