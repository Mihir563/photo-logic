"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Filter, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import PhotographerCard from "@/components/photographer-card";
import { toast, Toaster } from "sonner";
import type { Photographer } from "@/lib/types";
import CosmicLoader from "../loading";

export default function SearchPage() {
  const [loading, setLoading] = useState(false);
  const [photographers, setPhotographers] = useState<Photographer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("rating");
  const [activeFilters, setActiveFilters] = useState(0);

  // Fetch photographers on component mount and when filters change
  useEffect(() => {
    async function fetchPhotographers() {
      try {
        setLoading(true);

        // Build query parameters
        const params = new URLSearchParams();
        if (searchQuery) params.append("query", searchQuery);
        if (location) params.append("location", location);
        if (category) params.append("category", category);
        params.append("minPrice", priceRange[0].toString());
        params.append("maxPrice", priceRange[1].toString());
        if (specialties.length > 0)
          params.append("specialties", specialties.join(","));
        params.append("sortBy", sortBy);

        // Call the API endpoint
        const response = await fetch(`/api/search?${params.toString()}`);

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();

        if (data.photographers) {
          // Format the data to match our Photographer type

          const formattedData = data.photographers.map((profile:Photographer) => ({
            id: profile.id,
            name: profile.name,
            avatar_url: profile.avatar_url,
            cover_image: profile.coverImage,
            location: profile.location,
            rating: profile.rating || 0,
            specialties: profile.specialties || [],
            hourly_rate: profile.price || 0,
            bio: profile.bio || "",
            portfolio: [],
          }));

          setPhotographers(formattedData);
        }
      } catch (error) {
        toast.error("Error loading photographers", {
          //@ts-expect-error : dont know what is error in this!!!
          description: error.message,
        });
      } finally {
        setLoading(false);
      }
    }

    fetchPhotographers();

    // Calculate active filters
    let count = 0;
    if (searchQuery) count++;
    if (location) count++;
    if (category) count++;
    if (priceRange[0] > 0 || priceRange[1] < 100000) count++;
    if (specialties.length > 0) count++;
    setActiveFilters(count);
  }, [searchQuery, location, category, priceRange, specialties, sortBy]);

  const handleSpecialtyChange = (specialty: string, checked: boolean) => {
    if (checked) {
      setSpecialties((prev) => [...prev, specialty]);
    } else {
      setSpecialties((prev) => prev.filter((s) => s !== specialty));
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The search is already handled by the useEffect
  };

  const clearFilters = () => {
    setSearchQuery("");
    setLocation("");
    setCategory("");
    setPriceRange([0, 100000]);
    setSpecialties([]);
    setSortBy("rating");
  };

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      <div className="mb-4 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4">
          Find Your Perfect Photographer
        </h1>

        {/* Search Form - Mobile First */}
        <form
          onSubmit={handleSearch}
          className="flex flex-col gap-3 max-w-4xl mx-auto"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search photographers..."
              className="pl-10 h-12"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Location"
                className="h-12 pl-10"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              {location && (
                <button
                  type="button"
                  onClick={() => setLocation("")}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-12 min-w-[120px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wedding">Wedding</SelectItem>
                  <SelectItem value="portrait">Portrait</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="fashion">Fashion</SelectItem>
                  <SelectItem value="real-estate">Real Estate</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" className="h-12 px-4 sm:px-6">
                Search
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Filter and Sort Actions - Mobile */}
      <div className="flex justify-between items-center mb-4 sm:mb-6 lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center">
              <Filter className="mr-2 h-4 w-4" />
              Filters
              {activeFilters > 0 && (
                <span className="ml-2 bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs">
                  {activeFilters}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[90vw] sm:w-[400px]">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
              <SheetDescription>Refine your search results</SheetDescription>
            </SheetHeader>
            <div className="py-4 space-y-6">
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="mb-4"
              >
                Clear All Filters
              </Button>

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Price Range</h4>
                <Slider
                  value={priceRange}
                  min={0}
                  max={100000}
                  step={1000}
                  onValueChange={setPriceRange}
                />
                <div className="flex items-center justify-between">
                  <span className="text-sm">₹{priceRange[0]}</span>
                  <span className="text-sm">₹{priceRange[1]}</span>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Specialties</h4>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    "Wedding",
                    "Portrait",
                    "Event",
                    "Commercial",
                    "Fashion",
                    "Real Estate",
                  ].map((specialty) => (
                    <div
                      key={specialty}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`${specialty.toLowerCase()}-mobile`}
                        checked={specialties.includes(specialty)}
                        onCheckedChange={(checked) =>
                          handleSpecialtyChange(specialty, checked as boolean)
                        }
                      />
                      <Label htmlFor={`${specialty.toLowerCase()}-mobile`}>
                        {specialty}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <SheetClose asChild>
                <Button className="mt-4 w-full">Apply Filters</Button>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="price_low">Price: Low to High</SelectItem>
            <SelectItem value="price_high">Price: High to Low</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters - Desktop */}
        <div className="hidden lg:block w-64 space-y-6 sticky top-4 self-start">
          <div>
            <h3 className="font-medium mb-4">Filters</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="mb-4"
            >
              Clear All Filters
            </Button>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Price Range</h4>
            <Slider
              value={priceRange}
              min={0}
              max={100000}
              step={1000}
              onValueChange={setPriceRange}
            />
            <div className="flex items-center justify-between">
              <span className="text-sm">₹{priceRange[0]}</span>
              <span className="text-sm">₹{priceRange[1]}</span>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Specialties</h4>
            <div className="space-y-2">
              {[
                "Wedding",
                "Portrait",
                "Event",
                "Commercial",
                "Fashion",
                "Real Estate",
              ].map((specialty) => (
                <div key={specialty} className="flex items-center space-x-2">
                  <Checkbox
                    id={specialty.toLowerCase()}
                    checked={specialties.includes(specialty)}
                    onCheckedChange={(checked) =>
                      handleSpecialtyChange(specialty, checked as boolean)
                    }
                  />
                  <Label htmlFor={specialty.toLowerCase()}>{specialty}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 hidden lg:block">
            <h4 className="text-sm font-medium mb-2">Sort by</h4>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-2xl font-bold">
              {loading
                ? <CosmicLoader/>
                : `${photographers.length} Photographers Found`}
            </h2>
          </div>
          <Toaster />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {photographers.length > 0 ? (
              photographers.map((photographer) => (
                <PhotographerCard
                  key={photographer.id}
                  photographer={photographer}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-8 sm:py-12">
                <h3 className="text-lg font-medium mb-2">
                  No photographers found
                </h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or search criteria.
                </p>
                <Button onClick={clearFilters}>Clear Filters</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
