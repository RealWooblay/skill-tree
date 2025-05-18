"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, ChevronRight, Folder, FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export interface SkillTreeInfo {
  id: string
  title: string
  description: string
  category: string
  lastUpdated: string
  nodeCount: number
  completedNodes: number
}

interface SkillTreeSelectorProps {
  skillTrees: SkillTreeInfo[]
  activeTreeId: string
  onSelectTree: (treeId: string) => void
  onCreateTree: (title: string, description: string, category: string) => void
}

export function SkillTreeSelector({ skillTrees, activeTreeId, onSelectTree, onCreateTree }: SkillTreeSelectorProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [newTreeTitle, setNewTreeTitle] = useState("")
  const [newTreeDescription, setNewTreeDescription] = useState("")
  const [newTreeCategory, setNewTreeCategory] = useState("Personal Growth")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Group skill trees by category
  const groupedTrees: Record<string, SkillTreeInfo[]> = {}
  skillTrees.forEach((tree) => {
    if (!groupedTrees[tree.category]) {
      groupedTrees[tree.category] = []
    }
    groupedTrees[tree.category].push(tree)
  })

  const handleCreateTree = () => {
    if (newTreeTitle.trim()) {
      onCreateTree(newTreeTitle, newTreeDescription, newTreeCategory)
      setNewTreeTitle("")
      setNewTreeDescription("")
      setIsDialogOpen(false)
    }
  }

  return (
    <div className="fixed left-4 top-16 z-20 w-64">
      <motion.div
        initial={{ x: -10, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-card/80 backdrop-blur-md border border-primary/20 rounded-lg shadow-lg overflow-hidden"
      >
        <div className="p-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isOpen ? <FolderOpen className="h-4 w-4 text-primary" /> : <Folder className="h-4 w-4 text-primary" />}
            <h3 className="text-sm font-medium">Skill Trees</h3>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsOpen(!isOpen)}>
            <ChevronRight className={cn("h-4 w-4 transition-transform", isOpen && "rotate-90")} />
          </Button>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-2 max-h-[calc(100vh-200px)] overflow-y-auto">
                {Object.entries(groupedTrees).map(([category, trees]) => (
                  <div key={category} className="mb-3">
                    <h4 className="text-xs font-medium text-muted-foreground px-2 py-1">{category}</h4>
                    <div className="space-y-1">
                      {trees.map((tree) => (
                        <button
                          key={tree.id}
                          className={cn(
                            "w-full text-left px-3 py-2 text-sm rounded-md transition-colors",
                            tree.id === activeTreeId ? "bg-primary/20 text-primary" : "hover:bg-background/50",
                          )}
                          onClick={() => onSelectTree(tree.id)}
                        >
                          <div className="font-medium">{tree.title}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {tree.completedNodes}/{tree.nodeCount} nodes completed
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-2 border-t border-border">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full border-dashed border-primary/40">
                      <Plus className="h-4 w-4 mr-2" /> New Skill Tree
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card border-primary/20">
                    <DialogHeader>
                      <DialogTitle className="text-primary">Create New Skill Tree</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Title</label>
                        <Input
                          value={newTreeTitle}
                          onChange={(e) => setNewTreeTitle(e.target.value)}
                          placeholder="e.g., Programming Skills"
                          className="bg-background/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <Input
                          value={newTreeDescription}
                          onChange={(e) => setNewTreeDescription(e.target.value)}
                          placeholder="Brief description of this skill tree"
                          className="bg-background/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Category</label>
                        <select
                          value={newTreeCategory}
                          onChange={(e) => setNewTreeCategory(e.target.value)}
                          className="w-full h-10 px-3 py-2 bg-background/50 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option>Personal Growth</option>
                          <option>Professional Skills</option>
                          <option>Health & Fitness</option>
                          <option>Creative Skills</option>
                          <option>Languages</option>
                          <option>Custom</option>
                        </select>
                      </div>
                      <Button
                        onClick={handleCreateTree}
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                        disabled={!newTreeTitle.trim()}
                      >
                        Create Skill Tree
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
