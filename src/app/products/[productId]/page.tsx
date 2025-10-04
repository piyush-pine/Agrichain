
'use client';

import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import { useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import Image from 'next/image';
import { Leaf, ChevronsRight, ArrowLeft } from 'lucide-react';
import { getProductHistory } from '@/lib/blockchain';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

export default function PublicProductPage({ params }: { params: { productId: string } }) {
    const firestore = useFirestore();
    const [provenance, setProvenance] = useState<any[]>([]);
    const [isLoadingProvenance, setIsLoadingProvenance] = useState(true);

    const productRef = useMemoFirebase(() => {
        if (!params.productId) return null;
        return doc(firestore, 'products', params.productId);
    }, [firestore, params.productId]);
    
    const { data: product, isLoading: isLoadingProduct } = useDoc(productRef);

    useEffect(() => {
        const fetchProvenance = async () => {
            if (params.productId) {
                setIsLoadingProvenance(true);
                try {
                    const history = await getProductHistory(params.productId);
                    setProvenance(history);
                } catch(e) {
                    console.error("Failed to fetch provenance", e);
                } finally {
                    setIsLoadingProvenance(false);
                }
            }
        };
        fetchProvenance();
    }, [params.productId]);

    if (isLoadingProduct) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="w-full max-w-2xl p-4 space-y-4">
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-80 w-full" />
                    <Skeleton className="h-20 w-full" />
                </div>
            </div>
        );
    }
    
    if (!product) {
        return (
             <div className="flex min-h-screen flex-col items-center justify-center text-center p-4">
                <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
                <p className="text-muted-foreground mb-6">The product ID you are looking for does not exist in our records.</p>
                 <Button asChild>
                    <Link href="/">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Homepage
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 dark:bg-black min-h-screen p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <Button asChild variant="outline">
                        <Link href="/">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to AgriClear Home
                        </Link>
                    </Button>
                </div>
                <Card className="overflow-hidden shadow-lg">
                    <div className="grid md:grid-cols-2">
                        <div className="relative h-64 md:h-full w-full bg-muted">
                           <Image 
                                src={product.image_url || `https://picsum.photos/seed/${product.id}/600/400`}
                                alt={product.name}
                                layout="fill"
                                objectFit="cover"
                            />
                        </div>
                        <div className="p-6">
                             <CardHeader className="p-0">
                                <CardTitle className="text-4xl font-bold">{product.name}</CardTitle>
                                <CardDescription className="text-lg text-primary">${product.price.toFixed(2)}</CardDescription>
                            </CardHeader>
                             <CardContent className="p-0 mt-4">
                                <p className="text-muted-foreground">{product.description}</p>
                            </CardContent>
                        </div>
                    </div>
                </Card>
                
                <div className="mt-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-2xl">
                                <Leaf className="h-6 w-6 text-green-500" />
                                <span>Product Provenance</span>
                            </CardTitle>
                             <CardDescription>
                                This product's journey is transparently recorded on the blockchain.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                           {isLoadingProvenance ? (
                                <div className="space-y-4 pt-4">
                                    <Skeleton className="h-12 w-full" />
                                    <Skeleton className="h-12 w-full" />
                                    <Skeleton className="h-12 w-full" />
                                </div>
                           ) : provenance.length > 0 ? (
                                <ul className="space-y-4 border-l-2 border-primary/20 ml-3 py-4">
                                    {provenance.map((entry, index) => (
                                        <li key={index} className="relative pl-8">
                                            <div className="absolute -left-[11px] top-1 flex items-center justify-center h-5 w-5 rounded-full bg-primary/20 text-primary">
                                                <ChevronsRight className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-lg">{entry.action}</p>
                                                <p className="text-sm text-muted-foreground">{entry.timestamp}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-center text-muted-foreground py-8">No blockchain history found for this product.</p>
                           )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
