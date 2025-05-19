"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, ChevronRight, Folder, FolderOpen, GripVertical, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided } from "@hello-pangea/dnd"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

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

export function SkillTreeSelector({ skillTrees: initialSkillTrees, activeTreeId, onSelectTree, onCreateTree }: SkillTreeSelectorProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [categories, setCategories] = useState<string[]>([])
  const [newCategory, setNewCategory] = useState("")
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [treeToDelete, setTreeToDelete] = useState<SkillTreeInfo | null>(null)
  const [skillTrees, setSkillTrees] = useState<SkillTreeInfo[]>(initialSkillTrees)
  const router = useRouter()

  // Load skill trees and categories from localStorage on mount and when initialSkillTrees changes
  useEffect(() => {
    const storedSkillTrees = localStorage.getItem("skillTrees")
    if (storedSkillTrees) {
      try {
        const trees = JSON.parse(storedSkillTrees)
        // Transform the trees to match SkillTreeInfo format
        const formattedTrees = trees.map((tree: any) => ({
          id: tree.id,
          title: tree.title,
          description: tree.description,
          category: tree.category || "Uncategorized",
          lastUpdated: tree.createdAt || new Date().toISOString(),
          nodeCount: tree.nodes?.length || 0,
          completedNodes: tree.nodes?.filter((node: any) => node.completed).length || 0
        }))
        setSkillTrees(formattedTrees)

        // Extract unique categories from trees
        const uniqueCategories = Array.from(new Set(formattedTrees.map((tree: SkillTreeInfo) => tree.category))) as string[]
        setCategories(uniqueCategories)
      } catch (error) {
        console.error("Error loading skill trees:", error)
      }
    }
  }, [initialSkillTrees])

  // Group skill trees by category
  const groupedTrees: Record<string, SkillTreeInfo[]> = {}
  skillTrees.forEach((tree) => {
    if (!groupedTrees[tree.category]) {
      groupedTrees[tree.category] = []
    }
    groupedTrees[tree.category].push(tree)
  })

  const handleNewTreeClick = () => {
    router.push("/")
  }

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()])
      setNewCategory("")
      setIsAddingCategory(false)
    }
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const { source, destination } = result
    const treeId = result.draggableId
    const sourceCategory = source.droppableId
    const destCategory = destination.droppableId

    // Find the tree being moved
    const tree = skillTrees.find(t => t.id === treeId)
    if (!tree) return

    // Update the tree's category
    const updatedTree = { ...tree, category: destCategory }

    // Update the skill trees in localStorage
    const storedSkillTrees = localStorage.getItem("skillTrees")
    if (storedSkillTrees) {
      try {
        const trees = JSON.parse(storedSkillTrees)
        const updatedSkillTrees = trees.map((t: any) =>
          t.id === treeId ? { ...t, category: destCategory } : t
        )
        localStorage.setItem("skillTrees", JSON.stringify(updatedSkillTrees))

        // Update the local state immediately
        setSkillTrees(prevTrees =>
          prevTrees.map(t => t.id === treeId ? updatedTree : t)
        )

        // Update the nodes in localStorage
        const storedNodes = localStorage.getItem(`nodes-${treeId}`)
        if (storedNodes) {
          const nodes = JSON.parse(storedNodes)
          const updatedNodes = nodes.map((node: any) => ({
            ...node,
            category: destCategory
          }))
          localStorage.setItem(`nodes-${treeId}`, JSON.stringify(updatedNodes))
        }

        // Update the state to reflect changes
        onSelectTree(treeId)
      } catch (error) {
        console.error("Error updating skill tree category:", error)
      }
    }
  }

  const handleDeleteTree = (tree: SkillTreeInfo) => {
    setTreeToDelete(tree)
  }

  const confirmDelete = () => {
    if (!treeToDelete) return

    // Remove from localStorage
    const storedSkillTrees = localStorage.getItem("skillTrees")
    if (storedSkillTrees) {
      try {
        const trees = JSON.parse(storedSkillTrees)
        const updatedSkillTrees = trees.filter((t: SkillTreeInfo) => t.id !== treeToDelete.id)
        localStorage.setItem("skillTrees", JSON.stringify(updatedSkillTrees))

        // Also remove the nodes
        localStorage.removeItem(`nodes-${treeToDelete.id}`)
        localStorage.removeItem(`completedQuests-${treeToDelete.id}`)

        // Update local state immediately
        setSkillTrees(updatedSkillTrees)

        // If this was the active tree, select another one or go to home
        if (treeToDelete.id === activeTreeId) {
          const nextTree = updatedSkillTrees[0]
          if (nextTree) {
            onSelectTree(nextTree.id)
          } else {
            router.push("/")
          }
        }
      } catch (error) {
        console.error("Error deleting skill tree:", error)
      }
    }

    setTreeToDelete(null)
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
                <DragDropContext onDragEnd={handleDragEnd}>
                  {categories.map((category) => (
                    <div key={category} className="mb-3">
                      <div className="flex items-center justify-between px-2 py-1">
                        <h4 className="text-xs font-medium text-muted-foreground">{category}</h4>
                        <span className="text-xs text-muted-foreground">
                          {groupedTrees[category]?.length || 0}
                        </span>
                      </div>
                      <Droppable droppableId={category}>
                        {(provided: DroppableProvided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="space-y-1 min-h-[40px]"
                          >
                            {groupedTrees[category]?.map((tree, index) => (
                              <Draggable key={tree.id} draggableId={tree.id} index={index}>
                                {(provided: DraggableProvided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className={cn(
                                      "w-full text-left px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 group",
                                      tree.id === activeTreeId ? "bg-primary/20 text-primary" : "hover:bg-background/50"
                                    )}
                                    onClick={() => onSelectTree(tree.id)}
                                  >
                                    <div {...provided.dragHandleProps} className="cursor-grab">
                                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-white truncate">
                                        {tree.title}
                                      </p>
                                      <div className="flex items-center mt-1">
                                        <span className="text-xs text-gray-400">
                                          {tree.completedNodes || 0} nodes completed
                                        </span>
                                      </div>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleDeleteTree(tree)
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  ))}
                </DragDropContext>

                {/* Action Buttons */}
                <div className="mt-4 border-t border-border pt-4 space-y-2">
                  {isAddingCategory ? (
                    <div className="flex gap-2">
                      <Input
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="New category name"
                        className="h-8 text-sm"
                      />
                      <Button
                        size="sm"
                        onClick={handleAddCategory}
                        disabled={!newCategory.trim()}
                      >
                        Add
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-dashed border-primary/40"
                        onClick={() => setIsAddingCategory(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" /> Category
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-dashed border-primary/40"
                        onClick={handleNewTreeClick}
                      >
                        <Plus className="h-4 w-4 mr-2" /> Tree
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AlertDialog open={!!treeToDelete} onOpenChange={() => setTreeToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Skill Tree</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{treeToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
