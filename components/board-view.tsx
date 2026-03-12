"use client"

import { useMemo, useRef } from "react"
import type { NotificationRow, JourneyStage } from "@/lib/csv-parser"
import { EMAIL_STAGES } from "@/lib/csv-parser"
import { NotificationCard } from "@/components/notification-card"
import { ChevronLeft, ChevronRight } from "lucide-react"

/* ── Chevron arrow shape ── */

function ChevronArrow({
  stage,
  count,
  isFirst,
}: {
  stage: JourneyStage
  count: number
  isFirst: boolean
}) {
  return (
    <div
      className="relative flex shrink-0 items-center justify-center px-5 py-2"
      style={{
        backgroundColor: stage.color,
        color: stage.textColor,
        clipPath: isFirst
          ? "polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%)"
          : "polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%, 14px 50%)",
        minWidth: "130px",
        height: "38px",
        marginLeft: isFirst ? "0" : "-6px",
      }}
      title={`${stage.label} (${count})`}
    >
      <span className="truncate max-w-[110px] text-[11px] font-semibold leading-tight">
        {stage.label}
      </span>
      {count > 0 && (
        <span
          className="ml-1.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[9px] font-bold"
          style={{ backgroundColor: "rgba(0,0,0,0.2)", color: "#fff" }}
        >
          {count}
        </span>
      )}
    </div>
  )
}

/* ── Single journey section (Emails or Push) ── */

function JourneySection({
  title,
  stages,
  rows,
  isPush,
}: {
  title: string
  stages: JourneyStage[]
  rows: NotificationRow[]
  isPush: boolean
}) {
  const scrollRef = useRef<HTMLDivElement>(null)

  // Group rows by etape (direct match to stage.id)
  const grouped = useMemo(() => {
    const map = new Map<string, NotificationRow[]>()
    for (const stage of stages) map.set(stage.id, [])

    for (const row of rows) {
      const etape = row.etape
      if (map.has(etape)) {
        map.get(etape)!.push(row)
      }
      // skip rows that don't match any stage (e.g. archive)
    }
    return map
  }, [stages, rows])

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return
    scrollRef.current.scrollBy({
      left: dir === "left" ? -320 : 320,
      behavior: "smooth",
    })
  }

  return (
    <section className="flex flex-col gap-3">
      {/* Section title + scroll buttons */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          {title}
        </h2>
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

      {/* Chevron pipeline */}
      <div className="flex items-center overflow-x-auto pb-1 scrollbar-hide">
        {stages.map((stage, i) => (
          <ChevronArrow
            key={stage.id}
            stage={stage}
            count={grouped.get(stage.id)?.length ?? 0}
            isFirst={i === 0}
          />
        ))}
      </div>

      {/* Card columns */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-4"
      >
        {stages.map((stage) => {
          const stageRows = grouped.get(stage.id) ?? []
          return (
            <div
              key={stage.id}
              className="flex w-56 shrink-0 flex-col"
            >
              {/* Column header */}
              <div
                className="flex items-center justify-between rounded-t-lg px-3 py-2"
                style={{ backgroundColor: stage.color, color: stage.textColor }}
              >
                <span className="text-xs font-semibold truncate">
                  {stage.label}
                </span>
                <span
                  className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold"
                  style={{ backgroundColor: "rgba(0,0,0,0.15)", color: stage.textColor }}
                >
                  {stageRows.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-2 rounded-b-lg border border-t-0 border-border bg-muted/30 p-2 min-h-[80px] max-h-[55vh] overflow-y-auto">
                {stageRows.length === 0 ? (
                  <p className="py-6 text-center text-[11px] text-muted-foreground italic">
                    --
                  </p>
                ) : (
                  stageRows.map((row, idx) => (
                    <NotificationCard
                      key={`${row.key}-${idx}`}
                      row={row}
                      showPushView={isPush}
                    />
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

/* ── Main board: two sections ── */

interface BoardViewProps {
  data: NotificationRow[]
}

export function BoardView({ data }: BoardViewProps) {
  return (
    <div className="flex flex-col gap-10">
      <JourneySection
        title="Emails"
        stages={EMAIL_STAGES}
        rows={data}
        isPush={false}
      />
    </div>
  )
}
