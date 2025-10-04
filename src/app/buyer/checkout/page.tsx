
'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser } from "@/firebase/auth/use-user";
import { useFirestore, useMemoFirebase } from "@/firebase/provider";
import { addDoc, collection, doc, serverTimestamp, deleteDoc, getDoc, writeBatch } from "firebase/firestore";
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { getEscrowPaymentContract, getProductProvenanceContract } from '@/lib/blockchain';
import { ethers } from 'ethers';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useCart } from '@/hooks/use-cart';
import { Wallet, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function CheckoutPage() {
    const { user, loading: userLoading } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const router = useRouter();
    const { cartItems, isLoading, mergeLocalCartWithFirestore } = useCart();

    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [farmerWalletAddress, setFarmerWalletAddress] = useState<string | null>(null);

    const subtotal = cartItems?.reduce((acc, item) => acc + item.price * item.quantity, 0) || 0;
    const farmerId = cartItems && cartItems.length > 0 ? cartItems[0].farmer_id : null;

    useEffect(() => {
        if (!userLoading && !user) {
           router.push('/login');
           return;
        }
        if (user) {
            mergeLocalCartWithFirestore(user.uid);
        }
    }, [user, userLoading, router, mergeLocalCartWithFirestore]);

    const farmerDocRef = useMemoFirebase(() => {
        if (!farmerId || !firestore) return null;
        return doc(firestore, 'users', farmerId);
    }, [farmerId, firestore]);

    useEffect(() => {
        if (farmerDocRef) {
            getDoc(farmerDocRef).then(docSnap => {
                if (docSnap.exists()) {
                    setFarmerWalletAddress(docSnap.data().walletAddress || null);
                }
            });
        }
    }, [farmerDocRef]);


    const handlePlaceOrder = async () => {
        if (!user || !cartItems || cartItems.length === 0 || !user.walletAddress || !farmerId || !firestore) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Cannot place order. Ensure you are logged in and your cart is not empty.',
            });
            return;
        }

        if (!farmerWalletAddress) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'The farmer has not connected a wallet. Cannot place order.',
            });
            return;
        }

        setIsPlacingOrder(true);
        toast({ title: 'Placing Order...', description: 'Please wait while we confirm your order.' });

        try {
            const orderData = {
                buyer_id: user.uid,
                farmer_id: farmerId,
                farmer_wallet_address: farmerWalletAddress,
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
            
            const orderRef = await addDoc(collection(firestore, 'orders'), orderData);
            const orderId = orderRef.id;

            const escrowContract = getEscrowPaymentContract(null as any); 
            const provContract = getProductProvenanceContract(null as any);

            escrowContract.initiateEscrow(
                orderId,
                farmerWalletAddress,
                { value: ethers.parseEther(subtotal.toString()) }
            ).then(tx => console.log(`[MOCK] Escrow tx submitted: ${tx.hash}`));

            for (const item of cartItems) {
                provContract.updateHistory(item.product_id, `Sold to Buyer ${user.uid.slice(0,6)} in Order #${orderId.slice(0,6)}`)
                 .then(tx => console.log(`[MOCK] Provenance tx submitted: ${tx.hash}`));
            }
            
            updateDocumentNonBlocking(orderRef, { status: 'confirmed' });

            const batch = writeBatch(firestore);
            cartItems.forEach(item => {
                const cartItemRef = doc(firestore, 'users', user.uid, 'cart', item.id);
                batch.delete(cartItemRef);
            });
            await batch.commit();
            
            toast({
                title: 'Order Placed Successfully!',
                description: `Your order #${orderId.slice(0,6)} has been confirmed and payment is secured in escrow.`,
            });

            router.push('/buyer/orders');

        } catch (error: any) {
            console.error("Failed to place order:", error);
            toast({
                variant: 'destructive',
                title: 'Order Failed',
                description: error.reason || error.message || 'An unexpected error occurred.',
            });
        } finally {
            setIsPlacingOrder(false);
        }
    };

    const renderLoadingState = () => (
        <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-16 w-16 rounded-md" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/4" />
                    </div>
                    <Skeleton className="h-5 w-16" />
                </div>
            ))}
        </div>
    );

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
                            {isLoading && renderLoadingState()}
                            {!isLoading && (!cartItems || cartItems.length === 0) && <p>Your cart is empty.</p>}
                            {cartItems && cartItems.length > 0 && (
                                <div className="space-y-4">
                                    {cartItems.map(item => (
                                        <div key={item.id} className="flex items-center gap-4">
                                            <div className="relative h-16 w-16 rounded-md overflow-hidden bg-muted">
                                                <Image src={item.image_url!} alt={item.product_name} layout="fill" objectFit="cover" />
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
                                <h3 className="text-sm font-medium mb-2">Simulated Wallet</h3>
                                <div className='flex items-center gap-2 p-3 rounded-md bg-secondary text-secondary-foreground'>
                                    <Wallet className="h-5 w-5"/>
                                    {userLoading ? <Skeleton className="h-4 w-32" /> : (
                                        <p className="text-xs font-mono">
                                            {user?.walletAddress ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}` : 'No Wallet'}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <Button 
                                className="w-full" 
                                size="lg" 
                                disabled={userLoading || !user?.walletAddress || isLoading || !cartItems || cartItems.length === 0 || isPlacingOrder || !farmerWalletAddress}
                                onClick={handlePlaceOrder}
                            >
                                {isPlacingOrder && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isPlacingOrder ? 'Placing Order...' : `Place Order & Pay $${subtotal.toFixed(2)}`}
                            </Button>
                            {!farmerWalletAddress && cartItems && cartItems.length > 0 && (
                                 <div className="text-center text-xs text-destructive p-2 bg-destructive/10 rounded-md">
                                    The farmer for this item has not connected a wallet yet. You cannot place this order.
                                </div>
                            )}
                             <div className="text-center text-xs text-muted-foreground p-2 bg-secondary rounded-md">
                                Clicking "Place Order" will simulate a blockchain transaction to secure your payment in a mock escrow.
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
