"use client"

import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, X } from "lucide-react"
import type { NotificationRow } from "@/lib/csv-parser"

export interface Filters {
  search: string
  audience: "all" | "social" | "consumer"
  channel: "all" | "email" | "push"
  statuses: Set<string>
}

export const DEFAULT_FILTERS: Filters = {
  search: "",
  audience: "all",
  channel: "all",
  statuses: new Set(["en_prod"]),
}

interface FiltersBarProps {
  filters: Filters
  onChange: (filters: Filters) => void
}

const AUDIENCE_OPTIONS = [
  { value: "all" as const, label: "Both" },
  { value: "social" as const, label: "Influencer" },
  { value: "consumer" as const, label: "Consumer" },
]

const CHANNEL_OPTIONS = [
  { value: "all" as const, label: "Both" },
  { value: "email" as const, label: "Email" },
  { value: "push" as const, label: "Push" },
]

const STATUS_OPTIONS = [
  { value: "en_prod", label: "Live", color: "bg-emerald-500" },
  { value: "ajout_proposed", label: "Proposed", color: "bg-amber-500" },
  { value: "pas_en_prod", label: "Planned", color: "bg-sky-500" },
  { value: "a_supprimer", label: "Removed", color: "bg-zinc-400" },
] as const

export function FiltersBar({ filters, onChange }: FiltersBarProps) {
  const toggleStatus = (st: string) => {
    const next = new Set(filters.statuses)
    if (next.has(st)) {
      next.delete(st)
    } else {
      next.add(st)
    }
    onChange({ ...filters, statuses: next })
  }

  const isDefault =
    !filters.search &&
    filters.audience === "all" &&
    filters.channel === "all" &&
    filters.statuses.size === 1 &&
    filters.statuses.has("en_prod")

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative w-full sm:w-64">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search key, subject, trigger..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="h-8 pl-8 text-xs"
        />
        {filters.search && (
          <button
            onClick={() => onChange({ ...filters, search: "" })}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Audience filter */}
      <div className="flex items-center gap-1">
        <span className="mr-1 text-xs text-muted-foreground">Audience:</span>
        {AUDIENCE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange({ ...filters, audience: opt.value })}
            className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
              filters.audience === opt.value
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Channel filter */}
      <div className="flex items-center gap-1">
        <span className="mr-1 text-xs text-muted-foreground">Channel:</span>
        {CHANNEL_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange({ ...filters, channel: opt.value })}
            className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
              filters.channel === opt.value
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Status filters */}
      <div className="flex items-center gap-1">
        <span className="mr-1 text-xs text-muted-foreground">Status:</span>
        {STATUS_OPTIONS.map((st) => (
          <button
            key={st.value}
            onClick={() => toggleStatus(st.value)}
            className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
              filters.statuses.has(st.value)
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${st.color}`} />
            {st.label}
          </button>
        ))}
      </div>

      {/* Clear filters */}
      {!isDefault && (
        <Badge
          variant="secondary"
          className="cursor-pointer text-xs"
          onClick={() => onChange(DEFAULT_FILTERS)}
        >
          Clear filters
          <X className="ml-1 h-3 w-3" />
        </Badge>
      )}
    </div>
  )
}

/* ── Filter logic ── */

export function applyFilters(data: readonly NotificationRow[], filters: Filters): NotificationRow[] {
  const searchLower = filters.search.toLowerCase()

  return data.filter((row) => {
    // Audience
    if (filters.audience !== "all") {
      if (row.cible !== filters.audience && row.cible !== "both") return false
    }

    // Channel — "email" shows Email + Email+Push, "push" shows Push + Email+Push
    if (filters.channel === "email") {
      if (row.canal !== "Email" && row.canal !== "Email + Push") return false
    } else if (filters.channel === "push") {
      if (row.canal !== "Push" && row.canal !== "Email + Push") return false
    }

    // Status
    if (filters.statuses.size > 0 && !filters.statuses.has(row.statut)) return false

    // Search
    if (searchLower) {
      const haystack = `${row.key} ${row.sujet_email} ${row.push_content} ${row.trigger}`.toLowerCase()
      if (!haystack.includes(searchLower)) return false
    }

    return true
  })
}
