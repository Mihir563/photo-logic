'use client'

import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function ClientBookingsTab() {
  const router = useRouter();

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>My Bookings</CardTitle>
        <CardDescription>Manage your photography sessions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-16">
          <Camera className="h-16 w-16 mx-auto text-muted-foreground" />
          <h3 className="text-xl font-medium mt-4">No bookings yet</h3>
          <p className="text-muted-foreground mt-2">
            Book a session with a photographer to get started
          </p>
          <Button
            className="mt-4"
            onClick={() => router.push("/photographers")}
          >
            Find Photographers
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
