"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Message {
  id: string
  text: string
  sender: "user" | "ai"
}

interface TerminalInputProps {
  onComplete: (responses: string[]) => void
  questions: string[]
}

export function TerminalInput({ onComplete, questions }: TerminalInputProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [responses, setResponses] = useState<string[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Add initial message
  useEffect(() => {
    const timer = setTimeout(() => {
      setMessages([
        {
          id: "welcome",
          text: questions[0],
          sender: "ai",
        },
      ])
      setIsTyping(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [questions])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input when typing is done
  useEffect(() => {
    if (!isTyping) {
      inputRef.current?.focus()
    }
  }, [isTyping])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isTyping) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    // Store response
    const newResponses = [...responses, input]
    setResponses(newResponses)

    // Check if we have more questions
    if (currentQuestion < questions.length - 1) {
      // Add AI message after a delay
      setTimeout(() => {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: questions[currentQuestion + 1],
          sender: "ai",
        }
        setMessages((prev) => [...prev, aiMessage])
        setCurrentQuestion((prev) => prev + 1)
        setIsTyping(false)
      }, 1000)
    } else {
      // No more questions, complete the process
      setTimeout(() => {
        onComplete(newResponses)
      }, 1000)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-card border border-border"
                }`}
              >
                <div className="text-sm">
                  {message.sender === "ai" && (
                    <div className="text-xs text-muted-foreground mb-1 font-mono">SkillTree AI:</div>
                  )}
                  {message.text}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="bg-card border border-border p-3 rounded-lg">
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse delay-150" />
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse delay-300" />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-card/50">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your response..."
            className="bg-background border-primary/20 focus-visible:ring-primary"
            disabled={isTyping}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || isTyping}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}
