"use client"

import { useEffect } from "react"
import { playSound } from "@/utils/sound"

interface NodeCompletionAnimationProps {
  isVisible: boolean
  nodeTitle: string
  xpGained: number
  onComplete: () => void
}

export function NodeCompletionAnimation({ isVisible, onComplete }: NodeCompletionAnimationProps) {
  useEffect(() => {
    if (isVisible) {
      // Play completion sound
      playSound('nodeComplete')

      // Create energy wave effect
      const energyWave = document.createElement("div")
      energyWave.style.position = "fixed"
      energyWave.style.top = "50%"
      energyWave.style.left = "50%"
      energyWave.style.transform = "translate(-50%, -50%)"
      energyWave.style.width = "10px"
      energyWave.style.height = "10px"
      energyWave.style.borderRadius = "50%"
      energyWave.style.background = "#9333EA"
      energyWave.style.boxShadow = "0 0 60px 30px #9333EA"
      energyWave.style.animation = "1s ease-out 0s 1 expandRing"
      energyWave.style.opacity = "0"

      // Add keyframes for the energy wave
      const style = document.createElement("style")
      style.textContent = `
        @keyframes expandRing {
          0% {
            width: 10px;
            height: 10px;
            opacity: 0.8;
          }
          100% {
            width: 300px;
            height: 300px;
            opacity: 0;
          }
        }
      `
      document.head.appendChild(style)
      document.body.appendChild(energyWave)

      // Clean up
      const timer = setTimeout(() => {
        energyWave.remove()
        style.remove()
        onComplete()
      }, 1000)

      return () => {
        clearTimeout(timer)
        energyWave.remove()
        style.remove()
      }
    }
  }, [isVisible, onComplete])

  return null
}
