'use client'
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
import { useSearchParams } from "next/navigation";

export default function ClientProfileTab() {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "bookings";

  // Only render this component when it's the active tab
  if (currentTab !== "profile") {
    return null;
  }

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
