
'use client';

import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Award, DollarSign, Leaf, PlusCircle, ArrowUpRight } from "lucide-react";
import { useUser } from "@/firebase/auth/use-user";
import Link from "next/link";
import { useCollection } from "@/firebase";
import { collection, query, where, orderBy, limit } from "firebase/firestore";
import { useFirestore, useMemoFirebase } from "@/firebase/provider";
import React from "react";
import { ConnectWalletBanner } from "@/components/blockchain/ConnectWalletBanner";

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" | "success" } = {
  shipped: "default",
  processing: "secondary",
  delivered: "success",
  pending: "outline",
  confirmed: "default",
  paid: "success",
};

export default function FarmerDashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const productsQuery = useMemoFirebase(() => {
      if (!user) return null;
      return query(collection(firestore, "products"), where("farmer_id", "==", user.uid));
  }, [user, firestore]);

  const ordersQuery = useMemoFirebase(() => {
      if (!user) return null;
      return query(
        collection(firestore, "orders"), 
        where("farmer_id", "==", user.uid),
        orderBy("created_at", "desc")
      );
  }, [user, firestore]);
  
  const { data: products, isLoading: productsLoading } = useCollection(productsQuery);
  const { data: orders, isLoading: ordersLoading } = useCollection(ordersQuery);

  const totalRevenue = orders?.filter(o => o.status === 'paid' || o.status === 'delivered').reduce((acc, order) => acc + order.amount, 0) || 0;
  const openOrdersCount = orders?.filter(o => o.status === 'confirmed' || o.status === 'processing').length || 0;

  const stats = [
      { title: "Total Products", value: productsLoading ? '...' : products?.length ?? 0, icon: Leaf, change: "", changeType: "increase" },
      { title: "Open Orders", value: ordersLoading ? '...' : openOrdersCount, icon: Activity, change: "", changeType: "increase" },
      { title: "Total Revenue", value: ordersLoading ? '...' : `$${totalRevenue.toFixed(2)}`, icon: DollarSign, change: "", changeType: "increase" },
      { title: "Sustainability Tokens", value: "0 AGR", icon: Award, change: "", changeType: "increase" },
  ];

  const recentOrders = orders?.slice(0, 5) || [];


  return (
    <DashboardLayout>
        {!user?.walletAddress && <ConnectWalletBanner />}
        <div className="flex items-center justify-between mb-6">
            <div>
                <h1 className="text-3xl font-bold">Welcome, {user?.displayName || 'Farmer'}!</h1>
                <p className="text-muted-foreground">Here's a snapshot of your farm's activity.</p>
            </div>
            <Button asChild>
                <Link href="/farmer/products/new">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add New Product
                </Link>
            </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            {stats.map((stat) => (
                <Card key={stat.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                        <stat.icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        {stat.change && (
                            <p className="text-xs text-muted-foreground flex items-center">
                                <ArrowUpRight className="h-3 w-3 mr-1 text-green-500"/>
                                <span className="text-green-500 font-semibold">{stat.change}</span>
                            </p>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>

        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Recent Orders</CardTitle>
                        <CardDescription>A summary of your most recent sales.</CardDescription>
                    </div>
                    <Button asChild variant="secondary" size="sm">
                        <Link href="/farmer/orders">View All Orders</Link>
                    </Button>
                </div>
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
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {ordersLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center">Loading orders...</TableCell>
                            </TableRow>
                        ) : recentOrders.length > 0 ? ( recentOrders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell className="font-medium">#{order.id.slice(0,6)}...</TableCell>
                                <TableCell>{order.items.map((i:any) => i.product_name).join(', ')}</TableCell>
                                <TableCell>{order.created_at ? new Date(order.created_at.seconds * 1000).toLocaleDateString() : 'N/A'}</TableCell>
                                <TableCell>
                                    <Badge variant={statusVariant[order.status.toLowerCase()] || "default"}>{order.status}</Badge>
                                </TableCell>
                                <TableCell className="text-right">${order.amount.toFixed(2)}</TableCell>
                            </TableRow>
                        ))) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center">You have no recent orders.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </DashboardLayout>
  );
}
