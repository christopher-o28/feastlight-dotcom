// src/components/CMSBanner.jsx
// Shows a notice when running without Google Sheets configured
import { Settings, X } from 'lucide-react'
import { useState } from 'react'

export default function CMSBanner({ error, lastUpdated }) {
  const [dismissed, setDismissed] = useState(false)
  const hasSheetId = !!import.meta.env.VITE_SHEET_ID

  // Format timestamp safely
  const formattedTime = lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : null

  if (dismissed || (!error && hasSheetId)) return null

  return (
    <div className="bg-feast-dark border-b border-feast-red/30 text-white/80 text-xs px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <Settings size={13} className="text-feast-red flex-shrink-0" />
          {!hasSheetId ? (
            <span>
              <strong className="text-white">CMS not connected.</strong>{' '}
              Add <code className="text-feast-red bg-white/10 px-1 py-0.5 rounded">VITE_SHEET_ID</code> to your{' '}
              <code className="text-feast-red bg-white/10 px-1 py-0.5 rounded">.env</code> file to connect Google Sheets.
              Currently showing demo data.
            </span>
          ) : error ? (
            <span>
              <strong className="text-feast-red">Sheet sync error:</strong> {error}. Showing cached data.
            </span>
          ) : (
            <span>
              ✓ Connected to Google Sheets
              {formattedTime && ` · Last updated: ${formattedTime}`}
            </span>
          )}
        </div>
        <button onClick={() => setDismissed(true)} className="flex-shrink-0 hover:text-white transition-colors">
          <X size={14} />
        </button>
      </div>
    </div>
  )
}
