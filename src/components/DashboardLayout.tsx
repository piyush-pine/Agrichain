
'use client';

import React from 'react';
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
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { getAuth, signOut } from 'firebase/auth';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { CartSheet } from './cart/CartSheet';
import { Skeleton } from './ui/skeleton';

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
    const { user } = useUser();
    const router = useRouter();

    const handleSignOut = async () => {
        const auth = getAuth();
        await signOut(auth);
        router.push('/login');
    };
    
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
                    <DropdownMenuItem>
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>Profile</span>
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

function DashboardSkeleton() {
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
            <div className="flex flex-col gap-2 p-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
            </div>
          </SidebarContent>
        </Sidebar>

        <SidebarInset>
          <header className="flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:px-6">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="md:hidden" />
                <Skeleton className="h-6 w-32" />
            </div>
            <div className='flex items-center gap-4'>
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-6 w-20 hidden md:block" />
                </div>
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6">
              <div className="space-y-4">
                  <Skeleton className="h-10 w-1/4" />
                  <Skeleton className="h-40 w-full" />
                   <Skeleton className="h-40 w-full" />
              </div>
          </main>
        </SidebarInset>
    </SidebarProvider>
  )
}


export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading } = useUser();
  const router = useRouter();
  
  const role = user?.role as keyof typeof navItems | undefined;

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  

  if (loading || !user || !role) {
    return <DashboardSkeleton />;
  }
  
  const currentNav = navItems[role] || [];
  
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
              {currentNav.map((item) => (
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
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <SidebarInset>
          <header className="flex h-14 items-center justify-between gap-4 border-b bg-background px-4 sm:px-6">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="md:hidden" />
                <h1 className="text-lg font-semibold md:text-xl capitalize">{pathname.split('/').pop()?.replace('-', ' ') || 'Dashboard'}</h1>
            </div>
            <div className='flex items-center gap-4'>
                <Button variant="ghost" size="icon">
                    <Bell className="h-5 w-5" />
                    <span className="sr-only">Notifications</span>
                </Button>

                <CartSheet />

                <UserDropdown />
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </SidebarInset>
    </SidebarProvider>
  );
}
