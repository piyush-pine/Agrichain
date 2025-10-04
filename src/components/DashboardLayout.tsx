
'use client';

import React, { useEffect } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { useUser } from '@/firebase/auth/use-user';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  LogOut,
  ShoppingBag,
  Package,
  Truck,
  Leaf,
  Settings,
  Bell,
  User as UserIcon, // Renamed to avoid conflict
  ChevronDown,
  Award,
  Home,
  Wallet,
  ShieldAlert,
  Loader2,
  Map,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { getAuth, signOut } from 'firebase/auth';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { CartSheet } from './cart/CartSheet';
import { Skeleton } from './ui/skeleton';
import { useFirestore } from '@/firebase/provider';
import { ensureUserWallet } from '@/lib/wallet-utils';
import { ThemeToggle } from './ThemeToggle';
import { UserProvider } from '@/firebase/auth/use-user';


const navItems = {
  admin: [
    { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/users', icon: Users, label: 'User Management' },
    { href: '/admin/fraud-alerts', icon: ShieldAlert, label: 'Fraud Alerts' },
  ],
  buyer: [
    { href: '/buyer/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/buyer/marketplace', icon: ShoppingBag, label: 'Marketplace' },
    { href: '/buyer/orders', icon: Package, label: 'My Orders' },
  ],
  farmer: [
    { href: '/farmer/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/farmer/products', icon: Leaf, label: 'My Products' },
    { href: '/farmer/orders', icon: Package, label: 'Orders' },
    { href: '/farmer/rewards', icon: Award, label: 'Sustainability' },
  ],
  logistics: [
    { href: '/logistics/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/logistics/shipments', icon: Truck, label: 'Shipments' },
    { href: '/logistics/history', icon: Package, label: 'History' },
    { href: '/logistics/route-planner', icon: Map, label: 'Route Planner' },
  ],
};

function getInitials(name?: string | null) {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('');
}

function UserDropdown() {
    const { user, loading } = useUser();
    const router = useRouter();

    const handleSignOut = async () => {
        const auth = getAuth();
        await signOut(auth);
        router.push('/login');
    };
    
    if (loading) {
      return (
        <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="hidden md:flex flex-col gap-1.5 items-start">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-12" />
            </div>
        </div>
      )
    }
    
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                 <Button variant="ghost" className="flex items-center gap-2 p-0 h-auto focus-visible:ring-0">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.photoURL || undefined} />
                        <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
                    </Avatar>
                    <div className="hidden md:flex flex-col items-start">
                        <span className="text-sm font-medium text-sidebar-foreground">
                            {user?.displayName}
                        </span>
                         <span className="text-xs text-muted-foreground capitalize">
                            {user?.role}
                        </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-60" align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                 {user?.walletAddress && (
                     <>
                        <DropdownMenuGroup>
                            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground px-2 flex items-center gap-1">
                                <Wallet className="h-3 w-3" />
                                Simulated Wallet
                            </DropdownMenuLabel>
                            <DropdownMenuItem disabled className="font-mono text-xs truncate">
                                {user.walletAddress}
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                     </>
                 )}
                <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                        <Link href="/profile">
                            <UserIcon className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();
  
  const role = user?.role as keyof typeof navItems | undefined;
  const isNavLoading = loading || !role;

  useEffect(() => {
    if (!loading && !user) {
      localStorage.setItem('redirectAfterLogin', pathname);
      router.push('/login');
    }
  }, [user, loading, router, pathname]);
  
  useEffect(() => {
    if (!loading && user && !user.walletAddress && firestore) {
      ensureUserWallet(firestore, user.uid).catch(console.error);
    }
  }, [user, loading, firestore]);
  
  if (loading && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  return (
    <SidebarProvider>
        <Sidebar variant="sidebar" collapsible="icon">
          <SidebarHeader>
              <div className="flex items-center gap-2 p-2">
                <Leaf className="w-6 h-6 text-primary" />
                <span className="font-bold text-lg text-sidebar-primary group-data-[collapsible=icon]:hidden">
                    AgriClear
                </span>
              </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                  <Link href="/">
                      <SidebarMenuButton
                          icon={Home}
                          tooltip={"Homepage"}
                      >
                          Homepage
                      </SidebarMenuButton>
                  </Link>
              </SidebarMenuItem>
              
              {isNavLoading ? (
                  <div className="flex flex-col gap-2 p-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
              ) : (
                role && navItems[role]?.map((item) => (
                  <SidebarMenuItem key={item.label}>
                      <Link href={item.href}>
                          <SidebarMenuButton
                              isActive={pathname === item.href}
                              icon={item.icon}
                              tooltip={item.label}
                          >
                              {item.label}
                          </SidebarMenuButton>
                      </Link>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <SidebarInset>
          <header className="flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:px-6">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="md:hidden" />
                <h1 className="text-lg font-semibold md:text-xl capitalize">{pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'}</h1>
            </div>
            <div className='flex items-center gap-2'>
                <ThemeToggle />
                <Button variant="ghost" size="icon">
                    <Bell className="h-5 w-5" />
                    <span className="sr-only">Notifications</span>
                </Button>

                {role === 'buyer' && <CartSheet />}

                <UserDropdown />
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6">
             {children}
          </main>
        </SidebarInset>
    </SidebarProvider>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <UserProvider>
            <DashboardLayoutContent>{children}</DashboardLayoutContent>
        </UserProvider>
    )
}
