import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Globe, Palette, CreditCard, Shield } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline text-primary">Account Settings</h1>
      <CardDescription>
        Customize your WatchFinder AI experience, manage preferences, and more.
      </CardDescription>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Palette className="mr-2 h-5 w-5 text-primary" />Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="darkMode" className="flex flex-col space-y-1">
              <span>Dark Mode</span>
              <span className="font-normal leading-snug text-muted-foreground">
                Enable or disable dark theme. Currently following system preference.
              </span>
            </Label>
            <Switch id="darkMode" defaultChecked={true} aria-label="Toggle dark mode" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <Select defaultValue="it">
              <SelectTrigger id="language" className="w-full sm:w-[200px]">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="it">Italiano</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Globe className="mr-2 h-5 w-5 text-primary" />Regional Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currency">Preferred Currency</Label>
            <Select defaultValue="EUR">
              <SelectTrigger id="currency" className="w-full sm:w-[200px]">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
              </SelectContent>
            </Select>
          </div>
           <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select defaultValue="auto">
              <SelectTrigger id="timezone" className="w-full sm:w-[200px]">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Automatic (Europe/Rome)</SelectItem>
                {/* Add more timezones as needed */}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><CreditCard className="mr-2 h-5 w-5 text-primary" />Subscription & Billing</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-sm text-muted-foreground mb-2">Current Plan: <span className="font-semibold text-foreground">Investor Plan</span></p>
            <Button variant="outline">Manage Subscription</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Shield className="mr-2 h-5 w-5 text-primary" />Privacy & Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="items-top flex space-x-2">
            <Checkbox id="dataSharing" />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="dataSharing">
                Allow anonymous data sharing
              </Label>
              <p className="text-sm text-muted-foreground">
                Help us improve WatchFinder AI by sharing anonymized usage data.
              </p>
            </div>
          </div>
          <Button variant="link" className="p-0 h-auto text-primary">Download Your Data</Button>
          <Separator />
          <Button variant="destructive">Delete Account</Button>
          <p className="text-xs text-muted-foreground">Note: Account deletion is permanent and cannot be undone.</p>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button>Save All Settings</Button>
      </div>
    </div>
  );
}

