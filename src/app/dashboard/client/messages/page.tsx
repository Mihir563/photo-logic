"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Suspense } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import ChatInterface from "@/components/chat-interface";

export default function ClientMessagesPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the tab-based URL format while preserving functionality
    router.replace("/dashboard/client?tab=messages");
  }, [router]);

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Messages</CardTitle>
        <CardDescription>
          Manage client inquiries and conversations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<div>Loading messages...</div>}>
          <ChatInterface />
        </Suspense>
      </CardContent>
    </Card>
  );
}
