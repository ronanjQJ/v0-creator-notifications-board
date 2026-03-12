# Creator Notifications Board

A CSV-fed dashboard that visualizes creator-facing emails and push notifications. Built with v0.dev.
Built by a PM, for PMs. No engineering resources required.

## The Problem

PMs and product teams need a single view of their notification landscape. Today it's scattered across Mailjet, Confluence, and tribal knowledge. Answering "What do we send?" or "Where are the gaps?" takes days instead of minutes.

## Why I built this
Working on a influencer-facing SaaS product, I kept getting the same question from stakeholders: 'What exactly do we send to our users?' No one had a clear answer. The information was scattered across email tools, docs, and people's heads. I spent hours mapping it manually — then realized this was a PM problem worth solving properly.

## The Solution

Two views:
- **Campaign Timeline** – Order lifecycle (application → shipping → reminders → deadline → review). Spot gaps at a glance.
- **All Notifications** – Grouped by category with filters (Audience, Channel, Search).

Edit a CSV in Sheets/Excel, upload it, done. No backend.

## Quick Start

1. Deploy to Vercel (or run `pnpm dev` locally)
2. Upload your CSV (see `public/data/` for schema)
3. Use the board

## Tradeoffs

- **CSV as source** – No real-time sync, but zero backend. PMs know Sheets/Excel.
- **v0.dev** – Shipped fast. Prompt is versioned for regeneration.
- **Archive hidden** – Rows with `categorie = Archive` are not displayed. Keeps focus on what's live.

## What I Learned

The Campaign Timeline view is the killer feature. For lifecycle-driven products, a timeline beats a flat list. CSV + dropdowns in Sheets = PM-friendly, near-zero errors.
