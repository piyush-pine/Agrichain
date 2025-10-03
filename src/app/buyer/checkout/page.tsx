
'use client';

import React, { useState } from 'react';
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser } from "@/firebase/auth/use-user";
import { useFirestore, useMemoFirebase } from "@/firebase/provider";
import { useCollection, addDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase";
import { collection, doc, serverTimestamp, writeBatch } from "firebase/firestore";
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { ConnectWalletButton } from '@/components/blockchain/ConnectWalletButton';
import { getEscrowPaymentContract } from '@/lib/blockchain';
import { ethers } from 'ethers';

export default function CheckoutPage() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const router = useRouter();

    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    const cartQuery = useMemoFirebase(() => {
        if (!user) return null;
        return collection(firestore, 'users', user.uid, 'cart');
    }, [user, firestore]);

    const { data: cartItems, isLoading } = useCollection(cartQuery);
    
    const subtotal = cartItems?.reduce((acc, item) => acc + item.price * item.quantity, 0) || 0;
    const farmerId = cartItems && cartItems.length > 0 ? cartItems[0].farmer_id : null; // Assuming one farmer per order for now


    const handlePlaceOrder = async () => {
        if (!user || !cartItems || cartItems.length === 0 || !walletAddress || !farmerId) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Cannot place order. Ensure you are logged in, your cart is not empty, and your wallet is connected.',
            });
            return;
        }

        setIsPlacingOrder(true);

        try {
            // 1. Create Order in Firestore
            const orderData = {
                buyer_id: user.uid,
                farmer_id: farmerId,
                items: cartItems.map(item => ({
                    product_id: item.product_id,
                    product_name: item.product_name,
                    quantity: item.quantity,
                    price: item.price
                })),
                amount: subtotal,
                status: 'pending',
                escrow_released: false,
                created_at: serverTimestamp(),
            };
            
            const orderRef = await addDocumentNonBlocking(collection(firestore, 'orders'), orderData);
            if(!orderRef){
                throw new Error("Could not create order reference in Firestore.");
            }

            // 2. Initiate Escrow Payment on Blockchain
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const escrowContract = getEscrowPaymentContract(signer);
            
            const transaction = await escrowContract.initiateEscrow(
                orderRef.id,
                { value: ethers.parseEther(subtotal.toString()) }
            );
            
            toast({
                title: 'Processing Transaction',
                description: `Waiting for blockchain confirmation... Tx: ${transaction.hash.slice(0, 10)}...`,
            });
            
            await transaction.wait(); // Wait for the transaction to be mined

            // 3. Update Order Status and Clear Cart
            const batch = writeBatch(firestore);
            
            // Update order status to confirmed
            batch.update(orderRef, { status: 'confirmed' });

            // Clear the cart
            cartItems.forEach(item => {
                const cartItemRef = doc(firestore, 'users', user.uid, 'cart', item.id);
                batch.delete(cartItemRef);
            });
            
            await batch.commit();

            toast({
                title: 'Order Placed Successfully!',
                description: `Your order #${orderRef.id.slice(0,6)} has been confirmed and payment is secured.`,
            });

            router.push('/buyer/orders');

        } catch (error: any) {
            console.error("Failed to place order:", error);
            toast({
                variant: 'destructive',
                title: 'Order Failed',
                description: error.message || 'An unexpected error occurred.',
            });
        } finally {
            setIsPlacingOrder(false);
        }
    };


    return (
        <DashboardLayout>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Checkout</h1>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                            <CardDescription>Review the items in your cart before placing your order.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoading && <p>Loading your cart...</p>}
                            {!isLoading && (!cartItems || cartItems.length === 0) && <p>Your cart is empty.</p>}
                            {cartItems && cartItems.length > 0 && (
                                <div className="space-y-4">
                                    {cartItems.map(item => (
                                        <div key={item.id} className="flex items-center gap-4">
                                            <div className="relative h-16 w-16 rounded-md overflow-hidden bg-muted">
                                                <Image src={item.image_url} alt={item.product_name} layout="fill" objectFit="cover" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold">{item.product_name}</h4>
                                                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                            </div>
                                            <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    ))}
                                    <Separator />
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>Total</span>
                                        <span>${subtotal.toFixed(2)}</span>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
                <div>
                    <Card className="sticky top-20">
                        <CardHeader>
                            <CardTitle>Complete Purchase</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                             <div>
                                <h3 className="text-sm font-medium mb-2">Connect Wallet</h3>
                                <ConnectWalletButton onAddressChanged={setWalletAddress} />
                                {walletAddress && (
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                                    </p>
                                )}
                            </div>
                            <Button 
                                className="w-full" 
                                size="lg" 
                                disabled={!walletAddress || isLoading || !cartItems || cartItems.length === 0 || isPlacingOrder}
                                onClick={handlePlaceOrder}
                            >
                                {isPlacingOrder ? 'Placing Order...' : `Place Order & Pay $${subtotal.toFixed(2)}`}
                            </Button>
                             <div className="text-center text-xs text-muted-foreground p-2 bg-secondary rounded-md">
                                Clicking "Place Order" will prompt a blockchain transaction to secure your payment in a smart contract escrow.
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
