"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users, CalendarIcon, IndianRupee } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PhotographerDashboard() {
  const [userData, setUserData] = useState<{ id: string } | null>(null);
  const [stats, setStats] = useState({
    totalBookings: 0,
    newMessages: 0,
    profileViews: 0,
    totalRevenue: 0,
  });
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      // Get the current authenticated user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Get the user's profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileData) {
          setUserData(profileData);

          // Fetch stats for the stats cards
          const { count: bookingsCount } = await supabase
            .from("bookings")
            .select("*", { count: "exact" })
            .eq("photographer_id", user.id);

          const { count: messagesCount } = await supabase
            .from("messages")
            .select("*", { count: "exact" })
            .eq("receiver_id", user.id)
            .eq("read", false);

          const { data: completedBookings } = await supabase
            .from("bookings")
            .select("*")
            .eq("photographer_id", user.id)
            .eq("status", "completed");

          const { data: pricingPackages } = await supabase
            .from("pricing_packages")
            .select("*")
            .eq("user_id", user.id);

          let revenue = 0;
          if (completedBookings && pricingPackages) {
            revenue =
              completedBookings.length * (pricingPackages[0]?.price || 0);
          }

          setStats({
            totalBookings: bookingsCount || 0,
            newMessages: messagesCount || 0,
            profileViews: profileData.profile_views || 0,
            totalRevenue: revenue,
          });
        }
      }
    };

    fetchUserData();
  }, []);

  // Get the current active tab from URL
  const getCurrentTab = () => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      const segments = path.split("/");
      const lastSegment = segments[segments.length - 1];

      // If on base dashboard URL, default to "bookings"
      if (lastSegment === "dashboard") return "bookings";

      // Check if the last segment is one of our valid tabs
      const validTabs = [
        "bookings",
        "messages",
        "portfolio",
        "profile",
        "pricing",
        "availability",
      ];
      if (validTabs.includes(lastSegment)) return lastSegment;

      return "bookings";
    }
    return "bookings";
  };

  return (
    <>
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

      <Tabs defaultValue={getCurrentTab()} className="mt-8">
        <TabsList className="flex flex-wrap justify-center gap-2 md:justify-start">
          <Link href="/dashboard/bookings" passHref>
            <TabsTrigger
              value="bookings"
              className="flex-1 min-w-[120px]"
              data-active={getCurrentTab() === "bookings"}
            >
              Bookings
            </TabsTrigger>
          </Link>
          <Link href="/dashboard/messages" passHref>
            <TabsTrigger
              value="messages"
              className="flex-1 min-w-[120px]"
              data-active={getCurrentTab() === "messages"}
            >
              Messages
              
            </TabsTrigger>
          </Link>
          <Link href="/dashboard/portfolio" passHref>
            <TabsTrigger
              value="portfolio"
              className="flex-1 min-w-[120px]"
              data-active={getCurrentTab() === "portfolio"}
            >
              Portfolio
            </TabsTrigger>
          </Link>
          <Link href="/dashboard/profile" passHref>
            <TabsTrigger
              value="profile"
              className="flex-1 min-w-[120px]"
              data-active={getCurrentTab() === "profile"}
            >
              Profile
            </TabsTrigger>
          </Link>
          <Link href="/dashboard/pricing" passHref>
            <TabsTrigger
              value="pricing"
              className="flex-1 min-w-[120px]"
              data-active={getCurrentTab() === "pricing"}
            >
              Pricing
            </TabsTrigger>
          </Link>
          <Link href="/dashboard/availability" passHref>
            <TabsTrigger
              value="availability"
              className="flex-1 min-w-[120px]"
              data-active={getCurrentTab() === "availability"}
            >
              Availability
            </TabsTrigger>
          </Link>
        </TabsList>
      </Tabs>
    </>
  );
}
  