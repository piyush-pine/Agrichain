
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { getAuth } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase/auth/use-user';
import { useEffect } from 'react';
import { useCart } from '@/hooks/use-cart';
import { initiateEmailSignIn } from '@/firebase/non-blocking-login';

const formSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email.',
  }),
  password: z.string().min(6, {
    message: 'Password must be at least 6 characters.',
  }),
});

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter();
  const { user, loading: isUserLoading } = useUser();
  const { mergeLocalCartWithFirestore } = useCart();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    // This effect reliably handles redirection.
    // It will fire if a user is already logged in, or after a new login succeeds.
    if (!isUserLoading && user && user.role) {
      mergeLocalCartWithFirestore(user.uid);
      const redirectUrl = localStorage.getItem('redirectAfterLogin') || `/${user.role}/dashboard`;
      localStorage.removeItem('redirectAfterLogin');
      router.push(redirectUrl);
    }
  }, [user, isUserLoading, router, mergeLocalCartWithFirestore]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    const auth = getAuth();
    // This is now a non-blocking call. We let the onAuthStateChanged listener handle the result.
    initiateEmailSignIn(
      auth,
      values.email,
      values.password
    );

    // Provide immediate feedback to the user.
    toast({
        title: 'Attempting Login...',
        description: 'You will be redirected shortly.',
    });

    // We no longer use a try/catch here because errors will be handled globally
    // or by onAuthStateChanged, and we want the UI to remain responsive.
  }
  
  // Show a loading state if we're in the middle of a redirect.
  if (!isUserLoading && user && user.role) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <div>Redirecting...</div>
        </div>
    );
  }

  // Otherwise, always show the login form.
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Welcome back to AgriClear</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="user@agriclear.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          </Form>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="underline">
              Register
            </Link>
          </p>
          <Button asChild className="w-full mt-6" variant="outline">
            <Link href="/">Go back to Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
