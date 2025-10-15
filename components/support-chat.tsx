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
  const { t, language } = useLanguage()
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
  const [showStartupButtons, setShowStartupButtons] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatWindowRef = useRef<HTMLDivElement>(null)
  const isResizing = useRef(false)

  const apiUrl = 'https://ishema-bot-backend.onrender.com/chat-bot/'
  const botConfigurationUrl = 'https://ishema-bot-backend.onrender.com/chat-bot-config/'

  // urls for test
  // const apiUrl = 'http://localhost:8000/chat-bot/'
  // const botConfigurationUrl = 'http://localhost:8000/chat-bot-config/'

  // Helper function to map language to bot language
  const getBotLanguage = (userLanguage: string) => {
    // If language is English or French, use English for the bot
    if (userLanguage === 'en' || userLanguage === 'fr') {
      return 'english'
    }
    // If language is Kinyarwanda, use Kinyarwanda for the bot
    if (userLanguage === 'rw') {
      return 'kinyarwanda'
    }
    // Default to English
    return 'english'
  }

  // Helper function to parse basic markdown formatting
  const parseMarkdown = (text: string) => {
    if (!text) return text
    
    // Escape HTML to prevent XSS, but keep our markdown
    let formatted = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
    
    // Replace line breaks with <br> tags
    formatted = formatted.replace(/\n/g, '<br>')
    
    // Replace **bold** with <strong> tags (non-greedy)
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    
    // Replace *italic* with <em> tags (but not if it's part of **)
    formatted = formatted.replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '<em>$1</em>')
    
    // Replace `code` with <code> tags
    formatted = formatted.replace(/`([^`]+?)`/g, '<code>$1</code>')
    
    // Replace code blocks ```code``` with <pre><code> tags
    formatted = formatted.replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-50 p-2 rounded mt-1 mb-1 overflow-x-auto"><code>$1</code></pre>')
    
    // Replace numbered lists (1. item)
    formatted = formatted.replace(/^(\d+\.\s)(.*)$/gm, '<div class="ml-2 mt-1"><span class="font-semibold">$1</span>$2</div>')
    
    // Replace bullet points (- item or • item)
    formatted = formatted.replace(/^[-•]\s(.*)$/gm, '<div class="ml-2 mt-1">• $1</div>')
    
    // Replace headers (# Header)
    formatted = formatted.replace(/^#{1,3}\s(.*)$/gm, '<div class="font-bold text-base mt-2 mb-1">$1</div>')
    
    // Replace links [text](url) - make them functional
    formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="underline hover:no-underline">$1</a>')
    
    return formatted
  }

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

  // Refetch bot configuration when language changes
  useEffect(() => {
    fetchBotConfiguration()
  }, [language])

  // Save chat state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages))
    localStorage.setItem("hasShownWelcome", JSON.stringify(hasShownWelcome))
  }, [messages, hasShownWelcome])

  // Show welcome message when chat is opened for the first time or language changes
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
      setShowStartupButtons(true) // Show buttons with welcome message
    }
  }, [isOpen, hasShownWelcome, messages.length, botConfig])

  // Hide startup buttons when user sends a message
  useEffect(() => {
    if (messages.length > 1) {
      setShowStartupButtons(false)
    }
  }, [messages])

  // Reset welcome message and chat when language changes to get new language-specific content
  useEffect(() => {
    // Clear messages and reset welcome flag when language changes
    // This ensures the bot starts fresh with the new language
    if (messages.length > 0) {
      setMessages([])
      setHasShownWelcome(false)
      localStorage.removeItem("chatMessages")
      localStorage.removeItem("hasShownWelcome")
    }
  }, [language])

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const fetchBotConfiguration = async () => {
    try {
      const response = await fetch(`${botConfigurationUrl}?language=${getBotLanguage(language)}`)
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

  const handleButtonClick = async (buttonPrompt: string) => {
    // Hide buttons immediately
    setShowStartupButtons(false)
    
    // Set the input to the button prompt and trigger message send
    setInput(buttonPrompt)
    
    // Create user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: buttonPrompt,
      sender: "user",
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)
    setIsTyping(true)

    // Create a placeholder for the bot response
    const botMessageId = (Date.now() + 1).toString()
    const botMessage: Message = {
      id: botMessageId,
      text: "",
      sender: "support",
      timestamp: Date.now(),
    }
    
    setMessages((prev) => [...prev, botMessage])

    try {
      // Convert conversation history to new messages format
      const messagesHistory = [...messages, userMessage].map(msg => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text
      }))

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: messagesHistory,
          language: getBotLanguage(language)
        })
      })

      if (!response.ok) {
        throw new Error("Failed to get response from bot")
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let accumulatedText = ""

      if (reader) {
        setIsTyping(false) // Stop typing indicator when streaming starts
        
        while (true) {
          const { done, value } = await reader.read()
          
          if (done) break
          
          // Decode the chunk
          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')
          
          for (const line of lines) {
            if (line.trim() === '') continue
            
            try {
              // Parse JSON chunk
              const jsonChunk = JSON.parse(line)
              
              if (jsonChunk.content) {
                accumulatedText += jsonChunk.content
                
                // Update the bot message in real-time
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === botMessageId
                      ? { ...msg, text: accumulatedText }
                      : msg
                  )
                )
              }
              
              // Check if streaming is complete
              if (jsonChunk.done) {
                break
              }
            } catch (e) {
              // Skip invalid JSON lines
              console.warn("Failed to parse chunk:", line)
            }
          }
        }
      }

      // If no content was received, show error
      if (accumulatedText.trim() === "") {
        throw new Error("No response received from bot")
      }

    } catch (error) {
      console.error("Error in handleButtonClick:", error)
      setError("Failed to get response from bot")
      
      // Remove the empty bot message if there was an error
      setMessages((prev) => prev.filter((msg) => msg.id !== botMessageId))
    } finally {
      setIsLoading(false)
      setIsTyping(false)
      setInput("") // Clear input
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
    const currentInput = input
    setInput("")
    setIsLoading(true)
    setIsTyping(true)

    // Create a placeholder for the bot response
    const botMessageId = (Date.now() + 1).toString()
    const botMessage: Message = {
      id: botMessageId,
      text: "",
      sender: "support",
      timestamp: Date.now(),
    }
    
    setMessages((prev) => [...prev, botMessage])

    try {
      // Convert conversation history to new messages format
      const messagesHistory = [...messages, userMessage].map(msg => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text
      }))

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: messagesHistory,
          language: getBotLanguage(language)
        })
      })

      if (!response.ok) {
        throw new Error("Failed to get response from bot")
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let accumulatedText = ""

      if (reader) {
        setIsTyping(false) // Stop typing indicator when streaming starts
        
        while (true) {
          const { done, value } = await reader.read()
          
          if (done) break
          
          // Decode the chunk
          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')
          
          for (const line of lines) {
            if (line.trim() === '') continue
            
            try {
              // Parse JSON chunk
              const jsonChunk = JSON.parse(line)
              
              if (jsonChunk.content) {
                accumulatedText += jsonChunk.content
                
                // Update the bot message in real-time
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === botMessageId
                      ? { ...msg, text: accumulatedText }
                      : msg
                  )
                )
              }
              
              // Check if streaming is complete
              if (jsonChunk.done) {
                break
              }
            } catch (e) {
              // Skip invalid JSON lines
              console.warn("Failed to parse chunk:", line)
            }
          }
        }
      }

      // If no content was received, show error
      if (accumulatedText.trim() === "") {
        throw new Error("No response received from bot")
      }

    } catch (error) {
      console.error("Error in handleSendMessage:", error)
      setError("Failed to get response from bot")
      
      // Remove the empty bot message if there was an error
      setMessages((prev) => prev.filter((msg) => msg.id !== botMessageId))
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
          className="bg-white rounded-lg shadow-lg w-[90vw] sm:w-[460px] mb-2 flex flex-col border border-gray-200 overflow-hidden relative"
          style={{ minWidth: '250px' }}
        >
          <div className="bg-green-600 text-white p-3 flex justify-between items-center">
            <div>
              <h3 className="font-medium">ISHEMA RYANJYE Support</h3>
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

          <div className="flex-1 p-3 overflow-y-auto max-h-[500px] min-h-[390px] sm:max-h-[500px] sm:min-h-[415px] bg-gray-50">
            {showStartupButtons && botConfig?.commonButtons && messages.length === 1 && (
              <div className="mb-3">
                <div className="flex flex-wrap gap-1.5 max-w-full">
                  {botConfig.commonButtons.map((button, index) => (
                    <button
                      key={index}
                      onClick={() => handleButtonClick(button.buttonPrompt)}
                      disabled={isLoading}
                      className="bg-gray-200 text-gray-800 border border-green-500 font-medium py-1.5 px-2.5 rounded-md transition-all duration-200 hover:bg-green-50 hover:border-green-600 active:bg-green-100 shadow-sm text-xs disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {button.buttonText}
                    </button>
                  ))}
                </div>
              </div>
            )}
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
                  <div 
                    className={`text-sm leading-relaxed ${
                      message.sender === "user" 
                        ? `text-white 
                           [&_strong]:font-bold 
                           [&_em]:italic 
                           [&_code]:bg-green-700 [&_code]:text-green-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono
                           [&_pre]:bg-green-700 [&_pre]:text-green-100 [&_pre]:text-xs [&_pre]:font-mono [&_pre]:rounded [&_pre]:p-2 [&_pre]:mt-1 [&_pre]:mb-1 [&_pre]:overflow-x-auto
                           [&_a]:text-green-200 [&_a]:underline hover:[&_a]:no-underline [&_a]:cursor-pointer`
                        : `text-gray-800 
                           [&_strong]:font-bold [&_strong]:text-gray-900 
                           [&_em]:italic [&_em]:text-gray-700
                           [&_code]:bg-gray-100 [&_code]:text-gray-700 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:font-mono
                           [&_pre]:bg-gray-50 [&_pre]:text-gray-800 [&_pre]:text-xs [&_pre]:font-mono [&_pre]:rounded [&_pre]:p-2 [&_pre]:mt-1 [&_pre]:mb-1 [&_pre]:overflow-x-auto [&_pre]:border [&_pre]:border-gray-200
                           [&_a]:text-blue-600 [&_a]:underline hover:[&_a]:no-underline [&_a]:cursor-pointer`
                    }`}
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(message.text) }}
                  />
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
