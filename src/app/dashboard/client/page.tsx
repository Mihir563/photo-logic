"use client";

import { Button } from "@/components/ui/button";
import { Camera, CalendarIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function ClientDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get the current active tab from URL query parameters
  const getCurrentTab = () => {
    const tab = searchParams.get("tab");
    // If no tab specified, default to "bookings"
    if (!tab) return "bookings";

    // Check if the tab is one of our valid tabs
    const validTabs = ["bookings", "profile"];
    if (validTabs.includes(tab)) return tab;

    return "bookings";
  };

  const [activeTab, setActiveTab] = useState(getCurrentTab());

  // Update active tab when URL changes
  useEffect(() => {
    setActiveTab(getCurrentTab());
  }, [searchParams]);

  // Handle tab change
  const handleTabChange = (value:string) => {
    setActiveTab(value);
    // Update URL without causing a full navigation
    const newUrl = `/dashboard/client?tab=${value}`;
    router.replace(newUrl, { scroll: false });
  };

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Client Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Manage your bookings and find photographers
          </p>
        </div>
        <Button
          onClick={() => router.push("/photographers")}
          className="w-full md:w-auto"
        >
          Find Photographers
        </Button>
      </div>

      {/* Client Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
        <Card>
          <CardContent className="p-4 md:p-6 flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm font-medium text-muted-foreground">
                My Bookings
              </p>
              <h3 className="text-xl md:text-2xl font-bold mt-1">0</h3>
            </div>
            <div className="bg-primary/10 p-2 md:p-3 rounded-full">
              <CalendarIcon className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 md:p-6 flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm font-medium text-muted-foreground">
                Favorite Photographers
              </p>
              <h3 className="text-xl md:text-2xl font-bold mt-1">0</h3>
            </div>
            <div className="bg-primary/10 p-2 md:p-3 rounded-full">
              <Camera className="h-5 w-5 md:h-6 md:w-6 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="mt-4 md:mt-8"
      >
        <TabsList className="grid w-full grid-cols-2 mb-4 md:mb-8">
          <TabsTrigger value="bookings">My Bookings</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
        </TabsList>

        {/* This will be rendered in the children slot of the parallel route */}
        <TabsContent value="bookings">
          {/* Bookings content will be inserted via parallel routes */}
        </TabsContent>

        <TabsContent value="profile">
          {/* Profile content will be inserted via parallel routes */}
        </TabsContent>
      </Tabs>
    </>
  );
}
