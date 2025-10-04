
'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase/auth/use-user';
import { useFirestore } from '@/firebase/provider';
import { doc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { updateDocumentNonBlocking } from '@/firebase';
import { Loader2 } from 'lucide-react';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  companyName: z.string().optional(),
});

export default function ProfilePage() {
  const { toast } = useToast();
  const { user, loading: isUserLoading } = useUser();
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      companyName: '',
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.displayName || '',
        companyName: user.companyName || '',
      });
    }
  }, [user, form]);

  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    setIsSubmitting(true);
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to update your profile.',
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const userRef = doc(firestore, 'users', user.uid);
      const dataToUpdate: { name: string; companyName?: string } = {
        name: values.name,
      };

      if (values.companyName) {
        dataToUpdate.companyName = values.companyName;
      }

      // Update Firestore document
      updateDocumentNonBlocking(userRef, dataToUpdate);

      // Update Firebase Auth profile if display name changed
      if (user.displayName !== values.name) {
        await updateProfile(user, { displayName: values.name });
      }

      toast({
        variant: 'success',
        title: 'Profile Updated',
        description: 'Your information has been saved successfully.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isUserLoading) {
    return (
        <DashboardLayout>
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">My Profile</h1>
      </div>
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your account details here.</CardDescription>
                </CardHeader>
                <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                <Input placeholder="Your full name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="companyName"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Company Name (Optional)</FormLabel>
                                <FormControl>
                                <Input placeholder="Your farm or company name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <div className="flex justify-end">
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isSubmitting ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                </Form>
                </CardContent>
            </Card>
        </div>
        <div className="md:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle>Account Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Email</span>
                        <span className="font-medium text-sm">{user?.email}</span>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Role</span>
                        <span className="font-medium capitalize">{user?.role}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">User ID</span>
                        <span className="font-mono text-xs text-muted-foreground">{user?.uid.slice(0, 12)}...</span>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
