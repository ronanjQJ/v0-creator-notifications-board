# Creator Notifications Board

A CSV-fed dashboard that maps every notification sent to creators across their journey.
Built by a PM, for PMs. No engineering resources required.

**Live demo:** [v0-creator-notifications-board-hwkud514a.vercel.app/demo](https://v0-creator-notifications-board-hwkud514a.vercel.app/demo)

## Why I built this

Working on a creator-facing SaaS product, I kept getting the same question 
from stakeholders: "What exactly do we send to our users?" No one had a clear 
answer. The information was scattered across email tools, docs, and people's 
heads. I spent hours mapping it manually — then realized this was a PM problem 
worth solving properly.

## The Problem

PMs and product teams need a single view of their notification landscape. Today 
it's scattered across email platforms, Confluence, and tribal knowledge. 
Answering "What do we send?" or "Where are the gaps?" takes days instead of minutes.

## The Solution

Two views:
- **Campaign Timeline** – Order lifecycle (application → review → expiry). 
Spot gaps at a glance.
- **All Notifications** – Grouped by category with filters 
(Audience, Channel, Status, Search).

Edit a CSV in Sheets/Excel, upload it, done. No backend.

## Features

- Timeline and list views
- Filter by channel, status, audience
- "See full text" modal for email body
- Dark mode
- Demo mode with sample data (no upload needed)

## Getting Started

### Demo
Visit `/demo` — sample data loaded automatically, no upload required.

### With Your Own Data
1. Go to `/` (upload page)
2. Upload your CSV
3. You'll be redirected to `/board`

## CSV Format

| Column | Description |
|--------|-------------|
| `cle` | Unique notification key |
| `categorie` | Category grouping |
| `canal` | `email`, `push`, or `email + push` |
| `statut` | `en_prod`, `proposed`, `planned`, `removed` |
| `declencheur` | Trigger description |
| `timing` | e.g. "D+3", "Instant" |
| `cible` | `social`, `consumer`, or `both` |
| `sujet_email` | Email subject line |
| `push_content` | Push notification content |
| `body_html` | Full HTML body (optional) |
| `wording_url` | Link to wording doc |
| `jira_ticket` | Jira reference |
| `date_added` | YYYY-MM-DD |
| `volume_mois` | Monthly volume |

## Tradeoffs

- **CSV as source** – No real-time sync, but zero backend. PMs know Sheets/Excel.
- **v0.dev** – Shipped fast. Prompt is versioned for regeneration.
- **Demo mode** – Separate route, never touches your real data.

## What
