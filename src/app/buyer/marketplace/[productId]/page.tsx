
'use client';

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import { useDoc } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Image from 'next/image';
import { ShoppingCart, Leaf, User as UserIcon, ChevronsRight } from 'lucide-react';
import { getProductHistory } from '@/lib/blockchain';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/firebase/auth/use-user';
import { useCart } from '@/hooks/use-cart';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';

function ProductDetailContent({ params }: { params: { productId: string } }) {
    const firestore = useFirestore();
    const { user } = useUser();
    const { addToCart } = useCart();
    
    const [farmer, setFarmer] = useState<any>(null);
    const [provenance, setProvenance] = useState<any[]>([]);
    const [isLoadingProvenance, setIsLoadingProvenance] = useState(true);

    const productRef = useMemoFirebase(() => {
        if (!params.productId) return null;
        return doc(firestore, 'products', params.productId);
    }, [firestore, params.productId]);
    
    const { data: product, isLoading: isLoadingProduct } = useDoc(productRef);

    useEffect(() => {
        const fetchFarmerAndProvenance = async () => {
            if (product && product.farmer_id && firestore) {
                // Fetch farmer details
                try {
                    const farmerRef = doc(firestore, 'users', product.farmer_id);
                    const farmerSnap = await getDoc(farmerRef);
                    if (farmerSnap.exists()) {
                        setFarmer(farmerSnap.data());
                    }
                } catch(e) {
                    console.error("Error fetching farmer data: ", e);
                }


                // Fetch blockchain history
                setIsLoadingProvenance(true);
                 try {
                    const history = await getProductHistory(product.id);
                    setProvenance(history);
                } catch(e) {
                    console.error("Error fetching provenance data: ", e);
                } finally {
                    setIsLoadingProvenance(false);
                }
            }
        };
        fetchFarmerAndProvenance();
    }, [product, firestore]);

    const handleAddToCart = () => {
        addToCart(product);
    };

    if (isLoadingProduct) {
        return (
            <div className="grid md:grid-cols-5 gap-12">
                <div className="md:col-span-3 space-y-4">
                    <Skeleton className="h-96 w-full" />
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-12 w-1/3 ml-auto" />
                </div>
                 <div className="md:col-span-2 space-y-8">
                     <Skeleton className="h-32 w-full" />
                     <Skeleton className="h-64 w-full" />
                 </div>
            </div>
        );
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
                {farmer ? (
                     <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <UserIcon className="h-5 w-5 text-primary" />
                                <span>Sold By</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="font-semibold text-xl">{farmer.name}</p>
                            {farmer.created_at && (
                                <p className="text-sm text-muted-foreground">Member since {new Date(farmer.created_at.seconds * 1000).getFullYear()}</p>
                            )}
                            {/* We can add farmer ratings here later */}
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardContent className="pt-6">
                            <Skeleton className="h-6 w-1/2 mb-2" />
                            <Skeleton className="h-4 w-1/3" />
                        </CardContent>
                    </Card>
                )}
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


export default function ProductDetailPage({ params }: { params: { productId: string } }) {
    const { user } = useUser();

    if (user) {
        return (
            <DashboardLayout>
                <ProductDetailContent params={params} />
            </DashboardLayout>
        );
    }
    
    return (
        <div className="relative z-10 min-h-screen flex flex-col bg-background">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8 sm:px-6 lg:px-8">
               <ProductDetailContent params={params} />
            </main>
            <Footer />
        </div>
    )
}
