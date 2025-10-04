
'use client';

import React from 'react';
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useUser } from '@/firebase/auth/use-user';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import { useCollection, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, where, doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" | "success" } = {
  "in-transit": "default",
  "picked": "secondary",
  "delivered": "success",
};

export default function ShipmentsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const shipmentsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, "shipments"), where("logistics_id", "==", user.uid));
  }, [user, firestore]);

  const { data: shipments, isLoading } = useCollection(shipmentsQuery);

  const handleUpdateStatus = (shipmentId: string, newStatus: string) => {
    const shipmentRef = doc(firestore, 'shipments', shipmentId);
    updateDocumentNonBlocking(shipmentRef, { status: newStatus });
    toast({
        title: "Shipment Updated",
        description: `Shipment #${shipmentId.slice(0,6)} marked as ${newStatus}.`,
    });
  };

  return (
    <DashboardLayout>
        <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Your Shipments</h1>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Active and Recent Shipments</CardTitle>
                <CardDescription>Manage your assigned shipments and update their status.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Shipment ID</TableHead>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Products</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date Assigned</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                         {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center">Loading shipments...</TableCell>
                            </TableRow>
                        ) : shipments && shipments.length > 0 ? (
                            shipments.map((shipment) => (
                                <TableRow key={shipment.id}>
                                    <TableCell className="font-medium">#{shipment.id.slice(0,6)}...</TableCell>
                                    <TableCell>#{shipment.order_id.slice(0,6)}...</TableCell>
                                    <TableCell>{shipment.items.map((i:any) => i.product_name).join(', ')}</TableCell>
                                    <TableCell>
                                        <Badge variant={statusVariant[shipment.status] || "default"}>{shipment.status}</Badge>
                                    </TableCell>
                                    <TableCell>{shipment.created_at ? new Date(shipment.created_at.seconds * 1000).toLocaleDateString() : 'N/A'}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button size="icon" variant="ghost">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {shipment.status === 'picked' && (
                                                    <DropdownMenuItem onClick={() => handleUpdateStatus(shipment.id, 'in-transit')}>Mark In-Transit</DropdownMenuItem>
                                                )}
                                                {shipment.status === 'in-transit' && (
                                                    <DropdownMenuItem onClick={() => handleUpdateStatus(shipment.id, 'delivered')}>Mark Delivered</DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem>View Details</DropdownMenuItem>
                                                <DropdownMenuItem>Log IoT Data</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center">No shipments assigned to you.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </DashboardLayout>
  );
}
