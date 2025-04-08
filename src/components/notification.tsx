"use client";

import React, { useEffect, useState } from "react";
import { Bell, X, Check, Calendar, MessageSquare } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow, format } from "date-fns";
import { useRouter } from "next/navigation";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  user_id: string;
  read: boolean;
  created_at: string;
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);
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
      }
    };

    fetchUser();
  }, []);

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
          .limit(20);

        if (error) throw error;

        setNotifications(data || []);
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
      .channel("notifications_channel")
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
            setNotifications((current) => [payload.new as Notification, ...current]);
            setUnreadCount((count) => count + 1);
          } else if (payload.eventType === "UPDATE") {
            setNotifications((current) =>
              current.map((notification) =>
                notification.id === payload.new.id ? (payload.new as Notification) : notification
              )
            );
            // Recalculate unread count after update
            setNotifications((current) => {
              setUnreadCount(
                current.filter((notification) => !notification.read).length
              );
              return current;
            });
          } else if (payload.eventType === "DELETE") {
            setNotifications((current) =>
              current.filter(
                (notification) => notification.id !== payload.old.id
              )
            );
            // Recalculate unread count after delete
            setNotifications((current) => {
              setUnreadCount(
                current.filter((notification) => !notification.read).length
              );
              return current;
            });
          }
        }
      )
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, [userId]);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId);

      if (error) throw error;

      // Update local state
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
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
      setNotifications((current) =>
        current.map((notification) => ({ ...notification, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Delete a notification
  const deleteNotification = async (notificationId : string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId);

      if (error) throw error;

      // Update local state
      setNotifications((current) =>
        current.filter((notification) => notification.id !== notificationId)
      );
      // Recalculate unread count
      setNotifications((current) => {
        setUnreadCount(
          current.filter((notification) => !notification.read).length
        );
        return current;
      });
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  // Handle notification click based on type
  interface NotificationClickHandler {
    (notification: Notification): void;
  }

  const handleNotificationClick: NotificationClickHandler = (notification) => {
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

      // Close popover after handling click
      setOpen(false);
  };

  // Get appropriate icon for notification type
  
  type NotificationIconReturn = React.ReactElement;

  const getNotificationIcon = (type: string): NotificationIconReturn => {
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
  interface TimestampFormatter {
    (timestamp: string): string;
  }

  const formatTimestamp: TimestampFormatter = (timestamp) => {
    const date = new Date(timestamp);
    return format(date, "MMM d, yyyy 'at' h:mm a");
  };

  if (!userId) {
    return null; // Don't render if user is not logged in
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 px-1.5 min-w-[20px] h-5 flex items-center justify-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-full max-w-sm sm:max-w-md md:w-96 p-0"
        align="end"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-medium">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              Mark all as read
            </Button>
          )}
        </div>

        <ScrollArea className="h-[60vh] max-h-80">
          {isLoading ? (
            <div className="flex justify-center items-center h-20">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <Bell className="h-10 w-10 mb-2" />
              <p>No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start p-4 border-b hover:bg-muted/50 cursor-pointer ${
                  !notification.read ? "bg-blue-50/50" : ""
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="mr-3 mt-0.5 hidden sm:block">
                  {getNotificationIcon(notification.type)}
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start flex-wrap gap-1">
                    <h4 className="font-medium text-sm">
                      {notification.title}
                    </h4>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(
                          new Date(notification.created_at),
                          { addSuffix: true }
                        )}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {notification.message}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(notification.created_at)}
                    </span>
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs ml-auto"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Mark as read
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </ScrollArea>

        <div className="p-2 border-t text-center">
          <Button
            variant="link"
            size="sm"
            className="text-xs"
            onClick={() => {
              router.push("/dashboard/notifications");
              setOpen(false);
            }}
          >
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
