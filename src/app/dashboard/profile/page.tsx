import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Award, Edit3, UserCircle } from "lucide-react";

// Mock user data
const mockUser = {
  name: "Mario Rossi",
  email: "mario.rossi@example.com",
  avatarUrl: "https://placehold.co/100x100.png",
  joinDate: "2023-01-15",
  badges: ["Top ROI Master", "Watch Collector Pro", "Super Flipper"],
  subscriptionPlan: "Investor Plan",
};

export default function UserProfilePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline text-primary flex items-center">
        <UserCircle className="mr-3 h-7 w-7" /> My Profile
      </h1>
      <CardDescription>
        Manage your account details, preferences, and view your achievements.
      </CardDescription>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader className="items-center text-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={mockUser.avatarUrl} alt={mockUser.name} data-ai-hint="user avatar" />
                <AvatarFallback>{mockUser.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <CardTitle className="text-xl">{mockUser.name}</CardTitle>
              <CardDescription>{mockUser.email}</CardDescription>
              <CardDescription className="text-xs">Joined: {mockUser.joinDate}</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
                <Button variant="outline" size="sm">
                  <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
                </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg"><Award className="mr-2 h-5 w-5 text-primary" />Badges & Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              {mockUser.badges.length > 0 ? (
                <ul className="space-y-2">
                  {mockUser.badges.map(badge => (
                    <li key={badge} className="text-sm p-2 bg-muted/50 rounded-md flex items-center">
                      <Award className="mr-2 h-4 w-4 text-yellow-500" /> {badge}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No badges earned yet. Keep engaging!</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue={mockUser.name} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" defaultValue={mockUser.email} readOnly />
              </div>
              <Button>Save Changes</Button>
              <Separator className="my-6" />
              <h3 className="text-lg font-medium">Subscription</h3>
              <p className="text-sm text-muted-foreground">Current Plan: <span className="font-semibold text-primary">{mockUser.subscriptionPlan}</span></p>
              <Button variant="outline">Manage Subscription</Button>
               <Separator className="my-6" />
              <h3 className="text-lg font-medium">Security</h3>
              <Button variant="outline">Change Password</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
