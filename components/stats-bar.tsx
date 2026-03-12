"use client"

import { useMemo } from "react"
import type { NotificationRow } from "@/lib/csv-parser"
import type { Filters } from "@/components/filters-bar"
import { Mail, Bell, Zap } from "lucide-react"

interface StatsBarProps {
  data: NotificationRow[]
  filters: Filters
}

export function StatsBar({ data, filters }: StatsBarProps) {
  const stats = useMemo(() => {
    let live = 0
    let proposed = 0
    let planned = 0
    let emailOnly = 0
    let pushOnly = 0
    let emailPush = 0

    if (!data || !Array.isArray(data)) {
      return { live, proposed, planned, emailOnly, pushOnly, emailPush }
    }

    for (const row of data) {
      switch (row.statut) {
        case "en_prod": live++; break
        case "ajout_proposed": proposed++; break
        case "pas_en_prod": planned++; break
      }
      switch (row.canal) {
        case "Email": emailOnly++; break
        case "Push": pushOnly++; break
        case "Email + Push": emailPush++; break
      }
    }

    return { live, proposed, planned, emailOnly, pushOnly, emailPush }
  }, [data])

  // Show additional status counts only if those statuses are active in filters
  const showProposed = filters.statuses.has("ajout_proposed")
  const showPlanned = filters.statuses.has("pas_en_prod")

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="font-medium text-foreground">{stats.live}</span>
          <span className="text-muted-foreground">live</span>
        </span>
        {showProposed && stats.proposed > 0 && (
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="font-medium text-foreground">{stats.proposed}</span>
            <span className="text-muted-foreground">proposed</span>
          </span>
        )}
        {showPlanned && stats.planned > 0 && (
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-sky-500" />
            <span className="font-medium text-foreground">{stats.planned}</span>
            <span className="text-muted-foreground">planned</span>
          </span>
        )}
      </div>

      <span className="hidden h-4 w-px bg-border sm:block" />

      <div className="flex items-center gap-3 text-muted-foreground">
        <span className="flex items-center gap-1" title="Email only">
          <Mail className="h-3.5 w-3.5" />
          <span className="text-xs">{stats.emailOnly}</span>
        </span>
        <span className="flex items-center gap-1" title="Push only">
          <Bell className="h-3.5 w-3.5" />
          <span className="text-xs">{stats.pushOnly}</span>
        </span>
        <span className="flex items-center gap-1" title="Email + Push">
          <Zap className="h-3.5 w-3.5" />
          <span className="text-xs">{stats.emailPush}</span>
        </span>
      </div>
    </div>
  )
}
