import { Suspense } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import BookingManager from "@/components/booking-manager";
import CosmicLoader from "@/app/loading";

export default function BookingsTab() {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Bookings</CardTitle>
        <CardDescription>Manage your photography sessions</CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<div>
          <CosmicLoader/>
          <p>Loading bookings...</p></div>}>
          <BookingManager />
        </Suspense>
      </CardContent>
    </Card>
  );
}
