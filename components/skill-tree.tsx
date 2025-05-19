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
  type: "theory" | "practical" | "test" | "default"
  category: string
}

interface SkillTreeProps {
  nodes: SkillNode[]
  onNodeSelect: (node: SkillNode) => void
  onNodeComplete?: (nodeId: string) => void
  completedNodes?: number
}

export function SkillTree({ nodes, onNodeSelect, onNodeComplete, completedNodes }: SkillTreeProps) {
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null)
  const [xpBursts, setXpBursts] = useState<{ id: string; x: number; y: number; value: number }[]>([])
  const svgRef = useRef<SVGSVGElement>(null)

  // Handle node selection
  const handleNodeClick = (node: SkillNode) => {
    if (node.locked) return
    setSelectedNode(node)
    onNodeSelect(node)
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
              <svg
                ref={svgRef}
                width="100%"
                height="100%"
                viewBox="-500 -300 2000 1200"
                className="bg-transparent"
                style={{ overflow: 'visible' }}
              >
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

                      {/* Node icon */}
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
