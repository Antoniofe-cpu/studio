import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search, Star } from "lucide-react";

// Mock data for watchlist items
const mockWatchlistItems = [
  { id: 'wl1', brand: 'Rolex', model: 'Daytona', reference: '116500LN', targetPrice: 25000, currentMarketPrice: 28000, alertActive: true },
  { id: 'wl2', brand: 'Omega', model: 'Seamaster Diver 300M', reference: '210.30.42.20.03.001', targetPrice: 4500, currentMarketPrice: 4800, alertActive: false },
  { id: 'wl3', brand: 'Audemars Piguet', model: 'Royal Oak Offshore', reference: '26470ST.OO.A027CA.01', targetPrice: 30000, currentMarketPrice: 32000, alertActive: true },
];


export default function WatchlistPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold font-headline text-primary flex items-center">
          <Star className="mr-3 h-7 w-7" /> My Watchlist
        </h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add to Watchlist
        </Button>
      </div>
      <CardDescription>
        Keep track of specific watches and set price alerts to never miss a deal.
      </CardDescription>

      <div className="flex flex-col sm:flex-row gap-2 items-center">
        <div className="relative flex-grow w-full sm:w-auto">
            <Input type="search" placeholder="Search your watchlist..." className="pl-10" />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </div>
        {/* Placeholder for filters if needed */}
      </div>
      
      {mockWatchlistItems.length > 0 ? (
        <div className="space-y-4">
          {mockWatchlistItems.map(item => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-lg">{item.brand} {item.model}</CardTitle>
                        <CardDescription>{item.reference}</CardDescription>
                    </div>
                    <Button variant={item.alertActive ? "default" : "outline"} size="sm">
                        {item.alertActive ? "Alert Active" : "Activate Alert"}
                    </Button>
                </div>
              </CardHeader>
              <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm pt-2">
                <div>
                  <p className="text-muted-foreground">Target Price</p>
                  <p className="font-semibold">€{item.targetPrice.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Market Price</p>
                  <p className="font-semibold">€{item.currentMarketPrice.toLocaleString()}</p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <Button variant="link" className="p-0 h-auto text-primary">Edit Alert</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-10 text-center">
            <Star className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Your Watchlist is Empty</h3>
            <p className="text-muted-foreground mb-4">Add watches you want to track to get started.</p>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add First Watch
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
