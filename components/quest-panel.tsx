"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, Circle, ChevronRight, Trophy, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface Quest {
  id: string
  title: string
  description: string
  completed: boolean
  resources?: {
    title: string
    url: string
    type: string
  }[]
}

interface QuestPanelProps {
  title: string
  description: string
  quests: Quest[]
  xpReward: number
  progress: number
  onComplete: (questId: string) => void
  onClose: () => void
  nodeId: string
}

export function QuestPanel({
  title,
  description,
  quests,
  xpReward,
  progress,
  onComplete,
  onClose,
  nodeId,
}: QuestPanelProps) {
  const [expandedQuest, setExpandedQuest] = useState<string | null>(null)

  const toggleQuest = (questId: string) => {
    setExpandedQuest(expandedQuest === questId ? null : questId)
  }

  // Update the onComplete function to trigger node completion animation when all quests are completed
  const handleQuestComplete = (questId: string) => {
    // First call the parent onComplete function
    onComplete(questId)

    // Get updated quests (we need to check if this was the last quest)
    const updatedQuests = quests.map((quest) => (quest.id === questId ? { ...quest, completed: true } : quest))

    // Check if all quests are now completed
    const allCompleted = updatedQuests.every((quest) => quest.completed)

    if (allCompleted) {
      // Add a small delay to allow the quest completion animation to finish
      setTimeout(() => {
        // Find the node element in the SVG
        const nodeElement = document.querySelector(`g[data-node-id="${nodeId}"]`)
        if (nodeElement) {
          // Add the winning animation class
          nodeElement.classList.add("node-win-animation")

          // Create a pulse wave
          const pulseWave = document.createElementNS("http://www.w3.org/2000/svg", "circle")
          pulseWave.setAttribute("r", "0")
          pulseWave.setAttribute("fill", "none")
          pulseWave.setAttribute("stroke", "#34D399")
          pulseWave.setAttribute("stroke-width", "3")
          pulseWave.setAttribute("opacity", "0.8")
          nodeElement.appendChild(pulseWave)

          // Animate the pulse wave
          const pulseAnimation = pulseWave.animate(
            [
              { r: 0, opacity: 0.8 },
              { r: 100, opacity: 0 },
            ],
            {
              duration: 1500,
              easing: "ease-out",
            },
          )

          // Remove animation class and elements after animation completes
          setTimeout(() => {
            nodeElement.classList.remove("node-win-animation")
            pulseWave.remove()
          }, 2000)
        }
      }, 300)
    }
  }

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="w-full h-full max-w-md bg-card border border-border rounded-lg shadow-lg flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-border bg-background/50">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-primary glow-text">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <XCircle className="h-5 w-5" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-2">{description}</p>

        {/* Progress bar */}
        <div className="mt-4 space-y-2">
          <div className="flex justify-between text-xs">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* XP reward */}
        <div className="mt-4 flex items-center gap-2 text-secondary text-sm font-mono">
          <Trophy className="h-4 w-4" />
          <span className="glow-text">+{xpReward} XP on completion</span>
        </div>
      </div>

      {/* Quest list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground">QUESTS</h3>

        {quests.map((quest) => (
          <div key={quest.id} className="border border-border rounded-lg overflow-hidden">
            <div
              className={cn(
                "p-3 flex items-center gap-3 cursor-pointer hover:bg-background/50 transition-colors",
                quest.completed && "bg-accent/10",
              )}
              onClick={() => toggleQuest(quest.id)}
            >
              {quest.completed ? (
                <CheckCircle2 className="h-5 w-5 text-accent glow-sm" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}

              <div className="flex-1">
                <h4 className={cn("text-sm font-medium", quest.completed && "text-accent")}>{quest.title}</h4>
              </div>

              <ChevronRight
                className={cn(
                  "h-5 w-5 text-muted-foreground transition-transform",
                  expandedQuest === quest.id && "rotate-90",
                )}
              />
            </div>

            <AnimatePresence>
              {expandedQuest === quest.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-border bg-background/30"
                >
                  <div className="p-3 text-sm text-muted-foreground">{quest.description}</div>

                  {/* Resource links - only show if they exist and have content */}
                  {quest.resources && quest.resources.length > 0 && (
                    <div className="px-3 pb-2">
                      <h5 className="text-xs font-medium text-muted-foreground mb-2">RESOURCES</h5>
                      <div className="space-y-2">
                        {quest.resources.map((resource, index) => {
                          // Skip if no URL
                          if (!resource.url) return null;

                          // Handle different resource types
                          if (resource.type === "video" && resource.url.includes("youtube.com")) {
                            // Extract video ID for thumbnail
                            const videoId = resource.url.split("v=")[1]?.split("&")[0];
                            return videoId ? (
                              <a
                                key={index}
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block text-xs text-secondary hover:text-secondary/80 transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  <img
                                    src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                                    alt={resource.title}
                                    className="w-20 h-12 object-cover rounded"
                                  />
                                  <span>{resource.title}</span>
                                </div>
                              </a>
                            ) : null;
                          }

                          // Default link display
                          return (
                            <a
                              key={index}
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-xs text-secondary hover:text-secondary/80 transition-colors"
                            >
                              {resource.title}
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Complete button - show if quest is not completed */}
                  {!quest.completed && (
                    <div className="p-3 pt-0 flex justify-end">
                      <Button
                        size="sm"
                        onClick={() => handleQuestComplete(quest.id)}
                        className="bg-accent text-accent-foreground hover:bg-accent/90"
                      >
                        Complete
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
