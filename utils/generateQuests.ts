export function generateQuests(nodeId: string) {
  // Get the AI-generated skill tree from localStorage
  const storedSkillTrees = localStorage.getItem("skillTrees")
  if (!storedSkillTrees) return []

  try {
    const skillTrees = JSON.parse(storedSkillTrees)
    // Get the most recent skill tree
    const skillTree = skillTrees[skillTrees.length - 1]
    if (!skillTree?.nodes) return []

    // Find the node in the AI-generated skill tree
    const node = skillTree.nodes.find((n: any) => n.id === nodeId)
    if (!node?.quests) return []

    return node.quests.map((quest: { title: string; description: string; resources?: any[] }, index: number) => ({
      id: `${nodeId}-quest-${index + 1}`,
      title: quest.title,
      description: quest.description,
      completed: false,
      resources: quest.resources || []
    }))
  } catch (error) {
    console.error("Error parsing skill tree data:", error)
    return []
  }
}
