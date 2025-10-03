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
  ShieldCheck,
  Leaf,
  Settings,
  Bell,
  User as UserIcon, // Renamed to avoid conflict
  ChevronDown,
  Award,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { getAuth, signOut } from 'firebase/auth';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';

const navItems = {
  admin: [
    { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/users', icon: Users, label: 'User Management' },
    { href: '/admin/quality', icon: ShieldCheck, label: 'Quality Control' },
    { href: '/admin/fraud', icon: ShieldCheck, label: 'Fraud Detection' },
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
            <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
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


  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>; // Or a proper skeleton loader
  }

  if (!user || !role) {
    // If there's no user or the role is missing, don't render the dashboard.
    // The useEffect above will handle redirection.
    return null;
  }
  
  const currentNav = navItems[role] || [];
  const IconMap = {
    LayoutDashboard, Users, ShieldCheck, ShoppingBag, Package, Leaf, Award, Truck
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
              {currentNav.map((item) => {
                const Icon = IconMap[item.icon as keyof typeof IconMap] || item.icon;
                return(
                <SidebarMenuItem key={item.label}>
                    <Link href={item.href} legacyBehavior passHref>
                        <SidebarMenuButton
                            isActive={pathname === item.href}
                            icon={Icon}
                            tooltip={item.label}
                        >
                            {item.label}
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
              )})}
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
                <UserDropdown />
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </SidebarInset>
    </SidebarProvider>
  );
}
