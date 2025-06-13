import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { BellRing, Mail, MessageSquare } from "lucide-react";

// Mock notification settings
const mockNotificationSettings = [
  { id: 'priceAlerts', label: 'Price Alerts for Watchlist Items', enabled: true, channels: ['email', 'app'] },
  { id: 'newDeals', label: 'New Top Deals Notifications', enabled: true, channels: ['email'] },
  { id: 'weeklyNewsletter', label: 'Weekly Newsletter Subscription', enabled: false, channels: ['email'] },
  { id: 'flipAssistant', label: 'Flip Assistant Suggestions', enabled: true, channels: ['app'] },
];

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline text-primary flex items-center">
        <BellRing className="mr-3 h-7 w-7" /> Notification Settings
      </h1>
      <CardDescription>
        Manage how and when you receive notifications from WatchFinder AI.
      </CardDescription>

      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {mockNotificationSettings.map(setting => (
            <div key={setting.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg bg-muted/30">
              <div>
                <Label htmlFor={setting.id} className="text-base font-medium">{setting.label}</Label>
                <div className="flex items-center space-x-2 mt-1">
                  {setting.channels.includes('email') && <Mail className="h-4 w-4 text-muted-foreground" title="Email Notification" />}
                  {setting.channels.includes('app') && <MessageSquare className="h-4 w-4 text-muted-foreground" title="In-App Notification" />}
                </div>
              </div>
              <Switch id={setting.id} checked={setting.enabled} className="mt-2 sm:mt-0"/>
            </div>
          ))}
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button>Save Preferences</Button>
      </div>
    </div>
  );
}
