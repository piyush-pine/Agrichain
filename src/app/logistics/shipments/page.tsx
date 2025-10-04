
'use client';

import React from 'react';
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// Mock data for shipments - we will replace this with live data from Firestore later.
const shipments = [
  { id: "SHP732", origin: "Nashik, MH", destination: "Mumbai, MH", status: "in-transit", products: "Tomatoes (100kg)" },
  { id: "SHP591", origin: "Mysuru, KA", destination: "Bengaluru, KA", status: "picked", products: "Organic Rice (500kg)" },
  { id: "SHP648", origin: "Indore, MP", destination: "Delhi, DL", status: "in-transit", products: "Soybeans (1 Ton)" },
  { id: "SHP203", origin: "Chittoor, AP", destination: "Chennai, TN", status: "picked", products: "Mangoes (250kg)" },
  { id: "SHP887", origin: "Hassan, KA", destination: "Mangaluru, KA", status: "delivered", products: "Coffee Beans (300kg)" },
];

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" | "success" } = {
  "in-transit": "default",
  "picked": "secondary",
  "delivered": "success",
};

export default function ShipmentsPage() {
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
                            <TableHead>Origin</TableHead>
                            <TableHead>Destination</TableHead>
                            <TableHead>Products</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {shipments.map((shipment) => (
                            <TableRow key={shipment.id}>
                                <TableCell className="font-medium">{shipment.id}</TableCell>
                                <TableCell>{shipment.origin}</TableCell>
                                <TableCell>{shipment.destination}</TableCell>
                                <TableCell>{shipment.products}</TableCell>
                                <TableCell>
                                    <Badge variant={statusVariant[shipment.status] || "default"}>{shipment.status}</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button size="icon" variant="ghost">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem>Update Status</DropdownMenuItem>
                                            <DropdownMenuItem>View Details</DropdownMenuItem>
                                            <DropdownMenuItem>Log IoT Data</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </DashboardLayout>
  );
}

