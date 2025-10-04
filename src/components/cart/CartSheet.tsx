
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/use-cart';
import { useUser } from '@/firebase/auth/use-user';

export function CartSheet() {
    const { user } = useUser();
    const router = useRouter();
    const { cartItems, removeFromCart, isLoading } = useCart();

    const subtotal = cartItems?.reduce((acc, item) => acc + item.price * item.quantity, 0) || 0;

    const handleCheckout = () => {
        if (user) {
            router.push('/buyer/checkout');
        } else {
            // Store intended destination and redirect to login
            localStorage.setItem('redirectAfterLogin', '/buyer/checkout');
            router.push('/login');
        }
    };

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                    <ShoppingCart className="h-5 w-5 text-foreground/80" />
                    {cartItems && cartItems.length > 0 && (
                        <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 justify-center p-0">{cartItems.length}</Badge>
                    )}
                    <span className="sr-only">Open cart</span>
                </Button>
            </SheetTrigger>
            <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
                <SheetHeader className="px-6">
                    <SheetTitle>Shopping Cart</SheetTitle>
                </SheetHeader>
                <Separator />

                {isLoading && <div className="flex-1 flex items-center justify-center">Loading cart...</div>}
                
                {!isLoading && (!cartItems || cartItems.length === 0) && (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
                        <ShoppingCart className="h-16 w-16 text-muted-foreground" />
                        <h3 className="font-semibold">Your cart is empty</h3>
                        <p className="text-sm text-muted-foreground">Add some products from the marketplace to get started.</p>
                    </div>
                )}
                
                {cartItems && cartItems.length > 0 && (
                    <>
                        <ScrollArea className="flex-1">
                            <div className="flex flex-col gap-4 p-6">
                                {cartItems.map(item => (
                                    <div key={item.id} className="flex items-start gap-4">
                                        <div className="relative h-16 w-16 rounded-md overflow-hidden bg-muted">
                                            <Image src={item.image_url!} alt={item.product_name} layout="fill" objectFit="cover" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-sm">{item.product_name}</h4>
                                            <p className="text-xs text-muted-foreground">Quantity: {item.quantity}</p>
                                            <p className="text-sm font-medium mt-1">${item.price.toFixed(2)}</p>
                                        </div>
                                        <Button variant="outline" size="sm" onClick={() => removeFromCart(item.id)}>Remove</Button>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>

                        <Separator />
                        <SheetFooter className="bg-secondary/50 px-6 py-4">
                            <div className="w-full space-y-4">
                                <div className="flex justify-between font-semibold">
                                    <span>Subtotal</span>
                                    <span>${subtotal.toFixed(2)}</span>
                                </div>
                                <Button className="w-full" onClick={handleCheckout}>
                                    Proceed to Checkout
                                </Button>
                            </div>
                        </SheetFooter>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}
