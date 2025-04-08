"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast, Toaster } from "sonner";
import { useRouter } from "next/navigation";
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

            // // Calculate revenue from completed bookings
            // const { data: completedBookings } = await supabase
            //   .from("bookings")
            //   .select("*")
            //   .eq("photographer_id", user.id)
            //   .eq("status", "completed");

            // // Get pricing packages to calculate revenue
            // const { data: pricingPackages } = await supabase
            //   .from("pricing_packages")
            //   .select("*")
            //   .eq("user_id", user.id);

            // Calculate total revenue
            // let revenue = 0;
            // if (completedBookings && pricingPackages) {
            //   revenue =
            //     completedBookings.length * (pricingPackages[0]?.price || 0);
            // }

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <CosmicLoader />
        </div>
      </div>
    );
  }

  // Redirect client users to client dashboard
  if (
    userRole === "client" &&
    !window.location.pathname.includes("/dashboard/client")
  ) {
    router.push("/dashboard/client");
    return null;
  }

  // Redirect photographer users to photographer dashboard
  if (
    userRole === "photographer" &&
    window.location.pathname.includes("/dashboard/client")
  ) {
    router.push("/dashboard");
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {children}
      {tabs}
      <Toaster />
    </div>
  );
}
