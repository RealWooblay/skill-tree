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
import { generateQuests } from "@/utils/generateQuests" // Import generateQuests

// Update the initialNodes to include node types
const initialNodes = [
  {
    id: "root",
    title: "Core Skills",
    description: "The foundation of your growth journey",
    level: 0,
    position: { x: 500, y: 100 },
    completed: true,
    locked: false,
    parentIds: [],
    color: "#9333EA", // primary
    xp: 50,
    type: "default",
  },
  {
    id: "mindfulness",
    title: "Mindfulness",
    description: "Develop awareness and presence",
    level: 1,
    position: { x: 350, y: 200 },
    completed: false,
    locked: false,
    parentIds: ["root"],
    color: "#00FFFF", // secondary
    xp: 100,
    type: "theory",
  },
  {
    id: "productivity",
    title: "Productivity",
    description: "Optimize your workflow and focus",
    level: 1,
    position: { x: 650, y: 200 },
    completed: false,
    locked: false,
    parentIds: ["root"],
    color: "#00FFFF", // secondary
    xp: 100,
    type: "theory",
  },
  {
    id: "meditation",
    title: "Meditation",
    description: "Daily meditation practice",
    level: 2,
    position: { x: 250, y: 300 },
    completed: false,
    locked: false,
    parentIds: ["mindfulness"],
    color: "#34D399", // accent
    xp: 150,
    type: "practical",
  },
  {
    id: "journaling",
    title: "Journaling",
    description: "Reflect and process thoughts",
    level: 2,
    position: { x: 450, y: 300 },
    completed: false,
    locked: false,
    parentIds: ["mindfulness"],
    color: "#34D399", // accent
    xp: 150,
    type: "practical",
  },
  {
    id: "time-blocking",
    title: "Time Blocking",
    description: "Schedule focused work periods",
    level: 2,
    position: { x: 550, y: 300 },
    completed: false,
    locked: false,
    parentIds: ["productivity"],
    color: "#34D399", // accent
    xp: 150,
    type: "practical",
  },
  {
    id: "deep-work",
    title: "Deep Work",
    description: "Eliminate distractions for flow",
    level: 2,
    position: { x: 750, y: 300 },
    completed: false,
    locked: false,
    parentIds: ["productivity"],
    color: "#34D399", // accent
    xp: 150,
    type: "practical",
  },
  {
    id: "advanced-meditation",
    title: "Advanced Meditation",
    description: "Extended meditation sessions",
    level: 3,
    position: { x: 200, y: 400 },
    completed: false,
    locked: true,
    parentIds: ["meditation"],
    color: "#F472B6", // pink
    xp: 200,
    type: "test",
  },
  {
    id: "habit-stacking",
    title: "Habit Stacking",
    description: "Build compound habits",
    level: 3,
    position: { x: 350, y: 400 },
    completed: false,
    locked: true,
    parentIds: ["journaling", "time-blocking"],
    color: "#F472B6", // pink
    xp: 200,
    type: "theory",
  },
  {
    id: "flow-state",
    title: "Flow State",
    description: "Achieve optimal performance",
    level: 3,
    position: { x: 650, y: 400 },
    completed: false,
    locked: true,
    parentIds: ["deep-work"],
    color: "#F472B6", // pink
    xp: 200,
    type: "test",
  },
  {
    id: "digital-minimalism",
    title: "Digital Minimalism",
    description: "Reduce digital distractions",
    level: 3,
    position: { x: 800, y: 400 },
    completed: false,
    locked: true,
    parentIds: ["deep-work"],
    color: "#F472B6", // pink
    xp: 200,
    type: "theory",
  },
]

// Add a second skill tree for programming skills
const programmingNodes = [
  {
    id: "prog-root",
    title: "Programming Basics",
    description: "The foundation of programming skills",
    level: 0,
    position: { x: 500, y: 100 },
    completed: true,
    locked: false,
    parentIds: [],
    color: "#9333EA", // primary
    xp: 50,
    type: "default",
  },
  {
    id: "html-css",
    title: "HTML & CSS",
    description: "Web structure and styling",
    level: 1,
    position: { x: 350, y: 200 },
    completed: false,
    locked: false,
    parentIds: ["prog-root"],
    color: "#00FFFF", // secondary
    xp: 100,
    type: "theory",
  },
  {
    id: "javascript",
    title: "JavaScript",
    description: "Web interactivity and logic",
    level: 1,
    position: { x: 650, y: 200 },
    completed: false,
    locked: false,
    parentIds: ["prog-root"],
    color: "#00FFFF", // secondary
    xp: 100,
    type: "theory",
  },
  {
    id: "responsive-design",
    title: "Responsive Design",
    description: "Mobile-friendly layouts",
    level: 2,
    position: { x: 250, y: 300 },
    completed: false,
    locked: false,
    parentIds: ["html-css"],
    color: "#34D399", // accent
    xp: 150,
    type: "practical",
  },
  {
    id: "css-frameworks",
    title: "CSS Frameworks",
    description: "Bootstrap, Tailwind, etc.",
    level: 2,
    position: { x: 450, y: 300 },
    completed: false,
    locked: false,
    parentIds: ["html-css"],
    color: "#34D399", // accent
    xp: 150,
    type: "practical",
  },
  {
    id: "dom-manipulation",
    title: "DOM Manipulation",
    description: "Dynamic HTML updates",
    level: 2,
    position: { x: 550, y: 300 },
    completed: false,
    locked: false,
    parentIds: ["javascript"],
    color: "#34D399", // accent
    xp: 150,
    type: "practical",
  },
  {
    id: "es6-features",
    title: "ES6+ Features",
    description: "Modern JavaScript",
    level: 2,
    position: { x: 750, y: 300 },
    completed: false,
    locked: false,
    parentIds: ["javascript"],
    color: "#34D399", // accent
    xp: 150,
    type: "practical",
  },
  {
    id: "sass",
    title: "Sass/SCSS",
    description: "CSS preprocessors",
    level: 3,
    position: { x: 200, y: 400 },
    completed: false,
    locked: true,
    parentIds: ["responsive-design"],
    color: "#F472B6", // pink
    xp: 200,
    type: "test",
  },
  {
    id: "component-design",
    title: "Component Design",
    description: "Reusable UI components",
    level: 3,
    position: { x: 350, y: 400 },
    completed: false,
    locked: true,
    parentIds: ["css-frameworks", "dom-manipulation"],
    color: "#F472B6", // pink
    xp: 200,
    type: "theory",
  },
  {
    id: "async-js",
    title: "Async JavaScript",
    description: "Promises and async/await",
    level: 3,
    position: { x: 650, y: 400 },
    completed: false,
    locked: true,
    parentIds: ["es6-features"],
    color: "#F472B6", // pink
    xp: 200,
    type: "test",
  },
  {
    id: "frontend-frameworks",
    title: "Frontend Frameworks",
    description: "React, Vue, Angular",
    level: 3,
    position: { x: 800, y: 400 },
    completed: false,
    locked: true,
    parentIds: ["es6-features"],
    color: "#F472B6", // pink
    xp: 200,
    type: "theory",
  },
]

// Add a third skill tree for language learning
const languageNodes = [
  {
    id: "lang-root",
    title: "Language Basics",
    description: "The foundation of language learning",
    level: 0,
    position: { x: 500, y: 100 },
    completed: true,
    locked: false,
    parentIds: [],
    color: "#9333EA", // primary
    xp: 50,
    type: "default",
  },
  {
    id: "vocabulary",
    title: "Vocabulary",
    description: "Essential words and phrases",
    level: 1,
    position: { x: 350, y: 200 },
    completed: false,
    locked: false,
    parentIds: ["lang-root"],
    color: "#00FFFF", // secondary
    xp: 100,
    type: "theory",
  },
  {
    id: "grammar",
    title: "Grammar",
    description: "Basic sentence structure",
    level: 1,
    position: { x: 650, y: 200 },
    completed: false,
    locked: false,
    parentIds: ["lang-root"],
    color: "#00FFFF", // secondary
    xp: 100,
    type: "theory",
  },
  {
    id: "daily-phrases",
    title: "Daily Phrases",
    description: "Common expressions",
    level: 2,
    position: { x: 250, y: 300 },
    completed: false,
    locked: false,
    parentIds: ["vocabulary"],
    color: "#34D399", // accent
    xp: 150,
    type: "practical",
  },
  {
    id: "flashcards",
    title: "Flashcards",
    description: "Spaced repetition practice",
    level: 2,
    position: { x: 450, y: 300 },
    completed: false,
    locked: false,
    parentIds: ["vocabulary"],
    color: "#34D399", // accent
    xp: 150,
    type: "practical",
  },
  {
    id: "verb-conjugation",
    title: "Verb Conjugation",
    description: "Present tense mastery",
    level: 2,
    position: { x: 550, y: 300 },
    completed: false,
    locked: false,
    parentIds: ["grammar"],
    color: "#34D399", // accent
    xp: 150,
    type: "practical",
  },
  {
    id: "sentence-structure",
    title: "Sentence Structure",
    description: "Building complex sentences",
    level: 2,
    position: { x: 750, y: 300 },
    completed: false,
    locked: false,
    parentIds: ["grammar"],
    color: "#34D399", // accent
    xp: 150,
    type: "practical",
  },
  {
    id: "basic-conversation",
    title: "Basic Conversation",
    description: "Simple dialogues",
    level: 3,
    position: { x: 200, y: 400 },
    completed: false,
    locked: true,
    parentIds: ["daily-phrases"],
    color: "#F472B6", // pink
    xp: 200,
    type: "test",
  },
  {
    id: "reading-practice",
    title: "Reading Practice",
    description: "Simple texts and stories",
    level: 3,
    position: { x: 350, y: 400 },
    completed: false,
    locked: true,
    parentIds: ["flashcards", "verb-conjugation"],
    color: "#F472B6", // pink
    xp: 200,
    type: "theory",
  },
  {
    id: "past-tense",
    title: "Past Tense",
    description: "Talking about past events",
    level: 3,
    position: { x: 650, y: 400 },
    completed: false,
    locked: true,
    parentIds: ["sentence-structure"],
    color: "#F472B6", // pink
    xp: 200,
    type: "test",
  },
  {
    id: "listening-comprehension",
    title: "Listening Comprehension",
    description: "Understanding native speakers",
    level: 3,
    position: { x: 800, y: 400 },
    completed: false,
    locked: true,
    parentIds: ["sentence-structure"],
    color: "#F472B6", // pink
    xp: 200,
    type: "theory",
  },
]

// Create skill tree info objects
const skillTreeInfos: SkillTreeInfo[] = [
  {
    id: "personal-growth",
    title: "Personal Growth",
    description: "Develop mindfulness and productivity skills",
    category: "Personal Growth",
    lastUpdated: "Today",
    nodeCount: initialNodes.length,
    completedNodes: initialNodes.filter((node) => node.completed).length,
  },
  {
    id: "programming",
    title: "Web Development",
    description: "Learn frontend web development skills",
    category: "Professional Skills",
    lastUpdated: "Yesterday",
    nodeCount: programmingNodes.length,
    completedNodes: programmingNodes.filter((node) => node.completed).length,
  },
  {
    id: "language",
    title: "Spanish Learning",
    description: "Master Spanish language fundamentals",
    category: "Languages",
    lastUpdated: "3 days ago",
    nodeCount: languageNodes.length,
    completedNodes: languageNodes.filter((node) => node.completed).length,
  },
]

// Create a map of skill tree nodes
const skillTreeNodes = {
  "personal-growth": initialNodes,
  programming: programmingNodes,
  language: languageNodes,
}

export default function SkillTreePage() {
  const [activeTreeId, setActiveTreeId] = useState("personal-growth")
  const [nodes, setNodes] = useState(skillTreeNodes[activeTreeId as keyof typeof skillTreeNodes])
  const [selectedNode, setSelectedNode] = useState<any | null>(null)
  const [quests, setQuests] = useState<any[]>([])
  const [xp, setXp] = useState(50) // Starting XP from completed root node
  const [level, setLevel] = useState(1)
  const [maxXp, setMaxXp] = useState(200) // XP needed for level 2
  const [skillTrees, setSkillTrees] = useState<SkillTreeInfo[]>(skillTreeInfos)
  const [completedNodeAnimation, setCompletedNodeAnimation] = useState<{
    visible: boolean
    nodeTitle: string
    xpGained: number
  }>({ visible: false, nodeTitle: "", xpGained: 0 })

  // Initialize quests when a node is selected
  useEffect(() => {
    if (selectedNode) {
      setQuests(generateQuests(selectedNode.id))
    }
  }, [selectedNode])

  // Calculate level based on XP
  useEffect(() => {
    const newLevel = Math.floor(xp / 200) + 1
    if (newLevel !== level) {
      setLevel(newLevel)
      setMaxXp((newLevel + 1) * 200)
    }
  }, [xp, level])

  // Update nodes when active tree changes
  useEffect(() => {
    setNodes(skillTreeNodes[activeTreeId as keyof typeof skillTreeNodes])
    setSelectedNode(null)
  }, [activeTreeId])

  // Handle node selection
  const handleNodeSelect = (node: any) => {
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

      return updatedNodes
    })
  }

  // Handle quest completion
  const handleQuestComplete = (questId: string) => {
    setQuests((prevQuests) => {
      const updatedQuests = prevQuests.map((quest) => {
        if (quest.id === questId) {
          return { ...quest, completed: true }
        }
        return quest
      })

      // Add a small XP reward for completing a quest
      setXp((prev) => prev + 25)

      return updatedQuests
    })
  }

  // Calculate quest progress percentage
  const calculateProgress = () => {
    if (quests.length === 0) return 0
    const completedCount = quests.filter((quest) => quest.completed).length
    return (completedCount / quests.length) * 100
  }

  // Handle creating a new skill tree
  const handleCreateTree = (title: string, description: string, category: string) => {
    // Generate a unique ID
    const id = `tree-${Date.now()}`

    // Create a new skill tree with default nodes
    const newTree: SkillTreeInfo = {
      id,
      title,
      description,
      category,
      lastUpdated: "Just now",
      nodeCount: 1, // Start with just the root node
      completedNodes: 1, // Root node is completed by default
    }

    // Add basic root node
    const newNodes = [
      {
        id: `${id}-root`,
        title: "Getting Started",
        description: "The foundation of your journey",
        level: 0,
        position: { x: 500, y: 100 },
        completed: true,
        locked: false,
        parentIds: [],
        color: "#9333EA", // primary
        xp: 50,
        type: "default",
      },
    ]

    // Update skill tree nodes
    setSkillTrees((prev) => [...prev, newTree])

    // Update the skillTreeNodes object with the new nodes
    skillTreeNodes[id] = newNodes

    // Switch to the new tree
    setActiveTreeId(id)
  }

  // Add useEffect to check for new skill tree responses on page load
  useEffect(() => {
    // Check if there are new skill tree responses in localStorage
    const storedResponses = localStorage.getItem("skillTreeResponses")
    if (storedResponses) {
      try {
        const responses = JSON.parse(storedResponses)

        // Generate a new skill tree based on the responses
        const newTreeTitle = responses[0] || "New Skill Tree"
        const category = responses[1] || "Personal Growth"

        // Only create a new tree if we have valid responses
        if (newTreeTitle.trim()) {
          // Generate a unique ID
          const id = `tree-${Date.now()}`

          // Create a new skill tree
          const newTree: SkillTreeInfo = {
            id,
            title: newTreeTitle,
            description: `Skills related to ${newTreeTitle}`,
            category,
            lastUpdated: "Just now",
            nodeCount: 1, // Start with just the root node
            completedNodes: 1, // Root node is completed by default
          }

          // Add basic root node
          skillTreeNodes[id] = [
            {
              id: `${id}-root`,
              title: "Getting Started",
              description: `The foundation of your ${newTreeTitle} journey`,
              level: 0,
              position: { x: 500, y: 100 },
              completed: true,
              locked: false,
              parentIds: [],
              color: "#9333EA", // primary
              xp: 50,
              type: "default",
            },
          ]

          // Add some initial nodes based on the responses
          if (responses.length > 2 && responses[2]) {
            const skills = responses[2]
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)

            skills.slice(0, 3).forEach((skill, index) => {
              const nodeId = `${id}-skill-${index}`
              skillTreeNodes[id].push({
                id: nodeId,
                title: skill,
                description: `Learn and master ${skill}`,
                level: 1,
                position: { x: 350 + index * 150, y: 200 },
                completed: false,
                locked: false,
                parentIds: [`${id}-root`],
                color: "#00FFFF", // secondary
                xp: 100,
                type: index % 3 === 0 ? "theory" : index % 3 === 1 ? "practical" : "test",
              })
            })

            // Update node count
            newTree.nodeCount = skillTreeNodes[id].length
          }

          // Update skill trees
          setSkillTrees((prev) => [...prev, newTree])

          // Switch to the new tree
          setActiveTreeId(id)
        }

        // Clear the responses from localStorage
        localStorage.removeItem("skillTreeResponses")
      } catch (error) {
        console.error("Error parsing skill tree responses:", error)
        localStorage.removeItem("skillTreeResponses")
      }
    }
  }, [])

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
        <SkillTree nodes={nodes} onNodeSelect={handleNodeSelect} onNodeComplete={handleNodeComplete} />
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
              nodeId={selectedNode.id} // Add this line to pass the nodeId
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
    </main>
  )
}
