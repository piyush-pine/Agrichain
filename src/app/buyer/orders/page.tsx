
'use client';

import React, { useState } from 'react';
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/firebase/auth/use-user";
import { useFirestore, useMemoFirebase } from "@/firebase/provider";
import { useCollection, updateDocumentNonBlocking, addDocumentNonBlocking } from "@/firebase";
import { collection, query, where, orderBy, doc, serverTimestamp } from "firebase/firestore";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { releasePaymentFromEscrow } from '@/lib/blockchain';
import { QrCode, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import QRCode from 'react-qr-code';

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" | "success" } = {
  shipped: "default",
  pending: "secondary",
  delivered: "success",
  confirmed: "default",
  paid: "success",
  processing: "secondary",
  failed: "destructive",
};

export default function BuyerOrdersPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [selectedProduct, setSelectedProduct] = useState<{ id: string, name: string } | null>(null);
  const [isConfirming, setIsConfirming] = useState<string | null>(null);


  const ordersQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
        collection(firestore, "orders"), 
        where("buyer_id", "==", user.uid),
        orderBy("created_at", "desc")
    );
  }, [user, firestore]);

  const { data: orders, isLoading } = useCollection(ordersQuery);

  const handleConfirmDelivery = (order: any) => {
     if (!order.farmer_wallet_address) {
        toast({ variant: 'destructive', title: 'Error', description: 'Farmer wallet address is not available for this order.' });
        return;
    }

    setIsConfirming(order.id);
    toast({ title: 'Confirming Delivery (Simulated)...', description: 'Releasing payment from escrow.' });

    releasePaymentFromEscrow(null as any, order.id)
        .then(tx => {
            console.log(`[MOCK] Payment release tx submitted: ${tx.hash}`);

            const orderRef = doc(firestore, 'orders', order.id);
            updateDocumentNonBlocking(orderRef, { status: 'delivered', escrow_released: true });
            
            const rewardsCollection = collection(firestore, 'rewards');
            addDocumentNonBlocking(rewardsCollection, {
                user_id: order.farmer_id,
                type: 'timely-delivery',
                points: 15,
                order_id: order.id,
                verified: true,
                issued_at: serverTimestamp(),
            });

            setTimeout(() => {
                updateDocumentNonBlocking(orderRef, { status: 'paid' });
            }, 2000); 

            toast({
                variant: 'success',
                title: 'Payment Released! (Simulated)',
                description: `You've confirmed delivery. Mock funds sent & farmer rewarded.`,
            });
        })
        .catch(error => {
            console.error("Failed to release payment:", error);
            toast({
                variant: 'destructive',
                title: 'Mock Transaction Failed',
                description: error.reason || error.message || 'Could not release payment.',
            });
        })
        .finally(() => {
            setIsConfirming(null);
        });
  };

  const getProductUrl = (productId: string) => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/products/${productId}`;
    }
    return '';
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
            <Dialog>
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
                                  <TableCell>
                                      <ul className="list-disc list-inside">
                                        {order.items.map((item: any) => (
                                          <li key={item.product_id} className="flex items-center gap-2">
                                            <span>{item.product_name}</span>
                                             <DialogTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedProduct({id: item.product_id, name: item.product_name})}>
                                                    <QrCode className="h-4 w-4 text-muted-foreground" />
                                                </Button>
                                            </DialogTrigger>
                                          </li>
                                        ))}
                                      </ul>
                                  </TableCell>
                                  <TableCell>{order.created_at ? new Date(order.created_at.seconds * 1000).toLocaleDateString() : 'N/A'}</TableCell>
                                  <TableCell>
                                      <Badge variant={statusVariant[order.status.toLowerCase()] || "default"}>{order.status}</Badge>
                                  </TableCell>
                                  <TableCell className="text-right">${order.amount.toFixed(2)}</TableCell>
                                  <TableCell className="text-center">
                                    {order.status === 'shipped' && (
                                        <Button 
                                            size="sm" 
                                            onClick={() => handleConfirmDelivery(order)}
                                            disabled={isConfirming === order.id}
                                        >
                                            {isConfirming === order.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            {isConfirming === order.id ? 'Confirming...' : 'Confirm Delivery'}
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
                {selectedProduct && (
                     <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Provenance QR Code for {selectedProduct.name}</DialogTitle>
                        </DialogHeader>
                        <div className="flex justify-center p-4 bg-white">
                            <QRCode value={getProductUrl(selectedProduct.id)} size={256} />
                        </div>
                        <p className="text-center text-sm text-muted-foreground">Scan this code to view the product's journey.</p>
                    </DialogContent>
                )}
            </Dialog>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
