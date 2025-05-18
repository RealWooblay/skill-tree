"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Bell, Moon, Volume2, VolumeX, Eye, RefreshCw } from "lucide-react"
import { ParticleBackground } from "@/components/particles"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export default function SettingsPage() {
  // Settings state
  const [settings, setSettings] = useState({
    darkMode: true,
    notifications: true,
    soundEffects: true,
    soundVolume: 80,
    particleEffects: true,
    animationSpeed: 1.0,
    resetProgress: false,
  })

  // Handle settings changes
  const handleToggle = (setting: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }))
  }

  const handleSliderChange = (setting: keyof typeof settings, value: number[]) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: value[0],
    }))
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
            <CardTitle className="text-lg text-secondary">Appearance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Moon className="h-5 w-5 text-primary" />
                <div>
                  <Label className="text-sm font-medium">Dark Mode</Label>
                  <p className="text-xs text-muted-foreground">Always use dark theme</p>
                </div>
              </div>
              <Switch checked={settings.darkMode} onCheckedChange={() => handleToggle("darkMode")} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Eye className="h-5 w-5 text-primary" />
                <div>
                  <Label className="text-sm font-medium">Particle Effects</Label>
                  <p className="text-xs text-muted-foreground">Show ambient particle animations</p>
                </div>
              </div>
              <Switch checked={settings.particleEffects} onCheckedChange={() => handleToggle("particleEffects")} />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <RefreshCw className="h-5 w-5 text-primary" />
                <Label className="text-sm font-medium">Animation Speed</Label>
              </div>
              <div className="pt-2">
                <Slider
                  defaultValue={[settings.animationSpeed * 100]}
                  max={200}
                  min={50}
                  step={10}
                  onValueChange={(value) => handleSliderChange("animationSpeed", [value[0] / 100])}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Slower</span>
                  <span>Normal</span>
                  <span>Faster</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-primary/20 mt-6">
          <CardHeader>
            <CardTitle className="text-lg text-secondary">Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-primary" />
                <div>
                  <Label className="text-sm font-medium">Push Notifications</Label>
                  <p className="text-xs text-muted-foreground">Receive reminders and updates</p>
                </div>
              </div>
              <Switch checked={settings.notifications} onCheckedChange={() => handleToggle("notifications")} />
            </div>

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
                <Button variant="destructive" size="sm">
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
