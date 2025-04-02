"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import { format } from "date-fns"

interface ChatContact {
  id: string
  name: string
  avatar?: string
  lastMessage: string
  timestamp: string
  unread: boolean
}

interface ChatMessage {
  id: string
  senderId: string
  receiverId: string
  content: string
  timestamp: string
  read: boolean
}

export default function ChatInterface() {
  const [loading, setLoading] = useState(false)
  const [contacts, setContacts] = useState<ChatContact[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [activeChat, setActiveChat] = useState<string | null>(null)
  const [messageText, setMessageText] = useState("")
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; avatar?: string } | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch user data and contacts on component mount
  useEffect(() => {
    async function fetchUserAndContacts() {
      try {
        setLoading(true)

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) throw new Error("User not found")

        // Get user profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("name, avatar_url")
          .eq("id", user.id)
          .single()

        if (profileError) throw profileError

        setCurrentUser({
          id: user.id,
          name: profileData.name,
          avatar: profileData.avatar_url,
        })

        // Get contacts with latest messages
        const { data: contactsData, error: contactsError } = await supabase
          .from("messages")
          .select(`
            id,
            content,
            created_at,
            read,
            sender:sender_id(id, name, avatar_url),
            receiver:receiver_id(id, name, avatar_url)
          `)
          .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
          .order("created_at", { ascending: false })

        if (contactsError) throw contactsError

        if (contactsData) {
          // Process contacts
          const contactsMap = new Map<string, ChatContact>()

          contactsData.forEach((message) => {
            const isCurrentUserSender = message.sender[0].id === user.id
            const contactId = isCurrentUserSender ? message.receiver[0].id : message.sender[0].id
            const contactName = isCurrentUserSender ? message.receiver[0].name : message.sender[0].name
            const contactAvatar = isCurrentUserSender ? message.receiver[0].avatar_url : message.sender[0].avatar_url

            if (!contactsMap.has(contactId)) {
              contactsMap.set(contactId, {
                id: contactId,
                name: contactName,
                avatar: contactAvatar,
                lastMessage: message.content,
                timestamp: message.created_at,
                unread: !message.read && !isCurrentUserSender,
              })
            }
          })

          setContacts(Array.from(contactsMap.values()))

          // Set active chat if there are contacts
          if (contactsMap.size > 0 && !activeChat) {
            setActiveChat(Array.from(contactsMap.keys())[0])
          }
        }
      } catch (error: any) {
        toast.error("Error loading chats", {
          description: error.message,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUserAndContacts()

    // Set up real-time subscription for new messages
    const messagesSubscription = supabase
      .channel("messages-channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          const newMessage = payload.new as any

          // Check if message is relevant to current user
          if (newMessage.sender_id === currentUser?.id || newMessage.receiver_id === currentUser?.id) {
            // Update contacts
            fetchUserAndContacts()

            // Update messages if in active chat
            if (activeChat && (newMessage.sender_id === activeChat || newMessage.receiver_id === activeChat)) {
              setMessages((prev) => [
                ...prev,
                {
                  id: newMessage.id,
                  senderId: newMessage.sender_id,
                  receiverId: newMessage.receiver_id,
                  content: newMessage.content,
                  timestamp: newMessage.created_at,
                  read: newMessage.read,
                },
              ])
            }
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(messagesSubscription)
    }
  }, [toast, activeChat, currentUser])

  // Fetch messages when active chat changes
  useEffect(() => {
    async function fetchMessages() {
      if (!activeChat || !currentUser) return

      try {
        setLoading(true)

        const { data, error } = await supabase
          .from("messages")
          .select("*")
          .or(
            `and(sender_id.eq.${currentUser.id},receiver_id.eq.${activeChat}),and(sender_id.eq.${activeChat},receiver_id.eq.${currentUser.id})`,
          )
          .order("created_at", { ascending: true })

        if (error) throw error

        if (data) {
          setMessages(
            data.map((msg) => ({
              id: msg.id,
              senderId: msg.sender_id,
              receiverId: msg.receiver_id,
              content: msg.content,
              timestamp: msg.created_at,
              read: msg.read,
            })),
          )

          // Mark unread messages as read
          const unreadMessages = data.filter((msg) => !msg.read && msg.sender_id === activeChat).map((msg) => msg.id)

          if (unreadMessages.length > 0) {
            await supabase.from("messages").update({ read: true }).in("id", unreadMessages)

            // Update contacts
            setContacts((prev) =>
              prev.map((contact) => (contact.id === activeChat ? { ...contact, unread: false } : contact)),
            )
          }
        }
      } catch (error: any) {
       toast.error("Error loading messages", {
         description: error.message,
       });
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()
  }, [activeChat, currentUser, toast])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async () => {
    if (!messageText.trim() || !activeChat || !currentUser) return

    try {
      setLoading(true)

      const newMessage = {
        sender_id: currentUser.id,
        receiver_id: activeChat,
        content: messageText,
        created_at: new Date().toISOString(),
        read: false,
      }

      const { error } = await supabase.from("messages").insert([newMessage])

      if (error) throw error

      // Clear input
      setMessageText("")
    } catch (error: any) {
      toast.error(
        "Error sending message",{
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const activeContact = contacts.find((contact) => contact.id === activeChat)

  return (
    <div className="flex h-[600px] border rounded-lg overflow-hidden">
      {/* Contact List */}
      <div className="w-full md:w-1/3 border-r">
        <Tabs defaultValue="all">
          <div className="p-4 border-b">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="m-0">
            <div className="divide-y">
              {contacts.length > 0 ? (
                contacts.map((contact) => (
                  <div
                    key={contact.id}
                    className={`p-4 hover:bg-muted/50 cursor-pointer ${activeChat === contact.id ? "bg-muted" : ""}`}
                    onClick={() => setActiveChat(contact.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarImage src={contact.avatar || "/placeholder.svg?height=40&width=40"} alt={contact.name} />
                        <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium truncate">{contact.name}</h4>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(contact.timestamp), "MMM d")}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{contact.lastMessage}</p>
                      </div>
                      {contact.unread && <Badge className="ml-2 h-2 w-2 rounded-full p-0" />}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium mb-2">No conversations yet</h3>
                  <p className="text-muted-foreground">When clients message you, they'll appear here.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="unread" className="m-0">
            <div className="divide-y">
              {contacts.filter((c) => c.unread).length > 0 ? (
                contacts
                  .filter((c) => c.unread)
                  .map((contact) => (
                    <div
                      key={contact.id}
                      className={`p-4 hover:bg-muted/50 cursor-pointer ${activeChat === contact.id ? "bg-muted" : ""}`}
                      onClick={() => setActiveChat(contact.id)}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarImage
                            src={contact.avatar || "/placeholder.svg?height=40&width=40"}
                            alt={contact.name}
                          />
                          <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium truncate">{contact.name}</h4>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(contact.timestamp), "MMM d")}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{contact.lastMessage}</p>
                        </div>
                        <Badge className="ml-2 h-2 w-2 rounded-full p-0" />
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium mb-2">No unread messages</h3>
                  <p className="text-muted-foreground">You're all caught up!</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Chat Window */}
      <div className="hidden md:flex md:flex-col md:w-2/3">
        {activeChat && activeContact ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage
                    src={activeContact.avatar || "/placeholder.svg?height=40&width=40"}
                    alt={activeContact.name}
                  />
                  <AvatarFallback>{activeContact.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{activeContact.name}</h3>
                </div>
              </div>
              <div>
                <Button variant="outline" size="sm">
                  View Profile
                </Button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-auto">
              <div className="space-y-4">
                {messages.map((message) => {
                  const isCurrentUser = message.senderId === currentUser?.id

                  return (
                    <div
                      key={message.id}
                      className={`flex items-start gap-3 max-w-[80%] ${isCurrentUser ? "ml-auto flex-row-reverse" : ""}`}
                    >
                      <Avatar className="mt-1">
                        <AvatarImage
                          src={
                            isCurrentUser
                              ? currentUser.avatar || "/placeholder.svg?height=40&width=40"
                              : activeContact.avatar || "/placeholder.svg?height=40&width=40"
                          }
                          alt={isCurrentUser ? "You" : activeContact.name}
                        />
                        <AvatarFallback>
                          {isCurrentUser ? currentUser.name.charAt(0) : activeContact.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div
                          className={`${
                            isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"
                          } p-3 rounded-lg`}
                        >
                          <p>{message.content}</p>
                        </div>
                        <span
                          className={`text-xs text-muted-foreground mt-1 block ${isCurrentUser ? "text-right" : ""}`}
                        >
                          {format(new Date(message.timestamp), "h:mm a")}
                        </span>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t">
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  sendMessage()
                }}
              >
                <Input
                  placeholder="Type your message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
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
              <h3 className="text-xl font-medium mb-2">Select a conversation</h3>
              <p className="text-muted-foreground">Choose a conversation from the list to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

