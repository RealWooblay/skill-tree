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
import { LoadingBar } from "@/components/loading-bar"
import { Textarea } from "@/components/ui/textarea"

interface Message {
  role: "assistant" | "user"
  content: string
}

interface Question {
  question: string
}

interface SkillTreeNode {
  id: string
  title: string
  description: string
  level: number
  quests: any[]
}

export default function HomePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [messages, setMessages] = useState<Message[]>([])
  const [currentAnswer, setCurrentAnswer] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})

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

  const handleCreateTree = async (title: string, description: string, category: string) => {
    const newTreeId = `tree-${Date.now()}`
    const newTree = {
      id: newTreeId,
      title,
      description,
      category,
      createdAt: new Date().toISOString(),
      nodes: []
    }

    // Save to localStorage
    const savedTrees = JSON.parse(localStorage.getItem("skillTrees") || "[]")
    savedTrees.push(newTree)
    localStorage.setItem("skillTrees", JSON.stringify(savedTrees))
    localStorage.setItem("activeTreeId", newTreeId)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsThinking(true)
    setError(null)

    // Add user's input to messages
    setMessages((prev) => [
      ...prev,
      { role: "user", content: currentAnswer }
    ])

    try {
      // Convert answers object to array format
      const answersArray = Object.entries(answers).map(([question, answer]) => ({
        question,
        answer
      }))

      const response = await fetch("/api/generate-skill-tree", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: currentAnswer,
          answers: answersArray,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate skill tree")
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error("No response stream available")
      }

      let result = ""
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        // Convert the chunk to text
        const chunk = new TextDecoder().decode(value)
        result += chunk
      }

      // Parse the complete response
      const data = JSON.parse(result)
      console.log("API Response:", data)

      if (data.questions) {
        setFollowUpQuestions(data.questions)
        setCurrentQuestionIndex(0)
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.questions[0] }
        ])
        setIsThinking(false)
        // Clear the input after successful submission
        setCurrentAnswer("")
        return
      }

      if (data.skillTree) {
        // Save the skill tree response
        localStorage.setItem("newSkillTreeResponse", JSON.stringify(data.skillTree))

        // Create the skill tree
        await handleCreateTree(
          data.skillTree.title || "New Skill Tree",
          data.skillTree.description || "A skill tree to help you learn and grow",
          data.skillTree.category || "General"
        )

        // Redirect to skill tree page
        router.push("/skill-tree")
      }
    } catch (error) {
      console.error("Error generating skill tree:", error)
      setError(error instanceof Error ? error.message : "Failed to generate skill tree")
      setIsThinking(false)
    }
  }

  const handleAnswer = async (answer: string) => {
    if (!answer.trim()) return

    console.log("Handling answer:", answer)
    console.log("Current question index:", currentQuestionIndex)
    console.log("Total questions:", followUpQuestions.length)

    const currentQuestion = followUpQuestions[currentQuestionIndex]

    // Add user's answer to messages
    setMessages((prev) => [
      ...prev,
      { role: "user", content: answer },
    ])

    // Clear the input immediately
    setCurrentAnswer("")

    // Save the answer
    setAnswers(prev => {
      const newAnswers = { ...prev, [currentQuestion]: answer }
      console.log("Updated answers:", newAnswers)
      return newAnswers
    })

    if (currentQuestionIndex < followUpQuestions.length - 1) {
      console.log("Moving to next question")
      // Add next question to messages
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: followUpQuestions[currentQuestionIndex + 1] }
      ])
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      console.log("All questions answered, proceeding with generation")
      setIsThinking(true)
      // All questions answered, proceed with generation
      try {
        const response = await fetch("/api/generate-skill-tree", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: currentAnswer,
            answers: Object.entries(answers).map(([question, answer]) => ({
              question,
              answer
            }))
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to generate skill tree")
        }

        const data = await response.json()
        console.log("Final API Response:", data)

        if (data.skillTree) {
          console.log("Received skill tree, starting generation...")
          console.log("Skill tree data:", JSON.stringify(data.skillTree, null, 2))

          // Validate skill tree structure
          if (!data.skillTree.title || !data.skillTree.description || !Array.isArray(data.skillTree.nodes)) {
            console.error("Invalid skill tree structure:", data.skillTree)
            throw new Error("Invalid skill tree structure: missing required properties")
          }

          // Add generation message
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: "Analyzing your responses and generating a personalized skill tree...",
            },
          ])

          // Transform nodes to include UI properties
          const transformedNodes = data.skillTree.nodes.map((node: any) => {
            // Generate a unique ID if missing
            const id = node.id || `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

            // Ensure title and description exist
            const title = node.title || "Untitled Node"
            const description = node.description || "No description provided"

            // Convert level to number if it's a string
            const level = typeof node.level === 'string'
              ? node.level.toLowerCase() === 'beginner' ? 0
                : node.level.toLowerCase() === 'intermediate' ? 1
                  : node.level.toLowerCase() === 'advanced' ? 2
                    : parseInt(node.level) || 0
              : typeof node.level === 'number' ? node.level : 0

            // Ensure position is an object with x and y
            const position = typeof node.position === 'object' && node.position !== null
              ? { x: node.position.x || 0, y: node.position.y || 0 }
              : { x: 0, y: 0 }

            // Ensure quests is an array with proper structure
            const quests = Array.isArray(node.quests)
              ? node.quests.map((quest: any) => ({
                id: quest.id || `quest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                title: quest.title || quest.description || "Untitled Quest",
                description: quest.description || "No description provided",
                resources: Array.isArray(quest.resources)
                  ? quest.resources.map((resource: any) => ({
                    title: resource.title || resource.url || "Untitled Resource",
                    url: resource.url || "#",
                    type: resource.type || "Resource"
                  }))
                  : [],
                verification: quest.verification || "Complete the quest to verify"
              }))
              : node.quest
                ? [{
                  id: `quest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  title: node.quest.description || "Untitled Quest",
                  description: node.quest.description || "No description provided",
                  resources: Array.isArray(node.quest.resources)
                    ? node.quest.resources.map((url: string) => ({
                      title: url,
                      url,
                      type: "Resource"
                    }))
                    : [],
                  verification: node.quest.verification || "Complete the quest to verify"
                }]
                : []

            return {
              id,
              title,
              description,
              level,
              position,
              quests,
              parentIds: Array.isArray(node.parentIds) ? node.parentIds : [],
              color: node.color || '#34D399',
              xp: typeof node.xp === 'number' ? node.xp : 100,
              type: node.type || 'theory',
              completed: false,
              locked: level > 0
            }
          })

          // Create proper skill tree structure
          const newTree = {
            id: Date.now().toString(),
            title: data.skillTree.title || "Untitled Skill Tree",
            description: data.skillTree.description || "No description provided",
            nodes: transformedNodes,
            createdAt: new Date().toISOString(),
          }

          // Save the skill tree
          const savedTrees = JSON.parse(localStorage.getItem("skillTrees") || "[]")
          console.log("Saving skill tree:", JSON.stringify(newTree, null, 2))
          savedTrees.push(newTree)
          localStorage.setItem("skillTrees", JSON.stringify(savedTrees))
          localStorage.setItem("newSkillTreeResponse", JSON.stringify(newTree))

          // Add completion message
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: "Skill tree generated successfully! Preparing your learning journey...",
            },
          ])

          // Clear all states
          setIsThinking(false)
          setIsGenerating(false)
          setFollowUpQuestions([])
          setCurrentQuestionIndex(0)
          setAnswers({})

          // Redirect immediately
          router.push("/skill-tree")
        } else {
          throw new Error("Invalid response format from API")
        }
      } catch (error) {
        console.error("Error generating skill tree:", error)
        setIsGenerating(false)
        setIsThinking(false)
        setError("Failed to generate skill tree. Please try again.")
      }
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 relative">
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
              {/* Terminal-like Messages */}
              <div className="space-y-2 max-h-[400px] overflow-y-auto font-mono text-sm bg-black/50 p-4 rounded-lg">
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
                        {message.role === "assistant" ? "> " : "$ "}
                      </span>
                      {message.content}
                    </motion.div>
                  ))}
                  {isThinking && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-primary"
                    >
                      <span className="font-bold">{'>'} </span>
                      <span className="inline-flex">
                        <span className="animate-[bounce_1s_infinite_0ms]">.</span>
                        <span className="animate-[bounce_1s_infinite_200ms]">.</span>
                        <span className="animate-[bounce_1s_infinite_400ms]">.</span>
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Textarea
                  ref={inputRef}
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder={isGenerating ? "Generating your skill tree..." : "Type your answer..."}
                  className="min-h-[40px] max-h-[120px] font-mono bg-black/50 text-white border-primary/20 resize-none"
                  disabled={isGenerating || isThinking}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      if (followUpQuestions.length > 0) {
                        handleAnswer(currentAnswer)
                      } else {
                        handleSubmit(e)
                      }
                    }
                  }}
                />
                <Button
                  type="submit"
                  disabled={isGenerating || isThinking || !currentAnswer.trim()}
                  size="icon"
                  className="shrink-0"
                >
                  <Send className="h-4 w-4" />
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
                <li>• "I want to learn Spanish, focusing on conversational skills and grammar"</li>
                <li>• "Help me learn web development, starting with HTML, CSS, and JavaScript"</li>
                <li>• "Create a skill tree for learning digital art, focusing on character design"</li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  )
}
