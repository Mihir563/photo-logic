"use client";

import type { PortfolioItem } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import Image from "next/image";

interface PortfolioGalleryProps {
  portfolio: PortfolioItem[];
}

export default function PortfolioGallery({ portfolio }: PortfolioGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<PortfolioItem | null>(
    null
  );

  // Get unique categories
  const categories = [
    "All",
    ...new Set(portfolio.map((item) => item.category)),
  ];

  return (
    <div>
      <Tabs defaultValue="All" className="mb-6">
        <TabsList>
          {categories.map((category) => (
            <TabsTrigger key={category} value={category}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category} value={category}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {portfolio
                .filter(
                  (item) => category === "All" || item.category === category
                )
                .map((item) => (
                  <Card
                    key={item.id}
                    className="overflow-hidden cursor-pointer hover:shadow-md transition-all"
                    onClick={() => setSelectedImage(item)}
                  >
                    <div className="aspect-square overflow-hidden">
                      <Image
                        height={200}
                        width={200}
                        src={item.imageUrl || "/placeholder.svg"}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform hover:scale-105"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.category}
                      </p>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="max-w-4xl w-full bg-background rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <Image
                height={800}
                width={800}
                src={selectedImage.imageUrl || "/placeholder.svg"}
                alt={selectedImage.title}
                className="w-full max-h-[80vh] object-contain"
              />
              <button
                className="absolute top-4 right-4 bg-background/80 rounded-full p-2"
                onClick={() => setSelectedImage(null)}
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold">{selectedImage.title}</h3>
              <p className="text-muted-foreground mt-2">
                {selectedImage.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}