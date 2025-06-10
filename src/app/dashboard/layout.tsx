import { NavLink } from '@/components/nav-link';
import { Separator } from '@/components/ui/separator';
import { Package, BarChart2, User, Settings, Bell, Star, SearchCode, SlidersHorizontal } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row gap-8">
      <aside className="md:w-64 bg-card p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-primary font-headline">My Dashboard</h2>
        <nav className="space-y-2">
          <NavLink href="/dashboard" className="flex items-center gap-2 w-full justify-start">
            <Package className="h-4 w-4" /> Overview
          </NavLink>
          <NavLink href="/dashboard/recommendations" className="flex items-center gap-2 w-full justify-start">
            <SearchCode className="h-4 w-4" /> AI Recommendations
          </NavLink>
          <NavLink href="/dashboard/suggestions" className="flex items-center gap-2 w-full justify-start">
            <SlidersHorizontal className="h-4 w-4" /> Personalized Suggestions
          </NavLink>
          <NavLink href="/dashboard/watchlist" className="flex items-center gap-2 w-full justify-start">
            <Star className="h-4 w-4" /> Watchlist
          </NavLink>
          <NavLink href="/dashboard/history" className="flex items-center gap-2 w-full justify-start">
            <BarChart2 className="h-4 w-4" /> My History & ROI
          </NavLink>
          <Separator className="my-4" />
          <NavLink href="/dashboard/profile" className="flex items-center gap-2 w-full justify-start">
            <User className="h-4 w-4" /> Profile
          </NavLink>
          <NavLink href="/dashboard/notifications" className="flex items-center gap-2 w-full justify-start">
            <Bell className="h-4 w-4" /> Notifications
          </NavLink>
          <NavLink href="/dashboard/settings" className="flex items-center gap-2 w-full justify-start">
            <Settings className="h-4 w-4" /> Settings
          </NavLink>
        </nav>
      </aside>
      <div className="flex-1 bg-card p-6 rounded-lg shadow-md">
        {children}
      </div>
    </div>
  );
}
