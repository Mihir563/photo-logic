"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useState } from "react"

const messages = [
  {
    id: "1",
    sender: {
      name: "Emma Thompson",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    preview: "Hi, I'm interested in booking a portrait session for my family...",
    timestamp: "2 hours ago",
    unread: true,
  },
  {
    id: "2",
    sender: {
      name: "Michael Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    preview: "Thanks for the information. I'd like to book the session for April 12th...",
    timestamp: "Yesterday",
    unread: true,
  },
  {
    id: "3",
    sender: {
      name: "Sarah Williams",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    preview: "The photos look amazing! Thank you so much for capturing our special day...",
    timestamp: "3 days ago",
    unread: false,
  },
  {
    id: "4",
    sender: {
      name: "David Brown",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    preview: "I'm looking for a photographer for our corporate event next month...",
    timestamp: "1 week ago",
    unread: false,
  },
]

export default function MessageList() {
  const [activeChat, setActiveChat] = useState<string | null>(null)
  const [messageText, setMessageText] = useState("")

  const activeMessage = messages.find((m) => m.id === activeChat)

  return (
    <div className="flex h-[600px] border rounded-lg overflow-hidden">
      {/* Message List */}
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
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`p-4 hover:bg-muted/50 cursor-pointer ${activeChat === message.id ? "bg-muted" : ""}`}
                  onClick={() => setActiveChat(message.id)}
                >
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarImage src={message.sender.avatar} alt={message.sender.name} />
                      <AvatarFallback>{message.sender.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium truncate">{message.sender.name}</h4>
                        <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{message.preview}</p>
                    </div>
                    {message.unread && <Badge className="ml-2 h-2 w-2 rounded-full p-0" />}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="unread" className="m-0">
            <div className="divide-y">
              {messages
                .filter((m) => m.unread)
                .map((message) => (
                  <div
                    key={message.id}
                    className={`p-4 hover:bg-muted/50 cursor-pointer ${activeChat === message.id ? "bg-muted" : ""}`}
                    onClick={() => setActiveChat(message.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarImage src={message.sender.avatar} alt={message.sender.name} />
                        <AvatarFallback>{message.sender.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium truncate">{message.sender.name}</h4>
                          <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{message.preview}</p>
                      </div>
                      <Badge className="ml-2 h-2 w-2 rounded-full p-0" />
                    </div>
                  </div>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Chat Window */}
      <div className="hidden md:flex md:flex-col md:w-2/3">
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={activeMessage?.sender.avatar} alt={activeMessage?.sender.name} />
                  <AvatarFallback>{activeMessage?.sender.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{activeMessage?.sender.name}</h3>
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
                <div className="flex items-start gap-3 max-w-[80%]">
                  <Avatar className="mt-1">
                    <AvatarImage src={activeMessage?.sender.avatar} alt={activeMessage?.sender.name} />
                    <AvatarFallback>{activeMessage?.sender.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="bg-muted p-3 rounded-lg">
                      <p>
                        Hi, I'm interested in booking a portrait session for my family. Do you have availability in
                        April?
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground mt-1 block">2 hours ago</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 max-w-[80%] ml-auto flex-row-reverse">
                  <Avatar className="mt-1">
                    <AvatarImage src="/placeholder.svg?height=40&width=40" alt="You" />
                    <AvatarFallback>Y</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="bg-primary text-primary-foreground p-3 rounded-lg">
                      <p>
                        Hello! Thanks for reaching out. I do have some availability in April. What specific dates were
                        you thinking about?
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground mt-1 block text-right">1 hour ago</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 max-w-[80%]">
                  <Avatar className="mt-1">
                    <AvatarImage src={activeMessage?.sender.avatar} alt={activeMessage?.sender.name} />
                    <AvatarFallback>{activeMessage?.sender.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="bg-muted p-3 rounded-lg">
                      <p>
                        I was thinking about the second weekend of April, either the 12th or 13th. Would either of those
                        work for you?
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground mt-1 block">45 minutes ago</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="flex-1"
                />
                <Button>Send</Button>
              </div>
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

