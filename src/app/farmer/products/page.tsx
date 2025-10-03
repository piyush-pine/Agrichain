
'use client';

import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, PlusCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const products = [
  { id: "PROD001", name: "Organic Tomatoes", price: "$2.50/kg", status: "Listed", date: "2023-10-20" },
  { id: "PROD002", name: "Basmati Rice", price: "$5.00/kg", status: "Listed", date: "2023-10-18" },
  { id: "PROD003", name: "Fresh Mangoes", price: "$8.00/kg", status: "Sold", date: "2023-10-15" },
  { id: "PROD004", name: "Himalayan Honey", price: "$15.00/jar", status: "Listed", date: "2023-10-12" },
];

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" | "success" } = {
  Listed: "success",
  Sold: "secondary",
};


export default function FarmerProductsPage() {
  return (
    <DashboardLayout>
        <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">My Products</h1>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Product
            </Button>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Your Product Listings</CardTitle>
                <CardDescription>Manage your products available on the marketplace.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product Name</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date Listed</TableHead>
                            <TableHead>
                                <span className="sr-only">Actions</span>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map((product) => (
                            <TableRow key={product.id}>
                                <TableCell className="font-medium">{product.name}</TableCell>
                                <TableCell>{product.price}</TableCell>
                                <TableCell>
                                    <Badge variant={statusVariant[product.status] || "default"}>{product.status}</Badge>
                                </TableCell>
                                <TableCell>{product.date}</TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Toggle menu</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem>Edit</DropdownMenuItem>
                                            <DropdownMenuItem>View Analytics</DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
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
