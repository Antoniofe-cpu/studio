import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart2, Eye, ShoppingBag, TrendingUp } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Mock data
const mockUserHistory = {
  viewedItems: [
    { id: 'v1', name: 'Rolex Submariner 126610LN', date: '2024-07-25' },
    { id: 'v2', name: 'Omega Speedmaster Moonwatch', date: '2024-07-22' },
  ],
  purchasedItems: [
    { id: 'p1', name: 'Tudor Black Bay 58', date: '2024-06-15', purchasePrice: 3500, currentValue: 3800, roi: 8.57 },
  ],
};

export default function UserHistoryPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline text-primary flex items-center">
        <BarChart2 className="mr-3 h-7 w-7" /> My Activity & ROI
      </h1>
      <CardDescription>
        Review your interaction history, track your purchases, and analyze your investment returns.
      </CardDescription>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-xl"><Eye className="mr-2 h-5 w-5 text-primary" />Recently Viewed</CardTitle>
          </CardHeader>
          <CardContent>
            {mockUserHistory.viewedItems.length > 0 ? (
              <ul className="space-y-2">
                {mockUserHistory.viewedItems.map(item => (
                  <li key={item.id} className="text-sm p-2 bg-muted/50 rounded-md">{item.name} - <span className="text-xs text-muted-foreground">Viewed on {item.date}</span></li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No recently viewed items.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-xl"><ShoppingBag className="mr-2 h-5 w-5 text-primary" />Purchase History & ROI</CardTitle>
          </CardHeader>
          <CardContent>
            {mockUserHistory.purchasedItems.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Watch</TableHead>
                    <TableHead>Purchase Price</TableHead>
                    <TableHead>Current Value</TableHead>
                    <TableHead className="text-right">ROI (%)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockUserHistory.purchasedItems.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>€{item.purchasePrice.toLocaleString()}</TableCell>
                      <TableCell>€{item.currentValue.toLocaleString()}</TableCell>
                      <TableCell className={`text-right font-semibold ${item.roi >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {item.roi >= 0 ? '+' : ''}{item.roi.toFixed(2)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground">No purchase history found.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-xl"><TrendingUp className="mr-2 h-5 w-5 text-primary" />Overall Portfolio Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Placeholder for a chart or summary */}
          <p className="text-2xl font-bold">+10.2% <span className="text-sm text-muted-foreground">Total ROI</span></p>
          <p className="text-sm text-muted-foreground mt-1">Detailed performance charts coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
