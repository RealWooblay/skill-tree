"use client"

import { useState, useEffect } from "react"
import { AnimatePresence } from "framer-motion"
import { SkillTree } from "@/components/skill-tree"
import { QuestPanel } from "@/components/quest-panel"
import { XpBar } from "@/components/xp-bar"
import { ParticleBackground } from "@/components/particles"
import { Navigation } from "@/components/navigation"
import { SkillTreeSelector, type SkillTreeInfo } from "@/components/skill-tree-selector"
import { NodeCompletionAnimation } from "@/components/node-completion-animation"
import { LoadingBar } from "@/components/loading-bar"

// Helper functions for node positioning
function calculateNodeX(index: number, level: number, totalNodes: number): number {
  // Calculate how many nodes are at this level
  const nodesAtLevel = Math.ceil(totalNodes / 3) // Assuming 3 levels max
  const spacing = 400 // Horizontal spacing between nodes
  const baseOffset = -((nodesAtLevel - 1) * spacing) / 2 // Center the nodes

  // Add some randomness to prevent perfect alignment
  const jitter = (Math.random() - 0.5) * 50

  return baseOffset + (index * spacing) + jitter
}

function calculateNodeY(level: number): number {
  const baseSpacing = 300 // Vertical spacing between levels
  const jitter = (Math.random() - 0.5) * 30 // Small vertical jitter

  return (level * baseSpacing) + jitter
}

// Add type definitions at the top
type NodeType = "default" | "theory" | "practical" | "test"

interface Position {
  x: number
  y: number
}

interface SkillNode {
  id: string
  title: string
  description: string
  level: number
  position: Position
  completed: boolean
  locked: boolean
  parentIds: string[]
  color: string
  xp: number
  type: NodeType
  category: string
}

interface Quest {
  id: string
  title: string
  description: string
  nodeId: string
  completed: boolean
  resources: { title: string; url: string; type: string }[]
}

interface CompletedQuestsMap {
  [key: string]: boolean
}

const getQuestsFromAI = (node: SkillNode): Quest[] => {
  const storedSkillTrees = localStorage.getItem("skillTrees")
  if (!storedSkillTrees) return []

  try {
    const skillTrees = JSON.parse(storedSkillTrees)
    const skillTree = skillTrees[skillTrees.length - 1]
    if (!skillTree?.nodes) return []

    const aiNode = skillTree.nodes.find((n: any) => n.id === node.id)
    if (!aiNode?.quests) {
      console.log("No quests found for node:", node.id, "Node data:", aiNode)
      return []
    }

    // Ensure quests is an array
    const quests = Array.isArray(aiNode.quests) ? aiNode.quests : [aiNode.quests]

    return quests.map((quest: any) => ({
      id: `${node.id}-${quest.id || Math.random().toString(36).substr(2, 9)}`,
      title: quest.title || "Untitled Quest",
      description: quest.description || "No description provided",
      nodeId: node.id,
      completed: false,
      resources: Array.isArray(quest.resources) ? quest.resources : []
    }))
  } catch (error) {
    console.error("Error loading quests from AI response:", error)
    return []
  }
}

export default function SkillTreePage() {
  const [activeTreeId, setActiveTreeId] = useState("")
  const [nodes, setNodes] = useState<SkillNode[]>([])
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null)
  const [quests, setQuests] = useState<Quest[]>([])
  const [xp, setXp] = useState(0)
  const [level, setLevel] = useState(1)
  const [maxXp, setMaxXp] = useState(200)
  const [skillTrees, setSkillTrees] = useState<SkillTreeInfo[]>([])
  const [completedNodeAnimation, setCompletedNodeAnimation] = useState<{
    visible: boolean
    nodeTitle: string
    xpGained: number
  }>({ visible: false, nodeTitle: "", xpGained: 0 })
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)

  // Load skill trees from localStorage on mount
  useEffect(() => {
    const storedSkillTrees = localStorage.getItem("skillTrees")
    if (storedSkillTrees) {
      try {
        const skillTrees = JSON.parse(storedSkillTrees)
        // Get the most recent skill tree
        const skillTree = skillTrees[skillTrees.length - 1]
        if (!skillTree) return

        // Load completed nodes state
        const nodes = skillTree.nodes || []
        const completedNodes = nodes.filter((node: SkillNode) => node.completed).length

        setNodes(nodes)
        setActiveTreeId(skillTree.id)
        setSkillTrees([{
          id: skillTree.id,
          title: skillTree.title || "Untitled Skill Tree",
          description: skillTree.description || "No description available",
          category: skillTree.category || "Uncategorized",
          lastUpdated: skillTree.createdAt || new Date().toISOString(),
          nodeCount: nodes.length,
          completedNodes: completedNodes
        }])
      } catch (error) {
        console.error("Error loading skill tree:", error)
      }
    }
  }, [])

  // Add effect to update nodes when active tree changes
  useEffect(() => {
    const storedSkillTrees = localStorage.getItem("skillTrees")
    if (storedSkillTrees && activeTreeId) {
      try {
        const skillTrees = JSON.parse(storedSkillTrees)
        const skillTree = skillTrees.find((tree: any) => tree.id === activeTreeId)
        if (skillTree) {
          setNodes(skillTree.nodes || [])
          // Update the skill trees list with the correct title and description
          setSkillTrees(prev => prev.map(tree =>
            tree.id === activeTreeId ? {
              ...tree,
              title: skillTree.title || "Untitled Skill Tree",
              description: skillTree.description || "No description available",
              nodeCount: skillTree.nodes?.length || 0,
              completedNodes: skillTree.nodes?.filter((node: any) => node.completed).length || 0
            } : tree
          ))
        }
      } catch (error) {
        console.error("Error loading skill tree nodes:", error)
      }
    }
  }, [activeTreeId])

  // Add effect to update skill trees list when it changes
  useEffect(() => {
    const storedSkillTrees = localStorage.getItem("skillTrees")
    if (storedSkillTrees) {
      try {
        const skillTrees = JSON.parse(storedSkillTrees)
        const formattedTrees = skillTrees.map((tree: any) => ({
          id: tree.id,
          title: tree.title,
          description: tree.description,
          category: tree.category || "Uncategorized",
          lastUpdated: tree.createdAt || new Date().toISOString(),
          nodeCount: tree.nodes?.length || 0,
          completedNodes: tree.nodes?.filter((node: any) => node.completed).length || 0
        }))
        setSkillTrees(formattedTrees)
      } catch (error) {
        console.error("Error updating skill trees:", error)
      }
    }
  }, [])

  // Load completed quests from localStorage
  useEffect(() => {
    const savedQuests = localStorage.getItem('completedQuests')
    if (savedQuests) {
      try {
        const parsedQuests = JSON.parse(savedQuests) as CompletedQuestsMap
        setQuests(prevQuests => {
          return prevQuests.map((quest: Quest) => ({
            ...quest,
            completed: parsedQuests[quest.id] || false
          }))
        })
      } catch (error) {
        console.error('Error loading completed quests:', error)
      }
    }
  }, [selectedNode])

  // Initialize quests when a node is selected
  useEffect(() => {
    if (selectedNode) {
      const savedQuests = localStorage.getItem(`completedQuests-${selectedNode.id}`)
      const completedQuests = savedQuests ? JSON.parse(savedQuests) as CompletedQuestsMap : {}

      const aiQuests = getQuestsFromAI(selectedNode)
      console.log("Loaded quests for node:", selectedNode.id, aiQuests)

      if (aiQuests.length > 0) {
        const questsWithCompletion = aiQuests.map(quest => ({
          ...quest,
          completed: completedQuests[quest.id] || false
        }))
        setQuests(questsWithCompletion)
      } else {
        console.log("No quests found for node:", selectedNode.id)
        setQuests([])
      }
    } else {
      setQuests([])
    }
  }, [selectedNode])

  // Handle quest completion
  const handleQuestComplete = (questId: string) => {
    setQuests((prevQuests) => {
      const updatedQuests = prevQuests.map((q) =>
        q.id === questId ? { ...q, completed: true } : q
      )

      // Save completed quest to localStorage
      if (selectedNode) {
        const completedQuests = updatedQuests.reduce<CompletedQuestsMap>((acc, quest) => {
          if (quest.completed) {
            acc[quest.id] = true
          }
          return acc
        }, {})
        localStorage.setItem(`completedQuests-${selectedNode.id}`, JSON.stringify(completedQuests))
      }

      // Check if all quests for this node are completed
      const allQuestsCompleted = updatedQuests.every((q) => q.completed)
      if (allQuestsCompleted && selectedNode) {
        handleNodeComplete(selectedNode.id)
      }

      return updatedQuests
    })

    // Add XP for completing quest
    setXp((prev) => prev + 10)
  }

  // Calculate level based on XP
  useEffect(() => {
    const newLevel = Math.floor(xp / 200) + 1
    if (newLevel !== level) {
      setLevel(newLevel)
      setMaxXp((newLevel + 1) * 200)
    }
  }, [xp, level])

  // Handle node selection
  const handleNodeSelect = (node: SkillNode) => {
    setSelectedNode(node)
  }

  // Handle node completion
  const handleNodeComplete = (nodeId: string) => {
    setNodes((prevNodes) => {
      const updatedNodes = prevNodes.map((node) => {
        if (node.id === nodeId) {
          // Mark this node as completed
          return { ...node, completed: true }
        }

        // Unlock child nodes if their parents are completed
        if (node.locked && node.parentIds.includes(nodeId)) {
          const allParentsCompleted = node.parentIds.every((parentId) => {
            const parent = prevNodes.find((n) => n.id === parentId)
            return parent?.completed || parentId === nodeId
          })

          if (allParentsCompleted) {
            return { ...node, locked: false }
          }
        }

        return node
      })

      // Find the completed node to add XP
      const completedNode = prevNodes.find((node) => node.id === nodeId)
      if (completedNode) {
        setXp((prev) => prev + completedNode.xp)

        // Show completion animation
        setCompletedNodeAnimation({
          visible: true,
          nodeTitle: completedNode.title,
          xpGained: completedNode.xp,
        })
      }

      // Update skill tree info
      setSkillTrees((prev) =>
        prev.map((tree) => (tree.id === activeTreeId ? { ...tree, completedNodes: tree.completedNodes + 1 } : tree)),
      )

      // Save updated nodes to localStorage
      const storedSkillTrees = localStorage.getItem("skillTrees")
      if (storedSkillTrees) {
        try {
          const trees = JSON.parse(storedSkillTrees)
          const updatedTrees = trees.map((tree: any) =>
            tree.id === activeTreeId ? { ...tree, nodes: updatedNodes } : tree
          )
          localStorage.setItem("skillTrees", JSON.stringify(updatedTrees))
        } catch (error) {
          console.error("Error saving node completion:", error)
        }
      }

      return updatedNodes
    })
  }

  // Calculate quest progress percentage
  const calculateProgress = () => {
    if (quests.length === 0) return 0
    const completedCount = quests.filter((quest) => quest.completed).length
    return (completedCount / quests.length) * 100
  }

  // Handle creating a new skill tree
  const handleCreateTree = async (title: string, description: string, category: string) => {
    setIsGenerating(true)
    setGenerationProgress(0)

    // Simulate progress
    const interval = setInterval(() => {
      setGenerationProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 1
      })
    }, 50)

    // Create the tree
    const newTreeId = `tree-${Date.now()}`
    const newTree: SkillTreeInfo = {
      id: newTreeId,
      title,
      description,
      category,
      lastUpdated: new Date().toISOString(),
      nodeCount: 0,
      completedNodes: 0
    }

    // Create initial nodes
    const newNodes: SkillNode[] = [
      {
        id: `${newTreeId}-root`,
        title: "Root",
        description: "Starting point",
        level: 0,
        position: { x: 0, y: 0 },
        completed: false,
        locked: false,
        parentIds: [],
        color: "#4f46e5",
        xp: 50,
        type: "default",
        category
      }
    ]

    // Add additional nodes based on AI response
    const aiResponse = localStorage.getItem("newSkillTreeResponse")
    if (aiResponse) {
      try {
        const response = JSON.parse(aiResponse)
        const nodes = response.nodes || []
        const totalNodes = nodes.length

        nodes.forEach((node: any, index: number) => {
          const nodeType = node.type || "default"
          const nodeId = `${newTreeId}-node-${index + 1}`

          newNodes.push({
            id: nodeId,
            title: node.title || `Node ${index + 1}`,
            description: node.description || "",
            level: node.level || 1,
            position: {
              x: node.position?.x || calculateNodeX(index, node.level || 1, totalNodes),
              y: node.position?.y || calculateNodeY(node.level || 1)
            },
            completed: false,
            locked: node.parentIds?.length > 0,
            parentIds: node.parentIds || [`${newTreeId}-root`],
            color: node.color || "#4f46e5",
            xp: node.xp || 100,
            type: nodeType,
            category
          })
        })
      } catch (error) {
        console.error("Error parsing AI response:", error)
      }
    }

    // Update state
    setNodes(newNodes)
    setSkillTrees((prev) => [...prev, newTree])
    setActiveTreeId(newTreeId)

    // Clear AI response
    localStorage.removeItem("newSkillTreeResponse")

    // Complete loading
    setTimeout(() => {
      setIsGenerating(false)
      setGenerationProgress(0)
    }, 500)
  }

  return (
    <main className="flex min-h-screen flex-col relative">
      <ParticleBackground />
      <Navigation />

      {/* XP Bar */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-30 w-full max-w-md px-4">
        <XpBar currentXp={xp % maxXp} maxXp={maxXp} level={level} />
      </div>

      {/* Skill Tree Selector */}
      <SkillTreeSelector
        skillTrees={skillTrees}
        activeTreeId={activeTreeId}
        onSelectTree={setActiveTreeId}
        onCreateTree={handleCreateTree}
      />

      {/* Skill Tree */}
      <div className="flex-1 w-full h-full">
        <SkillTree
          nodes={nodes}
          onNodeSelect={handleNodeSelect}
          onNodeComplete={handleNodeComplete}
          completedNodes={skillTrees.find(tree => tree.id === activeTreeId)?.completedNodes || 0}
        />
      </div>

      {/* Quest Panel */}
      <AnimatePresence>
        {selectedNode && (
          <div className="fixed top-16 right-4 bottom-4 w-full max-w-md z-20">
            <QuestPanel
              title={selectedNode.title}
              description={selectedNode.description}
              quests={quests}
              xpReward={selectedNode.xp}
              progress={calculateProgress()}
              onComplete={handleQuestComplete}
              onClose={() => setSelectedNode(null)}
              nodeId={selectedNode.id}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Node Completion Animation */}
      <NodeCompletionAnimation
        isVisible={completedNodeAnimation.visible}
        nodeTitle={completedNodeAnimation.nodeTitle}
        xpGained={completedNodeAnimation.xpGained}
        onComplete={() => setCompletedNodeAnimation({ visible: false, nodeTitle: "", xpGained: 0 })}
      />

      {isGenerating && (
        <LoadingBar
          progress={generationProgress}
          message="Creating your skill tree..."
        />
      )}
    </main>
  )
}
