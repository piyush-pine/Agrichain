import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Register</CardTitle>
          <CardDescription>Join AgriChain today</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">Registration form will be implemented here. Please select a role from the homepage.</p>
           <Button asChild className="w-full mt-6">
              <Link href="/">Go back to Home</Link>
           </Button>
        </CardContent>
      </Card>
    </div>
  );
}
