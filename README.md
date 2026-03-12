# Creator Notifications Board

A CSV-fed dashboard that visualizes creator-facing emails and push notifications. Built with v0.dev.
Built by a PM, for PMs. No engineering resources required.

## The Problem

PMs and product teams need a single view of their notification landscape. Today it's scattered across Mailjet, Confluence, and tribal knowledge. Answering "What do we send?" or "Where are the gaps?" takes days instead of minutes.

## Why I built this
I was spending hours mapping what we send to creators. Realized no tool existed for this PM use case — so I built it.

## The Solution

Two views:
- **Campaign Timeline** – Order lifecycle (application → shipping → reminders → deadline → review). Spot gaps at a glance.
- **All Notifications** – Grouped by category with filters (Audience, Channel, Search).

Edit a CSV in Sheets/Excel, upload it, done. No backend.

## Quick Start

1. Deploy to Vercel (or run `pnpm dev` locally)
2. Upload your CSV (see `public/data/` for schema)
3. Use the board

**Live demo:** [v0-creator-notifications-board.vercel.app](https://v0-creator-notifications-board.vercel.app/)

## Tradeoffs

- **CSV as source** – No real-time sync, but zero backend. PMs know Sheets/Excel.
- **v0.dev** – Shipped fast. Prompt is versioned for regeneration.
- **Archive hidden** – Rows with `categorie = Archive` are not displayed. Keeps focus on what's live.

## What I Learned

The Campaign Timeline view is the killer feature. For lifecycle-driven products, a timeline beats a flat list. CSV + dropdowns in Sheets = PM-friendly, near-zero errors.
