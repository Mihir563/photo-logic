import type { Photographer } from "@/lib/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, Camera } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface PhotographerCardProps {
  photographer: Photographer;
}

export default function PhotographerCard({
  photographer,
}: PhotographerCardProps) {
  // Destructure the photographer object with the actual properties you're receiving
  const {
    id,
    name,
    avatar_url,
    location,
    rating,
    specialties,
    hourly_rate,
    cover_image,
    bio,
  } = photographer;

  console.log("PhotographerCard", { photographer });

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="relative h-48 overflow-hidden">
        <Image
          height={192}
          width={192}
          src={cover_image || "/placeholder.svg"}
          alt={`${name}'s work`}
          className="w-full h-full object-cover"
        />
      </div>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex gap-3">
            <Avatar className="h-10 w-10 border">
              <AvatarImage src={avatar_url} alt={name} />
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
            <span className="text-sm font-medium">{rating || "New"}</span>
          </div>
        </div>

        {bio && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {bio}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          {Array.isArray(specialties)
            ? specialties.map((specialty, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  <Camera className="h-3 w-3" />
                  {specialty}
                </Badge>
              ))
            : specialties?.split(",").map((specialty, index: number) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  <Camera className="h-3 w-3" />
                  {specialty.trim()}
                </Badge>
              ))}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-bold">₹{hourly_rate || 0}</span>
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
  );
}
