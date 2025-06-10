
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Users, ListChecks, BarChart, Loader2 } from "lucide-react";

export default function AdminPage() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !currentUser) {
      // In a real app, you might redirect to login or an unauthorized page.
      // Also, you'd check for admin roles here.
      router.push('/login'); 
    }
    // Add admin role check in a real application:
    // if (!loading && currentUser && !currentUser.isAdmin) { // Assuming isAdmin property
    //   router.push('/unauthorized');
    // }
  }, [currentUser, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg text-muted-foreground">Loading Admin Dashboard...</p>
      </div>
    );
  }

  if (!currentUser) {
     // This will be briefly shown before redirect effect kicks in
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
            <p className="text-lg text-muted-foreground">Redirecting...</p>
        </div>
    );
  }

  // Add a check for admin role here if you implement it
  // For now, any logged-in user can see this if they navigate directly.
  // A proper admin check would be:
  // if (!currentUser.isAdmin) {
  //   return <p>Unauthorized</p>;
  // }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-headline text-primary flex items-center">
          <ShieldCheck className="mr-3 h-8 w-8" /> Admin Dashboard
        </h1>
        {/* Add any global admin actions here */}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg"><ListChecks /> Deal Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">Review, accept, or remove watch deals.</p>
            <Button className="w-full">Manage Deals</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg"><Users /> User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">View and manage user accounts.</p>
            <Button className="w-full" variant="outline">Manage Users</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg"><BarChart /> Site Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">Monitor site traffic and deal performance.</p>
            <Button className="w-full" variant="outline">View Analytics</Button>
          </CardContent>
        </Card>
         <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">Top Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">Classify and monitor top listings.</p>
            <Button className="w-full" variant="outline">Monitor Top Listings</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Published Deals Overview</CardTitle>
          <CardDescription>A quick look at recently published deals and their status.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Placeholder for a table or list of deals */}
          <p className="text-muted-foreground">No deals to display currently.</p>
        </CardContent>
      </Card>
    </div>
  );
}
