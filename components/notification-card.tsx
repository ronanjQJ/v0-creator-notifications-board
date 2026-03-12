"use client"

import { useState, useCallback } from "react"
import type { NotificationRow } from "@/lib/csv-parser"
import {
  statusLabel,
  statusColor,
  formatVolume,
  jiraUrl,
  jiraLabel,
} from "@/lib/csv-parser"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Mail, Bell, ExternalLink, Ticket, FileText } from "lucide-react"

interface NotificationCardProps {
  row: NotificationRow
  compact?: boolean
}

export function NotificationCard({ row, compact = false }: NotificationCardProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const sc = statusColor(row.statut)
  const jUrl = jiraUrl(row.jira_ticket)
  const jLabel = jiraLabel(row.jira_ticket)
  const hasModalContent = row.sujet_email || row.push_content || row.wording_url || row.body_html

  const openModal = useCallback(() => {
    if (hasModalContent) setModalOpen(true)
  }, [hasModalContent])

  return (
    <>
      <div
        className={`group relative flex flex-col gap-2 rounded-lg border border-border bg-card p-3 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 border-l-[3px] ${sc.border} ${
          row.statut === "a_supprimer" ? "opacity-60" : ""
        }`}
      >
        {/* Row 1: Key + Status */}
        <div className="flex items-start justify-between gap-2">
          <span className="font-mono text-xs font-bold text-foreground leading-snug break-all">
            {row.key}
          </span>
          <Badge
            variant="secondary"
            className={`shrink-0 text-[10px] font-semibold px-1.5 py-0 ${sc.bg} ${sc.text} border-0`}
          >
            {statusLabel(row.statut)}
          </Badge>
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

        {/* Volume */}
        {row.volume_mois !== null && (
          <div className="flex items-center">
            <span className="text-[10px] font-medium text-muted-foreground">
              {formatVolume(row.volume_mois)}
            </span>
          </div>
        )}

        {/* Action links row */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border">
          {row.wording_url && (
            <a
              href={row.wording_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-foreground hover:bg-accent transition-colors"
            >
              <ExternalLink className="h-2.5 w-2.5" />
              View wording
            </a>
          )}
          {jUrl && (
            <a
              href={jUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-foreground hover:bg-accent transition-colors"
            >
              <Ticket className="h-2.5 w-2.5" />
              {jLabel}
            </a>
          )}
          {hasModalContent && (
            <button
              onClick={openModal}
              className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-foreground hover:bg-accent transition-colors"
            >
              <FileText className="h-2.5 w-2.5" />
              See full text
            </button>
          )}
        </div>
      </div>

      {/* Full text modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-mono text-sm">{row.key}</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 pt-2">
            {/* Channel + Status */}
            <div className="flex flex-wrap items-center gap-2">
              {(row.canal === "Email" || row.canal === "Email + Push") && (
                <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 dark:bg-sky-900/40 px-2.5 py-1 text-xs font-medium text-sky-700 dark:text-sky-300">
                  <Mail className="h-3 w-3" />
                  Email
                </span>
              )}
              {(row.canal === "Push" || row.canal === "Email + Push") && (
                <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 dark:bg-violet-900/40 px-2.5 py-1 text-xs font-medium text-violet-700 dark:text-violet-300">
                  <Bell className="h-3 w-3" />
                  Push
                </span>
              )}
              <Badge
                variant="secondary"
                className={`text-xs font-semibold px-2 py-0.5 ${sc.bg} ${sc.text} border-0`}
              >
                {statusLabel(row.statut)}
              </Badge>
              {row.timing && (
                <Badge variant="outline" className="text-xs px-2 py-0.5 font-medium">
                  {row.timing}
                </Badge>
              )}
            </div>

            {/* Email subject */}
            {row.sujet_email && (
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Email subject
                </span>
                <p className="text-sm text-foreground leading-relaxed">
                  {row.sujet_email}
                </p>
              </div>
            )}

            {/* Push content */}
            {row.push_content && (
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Push content
                </span>
                <p className="text-sm text-foreground leading-relaxed italic">
                  {row.push_content}
                </p>
              </div>
            )}

            {/* Trigger */}
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Trigger
              </span>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {row.trigger}
              </p>
            </div>

            {/* Wording link */}
            {row.wording_url && (
              <a
                href={row.wording_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-sky-600 dark:text-sky-400 hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View wording
              </a>
            )}

            {/* Body HTML */}
            {row.body_html && (
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Email body
                </span>
                <div
                  className="max-h-60 overflow-y-auto rounded-md border border-border bg-muted/30 p-3 text-sm text-foreground leading-relaxed prose prose-sm dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: sanitizeHTML(row.body_html) }}
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

/* Simple HTML sanitizer — strips script/style/event handlers */
function sanitizeHTML(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "")
}
