"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { TerminalInput } from "@/components/terminal-input"
import { ParticleBackground } from "@/components/particles"
import { Navigation } from "@/components/navigation"

export default function WelcomePage() {
  const router = useRouter()
  const [onboardingComplete, setOnboardingComplete] = useState(false)

  // Questions for the onboarding process
  const questions = [
    "What do you want to achieve in life right now?",
    "What areas of personal growth are most important to you? (e.g., health, career, relationships)",
    "What specific skills would you like to develop?",
    "How much time can you dedicate to your growth each week?",
  ]

  // Update the handleOnboardingComplete function to save the new skill tree without resetting existing ones
  const handleOnboardingComplete = (responses: string[]) => {
    console.log("Onboarding responses:", responses)
    setOnboardingComplete(true)

    // Store the responses in localStorage to use when creating the skill tree
    localStorage.setItem("skillTreeResponses", JSON.stringify(responses))

    // Redirect to skill tree after a delay
    setTimeout(() => {
      router.push("/skill-tree")
    }, 3000)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center relative overflow-hidden">
      <ParticleBackground />
      <Navigation />

      <div className="container max-w-4xl px-4 py-8 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-primary glow-text mb-4">SkillTree</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Level up your life with our gamified self-growth platform
          </p>
        </motion.div>

        {onboardingComplete ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <h2 className="text-2xl font-bold text-secondary glow-text mb-4">Generating Your Skill Tree...</h2>
            <div className="flex justify-center">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-primary animate-spin" />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-card border border-border rounded-lg shadow-lg overflow-hidden h-[500px]"
          >
            <div className="bg-background/50 p-2 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-destructive" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-accent" />
                <div className="flex-1 text-center text-xs font-mono text-muted-foreground">
                  SkillTree AI Onboarding
                </div>
              </div>
            </div>

            <TerminalInput questions={questions} onComplete={handleOnboardingComplete} />
          </motion.div>
        )}
      </div>
    </main>
  )
}
