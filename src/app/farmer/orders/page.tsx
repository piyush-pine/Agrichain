
'use client';

import React from 'react';
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from '@/firebase/auth/use-user';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import { useCollection } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';


const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" | "success" } = {
  shipped: "default",
  processing: "secondary",
  delivered: "success",
  pending: "outline",
  confirmed: "default",
  paid: "success",
};

export default function FarmerOrdersPage() {
    const { user } = useUser();
    const firestore = useFirestore();

    const ordersQuery = useMemoFirebase(() => {
        if (!user) return null;
        return query(collection(firestore, "orders"), where("farmer_id", "==", user.uid));
    }, [user, firestore]);

    const { data: orders, isLoading } = useCollection(ordersQuery);

    if (isLoading) {
        return <DashboardLayout><div>Loading...</div></DashboardLayout>
    }

    const filteredOrders = (status: string | string[]) => {
        const statuses = Array.isArray(status) ? status : [status];
        return orders?.filter(o => statuses.includes(o.status)) || [];
    }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Your Orders</h1>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Order Management</CardTitle>
            <CardDescription>A complete list of all orders for your products.</CardDescription>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="all">
                <TabsList className="mb-4">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="new">New</TabsTrigger>
                    <TabsTrigger value="processing">Processing</TabsTrigger>
                    <TabsTrigger value="shipped">Shipped</TabsTrigger>
                    <TabsTrigger value="delivered">Delivered</TabsTrigger>
                </TabsList>
                <TabsContent value="all">
                    <OrderTable orders={orders || []} firestore={firestore} />
                </TabsContent>
                 <TabsContent value="new">
                    <OrderTable orders={filteredOrders('confirmed')} firestore={firestore} />
                </TabsContent>
                <TabsContent value="processing">
                    <OrderTable orders={filteredOrders('processing')} firestore={firestore} />
                </TabsContent>
                <TabsContent value="shipped">
                    <OrderTable orders={filteredOrders('shipped')} firestore={firestore} />
                </TabsContent>
                <TabsContent value="delivered">
                    <OrderTable orders={filteredOrders('delivered')} firestore={firestore} />
                </TabsContent>
            </Tabs>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

function OrderTable({ orders, firestore }: { orders: any[], firestore: any }) {
    const { toast } = useToast();

    const handleUpdateStatus = (orderId: string, newStatus: string) => {
        const orderRef = doc(firestore, 'orders', orderId);
        updateDocumentNonBlocking(orderRef, { status: newStatus });
        toast({
            title: "Order Updated",
            description: `Order #${orderId.slice(0,6)} marked as ${newStatus}.`,
        });
    };

    if (!orders.length) {
        return <div className="text-center text-muted-foreground py-8">No orders found in this category.</div>;
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {orders.map((order) => (
                    <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id.slice(0,6)}...</TableCell>
                        <TableCell>{order.buyer_id.slice(0,6)}...</TableCell>
                        <TableCell>{order.items.map((i:any) => i.product_name).join(', ')}</TableCell>
                        <TableCell>{order.created_at ? new Date(order.created_at.seconds * 1000).toLocaleDateString() : 'N/A'}</TableCell>
                        <TableCell>
                            <Badge variant={statusVariant[order.status.toLowerCase()] || "default"}>{order.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">${order.amount.toFixed(2)}</TableCell>
                        <TableCell className="text-center">
                            {order.status === 'confirmed' && (
                                <Button size="sm" onClick={() => handleUpdateStatus(order.id, 'processing')}>Accept Order</Button>
                            )}
                             {order.status === 'processing' && (
                                <Button size="sm" onClick={() => handleUpdateStatus(order.id, 'shipped')}>Mark as Shipped</Button>                            )}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
