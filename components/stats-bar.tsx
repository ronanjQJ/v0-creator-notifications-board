"use client"

import { useMemo } from "react"
import type { NotificationRow } from "@/lib/csv-parser"
import { Mail, Bell, Zap } from "lucide-react"

interface StatsBarProps {
  data: NotificationRow[]
}

export function StatsBar({ data }: StatsBarProps) {
  const stats = useMemo(() => {
    let emailOnly = 0
    let pushOnly = 0
    let emailPush = 0

    for (const row of data) {
      // Exclude archived notifications from stats
      if (row.categorie === "Archive") continue
      switch (row.canal) {
        case "Email": emailOnly++; break
        case "Push": pushOnly++; break
        case "Email + Push": emailPush++; break
      }
    }

    const total = emailOnly + pushOnly + emailPush
    return { total, emailOnly, pushOnly, emailPush }
  }, [data])

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <span className="flex items-center gap-1.5">
        <span className="font-medium text-foreground">{stats.total}</span>
        <span className="text-muted-foreground">notifications</span>
      </span>

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
