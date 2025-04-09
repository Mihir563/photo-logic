// src/app/dashboard/client/@tabs/layout.tsx
"use client";

import { useSearchParams } from "next/navigation";

interface TabsLayoutProps {
  bookings: React.ReactNode;
  profile: React.ReactNode;
  default: React.ReactNode;
}

export default function TabsLayout({
  bookings,
  profile,
  default: defaultTab,
}: TabsLayoutProps) {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "bookings";

  // Only render the tab content that matches the current URL parameter
  if (currentTab === "bookings") {
    return <>{bookings}</>;
  } else if (currentTab === "profile") {
    return <>{profile}</>;
  } else {
    // This should never happen with proper redirects, but fall back to default
    return <>{defaultTab}</>;
  }
}
