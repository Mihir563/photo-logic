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

export default function ClientProfileTab() {
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
