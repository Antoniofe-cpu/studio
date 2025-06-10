
'use client';

import { Logo } from '@/components/logo';
import { NavLink } from '@/components/nav-link';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { UserCircle, LogOut, Loader2 } from 'lucide-react';

export function Header() {
  const { currentUser, logout, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
      router.push('/');
    } catch (error) {
      console.error("Logout error:", error);
      toast({ title: 'Logout Error', description: 'Failed to log out. Please try again.', variant: 'destructive' });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
          <NavLink href="/">Deals</NavLink>
          <NavLink href="/scan">AI Search Scanner</NavLink>
          {currentUser && <NavLink href="/dashboard">Dashboard</NavLink>}
          {currentUser && <NavLink href="/admin">Admin</NavLink>} {/* Consider admin roles in future */}
        </nav>
        <div className="flex items-center space-x-2">
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          ) : currentUser ? (
            <>
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {currentUser.email}
              </span>
              <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
