import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { photographerId, clientId, date, time, location, type, notes } = await request.json()

    // Validate required fields
    if (!photographerId || !clientId || !date || !time || !location || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if the photographer is available on the selected date
    const { data: availabilityData, error: availabilityError } = await supabase
      .from("availability")
      .select("available_dates")
      .eq("user_id", photographerId)
      .single()

    if (availabilityError) {
      return NextResponse.json({ error: "Error checking photographer availability" }, { status: 500 })
    }

    // Check if the date is in the available dates
    const isAvailable = availabilityData?.available_dates?.includes(date)

    if (!isAvailable) {
      return NextResponse.json({ error: "Photographer is not available on the selected date" }, { status: 400 })
    }

    // Create booking
    const { data, error } = await supabase
      .from("bookings")
      .insert([
        {
          photographer_id: photographerId,
          client_id: clientId,
          date,
          time,
          location,
          type,
          notes,
          status: "pending",
          created_at: new Date(),
        },
      ])
      .select()

    if (error) {
      return NextResponse.json({ error: "Error creating booking" }, { status: 500 })
    }

    // Send notification to photographer
    await supabase.from("notifications").insert([
      {
        user_id: photographerId,
        type: "new_booking",
        title: "New Booking Request",
        message: `You have a new booking request for ${date}`,
        read: false,
        created_at: new Date(),
      },
    ])

    return NextResponse.json({ success: true, booking: data[0] })
  } catch (error) {
    console.error("Error creating booking:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

