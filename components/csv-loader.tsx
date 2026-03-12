"use client"

import { useCallback, useState, useRef } from "react"
import { Upload, FileText } from "lucide-react"
import type { NotificationRow } from "@/lib/csv-parser"
import { parseCSV } from "@/lib/csv-parser"

interface CSVLoaderProps {
  onDataLoaded: (data: NotificationRow[]) => void
}

export function CSVLoader({ onDataLoaded }: CSVLoaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback(
    (file: File) => {
      setError(null)
      setFileName(file.name)
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        const data = parseCSV(text)
        if (data.length === 0) {
          setError("No valid data found. Check that the CSV has the expected columns (key, categorie, sujet, trigger, push, statut, etape).")
          return
        }
        onDataLoaded(data)
      }
      reader.onerror = () => setError("Failed to read file.")
      reader.readAsText(file)
    },
    [onDataLoaded]
  )

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

  return (
    <div className="flex flex-col gap-4">
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed p-10 transition-colors ${
          isDragging
            ? "border-foreground/40 bg-accent"
            : "border-border hover:border-foreground/30 hover:bg-accent/50"
        }`}
        role="button"
        tabIndex={0}
        aria-label="Upload CSV file"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click()
        }}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          {fileName ? (
            <FileText className="h-6 w-6 text-muted-foreground" />
          ) : (
            <Upload className="h-6 w-6 text-muted-foreground" />
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
              Expected columns: key, sujet, trigger, push, etape...
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

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
