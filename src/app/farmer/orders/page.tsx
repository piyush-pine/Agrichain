
'use client';

import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const orders = [
    { id: "ORD001", product: "Organic Tomatoes", date: "2023-10-26", status: "Shipped", amount: "$50.00", buyer: "Retail Co." },
    { id: "ORD002", product: "Basmati Rice", date: "2023-10-25", status: "Processing", amount: "$120.00", buyer: "FoodStuffs Inc." },
    { id: "ORD003", product: "Fresh Mangoes", date: "2023-10-25", status: "Delivered", amount: "$75.00", buyer: "Juice Bar" },
    { id: "ORD004", product: "Himalayan Honey", date: "2023-10-23", status: "Shipped", amount: "$90.00", buyer: "Healthy Eats" },
    { id: "ORD005", product: "Organic Spinach", date: "2023-10-24", status: "Delivered", amount: "$35.00", buyer: "Retail Co." },

];

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" | "success" } = {
  Shipped: "default",
  Processing: "secondary",
  Delivered: "success",
};

export default function FarmerOrdersPage() {
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
                    <OrderTable orders={orders} />
                </TabsContent>
                <TabsContent value="processing">
                    <OrderTable orders={orders.filter(o => o.status === 'Processing')} />
                </TabsContent>
                <TabsContent value="shipped">
                    <OrderTable orders={orders.filter(o => o.status === 'Shipped')} />
                </TabsContent>
                <TabsContent value="delivered">
                    <OrderTable orders={orders.filter(o => o.status === 'Delivered')} />
                </TabsContent>
            </Tabs>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

function OrderTable({ orders }: { orders: typeof orders }) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {orders.map((order) => (
                    <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.buyer}</TableCell>
                        <TableCell>{order.product}</TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell>
                            <Badge variant={statusVariant[order.status] || "default"}>{order.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{order.amount}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}
