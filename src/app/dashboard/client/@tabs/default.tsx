// app/dashboard/client/@tabs/default.tsx

import { redirect } from "next/navigation";

export default function DefaultClientTab() {
  redirect("/dashboard/client?tabs=bookings");
}

