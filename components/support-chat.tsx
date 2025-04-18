"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageCircle, X, Send, MinusCircle, Copy, Check } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

type Message = {
  id: string
  text: string
  sender: "user" | "support"
  timestamp: number
}

type BotConfig = {
  botImageURL: string
  userAvatarURL: string
  fontSize: number
  botStatus: number
  StartUpMessage: string
  commonButtons: Array<{
    buttonText: string
    buttonPrompt: string
  }>
}

export function SupportChat() {
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [hasShownWelcome, setHasShownWelcome] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [error, setError] = useState("")
  const [botConfig, setBotConfig] = useState<BotConfig | null>(null)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatWindowRef = useRef<HTMLDivElement>(null)
  const isResizing = useRef(false)

  const apiUrl = 'https://ishema-bot-backend-django-production.up.railway.app/chat-bot/'
  const botConfigurationUrl = 'https://ishema-bot-backend-django-production.up.railway.app/chat-bot-config/'

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

    fetchBotConfiguration()
  }, [])

  // Save chat state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages))
    localStorage.setItem("hasShownWelcome", JSON.stringify(hasShownWelcome))
  }, [messages, hasShownWelcome])

  // Show welcome message when chat is opened for the first time
  useEffect(() => {
    if (isOpen && !hasShownWelcome && messages.length === 0 && botConfig) {
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        text: botConfig.StartUpMessage,
        sender: "support",
        timestamp: Date.now(),
      }
      setMessages([welcomeMessage])
      setHasShownWelcome(true)
    }
  }, [isOpen, hasShownWelcome, messages.length, botConfig])

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const fetchBotConfiguration = async () => {
    try {
      const response = await fetch(botConfigurationUrl)
      if (response.ok) {
        const data = await response.json()
        setBotConfig(data)
      } else {
        throw new Error("Failed to fetch bot configuration")
      }
    } catch (error) {
      setError("Failed to load bot configuration")
    }
  }

  const handleSendMessage = async () => {
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
    setIsLoading(true)
    setIsTyping(true)

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          last_prompt: input,
          conversation_history: messages.map(msg => ({
            role: msg.sender === "user" ? "user" : "assistant",
            content: msg.text
          }))
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          const supportMessage: Message = {
            id: (Date.now() + 1).toString(),
            text: data.result,
            sender: "support",
            timestamp: Date.now(),
          }
          setMessages((prev) => [...prev, supportMessage])
        } else {
          throw new Error("Failed to get response from bot")
        }
      } else {
        throw new Error("Failed to get response from bot")
      }
    } catch (error) {
      setError("Failed to get response from bot")
    } finally {
      setIsLoading(false)
      setIsTyping(false)
    }
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

  const copyMessage = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (error) {
      setError("Failed to copy message")
    }
  }

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (feedback.trim() === "") return

    try {
      // Here you would typically send the feedback to your backend
      setShowFeedback(false)
      setFeedback("")
    } catch (error) {
      setError("Failed to submit feedback")
    }
  }

  const handleResizeStart = (e: React.MouseEvent) => {
    isResizing.current = true
    document.addEventListener('mousemove', handleResize)
    document.addEventListener('mouseup', handleResizeEnd)
  }

  const handleResize = (e: MouseEvent) => {
    if (!isResizing.current || !chatWindowRef.current) return
    const newWidth = e.clientX - chatWindowRef.current.getBoundingClientRect().left
    if (newWidth > 250) {
      chatWindowRef.current.style.width = `${newWidth}px`
    }
  }

  const handleResizeEnd = () => {
    isResizing.current = false
    document.removeEventListener('mousemove', handleResize)
    document.removeEventListener('mouseup', handleResizeEnd)
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {isOpen && (
        <div 
          ref={chatWindowRef}
          className="bg-white rounded-lg shadow-lg w-80 sm:w-96 mb-2 flex flex-col border border-gray-200 overflow-hidden relative"
          style={{ minWidth: '250px' }}
        >
          <div className="bg-green-600 text-white p-3 flex justify-between items-center">
            <div>
              <h3 className="font-medium">Support Chat</h3>
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${botConfig?.botStatus === 1 ? 'bg-green-400' : 'bg-gray-400'}`} />
                <span className="text-xs">{botConfig?.botStatus === 1 ? 'Online' : 'Offline'}</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <button onClick={() => setShowFeedback(true)} className="text-white hover:text-gray-200">
                <MessageCircle size={18} />
              </button>
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
                  className={`max-w-[80%] rounded-lg px-3 py-2 relative ${
                    message.sender === "user" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-800"
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className={`text-xs mt-1 ${message.sender === "user" ? "text-green-100" : "text-gray-500"}`}>
                    {formatTime(message.timestamp)}
                  </p>
                  <button
                    onClick={() => copyMessage(message.text)}
                    className="absolute top-1 right-1 text-gray-500 hover:text-gray-700"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }} />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-gray-200 flex">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 mr-2"
              disabled={isLoading}
            />
            <Button 
              onClick={handleSendMessage} 
              size="sm" 
              className="bg-green-600 hover:bg-green-700"
              disabled={isLoading}
            >
              <Send size={16} />
            </Button>
          </div>

          <div 
            className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize bg-gray-200 hover:bg-gray-300"
            onMouseDown={handleResizeStart}
          />

          {showFeedback && (
            <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center p-4">
              <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Feedback</h3>
                  <button onClick={() => setShowFeedback(false)} className="text-gray-500 hover:text-gray-700">
                    <X size={18} />
                  </button>
                </div>
                <form onSubmit={handleFeedbackSubmit}>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="w-full p-2 border rounded mb-4"
                    rows={4}
                    placeholder="Please provide your feedback..."
                  />
                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                    Send Feedback
                  </Button>
                </form>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <span className="block sm:inline">{error}</span>
              <button onClick={() => setError("")} className="absolute top-0 bottom-0 right-0 px-4 py-3">
                <X size={16} />
              </button>
            </div>
          )}
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
