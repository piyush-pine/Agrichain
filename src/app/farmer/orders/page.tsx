
'use client';

import React, { useState } from 'react';
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from '@/firebase/auth/use-user';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import { useCollection, addDocumentNonBlocking } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { doc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Truck } from 'lucide-react';


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

    const logisticsQuery = useMemoFirebase(() => {
        return query(collection(firestore, "users"), where("role", "==", "logistics"));
    }, [firestore]);

    const { data: orders, isLoading: isLoadingOrders } = useCollection(ordersQuery);
    const { data: logisticsPartners, isLoading: isLoadingLogistics } = useCollection(logisticsQuery);

    if (isLoadingOrders || isLoadingLogistics) {
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
                    <TabsTrigger value="delivered">Delivered & Paid</TabsTrigger>
                </TabsList>
                <TabsContent value="all">
                    <OrderTable orders={orders || []} firestore={firestore} logisticsPartners={logisticsPartners || []} />
                </TabsContent>
                 <TabsContent value="new">
                    <OrderTable orders={filteredOrders('confirmed')} firestore={firestore} logisticsPartners={logisticsPartners || []} />
                </TabsContent>
                <TabsContent value="processing">
                    <OrderTable orders={filteredOrders('processing')} firestore={firestore} logisticsPartners={logisticsPartners || []} />
                </TabsContent>
                <TabsContent value="shipped">
                    <OrderTable orders={filteredOrders('shipped')} firestore={firestore} logisticsPartners={logisticsPartners || []} />
                </TabsContent>
                <TabsContent value="delivered">
                    <OrderTable orders={filteredOrders(['delivered', 'paid'])} firestore={firestore} logisticsPartners={logisticsPartners || []} />
                </TabsContent>
            </Tabs>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

function OrderTable({ orders, firestore, logisticsPartners }: { orders: any[], firestore: any, logisticsPartners: any[] }) {
    const { toast } = useToast();
    const [selectedLogistics, setSelectedLogistics] = useState<{ [key: string]: string }>({});

    const handleUpdateStatus = (orderId: string, newStatus: string) => {
        const orderRef = doc(firestore, 'orders', orderId);
        updateDocumentNonBlocking(orderRef, { status: newStatus });
        toast({
            title: "Order Updated",
            description: `Order #${orderId.slice(0,6)} marked as ${newStatus}.`,
        });
    };
    
    const handleMarkAsShipped = (order: any) => {
        const logisticsId = selectedLogistics[order.id];
        if (!logisticsId) {
            toast({
                variant: 'destructive',
                title: "Logistics partner not selected",
                description: "Please select a logistics partner before marking as shipped.",
            });
            return;
        }

        // 1. Update order status
        const orderRef = doc(firestore, 'orders', order.id);
        updateDocumentNonBlocking(orderRef, { status: 'shipped' });

        // 2. Create shipment document
        const shipmentCollection = collection(firestore, 'shipments');
        const shipmentData = {
            order_id: order.id,
            logistics_id: logisticsId,
            status: 'picked', // Initial status for a new shipment
            created_at: serverTimestamp(),
            // You can add more details from the order if needed
            origin: "Farmer's Location", // Placeholder
            destination: "Buyer's Location", // Placeholder
            items: order.items,
        };
        addDocumentNonBlocking(shipmentCollection, shipmentData);

        toast({
            title: "Order Shipped!",
            description: `Order #${order.id.slice(0,6)} has been marked as shipped and assigned.`,
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
                        <TableCell className="text-center space-y-2">
                            {order.status === 'confirmed' && (
                                <Button size="sm" onClick={() => handleUpdateStatus(order.id, 'processing')}>Accept Order</Button>
                            )}
                             {order.status === 'processing' && (
                               <div className="flex items-center justify-center gap-2">
                                    <Select 
                                        onValueChange={(value) => setSelectedLogistics(prev => ({...prev, [order.id]: value}))}
                                    >
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Select Logistics" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {logisticsPartners.map(lp => (
                                                <SelectItem key={lp.id} value={lp.id}>
                                                    {lp.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button size="sm" onClick={() => handleMarkAsShipped(order)} disabled={!selectedLogistics[order.id]}>
                                        <Truck className="mr-2 h-4 w-4" />
                                        Ship
                                    </Button>
                               </div>
                            )}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
