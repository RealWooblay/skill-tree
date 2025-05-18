"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Home, GitBranch, User, Settings, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function Navigation() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/skill-tree", label: "Skill Tree", icon: GitBranch },
    { href: "/profile", label: "Profile", icon: User },
    { href: "/settings", label: "Settings", icon: Settings },
  ]

  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed top-4 right-4 z-50 md:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="bg-background/50 backdrop-blur-md border-primary/20"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile menu */}
      <motion.div
        className={cn(
          "fixed inset-0 z-40 bg-background/95 backdrop-blur-sm md:hidden",
          mobileMenuOpen ? "flex" : "hidden",
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: mobileMenuOpen ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex flex-col items-center justify-center w-full h-full gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-2 text-lg font-medium transition-colors",
                pathname === item.href ? "text-primary glow-text" : "text-muted-foreground hover:text-primary",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Desktop navigation */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 hidden md:block">
        <motion.div
          className="flex items-center gap-1 p-1 rounded-full bg-background/30 backdrop-blur-md border border-primary/20"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {navItems.map((item) => {
            const isActive = pathname === item.href

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  size="icon"
                  className={cn("rounded-full relative", isActive && "bg-primary text-primary-foreground")}
                >
                  <item.icon className="h-5 w-5" />
                  {isActive && (
                    <motion.span
                      className="absolute -bottom-1 left-1/2 w-1 h-1 bg-primary rounded-full"
                      layoutId="navIndicator"
                    />
                  )}
                </Button>
              </Link>
            )
          })}
        </motion.div>
      </div>
    </>
  )
}
