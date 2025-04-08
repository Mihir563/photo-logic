"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast, Toaster } from "sonner";
import { useRouter, usePathname } from "next/navigation";
import CosmicLoader from "@/app/loading";

export default function DashboardLayout({
  children,
  tabs,
}: {
  children: React.ReactNode;
  tabs: React.ReactNode;
}) {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

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

        setUserRole(profileData.account_type);

        // If user is a photographer, fetch their stats
        if (profileData.account_type === "photographer") {
          const fetchStats = async () => {
            // Stats fetching code...
          };

          fetchStats().catch((error) => {
            console.error("Failed to fetch stats:", error);
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Error", {
          description: "Failed to load your profile. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  useEffect(() => {
    // Only redirect if we have determined the user role and are not already loading
    if (!loading && userRole) {
      // Redirect client users to client dashboard
      if (userRole === "client" && !pathname.includes("/dashboard/client")) {
        router.push("/dashboard/client?tab=bookings");
        return;
      }

      // Redirect photographer users to photographer dashboard
      if (
        userRole === "photographer" &&
        pathname.includes("/dashboard/client")
      ) {
        router.push("/dashboard?tab=bookings");
        return;
      }
    }
  }, [userRole, loading, pathname, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <CosmicLoader />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {children}
      {tabs}
      <Toaster />
    </div>
  );
}
