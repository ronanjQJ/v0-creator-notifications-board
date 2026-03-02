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
  date_ajout: string
}

/* ── Timeline stage definition ── */

export interface TimelineStage {
  id: string
  label: string
  timings: string[]
}

export const TIMELINE_STAGES: TimelineStage[] = [
  { id: "application", label: "Application", timings: ["Approved"] },
  { id: "shipping", label: "Shipping", timings: ["Shipping"] },
  { id: "brief-reminder", label: "Brief reminder", timings: ["D+2"] },
  { id: "reminder-d14", label: "D-14 / D-10", timings: ["D-14/D-10"] },
  { id: "reminder-d7", label: "D-7", timings: ["D-7"] },
  { id: "reminder-d3", label: "D-3", timings: ["D-3"] },
  { id: "reminder-d1", label: "D-1", timings: ["D-1"] },
  { id: "expired", label: "Post-deadline", timings: ["Expired"] },
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
  "New Campaign",
  "Onboarding",
  "Shipping",
  "Re-engagement",
  "Review",
  "Review reminders",
  "Account",
  "Communication",
  "Moderation",
  "Rewards",
  "Amplification",
  // Legacy categories from older CSVs
  "Order",
  "Reminder",
  "Retention",
]

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
      trigger: obj["trigger"] ?? "",
      canal: normalizeCanal(obj["canal"] ?? "Email"),
      cible: normalizeCible(obj["cible"] ?? "social"),
      etape: (obj["etape"] ?? "").toLowerCase().trim(),
      timing: obj["timing"] ?? "",
      date_ajout: obj["date_ajout"] ?? "",
    }

    rows.push(row)
  }

  return rows
}
