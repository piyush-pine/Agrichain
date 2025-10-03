
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Activity, Award, DollarSign, Leaf } from "lucide-react";

const stats = [
    { title: "Total Products", value: "12", icon: Leaf },
    { title: "Open Orders", value: "5", icon: Activity },
    { title: "Total Revenue", value: "$1,250", icon: DollarSign },
    { title: "Sustainability Tokens", value: "85 AGR", icon: Award },
];

const recentOrders = [
    { id: "ORD001", product: "Organic Tomatoes", date: "2023-10-26", status: "Shipped", amount: "$50.00" },
    { id: "ORD002", product: "Basmati Rice", date: "2023-10-25", status: "Processing", amount: "$120.00" },
    { id: "ORD003", product: "Fresh Mangoes", date: "2023-10-25", status: "Delivered", amount: "$75.00" },
    { id: "ORD004", product: "Organic Turmeric", date: "2023-10-24", status: "Shipped", amount: "$30.00" },
    { id: "ORD005", product: "Wheat Flour", date: "2023-10-23", status: "Delivered", amount: "$25.00" },
];

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
  Shipped: "default",
  Processing: "secondary",
  Delivered: "outline",
};


export default function FarmerDashboardPage() {
  return (
    <div className="grid gap-6">
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
                            +20.1% from last month
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Product</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentOrders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">{order.id}</TableCell>
                                    <TableCell>{order.product}</TableCell>
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
             <Card>
                <CardHeader>
                    <CardTitle>Sustainability Rewards</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center text-center p-8">
                     <Award className="w-16 h-16 text-green-500 mb-4" />
                     <p className="text-4xl font-bold text-gray-800">85 AGR</p>
                     <p className="text-sm text-muted-foreground mt-2">
                         You have earned 85 AgriClear tokens for your sustainable farming practices.
                     </p>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
