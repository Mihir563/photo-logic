"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Users, CalendarIcon, IndianRupee } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PhotographerDashboard() {
  const [userData, setUserData] = useState<{ id: string } | null>(null);
  const stats = {
    totalBookings: 0,
    profileViews: 0,
    totalRevenue: 0,
  };
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
            Manage your profile, bookings
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
        <TabsList className="flex flex-wrap justify-center gap-2 md:justify-start ">
          <Link href="/dashboard/bookings" passHref className="cursor-pointer">
            <TabsTrigger
              value="bookings"
              className="flex-1 min-w-[120px]"
              data-active={getCurrentTab() === "bookings"}
            >
              Bookings
            </TabsTrigger>
          </Link>
          <Link href="/dashboard/portfolio" passHref className="cursor-pointer">
            <TabsTrigger
              value="portfolio"
              className="flex-1 min-w-[120px]"
              data-active={getCurrentTab() === "portfolio"}
            >
              Portfolio
            </TabsTrigger>
          </Link>
          <Link href="/dashboard/profile" passHref className="cursor-pointer">
            <TabsTrigger
              value="profile"
              className="flex-1 min-w-[120px]"
              data-active={getCurrentTab() === "profile"}
            >
              Profile
            </TabsTrigger>
          </Link>
          <Link href="/dashboard/pricing" passHref className="cursor-pointer">
            <TabsTrigger
              value="pricing"
              className="flex-1 min-w-[120px]"
              data-active={getCurrentTab() === "pricing"}
            >
              Pricing
            </TabsTrigger>
          </Link>
          <Link href="/dashboard/availability" passHref className="cursor-pointer">
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
  