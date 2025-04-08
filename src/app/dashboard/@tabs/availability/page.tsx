import { Suspense } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import AvailabilityManager from "@/components/availability-manager";
import CosmicLoader from "@/app/loading";

export default function AvailabilityTab() {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Availability</CardTitle>
        <CardDescription>Manage your availability for bookings</CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense
          fallback={
            <div>
              <CosmicLoader/>
              <p>Loading availability...</p>
            </div>
          }
        >
          <AvailabilityManager />
        </Suspense>
      </CardContent>
    </Card>
  );
}
