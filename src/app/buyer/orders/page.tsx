
'use client';

import React from 'react';
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/firebase/auth/use-user";
import { useFirestore, useMemoFirebase } from "@/firebase/provider";
import { useCollection, updateDocumentNonBlocking } from "@/firebase";
import { collection, query, where, orderBy, doc } from "firebase/firestore";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getEscrowPaymentContract, releasePaymentFromEscrow } from '@/lib/blockchain';
import { ethers } from 'ethers';

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" | "success" } = {
  shipped: "default",
  pending: "secondary",
  delivered: "success",
  confirmed: "default",
  paid: "success",
  processing: "secondary",
};

export default function BuyerOrdersPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const ordersQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
        collection(firestore, "orders"), 
        where("buyer_id", "==", user.uid),
        orderBy("created_at", "desc")
    );
  }, [user, firestore]);

  const { data: orders, isLoading } = useCollection(ordersQuery);

  const handleConfirmDelivery = async (order: any) => {
    if (!window.ethereum) {
        toast({ variant: 'destructive', title: 'MetaMask not detected!' });
        return;
    }
     if (!order.farmer_wallet_address) {
        toast({ variant: 'destructive', title: 'Error', description: 'Farmer wallet address is not available for this order.' });
        return;
    }

    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        toast({ title: 'Confirming Delivery...', description: 'Please approve the transaction in MetaMask to release payment.' });
        
        const tx = await releasePaymentFromEscrow(signer, order.id, order.farmer_wallet_address);
        
        toast({ title: 'Processing Blockchain Transaction', description: `Waiting for confirmation... Tx: ${tx.hash.slice(0,10)}...` });
        await tx.wait();

        // Update Firestore document
        const orderRef = doc(firestore, 'orders', order.id);
        updateDocumentNonBlocking(orderRef, { status: 'delivered' });
        
        // We can add another step to confirm payment on-chain and then mark as 'paid'
        // For now, we'll assume it's paid after release
        setTimeout(() => {
             updateDocumentNonBlocking(orderRef, { status: 'paid', escrow_released: true });
        }, 1000); // give a second for the 'delivered' state to be seen

        toast({
            variant: 'success',
            title: 'Payment Released!',
            description: `You've confirmed delivery. Funds have been sent to the farmer.`,
        });

    } catch (error: any) {
        console.error("Failed to release payment:", error);
        toast({
            variant: 'destructive',
            title: 'Transaction Failed',
            description: error.reason || error.message || 'Could not release payment.',
        });
    }
  };

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">My Orders</h1>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Order History</CardTitle>
            <CardDescription>Here's a list of all your purchases on AgriClear.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">Loading orders...</TableCell>
                      </TableRow>
                    ) : orders && orders.length > 0 ? (
                      orders.map((order) => (
                          <TableRow key={order.id}>
                              <TableCell className="font-medium">#{order.id.slice(0, 6)}...</TableCell>
                              <TableCell>{order.items.map((i:any) => i.product_name).join(', ')}</TableCell>
                              <TableCell>{order.created_at ? new Date(order.created_at.seconds * 1000).toLocaleDateString() : 'N/A'}</TableCell>
                              <TableCell>
                                  <Badge variant={statusVariant[order.status.toLowerCase()] || "default"}>{order.status}</Badge>
                              </TableCell>
                              <TableCell className="text-right">${order.amount.toFixed(2)}</TableCell>
                              <TableCell className="text-center">
                                {order.status === 'shipped' && (
                                    <Button size="sm" onClick={() => handleConfirmDelivery(order)}>
                                        Confirm Delivery
                                    </Button>
                                )}
                              </TableCell>
                          </TableRow>
                      ))
                    ) : (
                      <TableRow>
                          <TableCell colSpan={6} className="text-center">You have no orders yet. <Link href="/buyer/marketplace" className="text-primary underline">Start shopping</Link>.</TableCell>
                      </TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
