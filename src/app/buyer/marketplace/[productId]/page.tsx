
'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import { useDoc } from '@/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import Image from 'next/image';
import { ShoppingCart, Leaf, User as UserIcon, ChevronsRight } from 'lucide-react';
import { getProductHistory } from '@/lib/blockchain';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/firebase/auth/use-user';
import { useCart } from '@/hooks/use-cart';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { UserProvider } from '@/firebase/auth/use-user';

function ProductDetailContent({ params }: { params: { productId: string } }) {
    const firestore = useFirestore();
    const { user } = useUser();
    const { addToCart } = useCart();
    
    const [farmer, setFarmer] = useState<any>(null);
    const [isLoadingFarmer, setIsLoadingFarmer] = useState(true);
    const [provenance, setProvenance] = useState<any[]>([]);
    const [isLoadingProvenance, setIsLoadingProvenance] = useState(true);

    const productRef = useMemoFirebase(() => {
        if (!params.productId || !firestore) return null;
        return doc(firestore, 'products', params.productId);
    }, [firestore, params.productId]);
    
    const { data: product, isLoading: isLoadingProduct } = useDoc(productRef);

    useEffect(() => {
        if (product && product.farmer_id && firestore) {
            setIsLoadingFarmer(true);
            const farmerRef = doc(firestore, 'users', product.farmer_id);
            const unsub = onSnapshot(farmerRef, (farmerSnap) => {
                if (farmerSnap.exists()) {
                    setFarmer(farmerSnap.data());
                }
                setIsLoadingFarmer(false);
            }, () => setIsLoadingFarmer(false));
            return () => unsub();
        } else if (product) {
            setIsLoadingFarmer(false);
        }
    }, [product, firestore]);
    
    useEffect(() => {
        if (params.productId) {
            setIsLoadingProvenance(true);
            getProductHistory(params.productId)
                .then(setProvenance)
                .catch(e => console.error("Error fetching provenance: ", e))
                .finally(() => setIsLoadingProvenance(false));
        }
    }, [params.productId]);


    const handleAddToCart = () => {
        if(product) {
            addToCart(product);
        }
    };
    
    if (isLoadingProduct) {
        return <ProductDetailSkeleton />;
    }

    if (!product) {
        return <p>Product not found.</p>;
    }


    return (
        <div className="grid md:grid-cols-5 gap-12">
            <div className="md:col-span-3">
                <Card className="overflow-hidden">
                    <div className="relative h-96 w-full bg-muted">
                        <Image 
                            src={product.image_url || `https://picsum.photos/seed/${product.id}/600/400`}
                            alt={product.name}
                            layout="fill"
                            objectFit="cover"
                        />
                    </div>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <Badge variant="outline">{product.category}</Badge>
                                <CardTitle className="text-4xl font-bold mt-2">{product.name}</CardTitle>
                            </div>
                            <div className="text-3xl font-bold text-primary">${product.price.toFixed(2)}</div>
                        </div>
                    </CardHeader>
                    <CardContent>
                         <p className="text-muted-foreground">{product.description}</p>
                        <Separator className="my-6" />
                        <div className="flex justify-end">
                             <Button size="lg" onClick={handleAddToCart}>
                                <ShoppingCart className="mr-2 h-5 w-5" />
                                Add to Cart
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="md:col-span-2 space-y-8">
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <UserIcon className="h-5 w-5 text-primary" />
                            <span>Sold By</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoadingFarmer ? (
                             <div className="space-y-2">
                                <Skeleton className="h-6 w-1/2 mb-2" />
                                <Skeleton className="h-4 w-1/3" />
                            </div>
                        ) : farmer ? (
                            <div>
                                <p className="font-semibold text-xl">{farmer.name}</p>
                                {farmer.created_at && (
                                    <p className="text-sm text-muted-foreground">Member since {new Date(farmer.created_at.seconds * 1000).getFullYear()}</p>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">Farmer information not available.</p>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Leaf className="h-5 w-5 text-green-500" />
                            <span>Product Provenance</span>
                        </CardTitle>
                         <CardDescription>
                            This product's journey is secured on the blockchain.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                       {isLoadingProvenance ? (
                            <div className="space-y-4 pt-2">
                                <Skeleton className="h-8 w-full" />
                                <Skeleton className="h-8 w-full" />
                            </div>
                       ) : provenance.length > 0 ? (
                            <ul className="space-y-4">
                                {provenance.map((entry, index) => (
                                    <li key={index} className="flex items-center gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary">
                                                <ChevronsRight className="h-5 w-5" />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="font-semibold">{entry.action}</p>
                                            <p className="text-xs text-muted-foreground">{entry.timestamp}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">No blockchain history found for this product.</p>
                       )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

const ProductDetailSkeleton = () => (
    <div className="grid md:grid-cols-5 gap-12">
        <div className="md:col-span-3">
            <Card className="overflow-hidden">
                <Skeleton className="h-96 w-full" />
                <CardHeader>
                    <div className="space-y-3">
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-10 w-3/4" />
                    </div>
                </Header>
                <CardContent>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </div>
                    <Separator className="my-6" />
                    <div className="flex justify-end">
                        <Skeleton className="h-12 w-36" />
                    </div>
                </CardContent>
            </Card>
        </div>
        <div className="md:col-span-2 space-y-8">
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-24" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-1/2 mb-2" />
                        <Skeleton className="h-4 w-1/3" />
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-36 mb-2" />
                    <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4 pt-2">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
);


export default function ProductDetailPage({ params }: { params: { productId: string } }) {
    const { user, loading } = useUser();

    if (loading && !user) {
         return (
            <FirebaseClientProvider>
                <UserProvider>
                    <div className="relative z-10 min-h-screen flex flex-col bg-background">
                        <Header />
                        <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                           <ProductDetailSkeleton />
                        </main>
                        <Footer />
                    </div>
                </UserProvider>
            </FirebaseClientProvider>
        );
    }

    if (user) {
        return (
            <DashboardLayout>
                <ProductDetailContent params={params} />
            </DashboardLayout>
        );
    }
    
    return (
        <FirebaseClientProvider>
            <UserProvider>
                <div className="relative z-10 min-h-screen flex flex-col bg-background">
                    <Header />
                    <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8">
                       <ProductDetailContent params={params} />
                    </main>
                    <Footer />
                </div>
            </UserProvider>
        </FirebaseClientProvider>
    )
}
