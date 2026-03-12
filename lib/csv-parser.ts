/* ── Notification types ── */

export interface NotificationRow {
  key: string
  categorie: string
  sujet_email: string
  push_content: string
  trigger: string
  canal: "Email" | "Push" | "Email + Push"
  cible: "social" | "consumer" | "both"
  etape: string
  timing: string
  open_rate: number | null
  volume_mois: number | null
  statut: "en_prod" | "pas_en_prod" | "ajout_proposed" | "a_supprimer"
  date_ajout: string
  wording_url: string
  jira_ticket: string
  retake: string
  body_html: string
}

export type StatusFilter = NotificationRow["statut"]

/* ── Timeline stage definition ── */

export interface TimelineStage {
  id: string
  label: string
  timings: string[]
}

export const TIMELINE_STAGES: TimelineStage[] = [
  { id: "application", label: "Application", timings: ["Approved"] },
  { id: "shipping", label: "Shipping", timings: ["Shipping"] },
  { id: "activation", label: "Activation", timings: ["D+2"] },
  { id: "reminder-d14", label: "D-14 / D-10", timings: ["D-14/D-10"] },
  { id: "reminder-d7", label: "D-7", timings: ["D-7"] },
  { id: "reminder-d5", label: "D-5", timings: ["D-5"] },
  { id: "reminder-d3", label: "D-3", timings: ["D-3"] },
  { id: "reminder-d1", label: "D-1", timings: ["D-1"] },
  { id: "expired", label: "Expired", timings: ["Expired"] },
]

export const CAMPAIGN_ETAPES = [
  "candidature",
  "expedition",
  "rappels",
  "review",
  "review_expiree",
]

/* ── Category display order ── */

export const CATEGORY_ORDER = [
  "Order",
  "Onboarding",
  "New Campaign",
  "Reminder",
  "Moderation",
  "Retention",
  "Account",
  "Communication",
]

/* ── Status helpers ── */

export function statusLabel(statut: string): string {
  switch (statut) {
    case "en_prod": return "Live"
    case "pas_en_prod": return "Planned"
    case "ajout_proposed": return "Proposed"
    case "a_supprimer": return "Removed"
    default: return statut
  }
}

export function statusColor(statut: string): { bg: string; text: string; border: string } {
  switch (statut) {
    case "en_prod": return { bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-700 dark:text-emerald-400", border: "border-l-emerald-500" }
    case "pas_en_prod": return { bg: "bg-sky-50 dark:bg-sky-950/40", text: "text-sky-700 dark:text-sky-400", border: "border-l-sky-500" }
    case "ajout_proposed": return { bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-700 dark:text-amber-400", border: "border-l-amber-500" }
    case "a_supprimer": return { bg: "bg-zinc-100 dark:bg-zinc-800/40", text: "text-zinc-500 dark:text-zinc-400", border: "border-l-zinc-400" }
    default: return { bg: "bg-zinc-50 dark:bg-zinc-900", text: "text-zinc-600 dark:text-zinc-400", border: "border-l-zinc-300" }
  }
}

/* ── Volume formatter ── */

export function formatVolume(v: number | null): string {
  if (v === null) return ""
  if (v >= 1000) return `${Math.round(v / 1000)}K/mo`
  return `${v}/mo`
}

/* ── Jira URL helper ── */

export function jiraUrl(ticket: string): string | null {
  if (!ticket || ticket === "-") return null
  const first = ticket.split(";")[0].trim()
  if (!first) return null
  return `https://skeepers.atlassian.net/browse/${first}`
}

export function jiraLabel(ticket: string): string {
  if (!ticket) return ""
  const parts = ticket.split(";").map((t) => t.trim()).filter(Boolean)
  if (parts.length > 1) return "Jira"
  return parts[0] || ""
}

/* ── Robust CSV parser ── */

function parseCSVLine(line: string, delimiter: string): string[] {
  const fields: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        current += char
      }
    } else {
      if (char === '"') {
        inQuotes = true
      } else if (char === delimiter) {
        fields.push(current.trim())
        current = ""
      } else {
        current += char
      }
    }
  }
  fields.push(current.trim())
  return fields
}

function detectDelimiter(headerLine: string): string {
  let commas = 0
  let semicolons = 0
  let inQuotes = false
  for (const char of headerLine) {
    if (char === '"') inQuotes = !inQuotes
    if (!inQuotes) {
      if (char === ",") commas++
      if (char === ";") semicolons++
    }
  }
  return semicolons > commas ? ";" : ","
}

function parseRate(val: string): number | null {
  if (!val || val === "-") return null
  const cleaned = val.replace("%", "").trim()
  const num = parseFloat(cleaned)
  return isNaN(num) ? null : num
}

function parseVolume(val: string): number | null {
  if (!val || val === "-") return null
  const num = parseInt(val, 10)
  return isNaN(num) ? null : num
}

function normalizeCanal(val: string): NotificationRow["canal"] {
  const lower = val.toLowerCase().trim()
  if (lower.includes("email") && lower.includes("push")) return "Email + Push"
  if (lower === "push") return "Push"
  return "Email"
}

function normalizeCible(val: string): NotificationRow["cible"] {
  const lower = val.toLowerCase().trim()
  if (lower === "consumer") return "consumer"
  if (lower === "both") return "both"
  return "social"
}

function normalizeStatut(val: string): NotificationRow["statut"] {
  const lower = val.toLowerCase().trim()
  if (lower === "en_prod") return "en_prod"
  if (lower === "pas_en_prod") return "pas_en_prod"
  if (lower === "ajout_proposed") return "ajout_proposed"
  if (lower === "a_supprimer") return "a_supprimer"
  if (lower === "planned") return "pas_en_prod"
  if (lower === "removed") return "a_supprimer"
  return "en_prod"
}

export function parseCSV(text: string): NotificationRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)

  if (lines.length < 2) return []

  const delimiter = detectDelimiter(lines[0])

  const headers = parseCSVLine(lines[0], delimiter).map((h) =>
    h.toLowerCase().replace(/^\uFEFF/, "").trim()
  )

  const rows: NotificationRow[] = []

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i], delimiter)
    const obj: Record<string, string> = {}
    headers.forEach((h, idx) => {
      obj[h] = values[idx] ?? ""
    })

    const key = obj["key"] ?? ""
    if (!key || key === "-") continue

    const row: NotificationRow = {
      key,
      categorie: obj["categorie"] ?? "",
      sujet_email: obj["sujet_email"] ?? obj["sujet"] ?? "",
      push_content: obj["push_content"] ?? "",
      trigger: obj["trigger"] ?? obj["declencheur"] ?? "",
      canal: normalizeCanal(obj["canal"] ?? "Email"),
      cible: normalizeCible(obj["cible"] ?? "social"),
      etape: (obj["etape"] ?? "").toLowerCase().trim(),
      timing: obj["timing"] ?? "",
      open_rate: parseRate(obj["open_rate"] ?? ""),
      volume_mois: parseVolume(obj["volume_mois"] ?? ""),
      statut: normalizeStatut(obj["statut"] ?? "en_prod"),
      date_ajout: obj["date_ajout"] ?? "",
      wording_url: obj["wording_url"] ?? "",
      jira_ticket: obj["jira_ticket"] ?? "",
      retake: obj["retake"] ?? "",
      body_html: obj["body_html"] ?? "",
    }

    rows.push(row)
  }

  return rows
}
