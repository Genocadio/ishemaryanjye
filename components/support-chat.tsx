"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageCircle, X, Send, MinusCircle } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

type Message = {
  id: string
  text: string
  sender: "user" | "support"
  timestamp: number
}

export function SupportChat() {
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [hasShownWelcome, setHasShownWelcome] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load chat state from localStorage on component mount
  useEffect(() => {
    const storedMessages = localStorage.getItem("chatMessages")
    const storedHasShownWelcome = localStorage.getItem("hasShownWelcome")

    if (storedMessages) {
      setMessages(JSON.parse(storedMessages))
    }

    if (storedHasShownWelcome) {
      setHasShownWelcome(JSON.parse(storedHasShownWelcome))
    }
  }, [])

  // Save chat state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages))
    localStorage.setItem("hasShownWelcome", JSON.stringify(hasShownWelcome))
  }, [messages, hasShownWelcome])

  // Show welcome message when chat is opened for the first time
  useEffect(() => {
    if (isOpen && !hasShownWelcome && messages.length === 0) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        text: "Welcome to Ishema Ryanjye support! How can we help you today?",
        sender: "support",
        timestamp: Date.now(),
      }
      setMessages([welcomeMessage])
      setHasShownWelcome(true)
    }
  }, [isOpen, hasShownWelcome, messages.length])

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleSendMessage = () => {
    if (input.trim() === "") return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")

    // Add support response after a short delay
    setTimeout(() => {
      const supportMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "We will reach you sooner.",
        sender: "support",
        timestamp: Date.now(),
      }
      setMessages((prev) => [...prev, supportMessage])
    }, 500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage()
    }
  }

  const clearChat = () => {
    setMessages([])
    localStorage.removeItem("chatMessages")
    setHasShownWelcome(false)
    localStorage.removeItem("hasShownWelcome")
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="bg-white rounded-lg shadow-lg w-80 sm:w-96 mb-2 flex flex-col border border-gray-200 overflow-hidden">
          <div className="bg-green-600 text-white p-3 flex justify-between items-center">
            <h3 className="font-medium">Support Chat</h3>
            <div className="flex space-x-2">
              <button onClick={clearChat} className="text-white hover:text-gray-200">
                <MinusCircle size={18} />
              </button>
              <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200">
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="flex-1 p-3 overflow-y-auto max-h-80 min-h-[320px] bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-3 flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 ${
                    message.sender === "user" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-800"
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className={`text-xs mt-1 ${message.sender === "user" ? "text-green-100" : "text-gray-500"}`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-gray-200 flex">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 mr-2"
            />
            <Button onClick={handleSendMessage} size="sm" className="bg-green-600 hover:bg-green-700">
              <Send size={16} />
            </Button>
          </div>
        </div>
      )}

      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full w-12 h-12 bg-green-600 hover:bg-green-700 shadow-lg flex items-center justify-center"
      >
        <MessageCircle size={24} />
      </Button>
    </div>
  )
}
