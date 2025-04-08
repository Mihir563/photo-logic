"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function DashboardSlugRedirect() {
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    const slugArray = Array.isArray(params.slug) ? params.slug : [params.slug];

    // Check if this is a client dashboard route
    if (slugArray[0] === "client") {
      // If there's a second segment, it's a tab name
      if (slugArray.length > 1) {
        const clientTab = slugArray[1];
        router.replace(`/dashboard/client?tab=${clientTab}`);
      } else {
        router.replace("/dashboard/client");
      }
    } else {
      // Handle photographer dashboard routes
      const tab = slugArray[0];
      if (tab) {
        router.replace(`/dashboard?tab=${tab}`);
      } else {
        router.replace("/dashboard");
      }
    }
  }, [params.slug, router]);

  return null;
}
