
'use client';

import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Leaf, Recycle, Truck, Loader2 } from "lucide-react";
import { useUser } from "@/firebase/auth/use-user";
import { useFirestore, useMemoFirebase } from "@/firebase/provider";
import { useCollection } from "@/firebase";
import { collection, query, where, orderBy } from "firebase/firestore";
import React from "react";

const rewardDetails: { [key: string]: { icon: React.ElementType, title: string, color: string, description: string } } = {
    "organic": { icon: Leaf, title: "Organic Farming", color: "text-green-500", description: "For listing certified organic products" },
    "zero-waste": { icon: Recycle, title: "Zero-Waste Practice", color: "text-blue-500", description: "For using eco-friendly packaging" },
    "timely-delivery": { icon: Truck, title: "Timely Delivery", color: "text-orange-500", description: "For a successfully completed order" },
};

export default function FarmerRewardsPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const rewardsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
        collection(firestore, "rewards"),
        where("user_id", "==", user.uid),
        orderBy("issued_at", "desc")
    );
  }, [user, firestore]);

  const { data: rewards, isLoading } = useCollection(rewardsQuery);

  const totalPoints = rewards?.reduce((sum, r) => sum + r.points, 0) || 0;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Sustainability Rewards</h1>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Your Rewards History</CardTitle>
                    <CardDescription>Tokens earned for sustainable and efficient practices.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-10">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : rewards && rewards.length > 0 ? (
                        rewards.map((reward, index) => {
                            const details = rewardDetails[reward.type];
                            if (!details) return null;

                            const Icon = details.icon;
                            return (
                                <div key={index} className="flex items-center p-4 bg-secondary/50 rounded-lg">
                                    <div className={`p-3 bg-background rounded-full mr-4 ${details.color}`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-semibold">{details.title}</p>
                                        <p className="text-sm text-muted-foreground">{`Order #${reward.order_id.slice(0,6)}...`}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-bold text-lg ${details.color}`}>+{reward.points} AGR</p>
                                        <p className="text-xs text-muted-foreground">
                                            {reward.issued_at ? new Date(reward.issued_at.seconds * 1000).toLocaleDateString() : '...'}
                                        </p>
                                    </div>
                                </div>
                            )
                        })
                    ) : (
                         <div className="text-center py-10">
                            <h3 className="font-semibold">No Rewards Yet</h3>
                            <p className="text-sm text-muted-foreground">Complete orders to start earning rewards.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
        <div>
            <Card className="sticky top-20">
                <CardHeader className="items-center text-center">
                    <CardTitle className="text-2xl">Total Tokens</CardTitle>
                    <div className="flex items-center justify-center text-primary gap-2 my-4">
                        <Award className="w-12 h-12"/>
                        <p className="text-5xl font-bold">{isLoading ? <Loader2 className="h-10 w-10 animate-spin" /> : totalPoints}</p>
                    </div>
                    <CardDescription>Redeem for platform benefits, lower fees, and premium features.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button className="w-full" disabled>Redeem Tokens (Coming Soon)</Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
