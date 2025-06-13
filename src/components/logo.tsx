import Link from 'next/link';
import { Eye } from 'lucide-react'; // Using Eye as a placeholder for "finder" / "AI sensor"

export function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2 text-primary hover:opacity-80 transition-opacity">
      <Eye className="h-8 w-8" />
      <span className="text-2xl font-bold font-headline text-foreground">
        WatchFinder <span className="text-primary">AI</span>
      </span>
    </Link>
  );
}
