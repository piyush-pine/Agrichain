
'use client';

import React from 'react';
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from '@/firebase/auth/use-user';
import { useFirestore } from '@/firebase/provider';
import { useCollection } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" | "success" } = {
  Shipped: "default",
  Processing: "secondary",
  Delivered: "success",
  Pending: "outline",
  Confirmed: "default",
  Paid: "success",
};

export default function FarmerOrdersPage() {
    const { user } = useUser();
    const firestore = useFirestore();

    const ordersQuery = React.useMemo(() => {
        if (!user) return null;
        return query(collection(firestore, "orders"), where("farmer_id", "==", user.uid));
    }, [user, firestore]);

    const { data: orders, isLoading } = useCollection(ordersQuery);

    if (isLoading) {
        return <DashboardLayout><div>Loading...</div></DashboardLayout>
    }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Your Orders</h1>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Order History</CardTitle>
            <CardDescription>A complete list of all orders for your products.</CardDescription>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="all">
                <TabsList className="mb-4">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="processing">Processing</TabsTrigger>
                    <TabsTrigger value="shipped">Shipped</TabsTrigger>
                    <TabsTrigger value="delivered">Delivered</TabsTrigger>
                </TabsList>
                <TabsContent value="all">
                    <OrderTable orders={orders || []} />
                </TabsContent>
                <TabsContent value="processing">
                    <OrderTable orders={orders?.filter(o => o.status === 'Processing') || []} />
                </TabsContent>
                <TabsContent value="shipped">
                    <OrderTable orders={orders?.filter(o => o.status === 'Shipped') || []} />
                </TabsContent>
                <TabsContent value="delivered">
                    <OrderTable orders={orders?.filter(o => o.status === 'Delivered') || []} />
                </TabsContent>
            </Tabs>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

function OrderTable({ orders }: { orders: any[] }) {
    if (!orders.length) {
        return <div className="text-center text-muted-foreground py-8">No orders found.</div>;
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Buyer ID</TableHead>
                    <TableHead>Product ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {orders.map((order) => (
                    <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id.slice(0,6)}...</TableCell>
                        <TableCell>{order.buyer_id.slice(0,6)}...</TableCell>
                        <TableCell>{order.product_id.slice(0,6)}...</TableCell>
                        <TableCell>{order.created_at ? new Date(order.created_at.seconds * 1000).toLocaleDateString() : 'N/A'}</TableCell>
                        <TableCell>
                            <Badge variant={statusVariant[order.status] || "default"}>{order.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">${order.amount.toFixed(2)}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
