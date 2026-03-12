"use client"

import { useState, useEffect, useMemo } from "react"
import { useTheme } from "next-themes"
import { Moon, Sun, Upload } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatsBar } from "@/components/stats-bar"
import { FiltersBar, DEFAULT_FILTERS, applyFilters, type Filters } from "@/components/filters-bar"
import { TimelineView } from "@/components/timeline-view"
import { AllNotificationsView } from "@/components/all-notifications-view"
import { parseCSV, type NotificationRow } from "@/lib/csv-parser"

export default function DemoPage() {
  const [notifications, setNotifications] = useState<NotificationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)

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

  // Filter notifications using the shared applyFilters function
  const filteredNotifications = useMemo(() => {
    return applyFilters(notifications, filters)
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
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <h1 className="text-base sm:text-lg font-semibold truncate">Creator Notifications Board</h1>
            <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
              Demo
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
              <Link href="/">
                <Upload className="mr-2 h-4 w-4" />
                Upload your CSV
              </Link>
            </Button>
            <Button variant="outline" size="icon" asChild className="sm:hidden">
              <Link href="/">
                <Upload className="h-4 w-4" />
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

      {/* Stats + Filters */}
      <div className="sticky top-14 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3 space-y-3">
          <StatsBar data={filteredNotifications} filters={filters} />
          <FiltersBar filters={filters} onChange={setFilters} />
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4">
        <Tabs defaultValue="timeline" className="flex flex-col gap-4">
          <TabsList className="w-fit">
            <TabsTrigger value="timeline" className="text-xs sm:text-sm">Campaign Timeline</TabsTrigger>
            <TabsTrigger value="all" className="text-xs sm:text-sm">All Notifications</TabsTrigger>
          </TabsList>
          <TabsContent value="timeline" className="mt-0">
            <TimelineView data={filteredNotifications} />
          </TabsContent>
          <TabsContent value="all" className="mt-0">
            <AllNotificationsView data={filteredNotifications} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
