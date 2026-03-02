"use client"

import { useMemo, useRef } from "react"
import type { NotificationRow } from "@/lib/csv-parser"
import { TIMELINE_STAGES, CAMPAIGN_ETAPES } from "@/lib/csv-parser"
import { NotificationCard } from "@/components/notification-card"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface TimelineViewProps {
  data: NotificationRow[]
}

interface StageGroup {
  stageId: string
  label: string
  social: NotificationRow[]
  consumer: NotificationRow[]
  other: NotificationRow[]
}

export function TimelineView({ data }: TimelineViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const campaignRows = useMemo(
    () => data.filter((r) => CAMPAIGN_ETAPES.includes(r.etape)),
    [data]
  )

  const stages = useMemo(() => {
    const groups: StageGroup[] = TIMELINE_STAGES.map((stage) => ({
      stageId: stage.id,
      label: stage.label,
      social: [],
      consumer: [],
      other: [],
    }))

    const reviewNoTiming: NotificationRow[] = []

    for (const row of campaignRows) {
      const timing = row.timing

      // review_expiree with timing "Expired" -> Post-deadline stage
      // review rows (any timing) -> Review section at the end
      if (row.etape === "review_expiree") {
        const expiredIdx = TIMELINE_STAGES.findIndex(s => s.timings.includes(timing))
        if (expiredIdx >= 0) {
          groups[expiredIdx].other.push(row)
        } else {
          reviewNoTiming.push(row)
        }
        continue
      }
      if (row.etape === "review") {
        reviewNoTiming.push(row)
        continue
      }

      const stageIdx = TIMELINE_STAGES.findIndex((s) =>
        s.timings.includes(timing)
      )

      if (stageIdx >= 0) {
        const group = groups[stageIdx]
        // Use cible field for social/consumer split in reminder stages
        if (row.etape === "rappels") {
          if (row.cible === "consumer") {
            group.consumer.push(row)
          } else if (row.cible === "both") {
            // "both" goes under social for display
            group.social.push(row)
          } else {
            group.social.push(row)
          }
        } else {
          group.other.push(row)
        }
      }
    }

    return { groups, reviewNoTiming }
  }, [campaignRows])

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -340 : 340,
      behavior: "smooth",
    })
  }

  const deadlineAfterIndex = TIMELINE_STAGES.findIndex((s) => s.id === "reminder-d1")

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Campaign lifecycle from application to review. {campaignRows.length} notifications shown.
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => scroll("left")}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:bg-accent transition-colors"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:bg-accent transition-colors"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex gap-0 overflow-x-auto pb-4">
        {stages.groups.map((group, idx) => {
          const totalCount =
            group.social.length + group.consumer.length + group.other.length
          const isReminder = group.stageId.startsWith("reminder-")
          const showDeadlineLine = idx === deadlineAfterIndex

          return (
            <div key={group.stageId} className="flex shrink-0">
              <div className="flex w-60 flex-col">
                <div className="flex items-center justify-between rounded-t-lg bg-foreground/5 px-3 py-2 border border-border">
                  <span className="text-xs font-semibold text-foreground truncate">
                    {group.label}
                  </span>
                  <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground/10 px-1.5 text-[10px] font-bold text-foreground">
                    {totalCount}
                  </span>
                </div>

                <div className="flex flex-col gap-1 border border-t-0 border-border p-2 min-h-[120px] max-h-[65vh] overflow-y-auto bg-muted/20 rounded-b-lg">
                  {isReminder && (group.social.length > 0 || group.consumer.length > 0) ? (
                    <div className="flex flex-col gap-2">
                      {group.social.length > 0 && (
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1">
                            Social
                          </span>
                          {group.social.map((row, i) => (
                            <NotificationCard
                              key={`${row.key}-s-${i}`}
                              row={row}
                              compact
                            />
                          ))}
                        </div>
                      )}
                      {group.consumer.length > 0 && (
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-1">
                            Consumer
                          </span>
                          {group.consumer.map((row, i) => (
                            <NotificationCard
                              key={`${row.key}-c-${i}`}
                              row={row}
                              compact
                            />
                          ))}
                        </div>
                      )}
                      {group.other.length > 0 &&
                        group.other.map((row, i) => (
                          <NotificationCard
                            key={`${row.key}-o-${i}`}
                            row={row}
                            compact
                          />
                        ))}
                    </div>
                  ) : (
                    <>
                      {totalCount === 0 ? (
                        <p className="py-6 text-center text-[11px] text-muted-foreground italic">
                          --
                        </p>
                      ) : (
                        [...group.other, ...group.social, ...group.consumer].map(
                          (row, i) => (
                            <NotificationCard
                              key={`${row.key}-${i}`}
                              row={row}
                              compact
                            />
                          )
                        )
                      )}
                    </>
                  )}
                </div>
              </div>

              {showDeadlineLine && (
                <div className="flex shrink-0 flex-col items-center justify-stretch w-10 py-2">
                  <div className="flex-1 w-0.5 bg-red-500" />
                  <div className="my-2 -rotate-90 whitespace-nowrap text-[9px] font-bold uppercase tracking-widest text-red-500">
                    Deadline
                  </div>
                  <div className="flex-1 w-0.5 bg-red-500" />
                </div>
              )}
            </div>
          )
        })}

        {stages.reviewNoTiming.length > 0 && (
          <div className="flex w-60 shrink-0 flex-col">
            <div className="flex items-center justify-between rounded-t-lg bg-foreground/5 px-3 py-2 border border-border">
              <span className="text-xs font-semibold text-foreground">Review</span>
              <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground/10 px-1.5 text-[10px] font-bold text-foreground">
                {stages.reviewNoTiming.length}
              </span>
            </div>
            <div className="flex flex-col gap-1 border border-t-0 border-border p-2 min-h-[120px] max-h-[65vh] overflow-y-auto bg-muted/20 rounded-b-lg">
              {stages.reviewNoTiming.map((row, i) => (
                <NotificationCard key={`${row.key}-rv-${i}`} row={row} compact />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
