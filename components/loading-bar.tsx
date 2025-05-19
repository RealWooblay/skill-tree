"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface LoadingBarProps {
    progress: number
    message?: string
}

export function LoadingBar({ progress, message = "Processing..." }: LoadingBarProps) {
    const [dots, setDots] = useState("")
    const [displayProgress, setDisplayProgress] = useState(0)

    // Animate dots
    useEffect(() => {
        const interval = setInterval(() => {
            setDots((prev) => (prev.length >= 3 ? "" : prev + "."))
        }, 500)
        return () => clearInterval(interval)
    }, [])

    // Smooth progress animation
    useEffect(() => {
        const targetProgress = progress >= 95 ? 95 : progress // Cap at 95% until complete
        const interval = setInterval(() => {
            setDisplayProgress((prev) => {
                const diff = targetProgress - prev
                if (Math.abs(diff) < 0.1) return targetProgress
                return prev + diff * 0.1 // Smooth transition
            })
        }, 50)
        return () => clearInterval(interval)
    }, [progress])

    // Jump to 100% when complete
    useEffect(() => {
        if (progress === 100) {
            setDisplayProgress(100)
        }
    }, [progress])

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="w-full max-w-md p-6 space-y-4">
                <div className="text-center space-y-2">
                    <h2 className="text-xl font-bold text-primary glow-text">AI Processing</h2>
                    <p className="text-muted-foreground font-mono">
                        {message}
                        {dots}
                    </p>
                </div>

                <div className="relative h-2 bg-background/50 rounded-full overflow-hidden border border-primary/20">
                    {/* Shimmer effect */}
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent"
                        animate={{
                            x: ["-100%", "100%"],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                    />

                    {/* Progress bar */}
                    <motion.div
                        className="absolute inset-y-0 left-0 bg-primary"
                        style={{
                            width: `${displayProgress}%`,
                        }}
                        transition={{
                            duration: 0.5,
                            ease: "easeOut",
                        }}
                    />

                    {/* Glow effect */}
                    <motion.div
                        className="absolute inset-y-0 left-0 bg-primary/30 blur-sm"
                        style={{
                            width: `${displayProgress}%`,
                        }}
                        transition={{
                            duration: 0.5,
                            ease: "easeOut",
                        }}
                    />
                </div>

                {/* Progress percentage */}
                <div className="text-center">
                    <span className="text-sm font-mono text-primary glow-text">
                        {Math.round(displayProgress)}%
                    </span>
                </div>
            </div>
        </div>
    )
} 