"use client";

import { useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import {
  MapPin,
  Star,
  Camera,
  Mail,
  Instagram,
  Facebook,
  Twitter,
} from "lucide-react";
import PortfolioGallery from "@/components/portfolio-gallery";
import InquiryForm from "@/components/inquiry-form";
import { supabase } from "@/lib/supabase";

export default function PhotographerProfile() {
  const params = useParams();
  const [photographer, setPhotographer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPhotographer = async () => {
      try {
        setLoading(true);

        // Fetch photographer data from Supabase
        const { data, error } = await supabase
          .from("profiles")
          .select(
            `
    *,
    portfolio(*),
    availability(available_dates)
  `
          )
          .eq("id", params.id)
          .eq("account_type", "photographer")
          .single();

          
        if (error) {
          console.error("Error fetching photographer:", error);
          setError(error.message);
          return;
        }

        console.log
        if (!data) {
          notFound();
          return;
        }

        // Transform data if needed
        const transformedData = {
          ...data,
          specialties: data.specialties.map((s : any) => s.specialty || s.name),
          portfolio: data.portfolio.map((p: any) => ({
            title: p.title,
            id: p.id,
            imageUrl: p.image,
            category: p.category,
            description:p.description,
            createdAt: p.created_at
          })),
          
          availability: data.availability.map((a:any) => a.date),
        };

        setPhotographer(transformedData);
      } catch (err) {
        console.error("Failed to fetch photographer:", err);
        setError("Failed to load photographer profile");
      } finally {
        setLoading(false);
      }
    };


    if (params.id) {
      fetchPhotographer();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            Loading photographer profile...
          </p>
        </div>
      </div>
    );
  }

  if (error || !photographer) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Something went wrong</h2>
          <p className="mt-2 text-muted-foreground">
            {error || "Could not find photographer"}
          </p>
          <Button className="mt-4" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="relative mb-8">
        <div className="h-64 w-full overflow-hidden rounded-lg">
          <img
            src={photographer?.cover_image || "/placeholder.svg"}
            alt={`${photographer?.name}'s cover`}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-6 mt-6">
          <div className="flex-shrink-0">
            <Avatar className="h-24 w-24 border-4 border-background">
              <AvatarImage
                src={photographer?.avatar}
                alt={photographer?.name}
              />
              <AvatarFallback>{photographer?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>

          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">{photographer?.name}</h1>
                <div className="flex items-center gap-4 text-muted-foreground mt-1">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{photographer?.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span>{photographer?.rating}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Mail className="h-4 w-4" />
                  <span>Contact</span>
                </Button>
                <Button size="sm" className="gap-2">
                  <span>Book Now</span>
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {photographer?.specialties?.map((specialty, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  <Camera className="h-3 w-3" />
                  {specialty}
                </Badge>
              ))}
            </div>

            <p className="mt-4 text-muted-foreground">{photographer?.bio}</p>

            <div className="flex gap-3 mt-4">
              {photographer?.instagram && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() =>
                    window.open(
                      `https://instagram.com/${photographer.instagram}`,
                      "_blank"
                    )
                  }
                >
                  <Instagram className="h-4 w-4" />
                </Button>
              )}
              {photographer?.facebook && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() =>
                    window.open(
                      `https://facebook.com/${photographer.facebook}`,
                      "_blank"
                    )
                  }
                >
                  <Facebook className="h-4 w-4" />
                </Button>
              )}
              {photographer?.twitter && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  onClick={() =>
                    window.open(
                      `https://twitter.com/${photographer.twitter}`,
                      "_blank"
                    )
                  }
                >
                  <Twitter className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="portfolio" className="mt-8">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="inquire">Inquire</TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio" className="mt-6">
          <PortfolioGallery portfolio={photographer?.portfolio} />
        </TabsContent>

        <TabsContent value="pricing">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-2">Basic Session</h3>
                <div className="text-3xl font-bold mb-4">
                  ${photographer?.base_price}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    / hour
                  </span>
                </div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center">
                    <span className="mr-2">✓</span> 1 hour photo session
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span> 10 edited digital photos
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span> Online gallery
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span> Personal use license
                  </li>
                </ul>
                <Button className="w-full">Book This Package</Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-2">Standard Session</h3>
                <div className="text-3xl font-bold mb-4">
                  ${photographer?.base_price * 2}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    / package
                  </span>
                </div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center">
                    <span className="mr-2">✓</span> 2 hour photo session
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span> 25 edited digital photos
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span> Online gallery
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span> Personal use license
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span> 1 outfit change
                  </li>
                </ul>
                <Button className="w-full">Book This Package</Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-2">Premium Session</h3>
                <div className="text-3xl font-bold mb-4">
                  ${photographer?.base_price * 4}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    / package
                  </span>
                </div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center">
                    <span className="mr-2">✓</span> 4 hour photo session
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span> 50 edited digital photos
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span> Online gallery
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span> Commercial use license
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span> Multiple locations
                  </li>
                  <li className="flex items-center">
                    <span className="mr-2">✓</span> 3 outfit changes
                  </li>
                </ul>
                <Button className="w-full">Book This Package</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="availability">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-4">Available Dates</h3>
              <Calendar
                mode="multiple"
                selected={
                  photographer?.availability?.map((date) => new Date(date)) ||
                  []
                }
                className="rounded-md border"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-4">Book a Session</h3>
              <Card>
                <CardContent className="pt-6">
                  <p className="mb-4">
                    Select an available date from the calendar and book your
                    session.
                  </p>
                  <Button className="w-full">Request Booking</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="inquire">
          <InquiryForm
            photographerId={photographer?.id}
            photographerName={photographer?.name}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
