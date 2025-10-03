import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from 'next/link';
import { Button } from '@/components/ui/button';

function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export default function RegisterRolePage({ params }: { params: { role: string } }) {
  const role = params.role ? capitalizeFirstLetter(params.role) : 'User';
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Register as a {role}</CardTitle>
          <CardDescription>Create your AgriChain account</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">Registration form for a {role} will be implemented here.</p>
           <Button asChild className="w-full mt-6">
              <Link href="/">Go back to Home</Link>
           </Button>
        </CardContent>
      </Card>
    </div>
  );
}
