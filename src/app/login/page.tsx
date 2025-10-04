
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
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase/auth/use-user';
import { useEffect, useState } from 'react';
import { useCart } from '@/hooks/use-cart';
import { Loader2 } from 'lucide-react';

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

  // This effect reliably handles redirection AFTER a successful login and data fetch.
  useEffect(() => {
    // We only redirect if the user object exists AND has the role property.
    // This prevents redirecting before Firestore data is loaded.
    if (!isUserLoading && user && user.role) {
      mergeLocalCartWithFirestore(user.uid);
      const redirectUrl = localStorage.getItem('redirectAfterLogin') || `/${user.role}/dashboard`;
      localStorage.removeItem('redirectAfterLogin');
      router.push(redirectUrl);
    }
  }, [user, isUserLoading, router, mergeLocalCartWithFirestore]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    const auth = getAuth();
    
    toast({
        title: 'Attempting Login...',
        description: 'Please wait.',
    });

    try {
      // Awaiting here is crucial to catch errors and manage the form's submitting state.
      await signInWithEmailAndPassword(auth, values.email, values.password);
      // On success, we don't redirect here. The useEffect above will handle it
      // once the useUser hook is updated with the complete user profile.
    } catch (error: any) {
        let errorMessage = 'An unexpected error occurred.';
        // Handle specific Firebase auth errors for better user feedback
        switch (error.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
                errorMessage = 'Invalid email or password. Please try again.';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'Too many login attempts. Your account has been temporarily disabled.';
                break;
            default:
                 errorMessage = error.message;
                 break;
        }
        
        toast({
            variant: 'destructive',
            title: 'Login Failed',
            description: errorMessage,
        });
    }
    // The isSubmitting state is automatically managed by react-hook-form
    // because the onSubmit handler is `async`.
  }
  
  // Show a loading screen if the `useUser` hook is working or if we have a user
  // and are just waiting for the redirect effect to fire.
  if (isUserLoading || (user && user.role)) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Redirecting to your dashboard...</p>
            </div>
        </div>
    );
  }

  // Default state: show the login form.
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
                 {form.formState.isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                    </>
                 ) : (
                    'Login'
                 )}
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
