"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Sparkles } from "lucide-react"
import { ParticleBackground } from "@/components/particles"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

interface Message {
  role: "assistant" | "user"
  content: string
}

export default function HomePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [messages, setMessages] = useState<Message[]>([])
  const [currentAnswer, setCurrentAnswer] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Add initial greeting message
  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content: "Hi! I'll help you create a personalized learning path. What skill or topic would you like to learn?",
      },
    ])
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input when messages change
  useEffect(() => {
    inputRef.current?.focus()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentAnswer.trim()) return

    // Add user's answer to messages
    setMessages((prev) => [
      ...prev,
      { role: "user", content: currentAnswer },
    ])

    // Clear current answer
    setCurrentAnswer("")

    // If we have enough information, generate the skill tree
    if (messages.length >= 3) {
      setIsGenerating(true)
      setError(null)

      try {
        const response = await fetch("/api/generate-skill-tree", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: currentAnswer,
            messages: [...messages, { role: "user", content: currentAnswer }]
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || data.details || "Failed to generate skill tree")
        }

        // Save the generated skill tree
        const savedTrees = JSON.parse(localStorage.getItem("skillTrees") || "[]")
        savedTrees.push({
          id: Date.now().toString(),
          ...data,
          createdAt: new Date().toISOString(),
        })
        localStorage.setItem("skillTrees", JSON.stringify(savedTrees))

        // Add success message
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Great! I've created a comprehensive skill tree based on your goals. Let's take a look!",
          },
        ])

        toast({
          title: "Skill Tree Generated!",
          description: "Your personalized learning path is ready.",
        })

        // Navigate to the skill tree page
        router.push("/skill-tree")
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to generate skill tree. Please try again."
        setError(errorMessage)
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "I apologize, but I encountered an error while generating your skill tree. Please try again with more specific details about your learning goals.",
          },
        ])
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setIsGenerating(false)
      }
    } else {
      // Generate next question based on context
      try {
        const response = await fetch("/api/generate-question", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [...messages, { role: "user", content: currentAnswer }]
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to generate question")
        }

        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.question },
        ])
      } catch (err) {
        setError("Failed to generate next question. Please try again.")
        toast({
          title: "Error",
          description: "Failed to generate next question. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <main className="flex min-h-screen flex-col relative">
      <ParticleBackground />
      <Navigation />

      <div className="container max-w-4xl px-4 py-16 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-primary glow-text mb-4">
            Create Your Learning Path
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Let's create a personalized skill tree that matches your learning goals and preferences.
          </p>
        </motion.div>

        <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Chat Messages */}
              <div className="space-y-2 max-h-[400px] overflow-y-auto font-mono text-sm">
                <AnimatePresence>
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`${message.role === "assistant"
                        ? "text-primary"
                        : "text-secondary"
                        }`}
                    >
                      <span className="font-bold">
                        {message.role === "assistant" ? "AI: " : "You: "}
                      </span>
                      {message.content}
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  ref={inputRef}
                  placeholder={isGenerating ? "Generating your skill tree..." : "Type your answer..."}
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  disabled={isGenerating}
                  className="font-mono"
                />
                <Button
                  type="submit"
                  disabled={isGenerating || !currentAnswer.trim()}
                  size="icon"
                  className="shrink-0"
                >
                  {isGenerating ? (
                    <Sparkles className="h-4 w-4 animate-pulse" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>

              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 grid gap-6 md:grid-cols-2"
        >
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Tips for Better Results</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Be specific and detailed in your answers</li>
                <li>• Mention any relevant experience or background</li>
                <li>• Include your preferred learning style</li>
                <li>• Specify any particular areas you want to focus on</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Example Goals</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• "I want to learn web development, starting with HTML, CSS, and JavaScript"</li>
                <li>• "Help me learn digital art, focusing on character design and animation"</li>
                <li>• "Create a skill tree for learning Spanish, from beginner to advanced"</li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  )
}
