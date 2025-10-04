
'use client';

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet } from 'lucide-react';
import { ConnectWalletButton } from './ConnectWalletButton';

export function ConnectWalletBanner() {
    return (
        <Card className="mb-6 bg-secondary border-primary/20">
            <CardHeader>
                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                     <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary">
                            <Wallet className="h-6 w-6" />
                        </div>
                    </div>
                    <div className="flex-grow text-center md:text-left">
                        <CardTitle>Action Required: Connect Your Wallet</CardTitle>
                        <CardDescription className="mt-1">
                            A simulated wallet is required to perform blockchain actions like adding products.
                        </CardDescription>
                    </div>
                    <div className="flex-shrink-0">
                        <ConnectWalletButton />
                    </div>
                </div>
            </CardHeader>
        </Card>
    );
}
