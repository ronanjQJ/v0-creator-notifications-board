"use client"

import { useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { parseCSV } from "@/lib/csv-parser"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Upload, FileText, ClipboardPaste, ArrowRight, Eye } from "lucide-react"

const STORAGE_KEY = "creator-notifications-data"

export default function UploadPage() {
  const router = useRouter()
  const [isDragging, setIsDragging] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [pasteContent, setPasteContent] = useState("")
  const [fileContent, setFileContent] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback((file: File) => {
    setError(null)
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      setFileContent(text)
      setPasteContent("")
    }
    reader.onerror = () => setError("Failed to read file.")
    reader.readAsText(file)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file && (file.name.endsWith(".csv") || file.type === "text/csv")) {
        processFile(file)
      } else {
        setError("Please drop a .csv file.")
      }
    },
    [processFile]
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) processFile(file)
    },
    [processFile]
  )

  const handlePasteChange = (val: string) => {
    setPasteContent(val)
    if (val.trim()) {
      setFileName(null)
      setFileContent(null)
    }
  }

  const handleSubmit = () => {
    setError(null)
    const raw = fileContent ?? pasteContent
    if (!raw || !raw.trim()) {
      setError("Please upload a file or paste CSV content first.")
      return
    }

    const rows = parseCSV(raw)
    if (rows.length === 0) {
      setError(
        "No valid data found. Check that the CSV has the expected columns (key, categorie, sujet_email, trigger, etape, etc.)."
      )
      return
    }

    setSubmitting(true)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rows))
      router.push("/board")
    } catch {
      setError("Failed to store data. The CSV might be too large.")
      setSubmitting(false)
    }
  }

  const hasInput = Boolean(fileContent || pasteContent.trim())
  const buttonLabel = fileName ? "Upload and view board" : "View board"

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4 sm:px-6">
          <h1 className="text-lg font-bold tracking-tight text-foreground">
            Upload CSV
          </h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-8">
          {/* Intro */}
          <div className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold tracking-tight text-foreground text-balance">
              Creator Notifications Board
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Upload or paste the notifications CSV. You will be redirected to the board to visualize it.
            </p>
          </div>

          {/* File drop zone */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">
              Upload a .csv file
            </label>
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed p-8 transition-colors ${
                isDragging
                  ? "border-primary/50 bg-accent"
                  : fileName
                    ? "border-primary/30 bg-accent/50"
                    : "border-border hover:border-primary/30 hover:bg-accent/50"
              }`}
              role="button"
              tabIndex={0}
              aria-label="Upload CSV file"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click()
              }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                {fileName ? (
                  <FileText className="h-5 w-5 text-primary" />
                ) : (
                  <Upload className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              {fileName ? (
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">{fileName}</p>
                  <p className="text-xs text-muted-foreground">Click or drop to replace</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">
                    Drop your CSV file here, or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Expected columns: key, categorie, sujet_email, trigger, etape...
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                aria-hidden="true"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium text-muted-foreground">OR</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Paste area */}
          <div className="flex flex-col gap-2">
            <label htmlFor="csv-paste" className="flex items-center gap-1.5 text-sm font-medium text-foreground">
              <ClipboardPaste className="h-3.5 w-3.5 text-muted-foreground" />
              Paste CSV content
            </label>
            <Textarea
              id="csv-paste"
              placeholder={"key,categorie,sujet_email,trigger,canal,etape,...\nNOTIF_001,Order,Your order,..."}
              value={pasteContent}
              onChange={(e) => handlePasteChange(e.target.value)}
              rows={8}
              className="font-mono text-xs leading-relaxed"
              disabled={Boolean(fileName)}
            />
            {fileName && (
              <p className="text-xs text-muted-foreground">
                A file is selected. Remove it to use paste instead.
              </p>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={!hasInput || submitting}
            size="lg"
            className="w-full gap-2"
          >
            {submitting ? "Redirecting..." : buttonLabel}
            {!submitting && <ArrowRight className="h-4 w-4" />}
          </Button>

          {/* Demo link */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <span className="text-sm text-muted-foreground">No CSV?</span>
            <Button variant="link" size="sm" asChild className="h-auto p-0">
              <Link href="/demo" className="inline-flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5" />
                See demo with sample data
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
