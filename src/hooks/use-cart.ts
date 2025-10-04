
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/firebase/auth/use-user';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { useCollection, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { useToast } from './use-toast';

export interface CartItem {
    id: string;
    product_id: string;
    quantity: number;
    added_at: any;
    product_name: string;
    price: number;
    farmer_id: string;
    image_url?: string;
}

const LOCAL_STORAGE_CART_KEY = 'agriclear-guest-cart';

export function useCart() {
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [localCart, setLocalCart] = useState<CartItem[]>([]);

    // --- Firestore Cart for logged-in users ---
    const cartQuery = useMemoFirebase(() => {
        if (!user || !firestore) return null;
        return collection(firestore, 'users', user.uid, 'cart');
    }, [user, firestore]);

    const { data: firestoreCart, isLoading: isFirestoreCartLoading } = useCollection<CartItem>(cartQuery);

    // --- Local Storage Cart for guest users ---
    useEffect(() => {
        if (!user) {
            const storedCart = localStorage.getItem(LOCAL_STORAGE_CART_KEY);
            if (storedCart) {
                setLocalCart(JSON.parse(storedCart));
            }
        }
    }, [user]);

    const updateLocalCart = (cart: CartItem[]) => {
        setLocalCart(cart);
        localStorage.setItem(LOCAL_STORAGE_CART_KEY, JSON.stringify(cart));
    };

    const addToCart = (product: any, quantity = 1) => {
        if (!product) return;

        const cartItem: CartItem = {
            id: product.id, // Use product ID as cart item ID for simplicity
            product_id: product.id,
            quantity: quantity,
            added_at: new Date(),
            product_name: product.name,
            price: product.price,
            farmer_id: product.farmer_id,
            image_url: product.image_url || `https://picsum.photos/seed/${product.id}/400/300`,
        };

        if (user && firestore) {
            // Logged-in user: add to Firestore
            const cartItemRef = doc(firestore, 'users', user.uid, 'cart', product.id);
            setDocumentNonBlocking(cartItemRef, { ...cartItem, added_at: serverTimestamp() }, { merge: true });
        } else {
            // Guest user: add to local storage
            const existingItem = localCart.find(item => item.product_id === product.id);
            if (existingItem) {
                // Update quantity if item already in cart
                const updatedCart = localCart.map(item =>
                    item.product_id === product.id ? { ...item, quantity: item.quantity + quantity } : item
                );
                updateLocalCart(updatedCart);
            } else {
                updateLocalCart([...localCart, cartItem]);
            }
        }
        
        toast({
            title: "Added to Cart",
            description: `${product.name} has been added to your cart.`,
        });
    };

    const removeFromCart = (productId: string) => {
        if (user && firestore) {
            const itemRef = doc(firestore, 'users', user.uid, 'cart', productId);
            deleteDocumentNonBlocking(itemRef);
        } else {
            const updatedCart = localCart.filter(item => item.id !== productId);
            updateLocalCart(updatedCart);
        }
    };
    
    const mergeLocalCartWithFirestore = useCallback(async (userId: string) => {
        if (!firestore) return;
        
        const storedCartRaw = localStorage.getItem(LOCAL_STORAGE_CART_KEY);
        if (!storedCartRaw) return;

        const localItems: CartItem[] = JSON.parse(storedCartRaw);
        if (localItems.length === 0) return;

        for (const item of localItems) {
            const cartItemRef = doc(firestore, 'users', userId, 'cart', item.product_id);
            // This will add new items and merge/overwrite existing ones
            await setDocumentNonBlocking(cartItemRef, {
                ...item,
                added_at: serverTimestamp()
            }, { merge: true });
        }

        // Clear local cart after merging
        localStorage.removeItem(LOCAL_STORAGE_CART_KEY);
        setLocalCart([]);

    }, [firestore]);


    const cartItems = user ? firestoreCart : localCart;
    const isLoading = user ? isFirestoreCartLoading : false;

    return { cartItems, addToCart, removeFromCart, isLoading, mergeLocalCartWithFirestore };
}
