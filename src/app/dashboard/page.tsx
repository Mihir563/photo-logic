import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Users, CalendarIcon, DollarSign } from "lucide-react"
import ProfileForm from "@/components/profile-form"
import PricingForm from "@/components/pricing-form"
import BookingManager from "@/components/booking-manager"
import ChatInterface from "@/components/chat-interface"
import PortfolioManager from "@/components/portfolio-manager"
import AvailabilityManager from "@/components/availability-manager"

export default function Dashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Photographer Dashboard</h1>
          <p className="text-muted-foreground">Manage your profile, bookings, and messages</p>
        </div>
        <Button>View Public Profile</Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
              <h3 className="text-2xl font-bold mt-1">24</h3>
            </div>
            <div className="bg-primary/10 p-3 rounded-full">
              <CalendarIcon className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">New Messages</p>
              <h3 className="text-2xl font-bold mt-1">12</h3>
            </div>
            <div className="bg-primary/10 p-3 rounded-full">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Profile Views</p>
              <h3 className="text-2xl font-bold mt-1">156</h3>
            </div>
            <div className="bg-primary/10 p-3 rounded-full">
              <Users className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <h3 className="text-2xl font-bold mt-1">$2,450</h3>
            </div>
            <div className="bg-primary/10 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="bookings" className="mt-8">
        <TabsList className="grid w-full grid-cols-6 mb-8">
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings">
          <Suspense fallback={<div>Loading bookings...</div>}>
            <BookingManager />
          </Suspense>
        </TabsContent>

        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle>Messages</CardTitle>
              <CardDescription>Manage client inquiries and conversations</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Loading messages...</div>}>
                <ChatInterface />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="portfolio">
          <Suspense fallback={<div>Loading portfolio...</div>}>
            <PortfolioManager />
          </Suspense>
        </TabsContent>

        <TabsContent value="profile">
          <Suspense fallback={<div>Loading profile...</div>}>
            <ProfileForm />
          </Suspense>
        </TabsContent>

        <TabsContent value="pricing">
          <Suspense fallback={<div>Loading pricing...</div>}>
            <PricingForm />
          </Suspense>
        </TabsContent>

        <TabsContent value="availability">
          <Suspense fallback={<div>Loading availability...</div>}>
            <AvailabilityManager />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}

