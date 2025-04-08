"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { toast, Toaster } from "sonner";
import { addDays } from "date-fns";

export default function AvailabilityManager() {
  const [loading, setLoading] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [workingHours, setWorkingHours] = useState({
    monday: { start: "09:00", end: "17:00", available: true },
    tuesday: { start: "09:00", end: "17:00", available: true },
    wednesday: { start: "09:00", end: "17:00", available: true },
    thursday: { start: "09:00", end: "17:00", available: true },
    friday: { start: "09:00", end: "17:00", available: true },
    saturday: { start: "10:00", end: "15:00", available: true },
    sunday: { start: "10:00", end: "15:00", available: false },
  });
  const [settings, setSettings] = useState({
    advanceNotice: "48",
    maxBookingsPerDay: "2",
    bufferBetweenBookings: "60",
  });

  // Fetch availability data on component mount
  useEffect(() => {
    async function getAvailability() {
      try {
        setLoading(true);

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) throw new Error("User not found");

        // Get availability data
        const { data, error } = await supabase
          .from("availability")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (error && error.code !== "PGRST116") {
          throw error;
        }

        if (data) {
          // Set available dates
          if (data.available_dates && Array.isArray(data.available_dates)) {
            setSelectedDates(
              data.available_dates.map((date: string) => new Date(date))
            );
          }

          // Set working hours
          if (data.working_hours) {
            setWorkingHours(data.working_hours);
          }

          // Set settings
          if (data.settings) {
            setSettings(data.settings);
          }
        }
      } catch (error) {
        toast.error("Error loading availability", {
          //@ts-expect-error : dont know what is error in this!!!
          description: error.message,
        });
      } finally {
        setLoading(false);
      }
    }

    getAvailability();
  }, []);

  const saveAvailability = async () => {
    try {
      setLoading(true);

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("User not found");

      // Format dates as ISO strings for storage
      const formattedDates = selectedDates.map(
        (date) => date.toISOString().split("T")[0]
      );

      // Check if user already has an entry
      const { data: existingData, error: fetchError } = await supabase
        .from("availability")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") throw fetchError;

      if (!existingData) {
        // Insert new row
        const { error: insertError } = await supabase
          .from("availability")
          .insert([
            {
              user_id: user.id,
              available_dates: formattedDates,
              working_hours: workingHours,
              settings: settings,
              updated_at: new Date().toISOString(),
            },
          ]);

        if (insertError) throw insertError;
      } else {
        // Update existing row
        const { error: updateError } = await supabase
          .from("availability")
          .update({
            available_dates: formattedDates,
            working_hours: workingHours,
            settings: settings,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);

        if (updateError) throw updateError;
      }

      toast.success("Availability saved", {
        description: "Your availability has been updated successfully.",
      });
    } catch (error) {
      console.error("Save error:", error); // Debug logging
      toast.error("Error saving availability", {
        //@ts-expect-error : dont know what is error in this!!!
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };


  // Updated handler for calendar selection
  const handleDateSelect = (dates: Date[] | undefined) => {
    if (!dates) return;
    setSelectedDates(dates);
  };

  const handleWorkingHoursChange = (
    day: keyof typeof workingHours,
    field: keyof typeof workingHours.monday,
    value: string | boolean
  ) => {
    setWorkingHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const handleSettingsChange = (
    field: keyof typeof settings,
    value: string
  ) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Set Your Availability</CardTitle>
            <CardDescription>
              Mark dates when you're available for bookings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="multiple"
              selected={selectedDates}
              onSelect={handleDateSelect}
              className="rounded-md border"
              disabled={{ before: addDays(new Date(), 1) }}
            />

            <div className="mt-4 p-2 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">
                You are available on :{" "}
                {selectedDates.length > 0
                  ? selectedDates
                      .map((date) => date.toLocaleDateString())
                      .join(", ")
                  : "None"}
              </p>
            </div>

            <div className="flex justify-end mt-4">
              <Button onClick={saveAvailability} disabled={loading}>
                {loading ? "Saving..." : "Save Availability"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Working Hours</CardTitle>
            <CardDescription>Set your regular working hours</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(workingHours).map(([day, hours]) => (
              <div key={day} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={hours.available}
                    onCheckedChange={(checked) =>
                      handleWorkingHoursChange(
                        day as keyof typeof workingHours,
                        "available",
                        checked
                      )
                    }
                  />
                  <Label className="capitalize">{day}</Label>
                </div>

                {hours.available ? (
                  <div className="flex items-center space-x-2">
                    <Select
                      value={hours.start}
                      onValueChange={(value) =>
                        handleWorkingHoursChange(
                          day as keyof typeof workingHours,
                          "start",
                          value
                        )
                      }
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue placeholder="Start" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="08:00">8:00 AM</SelectItem>
                        <SelectItem value="09:00">9:00 AM</SelectItem>
                        <SelectItem value="10:00">10:00 AM</SelectItem>
                        <SelectItem value="11:00">11:00 AM</SelectItem>
                        <SelectItem value="12:00">12:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                    <span>to</span>
                    <Select
                      value={hours.end}
                      onValueChange={(value) =>
                        handleWorkingHoursChange(
                          day as keyof typeof workingHours,
                          "end",
                          value
                        )
                      }
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue placeholder="End" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15:00">3:00 PM</SelectItem>
                        <SelectItem value="16:00">4:00 PM</SelectItem>
                        <SelectItem value="17:00">5:00 PM</SelectItem>
                        <SelectItem value="18:00">6:00 PM</SelectItem>
                        <SelectItem value="19:00">7:00 PM</SelectItem>
                        <SelectItem value="20:00">8:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <Badge variant="outline">Not Available</Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Booking Settings</CardTitle>
            <CardDescription>
              Configure your booking preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="advanceNotice">
                Advance notice required (hours)
              </Label>
              <Input
                id="advanceNotice"
                type="number"
                value={settings.advanceNotice}
                onChange={(e) =>
                  handleSettingsChange("advanceNotice", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxBookings">Maximum bookings per day</Label>
              <Input
                id="maxBookings"
                type="number"
                value={settings.maxBookingsPerDay}
                onChange={(e) =>
                  handleSettingsChange("maxBookingsPerDay", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="buffer">Buffer between bookings (minutes)</Label>
              <Input
                id="buffer"
                type="number"
                value={settings.bufferBetweenBookings}
                onChange={(e) =>
                  handleSettingsChange("bufferBetweenBookings", e.target.value)
                }
              />
            </div>

            <Button
              className="w-full mt-4"
              onClick={saveAvailability}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Settings"}
            </Button>
          </CardContent>
        </Card>
        <Toaster />
      </div>
    </div>
  );
}
