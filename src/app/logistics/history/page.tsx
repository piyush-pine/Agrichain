
'use client';

import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ListChecks } from "lucide-react";

export default function HistoryPage() {

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Delivery History</h1>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Completed Shipments</CardTitle>
            <CardDescription>A record of all your completed deliveries.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-96 border-2 border-dashed rounded-lg bg-secondary/50">
            <ListChecks className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">No History Found</h3>
            <p className="text-muted-foreground">Your completed shipments will appear here.</p>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
