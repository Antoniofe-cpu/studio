'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { AnchorHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface NavLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
}

export function NavLink({ href, className, children, ...props }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        'px-3 py-2 rounded-md text-sm font-medium transition-colors',
        isActive
          ? 'bg-primary/20 text-primary'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
