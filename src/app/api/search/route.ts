import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query") || ""
    const location = searchParams.get("location") || ""
    const category = searchParams.get("category") || ""
    const specialties = searchParams.get("specialties")?.split(",") || []

    let supabaseQuery = supabase
      .from("profiles")
      .select(`
        id,
        name,
        avatar_url,
        cover_image,
        location,
        bio,
        specialties,
        rating
      `)
      .eq("account_type", "photographer")

    // Apply filters
    if (query) {
      supabaseQuery = supabaseQuery.or(`name.ilike.%${query}%,bio.ilike.%${query}%`)
    }

    if (location) {
      supabaseQuery = supabaseQuery.ilike("location", `%${location}%`)
    }

    if (category) {
      supabaseQuery = supabaseQuery.contains("specialties", [category])
    }

    if (specialties.length > 0) {
      supabaseQuery = supabaseQuery.contains("specialties", specialties)
    }



    const { data, error } = await supabaseQuery

    if (error) {
      return NextResponse.json({ error: "Error searching photographers" }, { status: 500 })
    }

    // Format the data
    const photographers = data.map((profile) => ({
      id: profile.id,
      name: profile.name,
      avatar_url: profile.avatar_url,
      coverImage: profile.cover_image,
      location: profile.location,
      rating: profile.rating || 0,
      specialties: profile.specialties || [],
      bio: profile.bio || "",
    }))
    console.log(photographers)

    return NextResponse.json({ photographers })
  } catch (error) {
    console.error("Error searching photographers:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

