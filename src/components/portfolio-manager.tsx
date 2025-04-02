"use client";

import type React from "react";

import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Trash, ImageIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import type { PortfolioItem } from "@/lib/types";



export default function PortfolioManager() {
  const [loading, setLoading] = useState(false);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newItem, setNewItem] = useState<Partial<PortfolioItem>>({
    title: "",
    category: "",
    description: "",
    preview: "",
  });

  // Fetch portfolio data on component mount
  useEffect(() => {
    async function getPortfolio() {
      try {
        setLoading(true);

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) throw new Error("User not found");

        // Get portfolio data
        const { data, error } = await supabase
          .from("portfolio")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        if (data) {
          setPortfolio(data);
        }
      } catch (error: any) {
        toast.error("Error loading portfolio", {
          description: error.message,
        });
      } finally {
        setLoading(false);
      }
    }

    getPortfolio();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string) => {
    setNewItem((prev) => ({ ...prev, category: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) {
        return;
      }

      const file = e.target.files[0];
      setNewItem((prev) => ({ ...prev, file }));

      // Create a preview
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setNewItem((prev) => ({
            ...prev,
            preview: event.target?.result as string,
          }));
        }
      };
      reader.readAsDataURL(file);
    } catch (error: any) {
      toast.error("Error selecting image", {
        description: error.message,
      });
    }
  };

  const addPortfolioItem = async () => {
    try {
      setLoading(true);

      if (!newItem.title || !newItem.category || !newItem.file) {
        throw new Error(
          "Please fill in all required fields and upload an image"
        );
      }

      // Get current user
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userData?.user) throw new Error("User not found");
      const user = userData.user;

      // Upload image to Supabase Storage
      // @ts-ignore
      const file = newItem.file as File;
      const fileExt = file.name.split(".").pop();
      const uniqueName = `portfolio-${user.id}-${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("portfolio") // Make sure this is your correct bucket name
        .upload(uniqueName, file);

      if (uploadError)
        throw new Error(`Storage Upload Error: ${uploadError.message}`);

      // Get Public URL - This is the fix
      const publicUrl = supabase.storage
        .from("portfolio")
        .getPublicUrl(uniqueName).data.publicUrl;

      console.log("Public URL:", publicUrl);

      // Create portfolio item in Supabase Database
      const { data, error } = await supabase
        .from("portfolio")
        .insert([
          {
            user_id: user.id,
            title: newItem.title,
            category: newItem.category,
            description: newItem.description,
            image: publicUrl, // Store Supabase Storage URL
            created_at: new Date(),
          },
        ])
        .select();

      console.log("Database response:", data);

      if (error) throw new Error(`Database Insert Error: ${error.message}`);

      // Add new item to state
      if (data) {
        setPortfolio((prev) => [data[0], ...prev]);
      }

      // Reset form and close dialog
      setNewItem({
        title: "",
        category: "",
        description: "",
        file: undefined,
        preview: "",
      });
      setDialogOpen(false);

      toast.success("Portfolio item added", {
        description: "Your portfolio item has been added successfully.",
      });
    } catch (error: any) {
      toast.error("Error adding portfolio item", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const deletePortfolioItem = async (id: string) => {
    try {
      setLoading(true);

      // Get the item to delete
      const itemToDelete = portfolio.find((item) => item.id === id);
      if (!itemToDelete) throw new Error("Item not found");

      // Delete from database
      const { error } = await supabase.from("portfolio").delete().eq("id", id);

      if (error) throw error;

      // Delete image from storage if needed
      if (itemToDelete.image) {
        // Extract file name from URL
        const fileName = itemToDelete.image.split("/").pop();
        if (fileName) {
          await supabase.storage.from("portfolio").remove([fileName]);
        }
      }

      // Update state
      setPortfolio((prev) => prev.filter((item) => item.id !== id));

      toast.success("Portfolio item deleted", {
        description: "Your portfolio item has been deleted successfully.",
      });
    } catch (error: any) {
      toast.error("Error deleting portfolio item", {
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Portfolio</CardTitle>
          <CardDescription>
            Showcase your best work to potential clients
          </CardDescription>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Portfolio Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Portfolio Item</DialogTitle>
              <DialogDescription>
                Upload a photo and add details to showcase your work.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex justify-center mb-4">
                {newItem.preview ? (
                  <div className="relative w-full max-w-md aspect-square rounded-md overflow-hidden">
                    <img
                      src={newItem.preview || "/file.svg"}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full max-w-md aspect-square rounded-md border-2 border-dashed border-muted-foreground/25 cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <ImageIcon className="w-10 h-10 mb-3 text-muted-foreground" />
                      <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        SVG, PNG, JPG or GIF (MAX. 5MB)
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Title
                </label>
                <Input
                  id="title"
                  name="title"
                  value={newItem.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Summer Wedding Photoshoot"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium">
                  Category
                </label>
                <Select
                  value={newItem.category}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Wedding">Wedding</SelectItem>
                    <SelectItem value="Portrait">Portrait</SelectItem>
                    <SelectItem value="Event">Event</SelectItem>
                    <SelectItem value="Commercial">Commercial</SelectItem>
                    <SelectItem value="Fashion">Fashion</SelectItem>
                    <SelectItem value="Real Estate">Real Estate</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="description"
                  name="description"
                  value={newItem.description || ""}
                  onChange={handleInputChange}
                  placeholder="Describe this portfolio item..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={addPortfolioItem} disabled={loading}>
                {loading ? "Adding..." : "Add to Portfolio"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {portfolio.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="aspect-square overflow-hidden">
                <img
                  src={item.image || "/placeholder.svg"}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.category}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => deletePortfolioItem(item.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
                {item.description && (
                  <p className="text-sm mt-2 text-muted-foreground line-clamp-2">
                    {item.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}

          {portfolio.length === 0 && !loading && (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No portfolio items yet</h3>
              <p className="text-muted-foreground mt-1 mb-4">
                Add your best work to showcase your skills to potential clients.
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Item
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
