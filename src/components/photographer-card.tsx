import type { Photographer } from "@/lib/types"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Star, Camera } from "lucide-react"
import Link from "next/link"

interface PhotographerCardProps {
  photographer: Photographer
}

export default function PhotographerCard({ photographer }: PhotographerCardProps) {
  const { id, name, avatar, location, rating, specialties, price, coverImage } = photographer

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="relative h-48 overflow-hidden">
        <img src={coverImage || "/placeholder.svg"} alt={`${name}'s work`} className="w-full h-full object-cover" />
      </div>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex gap-3">
            <Avatar className="h-10 w-10 border">
              <AvatarImage src={avatar} alt={name} />
              <AvatarFallback>{name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{name}</h3>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-3 w-3 mr-1" />
                <span>{location}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
            <span className="text-sm font-medium">{rating}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {specialties.map((specialty, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              <Camera className="h-3 w-3" />
              {specialty}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold">${price}</span>
            <span className="text-muted-foreground text-sm"> / hour</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t bg-muted/20 px-6 py-3">
        <Button asChild className="w-full">
          <Link href={`/photographers/${id}`}>View Profile</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

