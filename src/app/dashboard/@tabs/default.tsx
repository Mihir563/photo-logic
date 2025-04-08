// app/dashboard/@tabs/default.tsx

import { redirect } from "next/navigation";

export default function DefaultTabs() {
  redirect("/dashboard/bookings");
}
