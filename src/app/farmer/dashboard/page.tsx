
'use client';

import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Award, DollarSign, Leaf, PlusCircle } from "lucide-react";
import { useUser } from "@/firebase/auth/use-user";

const stats = [
    { title: "Total Products", value: "12", icon: Leaf, change: "+5 this month" },
    { title: "Open Orders", value: "5", icon: Activity, change: "+2 today" },
    { title: "Total Revenue", value: "$1,250", icon: DollarSign, change: "+20.1% this month" },
    { title: "Sustainability Tokens", value: "85 AGR", icon: Award, change: "+15 earned" },
];

const recentOrders = [
    { id: "ORD001", product: "Organic Tomatoes", date: "2023-10-26", status: "Shipped", amount: "$50.00" },
    { id: "ORD002", product: "Basmati Rice", date: "2023-10-25", status: "Processing", amount: "$120.00" },
    { id: "ORD003", product: "Fresh Mangoes", date: "2023-10-25", status: "Delivered", amount: "$75.00" },
];

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
  Shipped: "default",
  Processing: "secondary",
  Delivered: "outline",
};

export default function FarmerDashboardPage() {
  const { user } = useUser();

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold">Welcome, {user?.displayName || 'Farmer'}!</h1>
                <p className="text-muted-foreground">Here's a snapshot of your farm's activity.</p>
            </div>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Product
            </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
                <Card key={stat.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                        <stat.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <p className="text-xs text-muted-foreground">
                            {stat.change}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>

        <div className="grid grid-cols-1 gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                    <CardDescription>A summary of your most recent sales.</CardDescription>
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
                            {recentOrders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">{order.id}</TableCell>
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
                </CardContent>
            </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
