"use client";

import { useEffect } from "react";
import { redirect } from "next/navigation";

// This is a fallback page that redirects to the client bookings page
export default function ClientDashboardPage() {
  useEffect(() => {
    redirect("/dashboard/client/bookings");
  }, []);

  return null; // This won't render as we're redirecting
}
