"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronLeft } from "lucide-react";

export default function BackButton() {
  const router = useRouter();

  return (
    <Button
      onClick={() => router.back()}
      variant="outline"
      className=" items-center rounded-full -gap-1 right-10.5 top-19 fixed"
    >
      <ChevronLeft size={12} />
    </Button>
  );
}
