"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Suspense } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import ProfileForm from "@/components/profile-form";
import CosmicLoader from "@/app/loading";

export default function ClientProfilePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if we're on the direct route path before redirecting
    // This prevents redirect loops
    if (window.location.pathname === "/dashboard/client/profile" && 
        !window.location.search.includes("tab=")) {
      // Redirect to the tab-based URL format while preserving functionality
      router.replace("/dashboard/client?tab=profile");
    }
  }, [router]);

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>My Profile</CardTitle>
        <CardDescription>Manage your personal information</CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense
          fallback={
            <div>
              <CosmicLoader />
              <p>Loading profile...</p>
            </div>
          }
        >
          <ProfileForm isClient={true} />
        </Suspense>
      </CardContent>
    </Card>
  );
}