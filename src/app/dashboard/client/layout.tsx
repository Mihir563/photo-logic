"use client";

import { Suspense, useEffect } from "react";
import CosmicLoader from "@/app/loading";
import { useRouter, usePathname } from "next/navigation";

export default function ClientLayout({
  children,
  tabs,
}: {
  children: React.ReactNode;
  tabs: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If we're at the root client dashboard, redirect to the bookings tab
    if (pathname === "/dashboard/client") {
      router.replace("/dashboard/client/bookings");
    }
  }, [pathname, router]);

  return (
    <div className="flex flex-col gap-8">
      <Suspense fallback={<CosmicLoader />}></Suspense>

      {/* Main content for the route will be rendered here */}
      <div className="client-content-container">{children}</div>
      {/* Tabs content will be rendered here */}
      <div className="client-tabs-container">{tabs}</div>
    </div>
  );
}
