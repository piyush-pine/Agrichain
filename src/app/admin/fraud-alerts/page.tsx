
'use client';

import React from 'react';
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import { useCollection, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc, orderBy, query } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

const typeVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
  'price-spike': "destructive",
  'fake-quality': "outline",
  'duplicate-listing': "secondary",
};

export default function AdminFraudAlertsPage() {
    const firestore = useFirestore();
    const { toast } = useToast();

    const alertsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, "fraud_alerts"), orderBy("detected_at", "desc"));
    }, [firestore]);

    const { data: alerts, isLoading } = useCollection(alertsQuery);

    const handleResolveAlert = (alertId: string) => {
        if (!firestore) return;
        const alertRef = doc(firestore, "fraud_alerts", alertId);
        updateDocumentNonBlocking(alertRef, { resolved: true });
        toast({
            title: "Alert Resolved",
            description: `Alert #${alertId.slice(0,6)} has been marked as resolved.`,
        });
    };

    return (
        <DashboardLayout>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">AI Fraud Alerts</h1>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Suspicious Activity Monitor</CardTitle>
                    <CardDescription>Review and manage potential fraud detected by the AI system.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Alert Type</TableHead>
                                <TableHead>Confidence</TableHead>
                                <TableHead>Details / ID</TableHead>
                                <TableHead>Detected At</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center">Loading alerts...</TableCell>
                                </TableRow>
                            ) : alerts && alerts.length > 0 ? (
                                alerts.map((alert) => (
                                    <TableRow key={alert.id} className={!alert.resolved ? 'bg-destructive/5' : ''}>
                                        <TableCell>
                                            <Badge variant={typeVariant[alert.type] || 'default'}>{alert.type}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{(alert.confidence * 100).toFixed(0)}%</div>
                                        </TableCell>
                                        <TableCell>
                                            <p className="font-mono text-xs">{alert.details}</p>
                                            <Link href={`/products/${alert.transaction_id}`} className="text-xs text-muted-foreground hover:underline" target="_blank">
                                                Product ID: {alert.transaction_id.slice(0,10)}...
                                            </Link>
                                        </TableCell>
                                        <TableCell>{alert.detected_at ? new Date(alert.detected_at.seconds * 1000).toLocaleString() : 'N/A'}</TableCell>
                                        <TableCell>
                                            <Badge variant={alert.resolved ? 'success' : 'destructive'}>
                                                {alert.resolved ? 'Resolved' : 'Active'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                             {!alert.resolved && (
                                                <Button size="sm" onClick={() => handleResolveAlert(alert.id)}>
                                                    <CheckCircle className="mr-2 h-4 w-4" />
                                                    Mark as Resolved
                                                </Button>
                                             )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center">No fraud alerts detected.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </DashboardLayout>
    );
}
