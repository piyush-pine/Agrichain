
'use client';

import React from 'react';
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, ShoppingCart, Filter } from "lucide-react";
import Image from 'next/image';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import { useCollection, setDocumentNonBlocking } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { useUser } from '@/firebase/auth/use-user';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function MarketplacePage() {
    const firestore = useFirestore();
    const { user } = useUser();
    const { toast } = useToast();

    const productsQuery = useMemoFirebase(() => {
        return collection(firestore, "products");
    }, [firestore]);
    
    const { data: products, isLoading } = useCollection(productsQuery);

    const handleAddToCart = (e: React.MouseEvent, product: any) => {
        e.preventDefault(); // Prevent navigation when clicking the button
        if (!user) {
            toast({
                variant: "destructive",
                title: "Not Logged In",
                description: "You must be logged in to add items to your cart.",
            });
            return;
        }

        const cartItemRef = doc(firestore, 'users', user.uid, 'cart', product.id);
        const cartItemData = {
            product_id: product.id,
            quantity: 1, // Default to 1, can be updated in the cart view
            added_at: serverTimestamp(),
            product_name: product.name,
            price: product.price,
            farmer_id: product.farmer_id,
            image_url: product.image_url || `https://picsum.photos/seed/${product.id}/400/300`
        };

        setDocumentNonBlocking(cartItemRef, cartItemData, { merge: true });

        toast({
            title: "Added to Cart",
            description: `${product.name} has been added to your cart.`,
        });
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Marketplace</h1>
                        <p className="text-muted-foreground">Browse fresh produce directly from verified farmers.</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search for products..." className="pl-10" />
                    </div>
                    <Button variant="outline">
                        <Filter className="mr-2 h-4 w-4" />
                        Filter
                    </Button>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                             <Card key={i} className="flex flex-col animate-pulse">
                                <div className="bg-muted h-48 w-full rounded-t-lg"></div>
                                <CardHeader>
                                    <div className="h-6 bg-muted rounded w-3/4"></div>
                                    <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <div className="h-4 bg-muted rounded w-full"></div>
                                </CardContent>
                                <CardFooter className="flex justify-between items-center">
                                    <div className="h-8 bg-muted rounded w-1/4"></div>
                                    <div className="h-10 w-24 bg-muted rounded-md"></div>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {products?.map((product) => (
                             <Link key={product.id} href={`/buyer/marketplace/${product.id}`} className="block h-full transition-all duration-200 hover:-translate-y-1 hover:shadow-xl rounded-lg">
                                <Card className="flex flex-col h-full">
                                    <div className="relative w-full h-48 rounded-t-lg overflow-hidden bg-muted">
                                        <Image 
                                            src={product.image_url || `https://picsum.photos/seed/${product.id}/400/300`} 
                                            alt={product.name} 
                                            layout="fill"
                                            objectFit="cover"
                                        />
                                    </div>
                                    <CardHeader>
                                        <CardTitle className="text-lg">{product.name}</CardTitle>
                                        <p className="text-sm text-muted-foreground">{product.category}</p>
                                    </CardHeader>
                                    <CardContent className="flex-grow">
                                        <p className="text-sm line-clamp-2">{product.description}</p>
                                    </CardContent>
                                    <CardFooter className="flex justify-between items-center">
                                        <p className="text-lg font-bold text-primary">${product.price.toFixed(2)}</p>
                                        <Button size="sm" onClick={(e) => handleAddToCart(e, product)}>
                                            <ShoppingCart className="mr-2 h-4 w-4" />
                                            Add to Cart
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
