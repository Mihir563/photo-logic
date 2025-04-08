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
  Clock,
  Calendar as CalendarIcon,
} from "lucide-react";
import PortfolioGallery from "@/components/portfolio-gallery";
import InquiryForm from "@/components/inquiry-form";
import { supabase } from "@/lib/supabase";
import RequestBookingButton from "@/components/RequestBooking";
import Image from "next/image";
import CosmicLoader from "@/app/loading";

interface Photographer {
  id: string;
  name: string;
  cover_image?: string;
  avatar_url?: string;
  location?: string;
  rating?: number;
  bio?: string;
  instagram?: string;
  facebook?: string;
  twitter?: string;
  base_price?: number;
  specialties: string[];
  portfolio: Array<{
    title: string;
    id: string;
    imageUrl: string;
    category: string;
    description: string;
    createdAt: string;
  }>;
}

interface Availability {
  available_dates: string[];
  settings: {
    advanceNotice: string;
    maxBookingsPerDay: string;
    bufferBetweenBookings: string;
  };
  working_hours: {
    monday: { start: string; end: string; available: boolean };
    tuesday: { start: string; end: string; available: boolean };
    wednesday: { start: string; end: string; available: boolean };
    thursday: { start: string; end: string; available: boolean };
    friday: { start: string; end: string; available: boolean };
    saturday: { start: string; end: string; available: boolean };
    sunday: { start: string; end: string; available: boolean };
  };
}

export default function PhotographerProfile() {
  const params = useParams();
  const [photographer, setPhotographer] = useState<Photographer | null>(null);
  const [pricingPackages, setPricingPackages] = useState<
    Array<{ id: string; name: string; price: number; duration?: number; included?: string[] }>
  >([]);
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientId, setClientId] = useState<  string[] | undefined >();

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error);
      } else {
        setClientId(data?.user?.id ? [data.user.id] : undefined);
      }
    };
    fetchUser();
  }, []);

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
    portfolio(*)
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

        if (!data) {
          notFound();
          return;
        }

        // Transform data if needed
        const transformedData = {
          ...data,
          specialties: data.specialties,
          //@ts-expect-error : dont know what is error in this!!!
          portfolio: data.portfolio.map((p) => ({
            title: p.title,
            id: p.id,
            imageUrl: p.image,
            category: p.category,
            description: p.description,
            createdAt: p.created_at,
            specialties: p.specialties,
          })),
        };

        setPhotographer(transformedData);
      } catch (err) {
        console.error("Failed to fetch photographer:", err);
        setError("Failed to load photographer profile");
      } finally {
        setLoading(false);
      }
    };

    // Fetch pricing packages from Supabase
    const fetchPricingPackages = async () => {
      try {
        setLoading(true);

        // Fetch pricing packages from Supabase
        const { data, error } = await supabase
          .from("pricing_packages")
          .select("*")
          .eq("user_id", params.id);

        if (error) {
          console.error("Error fetching pricing packages:", error);
          setError(error.message);
          return;
        }

        setPricingPackages(data);
      } catch (err) {
        console.error("Failed to fetch pricing packages:", err);
        setError("Failed to load pricing packages");
      } finally {
        setLoading(false);
      }
    };

    const fetchDates = async () => {
      try {
        setLoading(true);

        // Fetch availability dates from Supabase
        const { data, error } = await supabase
          .from("availability")
          .select("*")
          .eq("user_id", params.id);

        if (error) {
          console.error("Error fetching availability:", error);
          setError(error.message);
          return;
        }

        if (data && data.length > 0) {
          setAvailability(data[0]); // Use the first item since it contains all the data
        }
      } catch (err) {
        console.error("Failed to fetch availability:", err);
        setError("Failed to load availability data");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchPhotographer();
      fetchPricingPackages();
      fetchDates();
    }
  }, [params.id]);

  // Format time for display (e.g., "09:00" to "9:00 AM")
  const formatTime = (timeStr: string) => {
    if (!timeStr) return "";
    const [hours, minutes] = timeStr.split(":");
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${period}`;
  };


  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <CosmicLoader/>
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
          <Image
            width={1000}
            height={400}
            src={photographer?.cover_image || "/placeholder.svg"}
            alt={`${photographer?.name}'s cover`}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-6 mt-6">
          <div className="flex-shrink-0">
            <Avatar className="h-24 w-24 border-4 border-background">
              <AvatarImage
                src={photographer?.avatar_url}
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

            <div className="flex flex-wrap gap-3 mt-4">
              {photographer?.instagram && (
                <Button
                  variant="ghost"
                  className="rounded-full px-4 py-2 text-white bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 hover:opacity-90 transition"
                  onClick={() =>
                    window.open(
                      `https://instagram.com/${photographer.instagram}`,
                      "_blank"
                    )
                  }
                >
                  <Instagram className="h-4 w-4 " />
                  <span className="whitespace-nowrap">
                    {photographer.instagram}
                  </span>
                </Button>
              )}

              {photographer?.facebook && (
                <Button
                  variant="ghost"
                  className="rounded-full px-4 py-2 text-blue-600 border border-blue-600 hover:bg-blue-50 transition"
                  onClick={() =>
                    window.open(
                      `https://facebook.com/${photographer.facebook}`,
                      "_blank"
                    )
                  }
                >
                  <Facebook className="h-4 w-4" />
                  <span className="whitespace-nowrap">
                    {photographer.facebook}
                  </span>
                </Button>
              )}

              {photographer?.twitter && (
                <Button
                  variant="ghost"
                  className="rounded-full px-4 py-2 text-sky-500 border border-sky-500 hover:bg-sky-50 transition"
                  onClick={() =>
                    window.open(
                      `https://twitter.com/${photographer.twitter}`,
                      "_blank"
                    )
                  }
                >
                  <Twitter className="h-4 w-4 mr-2" />
                  <span className="whitespace-nowrap">
                    {photographer.twitter}
                  </span>
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
          {/* @ts-expect-error : dont know what is error in this!!! */}
          <PortfolioGallery portfolio={photographer?.portfolio} />
        </TabsContent>

        <TabsContent value="pricing">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pricingPackages?.map((pkg) => (
              <Card key={pkg.id}>
                <CardContent className="pt-6">
                  <h3 className="text-xl font-bold mb-2">{pkg.name}</h3>
                  <div className="text-2xl font-semibold mb-4">
                    ₹{pkg.price}
                    {pkg.duration !== undefined ? "/ hour" : "/ package"}
                  </div>
                  <ul className="space-y-2 mb-6">
                    {pkg.included && pkg.included.length > 0 ? (
                      pkg.included.map((item, i: number) => (
                        <li key={i} className="flex items-center">
                          <span className="mr-2">✓</span> {item}
                        </li>
                      ))
                    ) : (
                      <>
                        <li className="flex items-center">
                          <span className="mr-2">✓</span> {pkg.duration} hour
                          photo session
                        </li>
                        <li className="flex items-center">
                          <span className="mr-2">✓</span> Online gallery
                        </li>
                        <li className="flex items-center">
                          <span className="mr-2">✓</span>{" "}
                          {pkg.name === "Basic Session"
                            ? "Personal"
                            : "Commercial"}{" "}
                          use license
                        </li>
                        {pkg.duration !== undefined && pkg.duration > 1 && (
                          <li className="flex items-center">
                            <span className="mr-2">✓</span>{" "}
                            {pkg.duration > 2
                              ? "Multiple locations"
                              : "1 location"}
                          </li>
                        )}
                      </>
                    )}
                  </ul>
                  <Button className="w-full">Book This Package</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="availability">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-4">Available Dates</h3>
              <Calendar
                mode="multiple"
                selected={
                  availability?.available_dates?.map(
                    (dateStr) => new Date(dateStr)
                  ) || []
                }
                className="rounded-md border"
              />
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-3">
                  Available Dates List
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {availability?.available_dates?.map((dateStr, index) => {
                    const date = new Date(dateStr);
                    return (
                      <div
                        key={index}
                        className="flex items-center p-2 border rounded-md"
                      >
                        <CalendarIcon className="h-4 w-4 mr-2 text-primary" />
                        <span>
                          {date.toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="flex-1">
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-4">Working Hours</h3>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      {availability?.working_hours &&
                        Object.entries(availability.working_hours).map(
                          ([day, hours]) => (
                            <div
                              key={day}
                              className="flex justify-between items-center"
                            >
                              <div className="capitalize font-medium">
                                {day}
                              </div>
                              <div className="flex items-center">
                                {hours.available ? (
                                  <>
                                    <Clock className="h-4 w-4 mr-2 text-green-500" />
                                    <span>
                                      {formatTime(hours.start)} -{" "}
                                      {formatTime(hours.end)}
                                    </span>
                                  </>
                                ) : (
                                  <span className="text-muted-foreground">
                                    Not Available
                                  </span>
                                )}
                              </div>
                            </div>
                          )
                        )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-4">Booking Settings</h3>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      {availability?.settings && (
                        <>
                          <div className="flex justify-between">
                            <span>Advance Notice Required:</span>
                            <span className="font-medium">
                              {availability.settings.advanceNotice} hours
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Max Bookings Per Day:</span>
                            <span className="font-medium">
                              {availability.settings.maxBookingsPerDay}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Buffer Between Bookings:</span>
                            <span className="font-medium">
                              {availability.settings.bufferBetweenBookings}{" "}
                              minutes
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                    <RequestBookingButton
                      clientId={clientId?.[0] || ""}
                      photographerId={photographer?.id}
                      photographerName={photographer?.name}
                      availableDates={availability?.available_dates || []}
                      workingHours={availability?.working_hours ?? {}}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="inquire">
          <InquiryForm
            clientId={clientId?.[0] || ""}
            photographerId={photographer?.id}
            photographerName={photographer?.name}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
