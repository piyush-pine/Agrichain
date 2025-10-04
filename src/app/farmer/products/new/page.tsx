
'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase/auth/use-user';
import { useFirestore } from '@/firebase/provider';
import { collection, serverTimestamp, doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Upload, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { getProductProvenanceContract } from '@/lib/blockchain';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { addDocumentNonBlocking, setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';

const productSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(2, 'Category is required'),
  price: z.coerce.number().min(0.01, 'Price must be greater than 0'),
  image: z.any().optional(),
});

export default function NewProductPage() {
    const { toast } = useToast();
    const { user } = useUser();
    const firestore = useFirestore();
    const router = useRouter();
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof productSchema>>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: '',
            description: '',
            category: '',
            price: 0,
        },
    });

    const onSubmit = (values: z.infer<typeof productSchema>) => {
        setIsSubmitting(true);
        if (!user || !firestore) {
            toast({
                variant: 'destructive',
                title: 'Authentication Error',
                description: 'You must be logged in to add a product.',
            });
            setIsSubmitting(false);
            return;
        }

        if (!user.walletAddress) {
            toast({
                variant: 'destructive',
                title: 'Wallet Not Connected',
                description: 'Please connect your wallet from the dashboard before adding a product.',
            });
            setIsSubmitting(false);
            return;
        }

        toast({ title: 'Listing Product...', description: 'Your product is being added to the marketplace.' });
        
        const productCollection = collection(firestore, 'products');
        const newDocRef = doc(productCollection);
        const productId = newDocRef.id;

        const productData = {
            id: productId,
            name: values.name,
            description: values.description,
            category: values.category,
            price: values.price,
            image_url: '',
            farmer_id: user.uid,
            status: 'Listed',
            created_at: serverTimestamp(),
        };

        setDocumentNonBlocking(newDocRef, productData, { merge: false });

        if (values.image && values.image.length > 0) {
            const file = values.image[0];
            const storage = getStorage();
            const storageRef = ref(storage, `products/${productId}/${file.name}`);
            
            uploadBytes(storageRef, file).then(snapshot => {
                getDownloadURL(snapshot.ref).then(imageUrl => {
                    const docToUpdate = doc(firestore, 'products', productId);
                    updateDocumentNonBlocking(docToUpdate, { image_url: imageUrl });
                });
            }).catch(err => {
                console.error("Image upload failed:", err);
            });
        }

        const provenanceContract = getProductProvenanceContract(null as any);
        provenanceContract.registerProduct(productId, values.name, values.category).then(tx => {
            console.log(`[MOCK] Blockchain tx submitted: ${tx.hash}`);
        });

        if (values.price > 1000) {
            const fraudAlertsCollection = collection(firestore, 'fraud_alerts');
            addDocumentNonBlocking(fraudAlertsCollection, {
                transaction_id: productId,
                type: 'price-spike',
                confidence: 0.95,
                resolved: false,
                detected_at: serverTimestamp(),
                details: `Product '${values.name}' listed at unusually high price of $${values.price}.`,
            });
        }
        
        toast({
            variant: 'success',
            title: 'Product Listed!',
            description: `${values.name} is now on the marketplace.`,
        });
        
        router.push('/farmer/products');
    };
    
    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            form.setValue('image', event.target.files);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImagePreview(null);
        form.setValue('image', null);
        const fileInput = document.getElementById('dropzone-file') as HTMLInputElement;
        if(fileInput) fileInput.value = '';
    };


  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Add New Product</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
          <CardDescription>Fill out the form below to list a new product.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Organic Red Tomatoes" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe your product in detail..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Category</FormLabel>
                            <FormControl>
                            <Input placeholder="e.g., Vegetables" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Price ($ per unit)</FormLabel>
                            <FormControl>
                            <Input type="number" step="0.01" placeholder="e.g., 2.50" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Product Image</FormLabel>
                        <FormControl>
                            {imagePreview ? (
                                <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                                    <Image src={imagePreview} alt="Product preview" layout="fill" objectFit="cover" />
                                    <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={removeImage}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center w-full">
                                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-muted">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                                            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                            <p className="text-xs text-muted-foreground">PNG, JPG or GIF</p>
                                        </div>
                                        <input id="dropzone-file" type="file" className="hidden" onChange={handleImageChange} accept="image/png, image/jpeg, image/gif" />
                                    </label>
                                </div>
                            )}
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isSubmitting ? 'Listing Product...' : 'Add Product'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
