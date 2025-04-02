import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Camera, MapPin, DollarSign } from "lucide-react"
import PhotographerCard from "@/components/photographer-card"
import { photographers } from "@/lib/data"

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Find Your Perfect Photographer</h1>
        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
          Connect with talented photographers for your special moments, events, or professional needs.
        </p>

        {/* Search Bar */}
        <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search photographers..." className="pl-10 h-12" />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex gap-2 h-12">
              <MapPin className="h-4 w-4" />
              <span>Location</span>
            </Button>
            <Button variant="outline" className="flex gap-2 h-12">
              <Camera className="h-4 w-4" />
              <span>Category</span>
            </Button>
            <Button variant="outline" className="flex gap-2 h-12">
              <DollarSign className="h-4 w-4" />
              <span>Price</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Photographer Listings */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Featured Photographers</h2>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">
              Most Popular
            </Button>
            <Button variant="ghost" size="sm">
              Newest
            </Button>
            <Button variant="ghost" size="sm">
              Price: Low to High
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photographers.map((photographer) => (
            <PhotographerCard key={photographer.id} photographer={photographer} />
          ))}
        </div>
      </section>
    </div>
  )
}

