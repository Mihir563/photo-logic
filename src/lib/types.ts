export interface Photographer {
  id: string
  name: string
  avatar: string
  coverImage: string
  location: string
  rating: number
  specialties: string[]
  price: number
  bio: string
  portfolio: PortfolioItem[]
  availability?: string[]
}

export interface PortfolioItem  {
  id: string;
  user_id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  created_at: string;
  file?: File;
  preview?: string;
};

export interface Booking {
  id: string
  photographerId: string
  clientId: string
  date: string
  status: "pending" | "confirmed" | "completed" | "cancelled"
  details: string
}

export interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  timestamp: string
  read: boolean
}

