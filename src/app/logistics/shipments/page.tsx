
'use client';

import React, { useState } from 'react';
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Thermometer, Droplets } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useUser } from '@/firebase/auth/use-user';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import { useCollection, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, where, doc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" | "success" } = {
  "in-transit": "default",
  "picked": "secondary",
  "delivered": "success",
};

function LogIotDataDialog({ shipmentId }: { shipmentId: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [temp, setTemp] = useState('');
    const [humidity, setHumidity] = useState('');
    const { toast } = useToast();
    const firestore = useFirestore();

    const handleSubmit = () => {
        if (!temp || !humidity || !firestore) {
            toast({
                variant: 'destructive',
                title: 'Invalid Input',
                description: 'Please enter both temperature and humidity.',
            });
            return;
        }

        const shipmentRef = doc(firestore, 'shipments', shipmentId);
        const newLogEntry = {
            temp: parseFloat(temp),
            humidity: parseFloat(humidity),
            timestamp: serverTimestamp(),
        };

        updateDocumentNonBlocking(shipmentRef, {
            condition_logs: arrayUnion(newLogEntry),
        });

        toast({
            title: "IoT Data Logged",
            description: `New condition data has been saved for shipment #${shipmentId.slice(0,6)}.`,
        });
        
        setIsOpen(false);
        setTemp('');
        setHumidity('');
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                 <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    Log IoT Data
                 </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Log IoT Condition Data</DialogTitle>
                    <DialogDescription>
                        Enter the current sensor readings for shipment #{shipmentId.slice(0,6)}. This will be recorded on the shipment's log.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="temperature" className="text-right">
                            Temperature
                        </Label>
                        <div className="col-span-3 relative">
                            <Thermometer className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="temperature"
                                type="number"
                                value={temp}
                                onChange={(e) => setTemp(e.target.value)}
                                placeholder="e.g., 4"
                                className="pl-10"
                            />
                             <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">°C</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="humidity" className="text-right">
                            Humidity
                        </Label>
                         <div className="col-span-3 relative">
                            <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="humidity"
                                type="number"
                                value={humidity}
                                onChange={(e) => setHumidity(e.target.value)}
                                placeholder="e.g., 85"
                                className="pl-10"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button type="submit" onClick={handleSubmit}>Log Data</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function ShipmentsPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const shipmentsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, "shipments"), where("logistics_id", "==", user.uid));
  }, [user, firestore]);

  const { data: shipments, isLoading } = useCollection(shipmentsQuery);

  const handleUpdateStatus = (shipmentId: string, newStatus: string) => {
    if (!firestore) return;
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
                                                <LogIotDataDialog shipmentId={shipment.id} />
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
