"use client"

import type React from "react"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, RotateCcw, Check, Lock, Star, BookOpen, Beaker, Code } from "lucide-react"

interface SkillNode {
  id: string
  title: string
  description: string
  level: number
  position: { x: number; y: number }
  completed: boolean
  locked: boolean
  parentIds: string[]
  color: string
  xp: number
  type: "theory" | "practical" | "test" | "default" // Add node type
}

interface SkillTreeProps {
  nodes: SkillNode[]
  onNodeSelect: (node: SkillNode) => void
  onNodeComplete: (nodeId: string) => void
}

export function SkillTree({ nodes, onNodeSelect, onNodeComplete }: SkillTreeProps) {
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null)
  const [xpBursts, setXpBursts] = useState<{ id: string; x: number; y: number; value: number }[]>([])
  const svgRef = useRef<SVGSVGElement>(null)

  // Handle node selection
  const handleNodeClick = (node: SkillNode) => {
    if (node.locked) return
    setSelectedNode(node)
    onNodeSelect(node)
  }

  // Handle node completion
  const handleNodeComplete = (node: SkillNode, event: React.MouseEvent) => {
    event.stopPropagation()
    if (node.completed || node.locked) return

    // Create XP burst animation
    const rect = (event.target as HTMLElement).getBoundingClientRect()
    const svgRect = svgRef.current?.getBoundingClientRect()

    if (svgRect) {
      const x = rect.left - svgRect.left + rect.width / 2
      const y = rect.top - svgRect.top + rect.height / 2

      const newBurst = {
        id: `burst-${Date.now()}`,
        x,
        y,
        value: node.xp,
      }

      setXpBursts((prev) => [...prev, newBurst])

      // Create confetti effect
      createConfetti(x, y)

      // Add sci-fi completion animation to the node
      const nodeElement = document.querySelector(`g[data-node-id="${node.id}"]`)
      if (nodeElement) {
        nodeElement.classList.add("quest-complete-animation")

        // Create energy field effect
        const energyField = document.createElementNS("http://www.w3.org/2000/svg", "circle")
        energyField.setAttribute("r", "45")
        energyField.setAttribute("fill", "none")
        energyField.setAttribute("stroke", node.color)
        energyField.setAttribute("stroke-width", "2")
        energyField.setAttribute("opacity", "0.6")
        energyField.classList.add("energy-field")
        nodeElement.appendChild(energyField)

        // Create orbital particles
        for (let i = 0; i < 5; i++) {
          const particle = document.createElementNS("http://www.w3.org/2000/svg", "circle")
          particle.setAttribute("r", "3")
          particle.setAttribute("fill", i % 2 === 0 ? node.color : "#FFFFFF")
          particle.setAttribute("opacity", "0.8")
          particle.style.animationDelay = `${i * 0.2}s`
          particle.classList.add("orbital-particle")
          nodeElement.appendChild(particle)
        }

        // Create a pulse wave
        const pulseWave = document.createElementNS("http://www.w3.org/2000/svg", "circle")
        pulseWave.setAttribute("r", "0")
        pulseWave.setAttribute("fill", "none")
        pulseWave.setAttribute("stroke", node.color)
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

        // Remove animation class after it completes
        setTimeout(() => {
          nodeElement.classList.remove("quest-complete-animation")
          energyField.remove()
          pulseWave.remove()
          // Keep the orbital particles for completed nodes
        }, 1500)
      }

      // Remove burst after animation completes
      setTimeout(() => {
        setXpBursts((prev) => prev.filter((burst) => burst.id !== newBurst.id))
      }, 1000)
    }

    onNodeComplete(node.id)
  }

  // Add a function to create confetti
  const createConfetti = (x: number, y: number) => {
    const confettiCount = 30
    const confettiColors = ["#9333EA", "#00FFFF", "#34D399"]

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement("div")
      confetti.className = "confetti"
      confetti.style.left = `${x}px`
      confetti.style.top = `${y}px`
      confetti.style.backgroundColor = confettiColors[Math.floor(Math.random() * confettiColors.length)]
      confetti.style.animationDuration = `${1 + Math.random()}s`
      confetti.style.animationDelay = `${Math.random() * 0.5}s`

      // Random direction
      const angle = Math.random() * Math.PI * 2
      const distance = 50 + Math.random() * 50
      confetti.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) rotate(${Math.random() * 360}deg)`

      svgRef.current?.parentElement?.appendChild(confetti)

      // Remove confetti after animation
      setTimeout(() => {
        confetti.remove()
      }, 2000)
    }
  }

  // Draw connections between nodes
  const renderConnections = () => {
    return nodes.flatMap((node) => {
      return node.parentIds.map((parentId) => {
        const parent = nodes.find((n) => n.id === parentId)
        if (!parent) return null

        const startX = parent.position.x
        const startY = parent.position.y
        const endX = node.position.x
        const endY = node.position.y

        // Calculate control points for curved lines
        const midX = (startX + endX) / 2
        const midY = (startY + endY) / 2
        const curveFactor = 30

        // Determine if horizontal or vertical curve
        const isHorizontal = Math.abs(endX - startX) > Math.abs(endY - startY)
        const controlX = isHorizontal ? midX : midX + curveFactor
        const controlY = isHorizontal ? midY + curveFactor : midY

        const path = `M${startX},${startY} Q${controlX},${controlY} ${endX},${endY}`

        const isActive = parent.completed && !node.completed && !node.locked
        const isCompleted = parent.completed && node.completed

        return (
          <motion.path
            key={`${node.id}-${parentId}`}
            d={path}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{
              pathLength: 1,
              opacity: 1,
              stroke: isCompleted ? node.color : isActive ? "rgba(255, 255, 255, 0.7)" : "rgba(255, 255, 255, 0.2)",
            }}
            transition={{ duration: 1, delay: 0.2 }}
            strokeWidth={isCompleted ? 3 : 2}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={isActive ? "5 5" : "none"}
          />
        )
      })
    })
  }

  return (
    <div className="w-full h-full relative">
      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={2}
        centerOnInit
        limitToBounds={false}
        wheel={{ step: 0.05 }}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            {/* Zoom controls */}
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <Button variant="outline" size="icon" onClick={() => zoomIn()}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => zoomOut()}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => resetTransform()}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>

            <TransformComponent
              wrapperStyle={{ width: "100%", height: "100%" }}
              contentStyle={{ width: "100%", height: "100%" }}
            >
              <svg ref={svgRef} width="100%" height="100%" viewBox="0 0 1000 600" className="bg-transparent">
                {/* Connections between nodes */}
                {renderConnections()}

                {/* Nodes */}
                {nodes.map((node) => {
                  const isSelected = selectedNode?.id === node.id

                  return (
                    <g
                      key={node.id}
                      data-node-id={node.id}
                      transform={`translate(${node.position.x}, ${node.position.y})`}
                      onClick={() => handleNodeClick(node)}
                      className={cn(
                        "cursor-pointer",
                        node.completed && "completed",
                        node.locked && "opacity-50 cursor-not-allowed",
                      )}
                    >
                      {/* Node background */}
                      <motion.circle
                        r={30}
                        fill="rgba(0, 0, 0, 0.5)"
                        stroke={node.color}
                        strokeWidth={node.completed ? 3 : 2}
                        initial={{ scale: 0 }}
                        animate={{
                          scale: 1,
                          filter: node.completed ? `drop-shadow(0 0 10px ${node.color})` : "none",
                        }}
                        transition={{ duration: 0.5, delay: 0.1 * node.level }}
                      />

                      {/* Selection indicator */}
                      {isSelected && (
                        <motion.circle
                          r={36}
                          fill="none"
                          stroke="white"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        />
                      )}

                      {/* Node icon - Fix the check icon appearing on incomplete nodes */}
                      <foreignObject x="-15" y="-15" width="30" height="30" className="pointer-events-none">
                        <div className="flex items-center justify-center w-full h-full text-white">
                          {node.locked ? (
                            <Lock className="h-4 w-4" />
                          ) : node.completed ? (
                            <Check className="h-5 w-5" />
                          ) : node.type === "theory" ? (
                            <BookOpen className="h-5 w-5" />
                          ) : node.type === "practical" ? (
                            <Code className="h-5 w-5" />
                          ) : node.type === "test" ? (
                            <Beaker className="h-5 w-5" />
                          ) : (
                            <Star className="h-5 w-5" />
                          )}
                        </div>
                      </foreignObject>

                      {/* Node title */}
                      <text
                        y="45"
                        textAnchor="middle"
                        fill="white"
                        fontSize="12"
                        fontWeight="bold"
                        className="pointer-events-none"
                      >
                        {node.title}
                      </text>

                      {/* Complete button - only show for nodes that are ready to complete */}
                      {!node.completed &&
                        !node.locked &&
                        node.parentIds.every((parentId) => {
                          const parent = nodes.find((n) => n.id === parentId)
                          return parent?.completed
                        }) && (
                          <foreignObject x="-15" y="-50" width="30" height="30">
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-6 w-6 rounded-full bg-background/50 border-primary hover:bg-primary hover:text-primary-foreground"
                              onClick={(e) => handleNodeComplete(node, e)}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          </foreignObject>
                        )}

                      {/* XP indicator for completed nodes */}
                      {node.completed && (
                        <text
                          y="-40"
                          textAnchor="middle"
                          fill={node.color}
                          fontSize="12"
                          fontWeight="bold"
                          className="pointer-events-none glow-text"
                        >
                          +{node.xp} XP
                        </text>
                      )}
                    </g>
                  )
                })}

                {/* XP Bursts */}
                {xpBursts.map((burst) => (
                  <g key={burst.id} transform={`translate(${burst.x}, ${burst.y})`} className="xp-burst">
                    <text textAnchor="middle" fill="#00ffff" fontSize="16" fontWeight="bold" className="glow-text">
                      +{burst.value} XP
                    </text>
                  </g>
                ))}
              </svg>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  )
}
