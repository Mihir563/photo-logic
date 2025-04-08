"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function DashboardSlugRedirect() {
  const router = useRouter();
  const params = useParams(); // 👈 THIS is the magic

  useEffect(() => {
    const tab = Array.isArray(params.slug) ? params.slug[0] : params.slug;
    if (tab) {
      router.replace(`/dashboard?tab=${tab}`);
    } else {
      router.replace("/dashboard");
    }
  }, [params.slug, router]);

  return null;
}
