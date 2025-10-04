
'use client';

import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Map } from "lucide-react";

export default function RoutePlannerPage() {

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Route Planner</h1>
      </div>
      <Card>
        <CardHeader>
            <CardTitle>Plan Your Route</CardTitle>
            <CardDescription>Add stops to optimize your delivery route.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-96 border-2 border-dashed rounded-lg bg-secondary/50">
            <Map className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold">Map Placeholder</h3>
            <p className="text-muted-foreground">The interactive route planning map will be displayed here.</p>
            <Button className="mt-6" disabled>Start Planning (Coming Soon)</Button>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
