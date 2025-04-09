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
    // Only redirect if we're at the root client dashboard with no tab parameter
    if (pathname === "/dashboard/client" && !searchParams.get("tab")) {
      router.replace("/dashboard/client?tab=bookings", { scroll: false });
    }
  }, [pathname, router, searchParams]);

  // Function to render the correct tab content based on the URL parameter
  const renderTabContent = () => {
    // Access the tabs slot's children to conditionally render the correct one
    if (!tabs) {
      return null;
    }

    // The `tabs` is a React element that contains all tab content components
    // We're using it as a container and manually selecting which content to show
    return tabs;
  };

  return (
    <div className="flex flex-col gap-4 md:gap-8">
      {/* Main dashboard UI */}
      <Suspense fallback={<CosmicLoader />}>{children}</Suspense>

      {/* Tab content - only render what's needed based on the URL tab parameter */}
      <div className="tab-content">
        <Suspense fallback={<CosmicLoader />}>{renderTabContent()}</Suspense>
      </div>
    </div>
  );
}
