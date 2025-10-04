
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Wallet, Loader2 } from 'lucide-react';
import { useUser } from '@/firebase/auth/use-user';
import { useFirestore } from '@/firebase/provider';
import { ensureUserWallet } from '@/lib/wallet-utils';

export function ConnectWalletButton() {
    const { user } = useUser();
    const firestore = useFirestore();
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleConnect = async () => {
        if (!user || !firestore) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'You must be logged in to connect a wallet.',
            });
            return;
        }

        if (user.walletAddress) {
            toast({
                title: 'Wallet Already Connected',
                description: 'Your simulated wallet is already active.',
            });
            return;
        }

        setIsLoading(true);
        try {
            await ensureUserWallet(firestore, user.uid);
            toast({
                variant: 'success',
                title: 'Wallet Connected!',
                description: 'Your simulated wallet has been successfully created.',
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Connection Failed',
                description: 'Could not create a simulated wallet. Please try again.',
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    const isConnected = !!user?.walletAddress;

    return (
        <Button onClick={handleConnect} disabled={isLoading || isConnected}>
            {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Wallet className="mr-2 h-4 w-4" />
            )}
            {isConnected ? 'Wallet Connected' : (isLoading ? 'Connecting...' : 'Connect Wallet')}
        </Button>
    );
}
