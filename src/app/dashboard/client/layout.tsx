"use client";

import { Suspense, useEffect } from "react";
import CosmicLoader from "@/app/loading";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function ClientLayout({
  children,
  tabs,
}: {
  children: React.ReactNode;
  tabs: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Get the current tab from URL or default to "bookings"
  const currentTab = searchParams.get("tab") || "bookings";

  useEffect(() => {
    // If we're at the root client dashboard with no tab parameter, redirect to the bookings tab
    if (pathname === "/dashboard/client" && !searchParams.get("tab")) {
      router.replace("/dashboard/client?tab=bookings", { scroll: false });
    }
  }, [pathname, router, searchParams]);

  // This would normally be inside tabs/page
  const renderTabContent = () => {
    return (
      <Suspense fallback={<CosmicLoader />}>
        {tabs}
      </Suspense>
    );
  };

  return (
    <div className="flex flex-col gap-4 md:gap-8">
      {/* Main dashboard UI */}
      <Suspense fallback={<CosmicLoader />}>
        {children}
      </Suspense>

      {/* Tab content */}
      <div className="tab-content">
        {renderTabContent()}
      </div>
    </div>
  );
}