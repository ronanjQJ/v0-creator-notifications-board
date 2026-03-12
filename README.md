# Creator Notifications Board

A visual dashboard to explore and manage creator notification campaigns across their journey.
Demo : https://v0-creator-notifications-board-hwkud514a.vercel.app/demo

## Features

- **Campaign Timeline View** - Visualize notifications across journey stages (Application → Review/Expired)
- **All Notifications View** - Browse all notifications grouped by category, sorted by volume
- **Filtering** - Search, filter by channel (Email/Push), status, and audience
- **Dark Mode** - Toggle between light and dark themes

## Getting Started

### Demo

Visit `/demo` to see the board with sample data - no upload required.

### With Your Own Data

1. Go to `/` (upload page)
2. Upload a CSV file or paste CSV content
3. Click "Upload and view board"
4. You'll be redirected to `/board` with your data

## CSV Format

Your CSV should include these columns:

| Column | Description |
|--------|-------------|
| `cle` | Unique notification key |
| `categorie` | Category grouping |
| `canal` | Channel: `email`, `push`, or `email + push` |
| `statut` | Status: `en_prod`, `proposed`, `planned`, `removed` |
| `declencheur` | Trigger description |
| `timing` | Timing info (e.g., "D+3", "Instant") |
| `cible` | Audience: `social`, `consumer`, or `both` |
| `sujet_email` | Email subject line |
| `push_content` | Push notification content |
| `body_html` | Full HTML body (optional) |
| `wording_url` | Link to wording document |
| `jira_ticket` | Jira ticket reference |
| `date_added` | Date added (YYYY-MM-DD) |
| `volume_mois` | Monthly volume |

## Tech Stack

- Next.js 15
- React 19
- Tailwind CSS 4
- shadcn/ui components
