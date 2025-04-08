import { NextResponse } from "next/server";
import { supabase } from "@/lib/server";

export async function POST(request: Request) {
  try {
    const {
      senderId,
      receiverId,
      content,
      action = "send",
    } = await request.json();

    // Validate required fields for any action
    if (!senderId || !receiverId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    switch (action) {
      case "send":
        return await handleSendMessage(senderId, receiverId, content);
      case "typing":
        return await handleTypingStatus(senderId, receiverId, Boolean(content));
      case "read":
        return await handleMarkAsRead(senderId, receiverId, content);
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error in message API:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// Handle sending a new message
async function handleSendMessage(
  senderId: string,
  receiverId: string,
  content: string
) {
  // Validate content for send action
  if (!content) {
    return NextResponse.json(
      { error: "Message content is required" },
      { status: 400 }
    );
  }

  const timestamp = new Date();

  try {
    // Create message
    const { data, error } = await supabase
      .from("messages")
      .insert([
        {
          sender_id: senderId,
          receiver_id: receiverId,
          content,
          read: false,
          created_at: timestamp,
        },
      ])
      .select();

    if (error) {
      console.error("Error inserting message:", error);
      return NextResponse.json(
        { error: "Error sending message", details: error },
        { status: 500 }
      );
    }

    // Send notification
    const { error: notificationError } = await supabase
      .from("notifications")
      .insert([
        {
          user_id: receiverId,
          type: "new_message",
          title: "New Message",
          message: "You have received a new message",
          read: false,
          created_at: timestamp,
        },
      ]);

    if (notificationError) {
      console.error("Notification error:", notificationError);
      // Continue even if notification fails
    }

    // Update user's chat status to active
    await updateChatStatus(senderId, "active");

    return NextResponse.json({ success: true, message: data?.[0] || null });
  } catch (err) {
    console.error("Error in handleSendMessage:", err);
    return NextResponse.json(
      {
        error: "Failed to send message",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}

// Handle typing indicator updates
async function handleTypingStatus(
  senderId: string,
  receiverId: string,
  isTyping: boolean
) {
  try {
    // Debug
    console.log(
      `Updating typing status: ${senderId} is typing to ${receiverId}: ${isTyping}`
    );

    await updateChatStatus(
      senderId,
      isTyping ? "typing" : "active",
      isTyping ? receiverId : null
    );

    return NextResponse.json({ success: true, typing: isTyping });
  } catch (err) {
    console.error("Error updating typing status:", err);
    return NextResponse.json(
      {
        error: "Failed to update typing status",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
// Handle marking messages as read
async function handleMarkAsRead(
  receiverId: string,
  senderId: string,
  messageIds: string[] | null
) {
  try {
    const updateQuery = supabase
      .from("messages")
      .update({
        read: true,
        read_at: new Date(),
      })
      .eq("sender_id", senderId)
      .eq("receiver_id", receiverId)
      .eq("read", false);

    // If specific message IDs provided, only mark those as read
    if (messageIds && messageIds.length > 0) {
      updateQuery.in("id", messageIds);
    }

    const { error } = await updateQuery;

    if (error) {
      console.error("Error marking messages as read:", error);
      return NextResponse.json(
        { error: "Error marking messages as read", details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, read: true });
  } catch (err) {
    console.error("Error in handleMarkAsRead:", err);
    return NextResponse.json(
      {
        error: "Failed to mark messages as read",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}

// Helper to update user chat status
async function updateChatStatus(
  userId: string,
  status: string,
  typingTo: string | null = null
) {
  try {
    // Check if status entry exists
    const { data } = await supabase
      .from("chat_status")
      .select("user_id")
      .eq("user_id", userId);

    const timestamp = new Date();

    if (data && data.length > 0) {
      // Update existing status
      await supabase
        .from("chat_status")
        .update({
          status,
          typing_to: typingTo,
          last_active: timestamp,
        })
        .eq("user_id", userId);
    } else {
      // Create new status entry
      await supabase.from("chat_status").insert([
        {
          user_id: userId,
          status,
          typing_to: typingTo,
          last_active: timestamp,
        },
      ]);

    }
  } catch (err) {
    console.error("Error updating chat status:", err);
    // Don't throw here, just log the error
  }
}

// GET endpoint to check user status
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("chat_status")
      .select("status, typing_to, last_active")
      .eq("user_id", userId)
      .limit(1);

    if (error) {
      console.error("Error fetching status:", error);
      return NextResponse.json(
        { error: "Error fetching status", details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: data?.[0]?.status || "offline",
      typingTo: data?.[0]?.typing_to || null,
      lastActive: data?.[0]?.last_active || null,
    });
  } catch (err) {
    console.error("Error in GET:", err);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
