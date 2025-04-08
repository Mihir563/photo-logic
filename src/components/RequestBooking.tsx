"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface RequestBookingButtonProps {
  clientId: string;
  photographerId: string;
  photographerName: string;
  availableDates: string[];
  workingHours: Record<string, { available: boolean; start: string; end: string; }>;
}

export default function RequestBookingButton({ 
  clientId, 
  photographerId, 
  photographerName,
  availableDates,
  workingHours
}: RequestBookingButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      date: null,
      time: "",
      location: "",
      type: "",
      notes: "",
    },
  });

  // Helper to get available times for the selected date

  interface DayHours {
    available: boolean;
    start: string;
    end: string;
  }


  const getAvailableTimesForDate = (selectedDate: Date | null): string[] => {
    if (!selectedDate || !workingHours) return [];

    const dayOfWeek = format(selectedDate, "EEEE").toLowerCase();
    const dayHours: DayHours | undefined = workingHours[dayOfWeek];

    if (!dayHours || !dayHours.available) return [];

    // Generate time slots based on start and end time
    // This is a simplified version - in production you'd want to check existing bookings
    // and buffer times between bookings
    const [startHour] = dayHours.start.split(":").map(Number);
    const [endHour] = dayHours.end.split(":").map(Number);

    const timeSlots: string[] = [];
    for (let hour = startHour; hour < endHour; hour++) {
      const formattedHour = hour % 12 || 12;
      const period = hour >= 12 ? "PM" : "AM";
      timeSlots.push(`${formattedHour}:00 ${period}`);
      timeSlots.push(`${formattedHour}:30 ${period}`);
    }

    return timeSlots;
  };

  //@ts-expect-error : dont know what is error in this!!!
  const isDateAvailable = (date) => {
    if (!availableDates) return false;
    const dateString = date.toISOString().split("T")[0]; // Format as YYYY-MM-DD
    return availableDates.includes(dateString);
  };

  //@ts-expect-error : dont know what is error in this!!!
  const onSubmit = async (data) => {
    if (!clientId) {
      toast("Sign in required", {
        description: "Please sign in to book this photographer",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Format date for database
      const formattedDate = format(data.date, "yyyy-MM-dd");

      // Create the booking
      const { error: bookingError } = await supabase
        .from("bookings")
        .insert({
          photographer_id: photographerId,
          client_id: clientId,
          date: formattedDate,
          time: data.time,
          location: data.location,
          type: data.type,
          notes: data.notes,
          status: "pending",
        })
        .select("id")
        .single();

      if (bookingError) throw bookingError;

      // Create notification for the photographer
      const { error: notificationError } = await supabase
        .from("notifications")
        .insert({
          user_id: photographerId,
          type: "booking_request",
          title: "New Booking Request",
          message: `You have received a new booking request for ${format(
            data.date,
            "MMMM d, yyyy"
          )} at ${data.time}.`,
          read: false,
        });

      if (notificationError) throw notificationError;

      toast("Booking request sent", {
        description: `Your booking request has been sent to ${photographerName}. You'll be notified when they respond.`,
      });

      // Create notification for the client
      await supabase.from("notifications").insert({
        user_id: clientId,
        type: "booking_sent",
        title: "Booking Request Sent",
        message: `Your booking request with ${photographerName} for ${format(
          data.date,
          "MMMM d, yyyy"
        )} has been sent. You'll be notified when they respond.`,
        read: false,
      });

      // Close the dialog and refresh the page
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error submitting booking request:", error);
      toast("Error submitting request", {
        description:
          "There was an error submitting your booking request. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">Request Booking</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Book a session with {photographerName}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 py-4"
          >
            <FormField
              control={form.control}
              name="date"
              rules={{ required: "Please select a date" }}
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Select Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={field.onChange}
                        disabled={(date) => !isDateAvailable(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="time"
              rules={{ required: "Please select a time" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Time</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!form.watch("date")}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a time slot" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {form.watch("date") ? (
                        getAvailableTimesForDate(form.watch("date")).map(
                          (time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          )
                        )
                      ) : (
                        <SelectItem value="none" disabled>
                          Select a date first
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              rules={{ required: "Please enter a location" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter shoot location" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              rules={{ required: "Please select a session type" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Session Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select session type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="portrait">Portrait</SelectItem>
                      <SelectItem value="wedding">Wedding</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="family">Family</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your vision, specific requirements, or questions for the photographer"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Send Booking Request"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}