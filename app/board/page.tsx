"use client"

import { useState, useEffect, useMemo } from "react"
import type { NotificationRow } from "@/lib/csv-parser"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { StatsBar } from "@/components/stats-bar"
import { FiltersBar, applyFilters, DEFAULT_FILTERS } from "@/components/filters-bar"
import type { Filters } from "@/components/filters-bar"
import { TimelineView } from "@/components/timeline-view"
import { AllNotificationsView } from "@/components/all-notifications-view"
import { ThemeToggle } from "@/components/theme-toggle"
import { RefreshCw, Clock, LayoutGrid, Upload, FileWarning } from "lucide-react"
import Link from "next/link"

const STORAGE_KEY = "creator-notifications-data"

export default function BoardPage() {
  const [rawData, setRawData] = useState<NotificationRow[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as NotificationRow[]
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRawData(parsed)
        }
      }
    } catch {
      // ignore parse errors
    } finally {
      setLoading(false)
    }
  }, [])

  const filteredData = useMemo(() => {
    if (!rawData) return []
    return applyFilters(rawData, filters)
  }, [rawData, filters])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading board...</p>
        </div>
      </div>
    )
  }

  if (!rawData) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card/80 backdrop-blur-sm">
          <div className="mx-auto flex max-w-[1800px] items-center justify-between px-4 py-4 sm:px-6">
            <h1 className="text-lg font-bold tracking-tight text-foreground">
              Creator Notifications Board
            </h1>
            <ThemeToggle />
          </div>
        </header>
        <main className="mx-auto flex max-w-md flex-col items-center gap-6 px-4 pt-24 sm:px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <FileWarning className="h-7 w-7 text-muted-foreground" />
          </div>
          <div className="flex flex-col gap-1.5">
            <h2 className="text-xl font-bold text-foreground">No data yet</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Please upload a CSV first to populate the notifications board.
            </p>
          </div>
          <Button asChild size="lg" className="gap-2">
            <Link href="/">
              <Upload className="h-4 w-4" />
              Upload CSV
            </Link>
          </Button>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1800px] items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
              Creator Notifications Board
            </h1>
            <StatsBar data={rawData} filters={filters} />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs"
              asChild
            >
              <Link href="/">
                <Upload className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Upload new CSV</span>
                <span className="sm:hidden">Update</span>
              </Link>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1800px] px-4 py-4 sm:px-6">
        <Tabs defaultValue="timeline" className="flex flex-col gap-4">
          <div className="sticky top-[73px] z-20 -mx-4 border-b border-border bg-background/80 px-4 pb-3 pt-1 backdrop-blur-sm sm:-mx-6 sm:px-6">
            <div className="flex flex-col gap-3">
              <TabsList className="w-fit">
                <TabsTrigger value="timeline" className="gap-1.5 text-xs">
                  <Clock className="h-3.5 w-3.5" />
                  Campaign Timeline
                </TabsTrigger>
                <TabsTrigger value="all" className="gap-1.5 text-xs">
                  <LayoutGrid className="h-3.5 w-3.5" />
                  All Notifications
                </TabsTrigger>
              </TabsList>
              <FiltersBar filters={filters} onChange={setFilters} />
            </div>
          </div>

          <TabsContent value="timeline" className="mt-0">
            <TimelineView data={filteredData} />
          </TabsContent>

          <TabsContent value="all" className="mt-0">
            <AllNotificationsView data={filteredData} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
