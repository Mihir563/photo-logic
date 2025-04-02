"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Upload } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

export default function ProfileForm() {
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    specialties: [] as string[],
    instagram: "",
    facebook: "",
    website: "",
    avatar_url: "",
    cover_image: "",
  })

  // Fetch profile data on component mount
  useEffect(() => {
    async function getProfile() {
      try {
        setLoading(true)

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) throw new Error("User not found")

        // Get profile data
        const { data, error } = await supabase.from("portfolio").select("*").eq("id", user.id).single()

        if (error && error.code !== "PGRST116") {
          throw error
        }

        if (data) {
          setProfile({
            name: data.name || "",
            email: data.email || "",
            phone: data.phone || "",
            location: data.location || "",
            bio: data.bio || "",
            specialties: data.specialties || [],
            instagram: data.instagram || "",
            facebook: data.facebook || "",
            website: data.website || "",
            avatar_url: data.avatar_url || "",
            cover_image: data.cover_image || "",
          })
        }
      } catch (error: any) {
        toast(
          "Error loading profile",{
          description: error.message,
        })
      } finally {
        setLoading(false)
      }
    }

    getProfile()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfile((prev) => ({ ...prev, [name]: value }))
  }

  const handleSpecialtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target
    setProfile((prev) => ({
      ...prev,
      specialties: checked ? [...prev.specialties, value] : prev.specialties.filter((s) => s !== value),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error("User not found")

      const updates = {
        id: user.id,
        name: profile.name,
        phone: profile.phone,
        location: profile.location,
        bio: profile.bio,
        specialties: profile.specialties,
        instagram: profile.instagram,
        facebook: profile.facebook,
        website: profile.website,
        updated_at: new Date(),
      }

      const { error } = await supabase.from("portfolio").upsert(updates)

      if (error) throw error

      toast(
      "Profile updated",{
        description: "Your profile has been updated successfully.",
      })
    } catch (error: any) {
      toast(
        "Error updating profile",{
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setLoading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.")
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not found")

      const file = event.target.files[0]
      const fileExt = file.name.split(".").pop()
      const filePath = `avatars/${user.id}-${Math.random()}.${fileExt}`

      // Upload to the portfolio bucket instead of avatars
      const { error: uploadError } = await supabase.storage.from("portfolio").upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL from portfolio bucket
      const {
        data: { publicUrl },
      } = supabase.storage.from("portfolio").getPublicUrl(filePath)

      // Update portfolio table
      const { error: updateError } = await supabase.from("portfolio").update({ avatar_url: publicUrl }).eq("id", user.id)

      if (updateError) throw updateError

      setProfile((prev) => ({ ...prev, avatar_url: publicUrl }))

      toast(
         "Avatar updated",{
        description: "Your profile photo has been updated successfully.",
      })
    } catch (error: any) {
      toast(
        "Error uploading avatar",{
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const uploadCoverImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setLoading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.")
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not found")

      const file = event.target.files[0]
      const fileExt = file.name.split(".").pop()
      const filePath = `covers/${user.id}-${Math.random()}.${fileExt}`

      // Upload to the portfolio bucket instead of covers
      const { error: uploadError } = await supabase.storage.from("portfolio").upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL from portfolio bucket
      const {
        data: { publicUrl },
      } = supabase.storage.from("portfolio").getPublicUrl(filePath)

      // Update portfolio table
      const { error: updateError } = await supabase
        .from("portfolio")
        .update({ cover_image: publicUrl })
        .eq("id", user.id)

      if (updateError) throw updateError

      setProfile((prev) => ({ ...prev, cover_image: publicUrl }))

      toast(
       "Cover image updated",{
        description: "Your cover image has been updated successfully.",
      })
    } catch (error: any) {
      toast(
       "Error uploading cover image",{
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal and professional information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Full Name
                </label>
                <Input id="name" name="name" value={profile.name} onChange={handleChange} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </label>
                  <Input id="email" name="email" type="email" value={profile.email} disabled />
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm font-medium">
                    Phone Number
                  </label>
                  <Input id="phone" name="phone" value={profile.phone} onChange={handleChange} />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="location" className="text-sm font-medium">
                  Location
                </label>
                <Input id="location" name="location" value={profile.location} onChange={handleChange} />
              </div>

              <div className="space-y-2">
                <label htmlFor="bio" className="text-sm font-medium">
                  Professional Bio
                </label>
                <Textarea id="bio" name="bio" rows={5} value={profile.bio} onChange={handleChange} />
                <p className="text-sm text-muted-foreground">
                  Write a short bio that describes your experience and style.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Specialties</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="wedding"
                      value="Wedding"
                      checked={profile.specialties.includes("Wedding")}
                      onChange={handleSpecialtyChange}
                      className="rounded"
                    />
                    <label htmlFor="wedding">Wedding</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="portrait"
                      value="Portrait"
                      checked={profile.specialties.includes("Portrait")}
                      onChange={handleSpecialtyChange}
                      className="rounded"
                    />
                    <label htmlFor="portrait">Portrait</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="event"
                      value="Event"
                      checked={profile.specialties.includes("Event")}
                      onChange={handleSpecialtyChange}
                      className="rounded"
                    />
                    <label htmlFor="event">Event</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="commercial"
                      value="Commercial"
                      checked={profile.specialties.includes("Commercial")}
                      onChange={handleSpecialtyChange}
                      className="rounded"
                    />
                    <label htmlFor="commercial">Commercial</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="fashion"
                      value="Fashion"
                      checked={profile.specialties.includes("Fashion")}
                      onChange={handleSpecialtyChange}
                      className="rounded"
                    />
                    <label htmlFor="fashion">Fashion</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="real-estate"
                      value="Real Estate"
                      checked={profile.specialties.includes("Real Estate")}
                      onChange={handleSpecialtyChange}
                      className="rounded"
                    />
                    <label htmlFor="real-estate">Real Estate</label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label htmlFor="instagram" className="text-sm font-medium">
                    Instagram
                  </label>
                  <Input id="instagram" name="instagram" value={profile.instagram} onChange={handleChange} />
                </div>

                <div className="space-y-2">
                  <label htmlFor="facebook" className="text-sm font-medium">
                    Facebook
                  </label>
                  <Input id="facebook" name="facebook" value={profile.facebook} onChange={handleChange} />
                </div>

                <div className="space-y-2">
                  <label htmlFor="website" className="text-sm font-medium">
                    Website
                  </label>
                  <Input id="website" name="website" value={profile.website} onChange={handleChange} />
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Profile Photo</CardTitle>
            <CardDescription>Upload a professional photo of yourself</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Avatar className="h-32 w-32 mb-4">
              <AvatarImage src={profile.avatar_url || "/placeholder.svg?height=128&width=128"} alt="Profile" />
              <AvatarFallback>{profile.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <label className="w-full">
              <Button variant="outline" className="w-full mb-2 cursor-pointer block">
                <Upload className="mr-2 h-4 w-4" />
                Upload New Photo
              </Button>
              <input type="file" accept="image/*" onChange={uploadAvatar} disabled={loading} className="hidden" />
            </label>
            <Button
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={async () => {
                try {
                  setLoading(true)
                  const {
                    data: { user },
                  } = await supabase.auth.getUser()
                  if (!user) throw new Error("User not found")

                  const { error } = await supabase.from("portfolio").update({ avatar_url: null }).eq("id", user.id)

                  if (error) throw error

                  setProfile((prev) => ({ ...prev, avatar_url: "" }))

                  toast(
                    "Avatar removed",{
                    description: "Your profile photo has been removed.",
                  })
                } catch (error: any) {
                  toast(
                    "Error removing avatar",{
                    description: error.message,
                  })
                } finally {
                  setLoading(false)
                }
              }}
              disabled={loading}
            >
              Remove Photo
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cover Image</CardTitle>
            <CardDescription>Upload a cover image for your profile</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-muted rounded-md mb-4 flex items-center justify-center overflow-hidden">
              <img
                src={profile.cover_image || "/placeholder.svg?height=300&width=500"}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            </div>
            <label className="w-full">
              <Button variant="outline" className="w-full">
                <Camera className="mr-2 h-4 w-4" />
                Change Cover Image
              </Button>
              <input type="file" accept="image/*" onChange={uploadCoverImage} disabled={loading} className="hidden" />
            </label>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 