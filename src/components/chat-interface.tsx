"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";
import { toast, Toaster } from "sonner";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import axios from 'axios'
import ChatBubble from "./ChatBubble";

interface ChatContact {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
}

interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export default function ChatInterface() {
  const [loading, setLoading] = useState(false);
  const [contacts, setContacts] = useState<ChatContact[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    avatar?: string;
  } | null>(null);
  const [showContacts, setShowContacts] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesSubscriptionRef = useRef<RealtimeChannel | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isContactTyping, setIsContactTyping] = useState(false);

  // Fetch messages when active chat changes
  const fetchMessages = useCallback(async () => {
    if (!activeChat || !currentUser) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(
          `and(sender_id.eq.${currentUser.id},receiver_id.eq.${activeChat}),and(sender_id.eq.${activeChat},receiver_id.eq.${currentUser.id})`
        )
        .order("created_at", { ascending: true });

      if (error) throw error;

      if (data) {
        setMessages(
          data.map((msg) => ({
            id: msg.id,
            senderId: msg.sender_id,
            receiverId: msg.receiver_id,
            content: msg.content,
            timestamp: msg.created_at,
            read: msg.read,
          }))
        );

        // Mark unread messages as read using the API
        const unreadMessages = data
          .filter((msg) => !msg.read && msg.sender_id === activeChat)
          .map((msg) => msg.id);

        if (unreadMessages.length > 0) {
          await axios.post("/api/message", {
            senderId: activeChat,
            receiverId: currentUser.id,
            content: unreadMessages,
            action: "read",
          });

          // Update contacts unread status
          setContacts((prev) =>
            prev.map((contact) =>
              contact.id === activeChat
                ? { ...contact, unread: false }
                : contact
            )
          );
        }
      }
    } catch (error) {
      toast.error("Error loading messages", {
        //@ts-expect-error : dont know what is error in this!!!
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  }, [activeChat, currentUser]);

  // Fetch user data and contacts - extracted to separate function
  const fetchUserAndContacts = useCallback(async () => {
    try {
      setLoading(true);

      // Get current user if not already set
      if (!currentUser) {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;
        if (!user) throw new Error("User not found");

        // Get user profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("name, avatar_url")
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;

        setCurrentUser({
          id: user.id,
          name: profileData.name,
          avatar: profileData.avatar_url,
        });
      }

      const userId =
        currentUser?.id || (await supabase.auth.getUser()).data.user?.id;

      if (!userId) throw new Error("User ID not found");

      // This is the critical part - change how you query the data
      const { data: messagesData, error: messagesError } = await supabase
        .from("messages")
        .select(
          `
        id,
        sender_id,
        receiver_id,
        content,
        created_at,
        read,
        sender:profiles!sender_id(id, name, avatar_url),
        receiver:profiles!receiver_id(id, name, avatar_url)
      `
        )
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order("created_at", { ascending: false });

      console.log("Raw messages data:", messagesData);

      if (messagesError) throw messagesError;

      if (messagesData && messagesData.length > 0) {
        // Process contacts
        const contactsMap = new Map();

        messagesData.forEach((message) => {
          const isCurrentUserSender = message.sender_id === userId;

          // Use this approach that matches your reference code
          const contactId = isCurrentUserSender
            ? message.receiver_id
            : message.sender_id;

          const contactData = isCurrentUserSender
            ? message.receiver
            : message.sender;

          if (!contactData || !contactId) return;

          if (!contactsMap.has(contactId)) {
            contactsMap.set(contactId, {
              id: contactId,
              // @ts-expect-error : why dont just ignore it
              name: contactData.name || "Unknown",
              // @ts-expect-error : why dont just ignore it
              avatar: contactData.avatar_url,
              lastMessage: message.content,
              timestamp: message.created_at,
              unread: !message.read && !isCurrentUserSender,
            });
          }
        });

        setContacts(Array.from(contactsMap.values()));

        // Set active chat only if there are contacts and no active chat is selected
        if (contactsMap.size > 0 && !activeChat) {
          setActiveChat(Array.from(contactsMap.keys())[0]);
        }
      }
    } catch (error) {
      toast.error("Error loading chats", {
        //@ts-expect-error : dont know what is error in this!!!
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  }, [currentUser, activeChat]);

  // Set up typing indicator
  const handleTypingIndicator = useCallback(
    (isTyping: boolean) => {
      if (!currentUser || !activeChat) return;

      // Clear any existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Send typing status via API
      axios.post("/api/message", {
        senderId: currentUser.id,
        receiverId: activeChat,
        content: isTyping,
        action: "typing",
      });

      // If typing, set a timeout to clear the typing status after 5 seconds
      if (isTyping) {
        typingTimeoutRef.current = setTimeout(() => {
          axios.post("/api/message", {
            senderId: currentUser.id,
            receiverId: activeChat,
            content: false,
            action: "typing",
          });
        }, 5000);
      }
    },
    [currentUser, activeChat]
  );

  // Initial setup - fetch user data and set up subscription
  useEffect(() => {
    fetchUserAndContacts();

    // Cleanup function
    return () => {
      if (messagesSubscriptionRef.current) {
        supabase.removeChannel(messagesSubscriptionRef.current);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [fetchUserAndContacts]);

  // Set up real-time subscription for new messages
  useEffect(() => {
    if (!currentUser?.id) return;

    // Remove any existing subscription
    if (messagesSubscriptionRef.current) {
      supabase.removeChannel(messagesSubscriptionRef.current);
    }

    // Create a new subscription
    const channel = supabase.channel("public:messages");

    channel
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `sender_id=eq.${currentUser.id}`,
        },
        (payload) => {
          handleNewMessage(payload.new);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${currentUser.id}`,
        },
        (payload) => {
          handleNewMessage(payload.new);
        }
      )
      .subscribe();

    // Store the subscription reference
    messagesSubscriptionRef.current = channel;

    // Handler for new messages
    //@ts-expect-error : dont know what is error in this!!!
    const handleNewMessage = async (newMessage) => {
      // Is this from a new contact?
      const isNewContact =
        newMessage.sender_id !== currentUser.id &&
        !contacts.some((c) => c.id === newMessage.sender_id);

      if (isNewContact) {
        // Fetch profile for the new contact
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("id, name, avatar_url")
          .eq("id", newMessage.sender_id)
          .single();

        if (!error && profile) {
          const newContact = {
            id: profile.id,
            name: profile.name || "Unknown",
            avatar: profile.avatar_url,
            lastMessage: newMessage.content,
            timestamp: newMessage.created_at,
            unread: true,
          };

          setContacts((prev) => [newContact, ...prev]);
        }
      } else {
        // Update existing contact's last message
        setContacts((prev) =>
          prev.map((contact) => {
            if (
              contact.id ===
              (newMessage.sender_id === currentUser.id
                ? newMessage.receiver_id
                : newMessage.sender_id)
            ) {
              return {
                ...contact,
                lastMessage: newMessage.content,
                timestamp: newMessage.created_at,
                unread:
                  newMessage.sender_id !== currentUser.id
                    ? true
                    : contact.unread,
              };
            }
            return contact;
          })
        );
      }

      // Update messages if in active chat
      if (
        activeChat &&
        (newMessage.sender_id === activeChat ||
          (newMessage.sender_id === currentUser.id &&
            newMessage.receiver_id === activeChat))
      ) {
        setMessages((prev) => {
          // Prevent duplicates
          if (prev.some((msg) => msg.id === newMessage.id)) return prev;

          return [
            ...prev,
            {
              id: newMessage.id,
              senderId: newMessage.sender_id,
              receiverId: newMessage.receiver_id,
              content: newMessage.content,
              timestamp: newMessage.created_at,
              read: false,
            },
          ];
        });

        // Mark as read if it's from the other person and in active chat
        if (newMessage.sender_id === activeChat) {
          await axios.post("/api/message", {
            senderId: activeChat,
            receiverId: currentUser.id,
            content: [newMessage.id],
            action: "read",
          });
        }
      }
    };

    return () => {
      if (messagesSubscriptionRef.current) {
        supabase.removeChannel(messagesSubscriptionRef.current);
      }
    };
  }, [currentUser, activeChat, contacts]);

  // Fetch messages when active chat changes
  useEffect(() => {
    if (activeChat) {
      fetchMessages();

      // On mobile, switch to chat view when an active chat is selected
      if (window.innerWidth < 768) {
        setShowContacts(false);
      }
    }
  }, [activeChat, fetchMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle chat selection on mobile
  //@ts-expect-error : dont know what is error in this!!!
  const handleChatSelect = (contactId) => {
    setActiveChat(contactId);
    if (window.innerWidth < 768) {
      setShowContacts(false);
    }
  };

  // Handle back button on mobile
  const handleBackToContacts = () => {
    setShowContacts(true);
  };

  // Handle message input change and trigger typing indicator
  const handleMessageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageText(e.target.value);
    handleTypingIndicator(e.target.value.trim().length > 0);
  };

  const sendMessage = async () => {
    if (!messageText.trim() || !activeChat || !currentUser) return;

    try {
      const timestamp = new Date().toISOString();
      const newMessageContent = messageText.trim();

      // Clear input before sending to improve UX
      setMessageText("");

      // Clear typing indicator
      handleTypingIndicator(false);

      // Add to local state immediately for instant UI update
      const tempId = `temp-${Date.now()}`;
      setMessages((prev) => [
        ...prev,
        {
          id: tempId,
          senderId: currentUser.id,
          receiverId: activeChat,
          content: newMessageContent,
          timestamp: timestamp,
          read: false,
        },
      ]);

      // Send message via API
      const response = await axios.post("/api/message", {
        senderId: currentUser.id,
        receiverId: activeChat,
        content: newMessageContent,
        action: "send",
      });

      if (!response.data.success) {
        throw new Error(response.data.error || "Failed to send message");
      }

      // Update contacts with latest message
      setContacts((prev) =>
        prev.map((contact) => {
          if (contact.id === activeChat) {
            return {
              ...contact,
              lastMessage: newMessageContent,
              timestamp: timestamp,
            };
          }
          return contact;
        })
      );

      // Update the message with the real ID from the database if needed
      if (response.data && response.data.message) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempId
              ? {
                  id: response.data.message.id,
                  senderId: response.data.message.sender_id,
                  receiverId: response.data.message.receiver_id,
                  content: response.data.message.content,
                  timestamp: response.data.message.created_at,
                  read: response.data.message.read,
                }
              : msg
          )
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);

      // Remove the temporary message from the UI
      setMessages((prev) => prev.filter((msg) => !msg.id.startsWith("temp-")));

      // Show error toast with more detailed information
      toast.error("Error sending message", {
        description:
          (error as { response?: { data?: { error?: string } } })?.response
            ?.data?.error ||
          (error instanceof Error ? error.message : "Unknown error") ||
          "Failed to send message",
      });

      // Restore the message text so user can try again
      setMessageText(messageText);
    }
  };

  const activeContact = contacts.find((contact) => contact.id === activeChat);

  // Get contact status
  const fetchContactStatus = useCallback(async () => {
    if (!activeChat) return;

    console.log("Rendeering");
    try {
      const response = await axios.get(`/api/message?userId=${activeChat}`);
      const data = response.data;

      // Handle status information
      if (data.status === "typing" && data.typingTo === currentUser?.id) {
        setIsContactTyping(true);
      } else {
        setIsContactTyping(false);
      }
    } catch (error) {
      console.error("Error fetching contact status:", error);
    }
  }, [currentUser?.id, activeChat]);

  // Check contact status periodically
  useEffect(() => {
    if (!activeChat) return;

    // Initial check
    fetchContactStatus();

    // Set up interval for checking (every 5 seconds)
    const statusInterval = setInterval(fetchContactStatus, 5000);

    return () => {
      clearInterval(statusInterval);
    };
  }, [activeChat, fetchContactStatus]);

  console.log(messages);
  console.log(contacts);
  return (
    <div className="flex h-[calc(100vh-4rem)] max-h-[600px] border rounded-lg overflow-hidden">
      {/* Contact List - Hidden on mobile when in chat view */}
      <div
        className={`w-full ${
          showContacts ? "block" : "hidden"
        } md:block md:w-1/3 border-r`}
      >
        <Tabs defaultValue="all">
          <div className="p-4 border-b">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="m-0">
            <div className="divide-y overflow-y-auto max-h-[calc(100vh-8rem)] md:max-h-[540px]">
              {contacts.length > 0 ? (
                contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className={`p-4 hover:bg-muted/50 cursor-pointer ${
                      activeChat === contact.id ? "bg-muted" : ""
                    }`}
                    onClick={() => handleChatSelect(contact.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarImage
                          src={
                            contact.avatar ||
                            "/placeholder.svg?height=40&width=40"
                          }
                          alt={contact.name}
                        />
                        <AvatarFallback>
                          {contact.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium truncate">
                            {contact.name}
                          </h4>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(contact.timestamp), "MMM d")}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {contact.lastMessage}
                        </p>
                      </div>
                      {contact.unread && (
                        <Badge className="ml-2 h-2 w-2 rounded-full p-0" />
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium mb-2">
                    No conversations yet
                  </h3>
                  <p className="text-muted-foreground">
                    When clients message you, they'll appear here.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="unread" className="m-0">
            <div className="divide-y overflow-y-auto max-h-[calc(100vh-8rem)] md:max-h-[540px]">
              {contacts.filter((c) => c.unread).length > 0 ? (
                contacts
                  .filter((c) => c.unread)
                  .map((contact) => (
                    <div
                      key={contact.id}
                      className={`p-4 hover:bg-muted/50 cursor-pointer ${
                        activeChat === contact.id ? "bg-muted" : ""
                      }`}
                      onClick={() => handleChatSelect(contact.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarImage
                            src={
                              contact.avatar ||
                              "/placeholder.svg?height=40&width=40"
                            }
                            alt={contact.name}
                          />
                          <AvatarFallback>
                            {contact.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium truncate">
                              {contact.name}
                            </h4>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(contact.timestamp), "MMM d")}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {contact.lastMessage}
                          </p>
                        </div>
                        <Badge className="ml-2 h-2 w-2 rounded-full p-0" />
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium mb-2">
                    No unread messages
                  </h3>
                  <p className="text-muted-foreground">You're all caught up!</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Chat Window - Visible on all devices when chat is selected */}
      <div
        className={`w-full flex flex-col overflow-x-auto ${
          showContacts ? "hidden" : "flex"
        } md:flex md:w-2/3`}
      >
        {activeChat && activeContact ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Back button on mobile */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={handleBackToContacts}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>

                <Avatar>
                  <AvatarImage
                    src={
                      activeContact.avatar ||
                      "/placeholder.svg?height=40&width=40"
                    }
                    alt={activeContact.name}
                  />
                  <AvatarFallback>
                    {activeContact.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{activeContact.name}</h3>
                </div>
              </div>
              <div>
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden md:inline-flex"
                >
                  View Profile
                </Button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-6">
                {messages.length > 0 ? (
                  messages.map((message) => {
                    const isCurrentUser = message.senderId === currentUser?.id;

                    return (
                      <div
                        key={message.id}
                        className={`flex items-end gap-3 max-w-[85%] ${
                          isCurrentUser ? "ml-auto flex-row-reverse" : ""
                        }`}
                      >
                        {/* Avatar */}
                        <Avatar className="h-8 w-8 md:h-10 md:w-10 shrink-0">
                          <AvatarImage
                            src={
                              isCurrentUser
                                ? currentUser.avatar ||
                                  "/placeholder.svg?height=40&width=40"
                                : activeContact.avatar ||
                                  "/placeholder.svg?height=40&width=40"
                            }
                            alt={isCurrentUser ? "You" : activeContact.name}
                          />
                          <AvatarFallback>
                            {(isCurrentUser
                              ? currentUser.name
                              : activeContact.name
                            )?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>

                        {/* Message bubble and timestamp */}
                        <div className="space-y-1">
                          <ChatBubble
                            content={message.content}
                            isCurrentUser={isCurrentUser}
                          />
                          <span
                            className={`text-xs text-muted-foreground block ${
                              isCurrentUser ? "text-right" : "text-left"
                            }`}
                          >
                            {format(new Date(message.timestamp), "h:mm a")}
                          </span>
                          {isContactTyping && (
                            <div className="flex items-start gap-3 max-w-[85%]">
                              <Avatar className="h-8 w-8 md:h-10 md:w-10 shrink-0">
                                <AvatarImage
                                  src={
                                    activeContact.avatar ||
                                    "/placeholder.svg?height=40&width=40"
                                  }
                                  alt={activeContact.name}
                                />
                                <AvatarFallback>
                                  {activeContact.name?.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="space-y-1">
                                <ChatBubble
                                  content="typing..."
                                  isCurrentUser={false}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      No messages yet. Start the conversation!
                    </p>
                  </div>
                )}

                {/* Scroll anchor */}
                <div ref={messagesEndRef} />
              </div>
            </div>

            <Toaster />

            {/* Chat Input */}
            <div className="p-2 md:p-4 border-t">
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage();
                }}
              >
                <Input
                  placeholder="Type your message..."
                  value={messageText}
                  onChange={handleMessageInputChange}
                  className="flex-1"
                />
                <Button type="submit" disabled={loading || !messageText.trim()}>
                  Send
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-center p-8">
            <div>
              <h3 className="text-xl font-medium mb-2">
                Select a conversation
              </h3>
              <p className="text-muted-foreground">
                Choose a conversation from the list to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
