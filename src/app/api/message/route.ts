import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { senderId, receiverId, content } = await request.json()

    // Validate required fields
    if (!senderId || !receiverId || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create message
    const { data, error } = await supabase
      .from("messages")
      .insert([
        {
          sender_id: senderId,
          receiver_id: receiverId,
          content,
          read: false,
          created_at: new Date(),
        },
      ])
      .select()

    if (error) {
      return NextResponse.json({ error: "Error sending message" }, { status: 500 })
    }

    // Send notification
    await supabase.from("notifications").insert([
      {
        user_id: receiverId,
        type: "new_message",
        title: "New Message",
        message: "You have received a new message",
        read: false,
        created_at: new Date(),
      },
    ])

    return NextResponse.json({ success: true, message: data[0] })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

