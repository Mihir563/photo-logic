"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Bell,
  X,
  Check,
  Calendar,
  MessageSquare,
  Search,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JSX } from "react/jsx-runtime";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentTab, setCurrentTab] = useState<Tab>("all");
  const router = useRouter();

  // Get current user ID
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error);
        setIsLoading(false);
        return;
      }

      if (data?.user) {
        setUserId(data.user.id);
      } else {
        setIsLoading(false);
        router.push("/login"); // Redirect if not logged in
      }
    };

    fetchUser();
  }, [router]);
  
 const applyFilters = useCallback(
   (
     notificationList: Notification[],
     query: string,
     type: string,
     tab: Tab
   ): void => {
     let filtered = [...notificationList];

     // Apply tab filter first (read status)
     if (tab === "unread") {
       filtered = filtered.filter((notification) => !notification.read);
     } else if (tab === "read") {
       filtered = filtered.filter((notification) => notification.read);
     }

     // Apply type filter
     if (type !== "all") {
       filtered = filtered.filter((notification) => notification.type === type);
     }

     // Apply search query
     if (query) {
       const lowerQuery = query.toLowerCase();
       filtered = filtered.filter(
         (notification) =>
           notification.title.toLowerCase().includes(lowerQuery) ||
           notification.message.toLowerCase().includes(lowerQuery)
       );
     }

     setFilteredNotifications(filtered);
   },
   [setFilteredNotifications] // or any state/setters you're using inside
 );

  // Fetch notifications and set up real-time listener when user ID is available
  useEffect(() => {
    if (!userId) return;

    // Initial fetch of notifications
    const fetchNotifications = async () => {
      setIsLoading(true);

      try {
        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(100);

        if (error) throw error;

        setNotifications(data || []);
        setFilteredNotifications(data || []);
        // Count unread notifications
        setUnreadCount(
          data.filter((notification) => !notification.read).length
        );
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();

    // Set up real-time subscription for new notifications
    const subscription = supabase
      .channel("notifications_page_channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log("Real-time notification update:", payload);

          // Handle different database events
          if (payload.eventType === "INSERT") {
            setNotifications((current) => [
              payload.new as Notification,
              ...current,
            ]);
            applyFilters(
              [payload.new as Notification, ...notifications],
              searchQuery,
              typeFilter,
              currentTab
            );
            setUnreadCount((count) => count + 1);
          } else if (payload.eventType === "UPDATE") {
            const updatedNotifications = notifications.map((notification) =>
              notification.id === payload.new.id
                ? (payload.new as Notification)
                : notification
            );
            setNotifications(updatedNotifications);
            applyFilters(
              updatedNotifications,
              searchQuery,
              typeFilter,
              currentTab
            );
            // Recalculate unread count
            setUnreadCount(
              updatedNotifications.filter((notification) => !notification.read)
                .length
            );
          } else if (payload.eventType === "DELETE") {
            const filteredNotifications = notifications.filter(
              (notification): notification is Notification =>
                notification.id !== payload.old.id
            );
            setNotifications(filteredNotifications);
            applyFilters(
              filteredNotifications,
              searchQuery,
              typeFilter,
              currentTab
            );
            // Recalculate unread count
            setUnreadCount(
              filteredNotifications.filter((notification) => !notification.read)
                .length
            );
          }
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, [notifications, searchQuery, typeFilter, currentTab, applyFilters, userId]);

  // Apply filters when search, type filter, or tab changes
  useEffect(() => {
    applyFilters(notifications, searchQuery, typeFilter, currentTab);
  }, [applyFilters, searchQuery, typeFilter, currentTab, notifications]);

  // Filter notifications based on search query, type filter, and tab
  interface Notification {
    id: string;
    user_id: string;
    type: string;
    title: string;
    message: string;
    read: boolean;
    created_at: string;
  }

  type Tab = "all" | "unread" | "read";


  // Mark notification as read
  const markAsRead = async (notificationId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId);

      if (error) throw error;

      // Update local state
      const updatedNotifications: Notification[] = notifications.map(
        (notification: Notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
      );

      setNotifications(updatedNotifications);
      applyFilters(updatedNotifications, searchQuery, typeFilter, currentTab);
      setUnreadCount((count) => Math.max(0, count - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications
        .filter((notification) => !notification.read)
        .map((notification) => notification.id);

      if (unreadIds.length === 0) return;

      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .in("id", unreadIds);

      if (error) throw error;

      // Update local state
      const updatedNotifications = notifications.map((notification) => ({
        ...notification,
        read: true,
      }));
      setNotifications(updatedNotifications);
      applyFilters(updatedNotifications, searchQuery, typeFilter, currentTab);
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Delete a notification
  interface DeleteNotificationResponse {
    error: Error | null;
  }

  const deleteNotification = async (notificationId: string): Promise<void> => {
    try {
      const { error }: DeleteNotificationResponse = await supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId);

      if (error) throw error;

      // Update local state
      const updatedNotifications: Notification[] = notifications.filter(
        (notification: Notification) => notification.id !== notificationId
      );

      setNotifications(updatedNotifications);
      applyFilters(updatedNotifications, searchQuery, typeFilter, currentTab);

      // Recalculate unread count
      setUnreadCount(
        updatedNotifications.filter((notification: Notification) => !notification.read).length
      );
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  // Handle notification click based on type
  const handleNotificationClick = (notification: Notification) => {
    // Mark as read first
    markAsRead(notification.id);

    // Navigate based on notification type
    switch (notification.type) {
      case "booking_request":
      case "booking_confirmed":
      case "booking_cancelled":
        router.push("/dashboard/bookings");
        break;
      case "new_message":
        router.push("/dashboard/messages");
        break;
      case "booking_sent":
        router.push("/dashboard/bookings");
        break;
      default:
        // No navigation for other notification types
        break;
    }
  };

  // Get appropriate icon for notification type
  interface NotificationIconProps {
    type: string;
  }

  const getNotificationIcon = (type: NotificationIconProps["type"]): JSX.Element => {
    switch (type) {
      case "booking_request":
      case "booking_confirmed":
      case "booking_cancelled":
      case "booking_sent":
        return <Calendar className="h-5 w-5 text-primary" />;
      case "new_message":
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string): string => {
    const date: Date = new Date(timestamp);
    return format(date, "MMM d, yyyy 'at' h:mm a");
  };

  // Get notification type options for filter
  const getNotificationTypes = () => {
    const types = new Set(
      notifications.map((notification) => notification.type)
    );
    return Array.from(types);
  };

  if (!userId) {
    return null; // Don't render if user is not logged in
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl flex items-center gap-2">
              Notifications
              {unreadCount > 0 && (
                <Badge className="ml-2">{unreadCount} unread</Badge>
              )}
            </CardTitle>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                Mark all as read
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notifications..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Select
                  value={typeFilter}
                  onValueChange={(value) => setTypeFilter(value)}
                >
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    {getNotificationTypes().map((type) => (
                        <SelectItem key={type} value={type}>
                        {type
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (c: string) => c.toUpperCase())}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tabs */}
            <Tabs
              defaultValue="all"
              value={currentTab}
              onValueChange={(value) => setCurrentTab(value as Tab)}
            >
              <TabsList className="grid w-full grid-cols-3 max-w-md">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unread">
                  Unread {unreadCount > 0 && `(${unreadCount})`}
                </TabsTrigger>
                <TabsTrigger value="read">Read</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Notifications List */}
            <div className="mt-4">
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                  <Bell className="h-16 w-16 mb-4 opacity-20" />
                  <p className="text-lg font-medium">No notifications found</p>
                  <p className="text-sm mt-1">
                    {searchQuery || typeFilter !== "all" || currentTab !== "all"
                      ? "Try adjusting your filters"
                      : "You don't have any notifications yet"}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex items-start p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors ${
                        !notification.read ? "bg-blue-50/50" : ""
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="mr-3 mt-0.5 hidden sm:block">
                        {getNotificationIcon(notification.type)}
                      </div>

                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">
                                {notification.title}
                              </h4>
                              {!notification.read && (
                                <Badge
                                  variant="outline"
                                  className="bg-blue-100 text-blue-700 border-blue-200"
                                >
                                  New
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              <span className="block sm:inline sm:mr-2">
                                {notification.type
                                  .replace(/_/g, " ")
                                  .replace(/\b\w/g, (c) => c.toUpperCase())}
                              </span>
                              <span className="block sm:inline text-xs opacity-70">
                                {formatDistanceToNow(
                                  new Date(notification.created_at),
                                  {
                                    addSuffix: true,
                                  }
                                )}
                              </span>
                            </p>
                          </div>
                          <div className="flex gap-2 self-end sm:self-auto">
                            {!notification.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Mark as read
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm my-2">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatTimestamp(notification.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
