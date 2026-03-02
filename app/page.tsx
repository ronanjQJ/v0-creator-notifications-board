"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import type { NotificationRow } from "@/lib/csv-parser"
import { parseCSV } from "@/lib/csv-parser"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatsBar } from "@/components/stats-bar"
import { FiltersBar, applyFilters, DEFAULT_FILTERS } from "@/components/filters-bar"
import type { Filters } from "@/components/filters-bar"
import { TimelineView } from "@/components/timeline-view"
import { AllNotificationsView } from "@/components/all-notifications-view"
import { ThemeToggle } from "@/components/theme-toggle"
import { LogoutButton } from "@/components/logout-button"
import { RefreshCw, Clock, LayoutGrid, FileWarning, Info } from "lucide-react"

export default function BoardPage() {
  const [rawData, setRawData] = useState<NotificationRow[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)

  const loadCSV = useCallback(async () => {
    try {
      const res = await fetch("/data/notifications.csv")
      if (!res.ok) return
      const text = await res.text()
      const rows = parseCSV(text)
      if (rows.length > 0) setRawData(rows)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCSV()
  }, [loadCSV])

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
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <LogoutButton />
            </div>
          </div>
        </header>
        <main className="mx-auto flex max-w-md flex-col items-center gap-6 px-4 pt-24 sm:px-6 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <FileWarning className="h-7 w-7 text-muted-foreground" />
          </div>
          <div className="flex flex-col gap-1.5">
            <h2 className="text-xl font-bold text-foreground">No data available</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              The notifications CSV could not be loaded. Please try again later.
            </p>
          </div>
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
            <StatsBar data={rawData} />
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Tip banner */}
      <div className="mx-auto max-w-[1800px] px-4 pt-3 sm:px-6">
        <div className="flex items-start gap-2.5 rounded-lg border border-sky-200 dark:border-sky-800/60 bg-sky-50 dark:bg-sky-950/30 px-3.5 py-2.5">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" />
          <p className="text-xs leading-relaxed text-sky-800 dark:text-sky-300">
            To view the full email wording, search for its subject line in&nbsp;
            <a
              href="https://app.im.skeepers.io/admin/tools/sent_emails/search_forms/new"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline underline-offset-2 hover:text-sky-600 dark:hover:text-sky-200"
            >
              Skeepers Admin
            </a>.
          </p>
        </div>
      </div>

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
