"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MapPin, Filter } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import PhotographerCard from "@/components/photographer-card"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import type { Photographer } from "@/lib/types"

export default function SearchPage() {
  const [loading, setLoading] = useState(false)
  const [photographers, setPhotographers] = useState<Photographer[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [location, setLocation] = useState("")
  const [category, setCategory] = useState("")
  const [priceRange, setPriceRange] = useState([0, 500])
  const [specialties, setSpecialties] = useState<string[]>([])
  const [sortBy, setSortBy] = useState("rating")

  // Fetch photographers on component mount and when filters change
  useEffect(() => {
    async function fetchPhotographers() {
      try {
        setLoading(true)

        let query = supabase
          .from("profiles")
          .select(`
            id,
            name,
            avatar_url,
            cover_image,
            location,
            bio,  
            specialties,
            hourly_rate,
            rating
          `)
          .eq("account_type", "photographer")

        // Apply filters
        if (searchQuery) {
          query = query.or(`name.ilike.%${searchQuery}%,bio.ilike.%${searchQuery}%`)
        }

        if (location) {
          query = query.ilike("location", `%${location}%`)
        }

        if (specialties.length > 0) {
          query = query.contains("specialties", specialties)
        }

        if (priceRange[0] > 0 || priceRange[1] < 500) {
          query = query.gte("hourly_rate", priceRange[0]).lte("hourly_rate", priceRange[1])
        }

        // Apply sorting
        if (sortBy === "rating") {
          query = query.order("rating", { ascending: false })
        } else if (sortBy === "price_low") {
          query = query.order("hourly_rate", { ascending: true })
        } else if (sortBy === "price_high") {
          query = query.order("hourly_rate", { ascending: false })
        } else if (sortBy === "newest") {
          query = query.order("created_at", { ascending: false })
        }

        const { data, error } = await query

        if (error) throw error

        if (data) {
          // Format the data
          const formattedData = data.map((profile) => ({
            id: profile.id,
            name: profile.name,
            avatar: profile.avatar_url,
            coverImage: profile.cover_image,
            location: profile.location,
            rating: profile.rating || 0,
            specialties: profile.specialties || [],
            price: profile.hourly_rate || 0,
            bio: profile.bio || "",
            portfolio: [],
          }))

          setPhotographers(formattedData)
        }
      } catch (error: any) {
        toast.error(
          "Error loading photographers",{
          description: error.message,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPhotographers()
  }, [searchQuery, location, category, priceRange, specialties, sortBy, toast])

  const handleSpecialtyChange = (specialty: string, checked: boolean) => {
    if (checked) {
      setSpecialties((prev) => [...prev, specialty])
    } else {
      setSpecialties((prev) => prev.filter((s) => s !== specialty))
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // The search is already handled by the useEffect
  }

  const clearFilters = () => {
    setSearchQuery("")
    setLocation("")
    setCategory("")
    setPriceRange([0, 500])
    setSpecialties([])
    setSortBy("rating")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Find Your Perfect Photographer</h1>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search photographers..."
              className="pl-10 h-12"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <MapPin className="absolute left-3 top-4 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Location"
                className="h-12 pl-10"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-12 min-w-[150px]">
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
            <Button type="submit" className="h-12">
              Search
            </Button>
          </div>
        </form>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters - Desktop */}
        <div className="hidden lg:block w-64 space-y-6">
          <div>
            <h3 className="font-medium mb-4">Filters</h3>
            <Button variant="outline" size="sm" onClick={clearFilters} className="mb-4">
              Clear All Filters
            </Button>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Price Range</h4>
            <Slider value={priceRange} min={0} max={500} step={10} onValueChange={setPriceRange} />
            <div className="flex items-center justify-between">
              <span className="text-sm">${priceRange[0]}</span>
              <span className="text-sm">${priceRange[1]}</span>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Specialties</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="wedding"
                  checked={specialties.includes("Wedding")}
                  onCheckedChange={(checked) => handleSpecialtyChange("Wedding", checked as boolean)}
                />
                <Label htmlFor="wedding">Wedding</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="portrait"
                  checked={specialties.includes("Portrait")}
                  onCheckedChange={(checked) => handleSpecialtyChange("Portrait", checked as boolean)}
                />
                <Label htmlFor="portrait">Portrait</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="event"
                  checked={specialties.includes("Event")}
                  onCheckedChange={(checked) => handleSpecialtyChange("Event", checked as boolean)}
                />
                <Label htmlFor="event">Event</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="commercial"
                  checked={specialties.includes("Commercial")}
                  onCheckedChange={(checked) => handleSpecialtyChange("Commercial", checked as boolean)}
                />
                <Label htmlFor="commercial">Commercial</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="fashion"
                  checked={specialties.includes("Fashion")}
                  onCheckedChange={(checked) => handleSpecialtyChange("Fashion", checked as boolean)}
                />
                <Label htmlFor="fashion">Fashion</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="real-estate"
                  checked={specialties.includes("Real Estate")}
                  onCheckedChange={(checked) => handleSpecialtyChange("Real Estate", checked as boolean)}
                />
                <Label htmlFor="real-estate">Real Estate</Label>
              </div>
            </div>
          </div>
        </div>

        {/* Filters - Mobile */}
        <div className="lg:hidden mb-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>Refine your search results</SheetDescription>
              </SheetHeader>
              <div className="py-4 space-y-6">
                <Button variant="outline" size="sm" onClick={clearFilters} className="mb-4">
                  Clear All Filters
                </Button>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Price Range</h4>
                  <Slider value={priceRange} min={0} max={500} step={10} onValueChange={setPriceRange} />
                  <div className="flex items-center justify-between">
                    <span className="text-sm">${priceRange[0]}</span>
                    <span className="text-sm">${priceRange[1]}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Specialties</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="wedding-mobile"
                        checked={specialties.includes("Wedding")}
                        onCheckedChange={(checked) => handleSpecialtyChange("Wedding", checked as boolean)}
                      />
                      <Label htmlFor="wedding-mobile">Wedding</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="portrait-mobile"
                        checked={specialties.includes("Portrait")}
                        onCheckedChange={(checked) => handleSpecialtyChange("Portrait", checked as boolean)}
                      />
                      <Label htmlFor="portrait-mobile">Portrait</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="event-mobile"
                        checked={specialties.includes("Event")}
                        onCheckedChange={(checked) => handleSpecialtyChange("Event", checked as boolean)}
                      />
                      <Label htmlFor="event-mobile">Event</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="commercial-mobile"
                        checked={specialties.includes("Commercial")}
                        onCheckedChange={(checked) => handleSpecialtyChange("Commercial", checked as boolean)}
                      />
                      <Label htmlFor="commercial-mobile">Commercial</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="fashion-mobile"
                        checked={specialties.includes("Fashion")}
                        onCheckedChange={(checked) => handleSpecialtyChange("Fashion", checked as boolean)}
                      />
                      <Label htmlFor="fashion-mobile">Fashion</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="real-estate-mobile"
                        checked={specialties.includes("Real Estate")}
                        onCheckedChange={(checked) => handleSpecialtyChange("Real Estate", checked as boolean)}
                      />
                      <Label htmlFor="real-estate-mobile">Real Estate</Label>
                    </div>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Results */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {loading ? "Searching..." : `${photographers.length} Photographers Found`}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {photographers.length > 0 ? (
              photographers.map((photographer) => (
                <PhotographerCard key={photographer.id} photographer={photographer} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <h3 className="text-lg font-medium mb-2">No photographers found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your filters or search criteria.</p>
                <Button onClick={clearFilters}>Clear Filters</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

