"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar } from "@/components/ui/calendar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { CalendarIcon, Clock, MapPin, Check, X } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { toast, Toaster } from "sonner"
import { format } from "date-fns"

interface Booking {
  id: string
  client: {
    id: string
    name: string
    email: string
    avatar?: string
  }
  date: string
  time: string
  location: string
  type: string
  status: "pending" | "confirmed" | "completed" | "cancelled"
  notes?: string
  created_at: string
}

export default function BookingManager() {
  const [loading, setLoading] = useState(false)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [responseNote, setResponseNote] = useState("")
  const [calendarDates, setCalendarDates] = useState<Date[]>([])

  // Fetch bookings data on component mount
  useEffect(() => {
    async function getBookings() {
      try {
        setLoading(true)

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) throw new Error("User not found")

        // Get bookings data
        const { data, error } = await supabase
          .from("bookings")
          .select(`
            id,
            date,
            time,
            location,
            type,
            status,
            notes,
            created_at,
            clients:client_id (id, name, email, avatar_url)
          `)
          .eq("photographer_id", user.id)
          .order("date", { ascending: true })

        if (error) throw error

        if (data) {
          // Format the data
          
          const formattedBookings = data.map((booking) => ({
            id: booking.id,
            client: {
              //@ts-expect-error : dont know what is error in this!!!
              id: booking.clients.id,
              //@ts-expect-error : dont know what is error in this!!!
              name: booking.clients.name,
              //@ts-expect-error : dont know what is error in this!!!
              email: booking.clients.email,
              //@ts-expect-error : dont know what is error in this!!!
              avatar: booking.clients.avatar_url,
            },
            date: booking.date,
            time: booking.time,
            location: booking.location,
            type: booking.type,
            status: booking.status,
            notes: booking.notes,
            created_at: booking.created_at,
          }));

          setBookings(formattedBookings)

          // Set calendar dates
          const dates = formattedBookings
            .filter((booking) => booking.status !== "cancelled")
            .map((booking) => new Date(booking.date))

          setCalendarDates(dates)
        }
      } catch (error) {
        toast.error("Error loading bookings", {
          //@ts-expect-error : dont know what is error in this!!!
          description: error.message,
        });
      } finally {
        setLoading(false)
      }
    }

    getBookings()
  }, [])

  const updateBookingStatus = async (id: string, status: "confirmed" | "cancelled") => {
    try {
      setLoading(true)

      const { error } = await supabase
        .from("bookings")
        .update({
          status,
          response_notes: responseNote,
          updated_at: new Date(),
        })
        .eq("id", id)

      if (error) throw error

      // Update local state
      setBookings((prev) => prev.map((booking) => (booking.id === id ? { ...booking, status } : booking)))

      // Update calendar dates if needed
      if (status === "cancelled") {
        setCalendarDates((prev) =>
          prev.filter(
            (date) => !selectedBooking || date.toISOString() !== new Date(selectedBooking.date).toISOString(),
          ),
        )
      }

      // Close dialog and reset
      setDialogOpen(false)
      setSelectedBooking(null)
      setResponseNote("")

      toast.success(
        `Booking ${status}`,{
        description: `The booking has been ${status} successfully.`,
      })

      // Send notification to client
      await supabase.from("notifications").insert([
        {
          user_id: selectedBooking?.client.id,
          type: "booking_update",
          title: `Booking ${status}`,
          message: `Your booking for ${selectedBooking?.date} has been ${status}.`,
          read: false,
          created_at: new Date(),
        },
      ])
    } catch (error) {
      toast.error("Error updating booking", {
        //@ts-expect-error : dont know what is error in this!!!
        description: error.message,
      });
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking)
    setDialogOpen(true)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Bookings</CardTitle>
            <CardDescription>Manage your scheduled photo sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bookings.length > 0 ? (
                bookings.map((booking) => (
                  <Card key={booking.id} className="overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      <CardHeader className="md:flex-1">
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarImage
                              src={booking.client.avatar || "/placeholder.svg?height=40&width=40"}
                              alt={booking.client.name}
                            />
                            <AvatarFallback>{booking.client.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{booking.client.name}</CardTitle>
                            <CardDescription>{booking.type}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="md:flex-1 pt-6 md:pt-0 md:flex md:items-center">
                        <div className="space-y-2">
                          <div className="flex items-center text-sm">
                            <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{format(new Date(booking.date), "MMMM d, yyyy")}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{booking.time}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{booking.location}</span>
                          </div>
                        </div>
                      </CardContent>

                      <CardFooter className="flex flex-col md:items-center gap-2 pt-6 md:pt-0">
                        <Badge
                          variant={
                            booking.status === "confirmed"
                              ? "default"
                              : booking.status === "pending"
                                ? "outline"
                                : booking.status === "completed"
                                  ? "secondary"
                                  : "destructive"
                          }
                          className="mb-2 capitalize"
                        >
                          {booking.status}
                        </Badge>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleViewDetails(booking)}>
                            Details
                          </Button>
                          {booking.status === "pending" && (
                            <Button size="sm" onClick={() => handleViewDetails(booking)}>
                              Respond
                            </Button>
                          )}
                        </div>
                      </CardFooter>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium mb-2">No bookings yet</h3>
                  <p className="text-muted-foreground">When clients book your services, they'll appear here.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>Your scheduled sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar mode="multiple" selected={calendarDates} className="rounded-md border" disabled />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Pending Bookings</span>
              <Badge variant="outline">{bookings.filter((b) => b.status === "pending").length}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Confirmed Bookings</span>
              <Badge>{bookings.filter((b) => b.status === "confirmed").length}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Completed Sessions</span>
              <Badge variant="secondary">{bookings.filter((b) => b.status === "completed").length}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Cancelled Bookings</span>
              <Badge variant="destructive">{bookings.filter((b) => b.status === "cancelled").length}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Booking Details Dialog */}
      {selectedBooking && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Booking Details</DialogTitle>
              <DialogDescription>
                {selectedBooking.status === "pending"
                  ? "Review and respond to this booking request"
                  : "View details for this booking"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={selectedBooking.client.avatar || "/placeholder.svg?height=40&width=40"}
                    alt={selectedBooking.client.name}
                  />
                  <AvatarFallback>{selectedBooking.client.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{selectedBooking.client.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedBooking.client.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium mb-1">Date</h4>
                  <p>{format(new Date(selectedBooking.date), "MMMM d, yyyy")}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Time</h4>
                  <p>{selectedBooking.time}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Location</h4>
                  <p>{selectedBooking.location}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-1">Session Type</h4>
                  <p>{selectedBooking.type}</p>
                </div>
              </div>

              {selectedBooking.notes && (
                <div>
                  <h4 className="text-sm font-medium mb-1">Client Notes</h4>
                  <p className="text-sm">{selectedBooking.notes}</p>
                </div>
              )}

              {selectedBooking.status === "pending" && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Your Response</h4>
                  <Textarea
                    placeholder="Add a note to the client about this booking..."
                    value={responseNote}
                    onChange={(e) => setResponseNote(e.target.value)}
                    rows={3}
                  />
                </div>
              )}
            </div>

            <Toaster/>

            <DialogFooter className="flex flex-col sm:flex-row sm:justify-between sm:space-x-2">
              {selectedBooking.status === "pending" ? (
                <>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => updateBookingStatus(selectedBooking.id, "cancelled")}
                    disabled={loading}
                    className="mb-2 sm:mb-0"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Decline
                  </Button>
                  <Button
                    type="button"
                    onClick={() => updateBookingStatus(selectedBooking.id, "confirmed")}
                    disabled={loading}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Confirm Booking
                  </Button>
                </>
              ) : (
                <Button type="button" onClick={() => setDialogOpen(false)}>
                  Close
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

