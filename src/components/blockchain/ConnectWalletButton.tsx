
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Wallet } from 'lucide-react';

interface ConnectWalletButtonProps {
    onAddressChanged: (address: string | null) => void;
}

declare global {
  interface Window {
    ethereum?: any
  }
}

export function ConnectWalletButton({ onAddressChanged }: ConnectWalletButtonProps) {
    const [currentAddress, setCurrentAddress] = useState<string | null>(null);
    const { toast } = useToast();

    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                handleAccountsChanged(accounts);
            } catch (error: any) {
                toast({
                    variant: 'destructive',
                    title: 'Wallet Connection Failed',
                    description: error.message,
                });
                onAddressChanged(null);
            }
        } else {
            toast({
                variant: 'destructive',
                title: 'MetaMask Not Detected',
                description: 'Please install MetaMask to use this feature.',
            });
        }
    };
    
    const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
            setCurrentAddress(null);
            onAddressChanged(null);
            toast({ title: 'Wallet Disconnected' });
        } else {
            const address = accounts[0];
            setCurrentAddress(address);
            onAddressChanged(address);
        }
    };

    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', handleAccountsChanged);
            // Check for already connected accounts on component mount
            window.ethereum.request({ method: 'eth_accounts' }).then(handleAccountsChanged).catch(console.error);
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            }
        };
    }, []);

    return (
        <Button onClick={connectWallet} className="w-full">
            <Wallet className="mr-2 h-4 w-4" />
            {currentAddress ? 'Wallet Connected' : 'Connect Wallet'}
        </Button>
    );
}
