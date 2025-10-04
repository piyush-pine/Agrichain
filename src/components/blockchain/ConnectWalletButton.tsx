
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Wallet } from 'lucide-react';
import { useUser } from '@/firebase/auth/use-user';

interface ConnectWalletButtonProps {
    onAddressChanged: (address: string | null) => void;
}

export function ConnectWalletButton({ onAddressChanged }: ConnectWalletButtonProps) {
    const { user } = useUser();
    const [currentAddress, setCurrentAddress] = useState<string | null>(null);
    const { toast } = useToast();

    // In simulation mode, the wallet is "connected" if the user has a walletAddress on their profile.
    useEffect(() => {
        if (user?.walletAddress) {
            setCurrentAddress(user.walletAddress);
            onAddressChanged(user.walletAddress);
        } else {
            setCurrentAddress(null);
            onAddressChanged(null);
        }
    }, [user, onAddressChanged]);


    const connectWallet = () => {
        if (user?.walletAddress) {
             toast({
                title: 'Wallet Already Connected',
                description: `Your simulated wallet is already active.`,
            });
        } else {
            toast({
                variant: 'destructive',
                title: 'No Simulated Wallet Found',
                description: 'Please re-register to get a simulated wallet assigned.',
            });
        }
    };

    return (
        <Button onClick={connectWallet} className="w-full" disabled={!user}>
            <Wallet className="mr-2 h-4 w-4" />
            {currentAddress ? 'Wallet Connected' : 'Connect Wallet'}
        </Button>
    );
}
