"use client";

import { Button } from "@/components/ui/button";
import { MessageSquare, Camera, CalendarIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ClientDashboard() {
  const router = useRouter();

  // Get the current active tab from URL
  const getCurrentTab = () => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      const segments = path.split("/");
      const lastSegment = segments[segments.length - 1];

      // If on base client dashboard URL, default to "bookings"
      if (lastSegment === "client") return "bookings";

      // Check if the last segment is one of our valid tabs
      const validTabs = ["bookings", "messages", "profile"];
      if (validTabs.includes(lastSegment)) return lastSegment;

      return "bookings";
    }
    return "bookings";
  };

  return (
    <>
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

      <Tabs defaultValue={getCurrentTab()} className="mt-8">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <Link href="/dashboard/client/bookings" passHref>
            <TabsTrigger
              value="bookings"
              data-active={getCurrentTab() === "bookings"}
            >
              My Bookings
            </TabsTrigger>
          </Link>
          <Link href="/dashboard/client/messages" passHref>
            <TabsTrigger
              value="messages"
              data-active={getCurrentTab() === "messages"}
            >
              Messages
            </TabsTrigger>
          </Link>
          <Link href="/dashboard/client/profile" passHref>
            <TabsTrigger
              value="profile"
              data-active={getCurrentTab() === "profile"}
            >
              Profile
            </TabsTrigger>
          </Link>
        </TabsList>
      </Tabs>
    </>
  );
}
