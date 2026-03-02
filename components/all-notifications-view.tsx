"use client"

import { useMemo } from "react"
import type { NotificationRow } from "@/lib/csv-parser"
import { CATEGORY_ORDER } from "@/lib/csv-parser"
import { NotificationCard } from "@/components/notification-card"

interface AllNotificationsViewProps {
  data: NotificationRow[]
}

export function AllNotificationsView({ data }: AllNotificationsViewProps) {
  const grouped = useMemo(() => {
    const map = new Map<string, NotificationRow[]>()

    for (const row of data) {
      const cat = row.categorie || "Other"
      if (!map.has(cat)) map.set(cat, [])
      map.get(cat)!.push(row)
    }

    // Sort within each group alphabetically by key
    for (const [, rows] of map) {
      rows.sort((a, b) => a.key.localeCompare(b.key))
    }

    // Sort categories by defined order
    const sorted: [string, NotificationRow[]][] = []
    for (const cat of CATEGORY_ORDER) {
      if (map.has(cat)) {
        sorted.push([cat, map.get(cat)!])
        map.delete(cat)
      }
    }
    // Add any remaining categories
    for (const [cat, rows] of map) {
      sorted.push([cat, rows])
    }

    return sorted
  }, [data])

  return (
    <div className="flex flex-col gap-8">
      {grouped.map(([category, rows]) => (
        <section key={category} className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-foreground">{category}</h3>
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground/10 px-1.5 text-[10px] font-bold text-foreground">
              {rows.length}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {rows.map((row, i) => (
              <NotificationCard key={`${row.key}-${i}`} row={row} />
            ))}
          </div>
        </section>
      ))}

      {grouped.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <p className="text-sm">No notifications match your filters.</p>
        </div>
      )}
    </div>
  )
}
