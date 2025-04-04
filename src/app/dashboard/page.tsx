"use client";

import { Suspense, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageSquare,
  Users,
  CalendarIcon,
  IndianRupee,
  Camera,
  UserCircle,
} from "lucide-react";
import ProfileForm from "@/components/profile-form";
import PricingForm from "@/components/pricing-form";
import BookingManager from "@/components/booking-manager";
import ChatInterface from "@/components/chat-interface";
import PortfolioManager from "@/components/portfolio-manager";
import AvailabilityManager from "@/components/availability-manager";
import { toast, Toaster } from "sonner";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userData, setUserData] = useState<{ id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    newMessages: 0,
    profileViews: 0,
    totalRevenue: 0,
  });

  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);

        // Get the current authenticated user
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          router.push("/auth"); // Redirect to login if not authenticated
          return;
        }

        // Get the user's profile including account_type
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError) {
          throw profileError;
        }

        if (!profileData) {
          // If profile doesn't exist, create an onboarding experience
          router.push("/onboarding");
          return;
        }

        setUserData(profileData);
        setUserRole(profileData.account_type);

        // If user is a photographer, fetch their stats
        if (profileData.account_type === "photographer") {
          const fetchStats = async () => {
            // Get total bookings
            const { count: bookingsCount } = await supabase
              .from("bookings")
              .select("*", { count: "exact" })
              .eq("photographer_id", user.id);

            // Get unread messages
            const { count: messagesCount } = await supabase
              .from("messages")
              .select("*", { count: "exact" })
              .eq("receiver_id", user.id)
              .eq("read", false);

            // Calculate revenue from completed bookings
            // This is a simplification, you might want to get this from an actual payments table
            const { data: completedBookings } = await supabase
              .from("bookings")
              .select("*")
              .eq("photographer_id", user.id)
              .eq("status", "completed");

            // Get pricing packages to calculate revenue
            const { data: pricingPackages } = await supabase
              .from("pricing_packages")
              .select("*")
              .eq("user_id", user.id);

            // Calculate total revenue
            // This is a sample calculation - adjust based on your actual data structure
            let revenue = 0;
            if (completedBookings && pricingPackages) {
              // Very simple calculation - in real app, you'd match bookings to packages
              revenue =
                completedBookings.length * (pricingPackages[0]?.price || 0);
            }

            setStats({
              totalBookings: bookingsCount || 0,
              newMessages: messagesCount || 0,
              profileViews: profileData.profile_views || 0,
              totalRevenue: revenue,
            });
          };

          fetchStats().catch((error) => {
            console.error("Failed to fetch stats:", error);
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error(
          "Error",{
          description: "Failed to load your profile. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [supabase, router, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  // Client dashboard
  if (userRole === "client") {
    return <ClientDashboard />;
  }

  // Photographer dashboard
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Photographer Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your profile, bookings, and messages
          </p>
        </div>
        <Button onClick={() => router.push(`/photographers/${userData?.id}`)}>
          View Public Profile
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Bookings
              </p>
              <h3 className="text-2xl font-bold mt-1">{stats.totalBookings}</h3>
            </div>
            <div className="bg-primary/10 p-3 rounded-full">
              <CalendarIcon className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                New Messages
              </p>
              <h3 className="text-2xl font-bold mt-1">{stats.newMessages}</h3>
            </div>
            <div className="bg-primary/10 p-3 rounded-full">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Profile Views
              </p>
              <h3 className="text-2xl font-bold mt-1">{stats.profileViews}</h3>
            </div>
            <div className="bg-primary/10 p-3 rounded-full">
              <Users className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Revenue
              </p>
              <h3 className="text-2xl font-bold mt-1 flex items-center">
                <IndianRupee className="h-5 w-5" />
                {stats.totalRevenue.toLocaleString()}
              </h3>
            </div>
            <div className="bg-primary/10 p-3 rounded-full">
              <IndianRupee className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="bookings" className="mt-8">
        <TabsList className="flex flex-wrap justify-center gap-2 md:justify-start">
          <TabsTrigger value="bookings" className="flex-1 min-w-[120px]">
            Bookings
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex-1 min-w-[120px]">
            Messages
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="flex-1 min-w-[120px]">
            Portfolio
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex-1 min-w-[120px]">
            Profile
          </TabsTrigger>
          <TabsTrigger value="pricing" className="flex-1 min-w-[120px]">
            Pricing
          </TabsTrigger>
          <TabsTrigger value="availability" className="flex-1 min-w-[120px]">
            Availability
          </TabsTrigger>
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
              <CardDescription>
                Manage client inquiries and conversations
              </CardDescription>
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
            <ProfileForm isClient={false} />
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
  );
}

// Client Dashboard Component
function ClientDashboard() {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Client Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your bookings and find photographers
          </p>
        </div>
        <Button onClick={() => router.push("/photographers")}>
          Find Photographers
        </Button>
      </div>

      {/* Client Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                My Bookings
              </p>
              <h3 className="text-2xl font-bold mt-1">0</h3>
            </div>
            <div className="bg-primary/10 p-3 rounded-full">
              <CalendarIcon className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                New Messages
              </p>
              <h3 className="text-2xl font-bold mt-1">0</h3>
            </div>
            <div className="bg-primary/10 p-3 rounded-full">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Favorite Photographers
              </p>
              <h3 className="text-2xl font-bold mt-1">0</h3>
            </div>
            <div className="bg-primary/10 p-3 rounded-full">
              <Camera className="h-6 w-6 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="bookings" className="mt-8">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="bookings">My Bookings</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle>My Bookings</CardTitle>
              <CardDescription>
                Manage your photography sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-16">
                <Camera className="h-16 w-16 mx-auto text-muted-foreground" />
                <h3 className="text-xl font-medium mt-4">No bookings yet</h3>
                <p className="text-muted-foreground mt-2">
                  Book a session with a photographer to get started
                </p>
                <Button
                  className="mt-4"
                  onClick={() => router.push("/photographers")}
                >
                  Find Photographers
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle>Messages</CardTitle>
              <CardDescription>Communicate with photographers</CardDescription>
            </CardHeader>
              <CardContent>
                <Suspense fallback={<div>Loading messages...</div>}>
                  <ChatInterface />
                </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <Toaster/>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>My Profile</CardTitle>
              <CardDescription>
                Manage your personal information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Loading profile...</div>}>
                <ProfileForm isClient={true} />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
