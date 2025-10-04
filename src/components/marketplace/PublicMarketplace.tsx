
'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, ShoppingCart, Filter } from "lucide-react";
import Image from 'next/image';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import { useCollection } from '@/firebase';
import { collection, limit, query } from 'firebase/firestore';
import Link from 'next/link';
import { useCart } from '@/hooks/use-cart';

interface PublicMarketplaceProps {
    isHomePage?: boolean;
}

export function PublicMarketplace({ isHomePage = false }: PublicMarketplaceProps) {
    const firestore = useFirestore();
    const { addToCart } = useCart();

    const productsQuery = useMemoFirebase(() => {
        if (!firestore) return null; // Wait for firestore to be available
        const productsCollection = collection(firestore, "products");
        if (isHomePage) {
            return query(productsCollection, limit(8)); // Limit to 8 products for the homepage
        }
        return productsCollection;
    }, [firestore, isHomePage]);
    
    const { data: products, isLoading } = useCollection(productsQuery);

    const handleAddToCart = (e: React.MouseEvent, product: any) => {
        e.preventDefault(); // Prevent navigation when clicking the button
        addToCart(product);
    };
    
    const pageTitle = isHomePage ? "Featured Products" : "Marketplace";
    const pageDescription = isHomePage ? "Explore some of our best-selling products." : "Browse fresh produce directly from verified farmers.";

    return (
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">{pageTitle}</h1>
                        <p className="text-muted-foreground">{pageDescription}</p>
                    </div>
                     {isHomePage && (
                        <Button asChild variant="outline">
                            <Link href="/buyer/marketplace">View All Products</Link>
                        </Button>
                    )}
                </div>

                {!isHomePage && (
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
                )}

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[...Array(isHomePage ? 8 : 12)].map((_, i) => (
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
                                <Card className="flex flex-col h-full bg-card">
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
                 {!isLoading && products?.length === 0 && (
                    <div className="col-span-full text-center py-16">
                        <h3 className="text-xl font-semibold">No Products Found</h3>
                        <p className="text-muted-foreground">Check back later for new listings.</p>
                    </div>
                 )}
            </div>
        </div>
    );
}
