
'use client';

import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck, Map, ListChecks } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/firebase/auth/use-user";

export default function LogisticsDashboardPage() {
  const { user } = useUser();

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
          <div>
              <h1 className="text-3xl font-bold">Welcome, {user?.displayName || 'Logistics Partner'}!</h1>
              <p className="text-muted-foreground">Manage your shipments and routes efficiently.</p>
          </div>
          <Button asChild>
              <Link href="/logistics/shipments">
                  <Truck className="mr-2 h-4 w-4" />
                  View Active Shipments
              </Link>
          </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              <span>Active Shipments</span>
            </CardTitle>
            <CardDescription>View and manage ongoing deliveries.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">You have <strong>5</strong> active shipments (mock data).</p>
            <Button asChild variant="secondary" className="w-full">
                <Link href="/logistics/shipments">Manage Shipments</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Map className="h-5 w-5 text-blue-500" />
                <span>Route Planner</span>
            </CardTitle>
            <CardDescription>Optimize your delivery routes for efficiency.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Plan a new multi-stop route.</p>
            <Button asChild variant="secondary" className="w-full">
                <Link href="/logistics/route-planner">Plan Route</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-green-500" />
                <span>Completed Deliveries</span>
            </CardTitle>
            <CardDescription>Review your history of completed jobs.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">You've completed <strong>28</strong> deliveries this month.</p>
            <Button asChild variant="secondary" className="w-full">
                <Link href="/logistics/history">View History</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

    </DashboardLayout>
  );
}
