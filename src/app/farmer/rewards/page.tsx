
'use client';

import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Leaf, Recycle, Truck } from "lucide-react";

const rewards = [
  { type: "organic", points: 50, date: "2023-10-15", description: "Certified Organic Tomatoes batch" },
  { type: "zero-waste", points: 30, date: "2023-10-10", description: "Eco-friendly packaging for rice" },
  { type: "timely-delivery", points: 15, date: "2023-10-05", description: "Early delivery of mangoes order" },
  { type: "organic", points: 50, date: "2023-09-28", description: "Certified Organic Spinach batch" },
];

const rewardDetails: { [key: string]: { icon: React.ElementType, title: string, color: string } } = {
    organic: { icon: Leaf, title: "Organic Farming", color: "text-green-500" },
    "zero-waste": { icon: Recycle, title: "Zero-Waste Practice", color: "text-blue-500" },
    "timely-delivery": { icon: Truck, title: "Timely Delivery", color: "text-orange-500" },
}

export default function FarmerRewardsPage() {
  const totalPoints = rewards.reduce((sum, r) => sum + r.points, 0);

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
                    {rewards.map((reward, index) => {
                        const details = rewardDetails[reward.type];
                        const Icon = details.icon;
                        return (
                            <div key={index} className="flex items-center p-4 bg-secondary/50 rounded-lg">
                                <div className={`p-3 bg-background rounded-full mr-4 ${details.color}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div className="flex-grow">
                                    <p className="font-semibold">{details.title}</p>
                                    <p className="text-sm text-muted-foreground">{reward.description}</p>
                                </div>
                                <div className="text-right">
                                    <p className={`font-bold text-lg ${details.color}`}>+{reward.points} AGR</p>
                                    <p className="text-xs text-muted-foreground">{reward.date}</p>
                                </div>
                            </div>
                        )
                    })}
                </CardContent>
            </Card>
        </div>
        <div>
            <Card className="sticky top-20">
                <CardHeader className="items-center text-center">
                    <CardTitle className="text-2xl">Total Tokens</CardTitle>
                    <div className="flex items-center justify-center text-primary gap-2 my-4">
                        <Award className="w-12 h-12"/>
                        <p className="text-5xl font-bold">{totalPoints}</p>
                    </div>
                    <CardDescription>Redeem for platform benefits, lower fees, and premium features.</CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Potential for a chart or further breakdown here */}
                </CardContent>
            </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
