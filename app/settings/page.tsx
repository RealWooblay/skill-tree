"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Volume2, VolumeX } from "lucide-react"
import { ParticleBackground } from "@/components/particles"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

// Sound settings utility functions
const getSoundSettings = () => {
  const savedSettings = localStorage.getItem("soundSettings")
  if (savedSettings) {
    try {
      return JSON.parse(savedSettings)
    } catch (error) {
      console.error("Error parsing sound settings:", error)
    }
  }
  return { enabled: true, volume: 80 }
}

const updateSoundSettings = (enabled: boolean, volume: number) => {
  localStorage.setItem("soundSettings", JSON.stringify({ enabled, volume }))
}

export default function SettingsPage() {
  // Settings state
  const [settings, setSettings] = useState({
    soundEffects: true,
    soundVolume: 80,
    resetProgress: false,
  })

  // Load saved settings on mount
  useEffect(() => {
    const savedSettings = getSoundSettings()
    setSettings(prev => ({
      ...prev,
      soundEffects: savedSettings.enabled,
      soundVolume: savedSettings.volume,
    }))
  }, [])

  // Handle settings changes
  const handleToggle = (setting: keyof typeof settings) => {
    const newValue = !settings[setting]
    setSettings(prev => ({
      ...prev,
      [setting]: newValue,
    }))

    if (setting === 'soundEffects') {
      updateSoundSettings(newValue, settings.soundVolume)
    }
  }

  const handleSliderChange = (setting: keyof typeof settings, value: number[]) => {
    const newValue = value[0]
    setSettings(prev => ({
      ...prev,
      [setting]: newValue,
    }))

    if (setting === 'soundVolume') {
      updateSoundSettings(settings.soundEffects, newValue)
    }
  }

  const handleResetProgress = () => {
    // Clear all skill tree data
    localStorage.removeItem("skillTrees")
    localStorage.removeItem("completedQuests")
    localStorage.removeItem("skillTreeResponses")

    // Reload the page to reflect changes
    window.location.href = "/"
  }

  return (
    <main className="flex min-h-screen flex-col relative">
      <ParticleBackground />
      <Navigation />

      <div className="container max-w-2xl px-4 py-16 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-primary glow-text mb-2">Settings</h1>
          <p className="text-sm text-muted-foreground">Customize your SkillTree experience</p>
        </motion.div>

        <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg text-secondary">Sound Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {settings.soundEffects ? (
                  <Volume2 className="h-5 w-5 text-primary" />
                ) : (
                  <VolumeX className="h-5 w-5 text-primary" />
                )}
                <div>
                  <Label className="text-sm font-medium">Sound Effects</Label>
                  <p className="text-xs text-muted-foreground">Play sounds for actions and achievements</p>
                </div>
              </div>
              <Switch checked={settings.soundEffects} onCheckedChange={() => handleToggle("soundEffects")} />
            </div>

            {settings.soundEffects && (
              <div className="space-y-2 pl-8">
                <Label className="text-xs">Volume</Label>
                <Slider
                  defaultValue={[settings.soundVolume]}
                  max={100}
                  step={1}
                  onValueChange={(value) => handleSliderChange("soundVolume", value)}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-primary/20 mt-6">
          <CardHeader>
            <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                These actions cannot be undone. Please proceed with caution.
              </p>

              <Separator className="bg-border" />

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium">Reset Progress</h3>
                  <p className="text-xs text-muted-foreground">Reset all your skill tree progress and start over</p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      Reset
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-card border-primary/20">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete all your skill trees and progress. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleResetProgress} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Reset Progress
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
