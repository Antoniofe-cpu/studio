import { Logo } from '@/components/logo';
import { NavLink } from '@/components/nav-link';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
          <NavLink href="/">Deals</NavLink>
          <NavLink href="/scan">Scan Watch</NavLink>
          <NavLink href="/dashboard">Dashboard</NavLink>
          <NavLink href="/admin">Admin</NavLink>
        </nav>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button size="sm" asChild>
             <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
