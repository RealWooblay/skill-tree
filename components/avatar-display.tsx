"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface AvatarDisplayProps {
  level: number
  className?: string
  size?: "sm" | "md" | "lg"
}

export function AvatarDisplay({ level, className, size = "md" }: AvatarDisplayProps) {
  // Determine avatar evolution based on level
  const evolution = Math.min(Math.floor(level / 5), 3)

  // Size classes
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-32 h-32",
    lg: "w-48 h-48",
  }

  // Colors based on evolution
  const colors = [
    { primary: "#9333EA", secondary: "#00FFFF" }, // Level 0-4
    { primary: "#00FFFF", secondary: "#34D399" }, // Level 5-9
    { primary: "#34D399", secondary: "#F472B6" }, // Level 10-14
    { primary: "#F472B6", secondary: "#9333EA" }, // Level 15+
  ]

  const { primary, secondary } = colors[evolution]

  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      {/* Base avatar shape */}
      <motion.div
        className="absolute inset-0 rounded-full bg-background border-2 overflow-hidden"
        style={{ borderColor: primary }}
        animate={{
          boxShadow: `0 0 20px ${primary}40`,
        }}
      >
        {/* Inner geometric pattern */}
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Background pattern */}
          <defs>
            <pattern id="avatarGrid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke={`${primary}30`} strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#avatarGrid)" />

          {/* Central shape - evolves with level */}
          {evolution >= 0 && (
            <motion.polygon
              points="50,20 80,50 50,80 20,50"
              fill={`${primary}80`}
              stroke={primary}
              strokeWidth="1"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1 }}
            />
          )}

          {/* Additional shapes for higher levels */}
          {evolution >= 1 && (
            <motion.circle
              cx="50"
              cy="50"
              r="15"
              fill={`${secondary}60`}
              stroke={secondary}
              strokeWidth="1"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
            />
          )}

          {evolution >= 2 && (
            <motion.path
              d="M 50 20 L 65 35 L 50 50 L 35 35 Z"
              fill={`${primary}80`}
              stroke={primary}
              strokeWidth="1"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
            />
          )}

          {evolution >= 3 && (
            <>
              <motion.circle
                cx="50"
                cy="50"
                r="30"
                fill="none"
                stroke={secondary}
                strokeWidth="1"
                strokeDasharray="3,3"
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  rotate: 360,
                }}
                transition={{
                  duration: 1,
                  delay: 0.6,
                  rotate: {
                    repeat: Number.POSITIVE_INFINITY,
                    duration: 20,
                    ease: "linear",
                  },
                }}
              />
              <motion.circle
                cx="50"
                cy="50"
                r="5"
                fill={secondary}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1, delay: 0.8 }}
              />
            </>
          )}
        </svg>
      </motion.div>

      {/* Level indicator */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-background border border-primary rounded-full px-2 py-0.5 text-xs font-mono text-primary">
        LVL {level}
      </div>

      {/* Animated particles around avatar */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 3 + evolution }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor: i % 2 === 0 ? primary : secondary,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.7, 1, 0.7],
              x: [0, Math.random() * 10 - 5, 0],
              y: [0, Math.random() * 10 - 5, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
    </div>
  )
}
