
'use client';

import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/firebase/auth/use-user";
import { useFirestore, useMemoFirebase } from "@/firebase/provider";
import { useCollection } from "@/firebase";
import { collection, query, where } from "firebase/firestore";

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" | "success" } = {
  shipped: "default",
  pending: "secondary",
  delivered: "success",
  confirmed: "default"
};

export default function BuyerOrdersPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const ordersQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, "orders"), where("buyer_id", "==", user.uid));
  }, [user, firestore]);

  const { data: orders, isLoading } = useCollection(ordersQuery);

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
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">Loading orders...</TableCell>
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
                          </TableRow>
                      ))
                    ) : (
                      <TableRow>
                          <TableCell colSpan={5} className="text-center">You have no orders yet.</TableCell>
                      </TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
