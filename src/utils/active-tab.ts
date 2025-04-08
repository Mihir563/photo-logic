"use client";

// Helper function to determine the active tab from the URL
export function getActiveTab(defaultTab = "bookings") {
  if (typeof window === "undefined") return defaultTab;

  const path = window.location.pathname;
  const segments = path.split("/");
  const lastSegment = segments[segments.length - 1];

  // Handle base routes
  if (lastSegment === "dashboard" || lastSegment === "client")
    return defaultTab;

  // Check if the last segment is a valid tab name
  const validPhotographerTabs = [
    "bookings",
    "messages",
    "portfolio",
    "profile",
    "pricing",
    "availability",
  ];
  const validClientTabs = ["bookings", "messages", "profile"];

  if (path.includes("/client/")) {
    return validClientTabs.includes(lastSegment) ? lastSegment : defaultTab;
  } else {
    return validPhotographerTabs.includes(lastSegment)
      ? lastSegment
      : defaultTab;
  }
}
