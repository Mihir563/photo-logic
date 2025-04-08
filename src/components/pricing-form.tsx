"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { IndianRupee, Plus, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast, Toaster } from "sonner";
import CosmicLoader from "@/app/loading";

export default function PricingForm() {
  const [packages, setPackages] = useState<
    {
      id: string;
      name: string;
      price: number;
      duration: number;
      description: string;
      included: string[];
      isNew?: boolean;
      hasChanges?: boolean;
    }[]
  >([]);
  const [hourlyRate, setHourlyRate] = useState("150");
  const [loading, setLoading] = useState(true);

  // Fetch user profile and pricing packages
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          toast.error(
           "Authentication error",{
            description: "Please sign in to manage your pricing packages",
          });
          return;
        }

        // Get user profile to fetch hourly rate
        const { data: profileData } = await supabase
          .from("profiles")
          .select("hourly_rate")
          .eq("id", user.id)
          .single();

        if (profileData?.hourly_rate) {
          setHourlyRate(profileData.hourly_rate.toString());
        }

        // Get pricing packages
        const { data: packagesData, error } = await supabase
          .from("pricing_packages")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true });

        if (error) {
          throw error;
        }

        if (packagesData && packagesData.length > 0) {
          // Transform the data to match our component structure
          const formattedPackages = packagesData.map((pkg) => ({
            id: pkg.id,
            name: pkg.name,
            price: pkg.price,
            duration: pkg.duration || 1,
            description: pkg.description || "",
            included: pkg.included || [""],
          }));

          setPackages(formattedPackages);
        } else {
          // If no packages exist, create default ones
          setPackages([
            {
              id: "temp-1",
              name: "Basic Session",
              price: 150,
              duration: 1,
              description:
                "1 hour photo session, 10 edited digital photos, Online gallery, Personal use license",
              included: [
                "1 hour photo session",
                "10 edited digital photos",
                "Online gallery",
                "Personal use license",
              ],
              isNew: true,
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error(
          "Error fetching data",{
           //@ts-expect-error : dont know what is error in this!!!
          description: error.message || "Failed to load your pricing packages",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Save hourly rate to profiles table
  const saveHourlyRate = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { error } = await supabase
        .from("profiles")
        .update({
          hourly_rate: parseFloat(hourlyRate),
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success(
        "Hourly rate updated",{
        description: "Your hourly rate has been saved successfully",
      });
    } catch (error) {
      console.error("Error saving hourly rate:", error);
      toast.error(
        "Error saving hourly rate",{
        description: error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  };

  const addPackage = () => {
    const newPackage = {
      id: `temp-${Date.now()}`,
      name: "New Package",
      price: 0,
      duration: 1,
      description: "",
      included: [""],
      isNew: true,
    };
    setPackages([...packages, newPackage]);
  };

  const removePackage = async (id:number) => {
    try {
      // If it's a temporary ID (hasn't been saved to Supabase yet)
           //@ts-expect-error : dont know what is error in this!!!
      if (id.startsWith("temp-")) {
           //@ts-expect-error : dont know what is error in this!!!
        setPackages(packages.filter((pkg) => pkg.id !== id));
        return;
      }

      // Otherwise, delete from Supabase
      const { error } = await supabase
        .from("pricing_packages")
        .delete()
        .eq("id", id);

      if (error) throw error;

           //@ts-expect-error : dont know what is error in this!!!
      setPackages(packages.filter((pkg) => pkg.id !== id));

      toast.success(
        "Package removed",{
        description: "Your package has been deleted successfully",
      });
    } catch (error) {
      console.error("Error removing package:", error);
      toast.error("Error removing package", {
        //@ts-expect-error : dont know what is error in this!!!
        description: error.message,
      });
    }
  };

           //@ts-expect-error : dont know what is error in this!!!
  const handlePackageChange = (id, field, value) => {
    setPackages(
      packages.map((pkg) => {
        if (pkg.id === id) {
          return { ...pkg, [field]: value, hasChanges: true };
        }
        return pkg;
      })
    );
  };

  const handleIncludedItemChange = (packageId:number, itemIndex:number, value:number) => {
    setPackages(
      packages.map((pkg) => {
           //@ts-expect-error : dont know what is error in this!!!
        if (pkg.id === packageId) {
          const newIncluded = [...pkg.included];
           //@ts-expect-error : dont know what is error in this!!!
          newIncluded[itemIndex] = value;
          return { ...pkg, included: newIncluded, hasChanges: true };
        }
        return pkg;
      })
    );
  };

  const addIncludedItem = (packageId:number) => {
    setPackages(
      packages.map((pkg) => {
        //@ts-expect-error : dont know what is error in this!!!
        if (pkg.id === packageId) {
          return {
            ...pkg,
            included: [...pkg.included, ""],
            hasChanges: true,
          };
        }
        return pkg;
      })
    );
  };

  const removeIncludedItem = (packageId:number, itemIndex:number) => {
    setPackages(
      packages.map((pkg) => {
        //@ts-expect-error : dont know what is error in this!!!
        if (pkg.id === packageId) {
          const newIncluded = [...pkg.included];
          newIncluded.splice(itemIndex, 1);
          return {
            ...pkg,
            included: newIncluded,
            hasChanges: true,
          };
        }
        return pkg;
      })
    );
  };

  const savePackages = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error(
          "Authentication error",{
          description: "Please sign in to save your pricing packages",
        });
        return;
      }

      // Save hourly rate
      await saveHourlyRate();

      // Process each package
      for (const pkg of packages as Array<{
        id: string;
        name: string;
        price: number;
        duration:number;
        description: string;
        included: string[];
        isNew?: boolean;
        hasChanges?: boolean;
      }>) {
        // Format the package data for Supabase
        const packageData = {
          user_id: user.id,
          name: pkg.name,
           //@ts-expect-error : dont know what is error in this!!!
          price: parseFloat(pkg.price),
           //@ts-expect-error : dont know what is error in this!!!
          duration: parseInt(pkg.duration),
          description: pkg.description,
          included: pkg.included.filter((item) => item.trim() !== ""),
          updated_at: new Date().toISOString(),
        };

        if (pkg.isNew || pkg.id.startsWith("temp-")) {
          // Insert new package
          const {error } = await supabase
            .from("pricing_packages")
            .insert(packageData)
            .select();

          if (error) throw error;
        } else if (pkg.hasChanges) {
          // Update existing package
          const { error } = await supabase
            .from("pricing_packages")
            .update(packageData)
            .eq("id", pkg.id);

          if (error) throw error;
        }
      }

      // Refresh data after saving
      const { data: refreshedPackages, error } = await supabase
        .from("pricing_packages")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const formattedPackages = refreshedPackages.map((pkg) => ({
        id: pkg.id,
        name: pkg.name,
        price: pkg.price,
        duration: pkg.duration || 1,
        description: pkg.description || "",
        included: pkg.included || [""],
      }));

      setPackages(formattedPackages);

      toast.success(
        "Packages saved",{
        description: "Your pricing packages have been saved successfully",
      });
    } catch (error) {
      console.error("Error saving packages:", error);
      toast.success("Error saving packages", {
        //@ts-expect-error : dont know what is error in this!!!
        description: error.message,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <CosmicLoader/>
        <p>Loading your pricing information...</p>
      </div>
    );
  }

  return (
    <div>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Hourly Rate</CardTitle>
          <CardDescription>
            Set your base hourly rate for photography services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 max-w-md">
            <div className="relative">
              <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-10"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                type="number"
                min="0"
              />
            </div>
            <span className="text-muted-foreground">per hour</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Packages</CardTitle>
            <CardDescription>
              Create custom packages for your photography services
            </CardDescription>
          </div>
          <Button onClick={addPackage}>
            <Plus className="mr-2 h-4 w-4" />
            Add Package
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {packages.map((pkg, index) => (
              <div key={pkg.id} className="border rounded-lg p-6 relative">
                <Button
                  size="icon"
                  className="absolute top-4 right-4 text-muted-foreground hover:text-destructive"
                  //@ts-expect-error : dont know what is error in this!!!
                  onClick={() => removePackage(pkg.id)}
                >
                  <Trash className="h-4 w-4" />
                </Button>

                <h3 className="text-lg font-medium mb-4">
                  Package {index + 1}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label
                        htmlFor={`name-${pkg.id}`}
                        className="text-sm font-medium"
                      >
                        Package Name
                      </label>
                      <Input
                        id={`name-${pkg.id}`}
                        value={pkg.name}
                        onChange={(e) =>
                          handlePackageChange(pkg.id, "name", e.target.value)
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label
                          htmlFor={`price-${pkg.id}`}
                          className="text-sm font-medium items-center flex"
                        >
                          Price <IndianRupee size={14} />
                        </label>
                        <Input
                          id={`price-${pkg.id}`}
                          value={pkg.price}
                          onChange={(e) =>
                            handlePackageChange(pkg.id, "price", e.target.value)
                          }
                          type="number"
                          min="0"
                        />
                      </div>

                      <div className="space-y-2">
                        <label
                          htmlFor={`duration-${pkg.id}`}
                          className="text-sm font-medium"
                        >
                          Duration (hours)
                        </label>
                        <Input
                          id={`duration-${pkg.id}`}
                          value={pkg.duration}
                          onChange={(e) =>
                            handlePackageChange(
                              pkg.id,
                              "duration",
                              e.target.value
                            )
                          }
                          type="number"
                          min="0.5"
                          step="0.5"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor={`description-${pkg.id}`}
                        className="text-sm font-medium"
                      >
                        Description
                      </label>
                      <Textarea
                        id={`description-${pkg.id}`}
                        value={pkg.description}
                        onChange={(e) =>
                          handlePackageChange(
                            pkg.id,
                            "description",
                            e.target.value
                          )
                        }
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">
                        What's Included
                      </label>
                      <div className="mt-2 space-y-2">
                        {pkg.included.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex gap-2">
                            <Input
                              value={item}
                              onChange={(e) =>
                                handleIncludedItemChange(
                                  //@ts-expect-error : dont know what is error in this!!!
                                  pkg.id,
                                  itemIndex,
                                  e.target.value
                                )
                              }
                              placeholder="e.g., 1 hour photo session"
                            />
                            {itemIndex === pkg.included.length - 1 ? (
                              <Button
                                size="icon"
                                //@ts-expect-error : dont know what is error in this!!!
                                onClick={() => addIncludedItem(pkg.id)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                size="icon"
                                onClick={() =>
                                  //@ts-expect-error : dont know what is error in this!!!
                                  removeIncludedItem(pkg.id, itemIndex)
                                }
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Toaster />

          <div className="mt-6">
            <Button onClick={savePackages}>Save Pricing</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
