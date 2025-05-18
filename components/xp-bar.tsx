"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface XpBarProps {
  currentXp: number
  maxXp: number
  level: number
  className?: string
}

export function XpBar({ currentXp, maxXp, level, className }: XpBarProps) {
  const percentage = Math.min((currentXp / maxXp) * 100, 100)

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="text-sm font-mono text-primary glow-text">LVL {level}</div>

      <div className="relative h-2 flex-1 bg-background/50 rounded-full overflow-hidden border border-primary/20">
        <motion.div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-secondary"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      <div className="text-xs font-mono text-muted-foreground">
        {currentXp}/{maxXp} XP
      </div>
    </div>
  )
}
