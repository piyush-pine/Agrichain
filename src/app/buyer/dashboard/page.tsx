
'use client';

import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Package, Heart } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/firebase/auth/use-user";

export default function BuyerDashboardPage() {
  const { user } = useUser();

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
          <div>
              <h1 className="text-3xl font-bold">Welcome, {user?.displayName || 'Buyer'}!</h1>
              <p className="text-muted-foreground">Your hub for fresh, traceable produce.</p>
          </div>
          <Button asChild>
              <Link href="/buyer/marketplace">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Browse Marketplace
              </Link>
          </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              <span>My Orders</span>
            </CardTitle>
            <CardDescription>Track your active and past orders.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">You have <strong>3</strong> active orders.</p>
            <Button asChild variant="secondary" className="w-full">
                <Link href="/buyer/orders">View Orders</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-destructive" />
                <span>Favorites</span>
            </CardTitle>
            <CardDescription>Re-order your favorite products and farmers.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">You have <strong>5</strong> favorite products.</p>
            <Button asChild variant="secondary" className="w-full">
                <Link href="/buyer/favorites">View Favorites</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="bg-primary/10 border-primary/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                <span>Explore the Marketplace</span>
            </CardTitle>
            <CardDescription>Discover new products from verified farmers across India.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">New seasonal produce just arrived!</p>
            <Button asChild className="w-full">
                <Link href="/buyer/marketplace">Start Shopping</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

    </DashboardLayout>
  );
}
