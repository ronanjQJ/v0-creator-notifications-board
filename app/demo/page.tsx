"use client"

import { useState, useEffect, useMemo } from "react"
import { useTheme } from "next-themes"
import { Moon, Sun, Upload } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatsBar } from "@/components/stats-bar"
import { FiltersBar, type Filters } from "@/components/filters-bar"
import { TimelineView } from "@/components/timeline-view"
import { AllNotificationsView } from "@/components/all-notifications-view"
import { parseCSV, type Notification } from "@/lib/csv-parser"

export default function DemoPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  const [filters, setFilters] = useState<Filters>({
    search: "",
    channels: [],
    statuses: ["en_prod"],
    audiences: [],
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  // Load demo CSV on mount
  useEffect(() => {
    async function loadDemoData() {
      try {
        const response = await fetch("/data/demo-notifications.csv")
        if (!response.ok) {
          throw new Error("Failed to load demo data")
        }
        const csvText = await response.text()
        const parsed = parseCSV(csvText)
        setNotifications(parsed)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load demo data")
      } finally {
        setLoading(false)
      }
    }
    loadDemoData()
  }, [])

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesSearch =
          n.key.toLowerCase().includes(searchLower) ||
          n.declencheur.toLowerCase().includes(searchLower) ||
          (n.sujetEmail?.toLowerCase().includes(searchLower)) ||
          (n.pushContent?.toLowerCase().includes(searchLower))
        if (!matchesSearch) return false
      }

      // Channel filter
      if (filters.channels.length > 0) {
        const matchesChannel = filters.channels.some((ch) => {
          if (ch === "Email") return n.canal === "Email" || n.canal === "Email + Push"
          if (ch === "Push") return n.canal === "Push" || n.canal === "Email + Push"
          return false
        })
        if (!matchesChannel) return false
      }

      // Status filter
      if (filters.statuses.length > 0) {
        if (!filters.statuses.includes(n.statut)) return false
      }

      // Audience filter
      if (filters.audiences.length > 0) {
        if (!filters.audiences.includes(n.cible)) return false
      }

      return true
    })
  }, [notifications, filters])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading demo data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <p className="text-destructive mb-4">{error}</p>
          <Button asChild>
            <Link href="/">Go to Upload</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold">Creator Notifications Board</h1>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
              Demo
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/">
                <Upload className="mr-2 h-4 w-4" />
                Upload your CSV
              </Link>
            </Button>
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Stats */}
      <StatsBar notifications={filteredNotifications} filters={filters} />

      {/* Filters */}
      <FiltersBar
        filters={filters}
        onFiltersChange={setFilters}
        notifications={notifications}
      />

      {/* Main Content */}
      <main className="container py-6">
        <Tabs defaultValue="timeline" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="timeline">Campaign Timeline</TabsTrigger>
            <TabsTrigger value="all">All Notifications</TabsTrigger>
          </TabsList>
          <TabsContent value="timeline">
            <TimelineView notifications={filteredNotifications} />
          </TabsContent>
          <TabsContent value="all">
            <AllNotificationsView notifications={filteredNotifications} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
