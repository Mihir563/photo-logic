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

export default function PricingForm() {
  const [packages, setPackages] = useState<
    {
      id: string;
      name: string;
      priceMin: number;
      priceMax: number;
      duration: number;
      description: string;
      included: string[];
      isNew?: boolean;
      hasChanges?: boolean;
    }[]
  >([]);
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
          toast.error("Authentication error", {
            description: "Please sign in to manage your pricing packages",
          });
          return;
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
            priceMin: pkg.price_min || pkg.price || 0,
            priceMax: pkg.price_max || pkg.price || 0,
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
              priceMin: 150,
              priceMax: 250,
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
        toast.error("Error fetching data", {
          description:
            error instanceof Error
              ? error.message
              : "Failed to load your pricing packages",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const addPackage = () => {
    const newPackage = {
      id: `temp-${Date.now()}`,
      name: "New Package",
      priceMin: 0,
      priceMax: 0,
      duration: 1,
      description: "",
      included: [""],
      isNew: true,
    };
    setPackages([...packages, newPackage]);
  };

  const removePackage = async (id: string) => {
    try {
      // If it's a temporary ID (hasn't been saved to Supabase yet)
      if (id.startsWith("temp-")) {
        setPackages(packages.filter((pkg) => pkg.id !== id));
        return;
      }

      // Otherwise, delete from Supabase
      const { error } = await supabase
        .from("pricing_packages")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setPackages(packages.filter((pkg) => pkg.id !== id));

      toast.success("Package removed", {
        description: "Your package has been deleted successfully",
      });
    } catch (error) {
      console.error("Error removing package:", error);
      toast.error("Error removing package", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  };

  const handlePackageChange = (id: string, field: string, value: string) => {
    setPackages(
      packages.map((pkg) => {
        if (pkg.id === id) {
          return { ...pkg, [field]: value, hasChanges: true };
        }
        return pkg;
      })
    );
  };

  const handleIncludedItemChange = (
    packageId: string,
    itemIndex: number,
    value: string
  ) => {
    setPackages(
      packages.map((pkg) => {
        if (pkg.id === packageId) {
          const newIncluded = [...pkg.included];
          newIncluded[itemIndex] = value;
          return { ...pkg, included: newIncluded, hasChanges: true };
        }
        return pkg;
      })
    );
  };

  const addIncludedItem = (packageId: string) => {
    setPackages(
      packages.map((pkg) => {
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

  const removeIncludedItem = (packageId: string, itemIndex: number) => {
    setPackages(
      packages.map((pkg) => {
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
        toast.error("Authentication error", {
          description: "Please sign in to save your pricing packages",
        });
        return;
      }

      // Save hourly rate

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
        priceMin: pkg.price_min || pkg.price || 0,
        priceMax: pkg.price_max || pkg.price || 0,
        duration: pkg.duration || 1,
        description: pkg.description || "",
        included: pkg.included || [""],
      }));

      setPackages(formattedPackages);

      toast.success("Packages saved", {
        description: "Your pricing packages have been saved successfully",
      });
    } catch (error) {
      console.error("Error saving packages:", error);
      toast.error("Error saving packages", {
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p>Loading your pricing information...</p>
      </div>
    );
  }

  return (
    <div>
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

                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center">
                        Price Range <IndianRupee size={14} className="ml-1" />
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                          <span className="absolute left-3 top-3 text-sm text-muted-foreground">
                            From
                          </span>
                          <Input
                            id={`priceMin-${pkg.id}`}
                            className="pl-16"
                            value={pkg.priceMin}
                            onChange={(e) =>
                              handlePackageChange(
                                pkg.id,
                                "priceMin",
                                e.target.value
                              )
                            }
                            type="number"
                            min="0"
                          />
                        </div>
                        <div className="relative">
                          <span className="absolute left-3 top-3 text-sm text-muted-foreground">
                            To
                          </span>
                          <Input
                            id={`priceMax-${pkg.id}`}
                            className="pl-12"
                            value={pkg.priceMax}
                            onChange={(e) =>
                              handlePackageChange(
                                pkg.id,
                                "priceMax",
                                e.target.value
                              )
                            }
                            type="number"
                            min="0"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor={`duration-${pkg.id}`}
                        className="text-sm font-medium"
                      >
                        Duration (days)
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
                                onClick={() => addIncludedItem(pkg.id)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                size="icon"
                                onClick={() =>
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
            <Button onClick={() => savePackages()}>Save Pricing</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
