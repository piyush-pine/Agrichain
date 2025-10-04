
'use client';

import React from 'react';
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import { useCollection } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const roleVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
  farmer: "default",
  buyer: "secondary",
  logistics: "outline",
  admin: "destructive",
};

export default function AdminUsersPage() {
    const firestore = useFirestore();

    const usersQuery = useMemoFirebase(() => {
        return collection(firestore, "users");
    }, [firestore]);

    const { data: users, isLoading } = useCollection(usersQuery);

    return (
        <DashboardLayout>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">User Management</h1>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>All Registered Users</CardTitle>
                    <CardDescription>View and manage all users on the AgriClear platform.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Joined On</TableHead>
                                <TableHead>Verification Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center">Loading users...</TableCell>
                                </TableRow>
                            ) : users && users.length > 0 ? (
                                users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Badge variant={roleVariant[user.role] || 'default'}>{user.role}</Badge>
                                        </TableCell>
                                        <TableCell>{user.created_at ? new Date(user.created_at.seconds * 1000).toLocaleDateString() : 'N/A'}</TableCell>
                                        <TableCell>
                                            <Badge variant={user.verified ? 'success' : 'secondary'}>
                                                {user.verified ? 'Verified' : 'Unverified'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                             <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button size="icon" variant="ghost">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>View Details</DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                        {user.verified ? 'Revoke Verification' : 'Verify User'}
                                                    </DropdownMenuItem>
                                                     <DropdownMenuItem className="text-destructive">Suspend User</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center">No users found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </DashboardLayout>
    );
}
