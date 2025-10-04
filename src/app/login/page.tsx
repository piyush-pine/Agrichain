
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
import { useEffect } from 'react';
import { useCart } from '@/hooks/use-cart';

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
  const { user, loading } = useUser();
  const { mergeLocalCartWithFirestore } = useCart();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    // This effect handles redirection if the user is already authenticated
    // or after a successful login when their role is fetched.
    if (!loading && user && user.role) {
      mergeLocalCartWithFirestore(user.uid);
      const redirectUrl = localStorage.getItem('redirectAfterLogin') || `/${user.role}/dashboard`;
      localStorage.removeItem('redirectAfterLogin');
      router.push(redirectUrl);
    }
  }, [user, loading, router, mergeLocalCartWithFirestore]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const auth = getAuth();
      await signInWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      // After successful sign-in, the useEffect hook above will handle the redirection.
      toast({
        title: 'Login Successful',
        description: 'Redirecting you to your dashboard...',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.code === 'auth/invalid-credential' 
          ? 'Invalid email or password. Please try again.'
          : error.message,
      });
    }
  }

  // The form is always shown if the user is not yet redirected.
  // The useEffect handles the redirection logic in the background.
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
