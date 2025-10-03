import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import RoleCards from "@/components/landing/RoleCards";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-7xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Register for AgriClear</CardTitle>
            <CardDescription>
              Please select your role in the supply chain to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="py-8">
              <RoleCards />
            </div>
            <div className="text-center">
              <Button asChild variant="outline">
                <Link href="/">Go back to Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
