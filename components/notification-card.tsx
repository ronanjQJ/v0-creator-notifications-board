"use client"

import type { NotificationRow } from "@/lib/csv-parser"
import { Badge } from "@/components/ui/badge"
import { Mail, Bell } from "lucide-react"

interface NotificationCardProps {
  row: NotificationRow
  compact?: boolean
  showPushView?: boolean
}

export function NotificationCard({ row, compact = false }: NotificationCardProps) {
  return (
    <div
      className="group relative flex flex-col gap-2 rounded-lg border border-border bg-card p-3 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
    >
      {/* Row 1: Key */}
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-xs font-bold text-foreground leading-snug break-all">
          {row.key}
        </span>
      </div>

      {/* Channel pills + timing */}
      <div className="flex flex-wrap items-center gap-1.5">
        {(row.canal === "Email" || row.canal === "Email + Push") && (
          <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 dark:bg-sky-900/40 px-2 py-0.5 text-[10px] font-medium text-sky-700 dark:text-sky-300">
            <Mail className="h-2.5 w-2.5" />
            Email
          </span>
        )}
        {(row.canal === "Push" || row.canal === "Email + Push") && (
          <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 dark:bg-violet-900/40 px-2 py-0.5 text-[10px] font-medium text-violet-700 dark:text-violet-300">
            <Bell className="h-2.5 w-2.5" />
            Push
          </span>
        )}
        {row.timing && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-medium">
            {row.timing}
          </Badge>
        )}
      </div>

      {/* Subject line */}
      {row.sujet_email && (
        <p className={`text-xs text-muted-foreground leading-relaxed ${compact ? "line-clamp-2" : ""}`}>
          {row.sujet_email}
        </p>
      )}

      {/* Push content */}
      {row.push_content && (
        <p className={`text-xs text-muted-foreground leading-relaxed italic ${compact ? "line-clamp-2" : ""}`}>
          <Bell className="mr-1 inline h-3 w-3 text-violet-500" />
          {row.push_content}
        </p>
      )}

      {/* Trigger */}
      <p className="text-[11px] text-muted-foreground/80 leading-snug">
        <span className="font-medium text-muted-foreground">Trigger:</span> {row.trigger}
      </p>

      {/* Date added */}
      {row.date_ajout && (
        <p className="text-[10px] text-muted-foreground/60">
          Added on {row.date_ajout}
        </p>
      )}
    </div>
  )
}
