import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, MapPin } from "lucide-react"

const bookings = [
  {
    id: "1",
    client: {
      name: "Emma Thompson",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    date: "April 5, 2025",
    time: "10:00 AM - 12:00 PM",
    location: "Central Park, New York",
    type: "Portrait Session",
    status: "confirmed",
  },  
  {
    id: "2",
    client: {
      name: "Michael Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    date: "April 12, 2025",
    time: "2:00 PM - 6:00 PM",
    location: "Johnson Residence, Brooklyn",
    type: "Family Session",
    status: "pending",
  },
  {
    id: "3",
    client: {
      name: "Sarah Williams",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    date: "April 18, 2025",
    time: "9:00 AM - 11:00 AM",
    location: "Williams Office, Manhattan",
    type: "Corporate Headshots",
    status: "confirmed",
  },
]

export default function BookingList() {
  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <Card key={booking.id} className="overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <CardHeader className="md:flex-1">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={booking.client.avatar} alt={booking.client.name} />
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
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{booking.date}</span>
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
              <Badge variant={booking.status === "confirmed" ? "default" : "outline"} className="mb-2">
                {booking.status === "confirmed" ? "Confirmed" : "Pending"}
              </Badge>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  Details
                </Button>
                {booking.status === "pending" && <Button size="sm">Confirm</Button>}
              </div>
            </CardFooter>
          </div>
        </Card>
      ))}
    </div>
  )
}

