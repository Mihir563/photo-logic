'use client'

import { useEffect, useState } from "react";
import PhotographerCard from "@/components/photographer-card";
import { supabase } from "@/lib/supabase";
import { Photographer } from "@/lib/types";
import CosmicLoader from "./loading";
export default function Home() {
  
  const [photographers, setPhotographers] = useState<Photographer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPhotographers() {
      try {
        setLoading(true);

        // Fetch photographers with their portfolios
        const { data, error } = await supabase
  .from("profiles")
  .select("*")
  .neq("account_type", "client").limit(100); // Fetch everything except clients

 

        if (error) throw error;

        setPhotographers(data || []);
      } catch (err) {
        console.error("Error fetching photographers:", err);
        //@ts-expect-error: err is of course an error how would i define the type of unknown? 
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchPhotographers();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">
          Find Your Perfect Photographer
        </h1>
        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
          Connect with talented photographers for your special moments, events,
          or professional needs.
        </p>
      </section>

      {/* Photographer Listings */}
      <section>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="relative inline-block text-2xl font-bold text-transparent bg-gradient-to-r from-gray-500 to-gray-600 bg-clip-text ">
              Featured Photographers
            </h2>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <CosmicLoader/>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            Error loading photographers: {error}
          </div>
        ) : photographers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No photographers found
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {photographers.map((photographer) => (
              <PhotographerCard
                key={photographer.id}
                photographer={photographer}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
