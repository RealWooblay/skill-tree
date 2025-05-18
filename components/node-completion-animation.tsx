"use client"

import { useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"

interface NodeCompletionAnimationProps {
  isVisible: boolean
  nodeTitle: string
  xpGained: number
  onComplete: () => void
}

export function NodeCompletionAnimation({ isVisible, nodeTitle, xpGained, onComplete }: NodeCompletionAnimationProps) {
  const confettiRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isVisible && confettiRef.current) {
      // Create confetti effect
      const canvas = document.createElement("canvas")
      canvas.style.position = "fixed"
      canvas.style.inset = "0"
      canvas.style.width = "100%"
      canvas.style.height = "100%"
      canvas.style.pointerEvents = "none"
      canvas.style.zIndex = "100"
      document.body.appendChild(canvas)

      const myConfetti = confetti.create(canvas, {
        resize: true,
        useWorker: true,
      })

      // Fire confetti
      myConfetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#9333EA", "#00FFFF", "#34D399"],
      })

      // Add sci-fi energy wave effect
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
        canvas.remove()
        energyWave.remove()
        style.remove()
        onComplete()
      }, 3000)

      return () => {
        clearTimeout(timer)
        canvas.remove()
        energyWave.remove()
        style.remove()
      }
    }
  }, [isVisible, onComplete])

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-background/70 backdrop-blur-sm">
          <div ref={confettiRef} className="absolute inset-0" />
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 15 }}
            className="bg-card border border-primary/20 rounded-xl p-8 shadow-lg max-w-md text-center"
          >
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              transition={{ type: "spring", damping: 10, delay: 0.2 }}
            >
              <h2 className="text-2xl font-bold text-primary glow-text mb-2">Skill Unlocked!</h2>
              <p className="text-lg mb-6">{nodeTitle}</p>
            </motion.div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 8, delay: 0.4 }}
              className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <span className="text-4xl font-bold text-primary glow-text">+{xpGained}</span>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
              <p className="text-muted-foreground mb-6">
                Congratulations on mastering this skill! Keep up the great work.
              </p>
              <button
                onClick={onComplete}
                className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                Continue
              </button>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
