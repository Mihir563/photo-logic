import type { Photographer } from "./types"

export const photographers: Photographer[] = [
  {
    id: "1",
    name: "Alex Morgan",
    avatar: "/placeholder.svg?height=40&width=40",
    coverImage: "/placeholder.svg?height=300&width=500",
    location: "New York, NY",
    rating: 4.9,
    specialties: ["Wedding", "Portrait", "Event"],
    price: 150,
    bio: "Professional photographer with over 10 years of experience specializing in wedding photography and portraits. I focus on capturing authentic moments and creating timeless memories.",
    portfolio: [
      {
        id: "p1",
        image: "/placeholder.svg?height=600&width=800",
        title: "Summer Wedding",
        category: "Wedding",
        description: "A beautiful summer wedding in Central Park",
      },
      {
        id: "p2",
        image: "/placeholder.svg?height=600&width=800",
        title: "Corporate Event",
        category: "Event",
        description: "Annual gala for tech company",
      },
      {
        id: "p3",
        image: "/placeholder.svg?height=600&width=800",
        title: "Family Portrait",
        category: "Portrait",
        description: "Family session at sunset",
      },
    ],
    availability: ["2025-04-05", "2025-04-06", "2025-04-12", "2025-04-13"],
  },
  {
    id: "2",
    name: "Samantha Lee",
    avatar: "/placeholder.svg?height=40&width=40",
    coverImage: "/placeholder.svg?height=300&width=500",
    location: "Los Angeles, CA",
    rating: 4.8,
    specialties: ["Fashion", "Commercial", "Editorial"],
    price: 200,
    bio: "Fashion and commercial photographer with a modern aesthetic. I've worked with major brands and magazines to create compelling visual stories.",
    portfolio: [
      {
        id: "p1",
        image: "/placeholder.svg?height=600&width=800",
        title: "Summer Collection",
        category: "Fashion",
        description: "Beachwear campaign for local designer",
      },
      {
        id: "p2",
        image: "/placeholder.svg?height=600&width=800",
        title: "Product Shoot",
        category: "Commercial",
        description: "Lifestyle products for e-commerce",
      },
      {
        id: "p3",
        image: "/placeholder.svg?height=600&width=800",
        title: "Magazine Cover",
        category: "Editorial",
        description: "Cover shoot for lifestyle magazine",
      },
    ],
    availability: ["2025-04-02", "2025-04-03", "2025-04-09", "2025-04-10"],
  },
  {
    id: "3",
    name: "David Chen",
    avatar: "/placeholder.svg?height=40&width=40",
    coverImage: "/placeholder.svg?height=300&width=500",
    location: "Chicago, IL",
    rating: 4.7,
    specialties: ["Architecture", "Real Estate", "Landscape"],
    price: 175,
    bio: "Specialized in architectural and real estate photography. I use advanced techniques to showcase spaces in their best light, helping properties sell faster.",
    portfolio: [
      {
        id: "p1",
        image: "/placeholder.svg?height=600&width=800",
        title: "Modern Home",
        category: "Real Estate",
        description: "Luxury property in downtown Chicago",
      },
      {
        id: "p2",
        image: "/placeholder.svg?height=600&width=800",
        title: "City Skyline",
        category: "Architecture",
        description: "Chicago skyline at blue hour",
      },
      {
        id: "p3",
        image: "/placeholder.svg?height=600&width=800",
        title: "Lake Michigan",
        category: "Landscape",
        description: "Sunrise over Lake Michigan",
      },
    ],
    availability: ["2025-04-04", "2025-04-07", "2025-04-11", "2025-04-14"],
  },
]

