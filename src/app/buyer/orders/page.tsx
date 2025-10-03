
'use client';

import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const orders = [
    { id: "ORD001", product: "Organic Red Tomatoes", date: "2023-10-28", status: "Shipped", amount: 25.50 },
    { id: "ORD002", product: "Fresh Spinach", date: "2023-10-25", status: "Delivered", amount: 15.00 },
    { id: "ORD003", product: "Basmati Rice (5kg)", date: "2023-10-22", status: "Delivered", amount: 45.00 },
    { id: "ORD004", product: "Himalayan Apples", date: "2023-10-20", status: "Processing", amount: 35.75 },
];

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" | "success" } = {
  Shipped: "default",
  Processing: "secondary",
  Delivered: "success",
};

export default function BuyerOrdersPage() {
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
                            <TableCell>{order.product}</TableCell>
                            <TableCell>{order.date}</TableCell>
                            <TableCell>
                                <Badge variant={statusVariant[order.status] || "default"}>{order.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right">${order.amount.toFixed(2)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
