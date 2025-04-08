"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default function BackButton() {
  const router = useRouter();

  return (
    <Button
      onClick={() => router.back()}
      variant="outline"
      className="bg-black/40 text-white border-white/50 items-center rounded-full right-4 bottom-4 fixed"
    >
      <ChevronLeft size={12} />
    </Button>
  );
}
