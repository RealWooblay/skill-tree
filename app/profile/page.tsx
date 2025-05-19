"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { GitBranch, Trophy, Clock, Zap, Star, BarChart3 } from "lucide-react"
import { AvatarDisplay } from "@/components/avatar-display"
import { XpBar } from "@/components/xp-bar"
import { ParticleBackground } from "@/components/particles"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface SkillTree {
  id: string
  title: string
  description: string
  category: string
  nodes: Array<{
    id: string
    title: string
    description: string
    level: number
    completed: boolean
    xp: number
    type: string
    category: string
  }>
}

export default function ProfilePage() {
  const [userData, setUserData] = useState({
    name: "Skill Seeker",
    level: 1,
    xp: 0,
    maxXp: 200,
    joinedDate: "Just now",
    completedSkills: 0,
    totalSkills: 0,
    streakDays: 0,
    focusArea: "No active focus",
    recentQuests: [] as Array<{ id: string; title: string; date: string; xp: number }>,
    stats: [
      { label: "Focus Minutes", value: 0, icon: Clock, color: "text-primary" },
      { label: "Quests Completed", value: 0, icon: Trophy, color: "text-secondary" },
      { label: "Current Streak", value: 0, icon: Zap, color: "text-accent" },
    ],
    skillDistribution: [] as Array<{ category: string; percentage: number }>,
  })

  useEffect(() => {
    // Load skill trees from localStorage
    const storedSkillTrees = localStorage.getItem("skillTrees")
    if (!storedSkillTrees) return

    try {
      const skillTrees = JSON.parse(storedSkillTrees) as SkillTree[]
      if (!skillTrees.length) return

      // Calculate total XP and level
      let totalXp = 0
      let completedSkills = 0
      let totalSkills = 0
      const categoryCounts: { [key: string]: number } = {}
      const completedCategoryCounts: { [key: string]: number } = {}
      const recentQuests: Array<{ id: string; title: string; date: string; xp: number }> = []

      skillTrees.forEach(tree => {
        tree.nodes.forEach(node => {
          totalSkills++
          if (node.completed) {
            completedSkills++
            totalXp += node.xp
            completedCategoryCounts[node.category] = (completedCategoryCounts[node.category] || 0) + 1
            recentQuests.push({
              id: node.id,
              title: node.title,
              date: "Recently",
              xp: node.xp
            })
          }
          categoryCounts[node.category] = (categoryCounts[node.category] || 0) + 1
        })
      })

      // Calculate level based on XP
      const level = Math.floor(totalXp / 200) + 1
      const maxXp = level * 200

      // Calculate skill distribution
      const skillDistribution = Object.keys(categoryCounts).map(category => ({
        category,
        percentage: Math.round((completedCategoryCounts[category] || 0) / categoryCounts[category] * 100)
      }))

      // Get current focus area from active skill tree
      const activeTreeId = localStorage.getItem("activeTreeId")
      const activeTree = skillTrees.find(tree => tree.id === activeTreeId)
      const focusArea = activeTree?.category || "No active focus"

      // Update user data
      setUserData(prev => ({
        ...prev,
        level,
        xp: totalXp,
        maxXp,
        completedSkills,
        totalSkills,
        focusArea,
        recentQuests: recentQuests.slice(0, 3), // Show only 3 most recent
        stats: [
          { label: "Focus Minutes", value: Math.floor(totalXp / 10), icon: Clock, color: "text-primary" },
          { label: "Quests Completed", value: completedSkills, icon: Trophy, color: "text-secondary" },
          { label: "Current Streak", value: Math.floor(completedSkills / 3), icon: Zap, color: "text-accent" },
        ],
        skillDistribution
      }))
    } catch (error) {
      console.error("Error loading skill trees:", error)
    }
  }, [])

  return (
    <main className="flex min-h-screen flex-col relative">
      <ParticleBackground />
      <Navigation />

      <div className="container max-w-4xl px-4 py-16 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-primary glow-text mb-2">{userData.name}</h1>
          <p className="text-sm text-muted-foreground">Joined {userData.joinedDate}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Avatar Card */}
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader className="text-center">
              <CardTitle className="text-lg text-secondary">Avatar</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <AvatarDisplay level={userData.level} size="lg" className="mb-4" />

              <XpBar
                currentXp={userData.xp % userData.maxXp}
                maxXp={userData.maxXp}
                level={userData.level}
                className="mt-4 w-full"
              />

              <div className="mt-6 w-full">
                <div className="flex justify-between text-xs text-muted-foreground mb-2">
                  <span>Skills Mastered</span>
                  <span>
                    {userData.completedSkills}/{userData.totalSkills}
                  </span>
                </div>
                <Progress value={(userData.completedSkills / userData.totalSkills) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg text-secondary">Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {userData.stats.map((stat, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className={`p-2 rounded-full bg-background ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{stat.label}</div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t border-border">
                <h3 className="text-sm font-medium mb-3">Skill Distribution</h3>
                {userData.skillDistribution.map((skill, index) => (
                  <div key={index} className="mb-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span>{skill.category}</span>
                      <span>{skill.percentage}%</span>
                    </div>
                    <div className="h-2 bg-background/50 rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${skill.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity Card */}
          <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg text-secondary">Recent Activity</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs">
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5 text-primary" />
                  <div className="text-sm font-medium">Current Focus</div>
                </div>
                <div className="bg-background/50 p-3 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-secondary" />
                    <span className="text-sm font-medium">{userData.focusArea}</span>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    You're currently focused on improving your {userData.focusArea.toLowerCase()} skills.
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-6">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <div className="text-sm font-medium">Completed Quests</div>
                </div>

                <div className="space-y-3">
                  {userData.recentQuests.map((quest) => (
                    <div key={quest.id} className="bg-background/50 p-3 rounded-lg border border-primary/20">
                      <div className="flex justify-between items-start">
                        <div className="text-sm font-medium">{quest.title}</div>
                        <div className="text-xs text-secondary">+{quest.xp} XP</div>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">{quest.date}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
