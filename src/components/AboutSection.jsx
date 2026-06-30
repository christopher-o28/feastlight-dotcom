// src/components/AboutSection.jsx
import { useEffect, useRef, useState } from 'react'
import AnimatedSection from './AnimatedSection'

const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTkZi9S2sUa1HkQ6v9PCeZfr0stItscA73BW4t2prGQifg4fFhorLez06Vqu-lTFc016yo3H1wf96PQ/pub?gid=851635418&single=true&output=csv'

function parseCSV(text) {
  const rows = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (char === '"') { inQuotes = !inQuotes; current += char }
    else if (char === '\n' && !inQuotes) { rows.push(current); current = '' }
    else { current += char }
  }
  if (current) rows.push(current)

  const parseRow = (line) => {
    const values = []; let val = ''; let inQ = false
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '"') { inQ = !inQ }
      else if (line[i] === ',' && !inQ) { values.push(val.trim()); val = '' }
      else { val += line[i] }
    }
    values.push(val.trim())
    return values
  }

  const headers = parseRow(rows[0])
  return rows.slice(1).map(row => {
    const values = parseRow(row)
    return headers.reduce((obj, h, i) => ({ ...obj, [h]: values[i] || '' }), {})
  }).filter(row => row.id && row.id.trim())
}

function renderWithBold(text) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i} className="text-feast-dark">{part}</strong> : part
  )
}

// ── Row ───────────────────────────────────────────────────────────────────────
function AboutRow({ section, index }) {
  const { imageLink, body } = section
  const imageRight = index % 2 !== 0
  const [open, setOpen] = useState(false)
  const popRef = useRef(null)
  const btnRef = useRef(null)

  const paragraphs = body ? body.split('\n').filter(Boolean) : []
  const PREVIEW_COUNT = 2
  const needsToggle = paragraphs.length > PREVIEW_COUNT
  const previewParagraphs = paragraphs.slice(0, PREVIEW_COUNT)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (
        popRef.current && !popRef.current.contains(e.target) &&
        btnRef.current && !btnRef.current.contains(e.target)
      ) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const imageBlock = (
    <div className="w-full md:w-1/2 flex-shrink-0">
      <div
        className="w-full aspect-square bg-contain bg-center bg-no-repeat bg-gray-100"
        style={{ backgroundImage: `url(${imageLink})` }}
      />
    </div>
  )

  const textBlock = (
    // This wrapper is `relative` so the popup overlays exactly on top of it
    <div className="relative w-full md:w-1/2 flex-shrink-0">

      {/* Normal text content — always rendered */}
      <div className="bg-white flex flex-col justify-center p-8 sm:p-10 lg:p-14 h-full">
        <div>
          {previewParagraphs.map((para, i) => (
            <p key={i} className="text-sm sm:text-base leading-relaxed text-gray-500 mt-3">
              {renderWithBold(para.trim())}
            </p>
          ))}
          {needsToggle && <p className="text-sm text-gray-400 mt-1">...</p>}
        </div>

        {needsToggle && (
          <button
            ref={btnRef}
            onClick={() => setOpen(true)}
            className="mt-5 self-start text-sm font-semibold text-feast-red hover:underline transition-colors"
          >
            + Show more
          </button>
        )}
      </div>

      {/* Popup — overlays the text panel */}
      {open && (
        <div
          ref={popRef}
          className="absolute inset-0 bg-white flex flex-col rounded-r-2xl overflow-hidden"
          style={{
            boxShadow: '0 4px 32px rgba(0,0,0,0.13)',
            animation: 'popoverIn 0.2s ease-out',
            zIndex: 10,
          }}
        >
          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-8 sm:px-10 lg:px-14 pt-8 pb-4 space-y-4">
            {paragraphs.map((para, i) => (
              <p key={i} className="text-sm sm:text-base leading-relaxed text-gray-500">
                {renderWithBold(para.trim())}
              </p>
            ))}
          </div>

          {/* Footer */}
          <div className="px-8 sm:px-10 lg:px-14 py-4 border-t border-gray-100 bg-gray-50 flex-shrink-0">
            <button
              onClick={() => setOpen(false)}
              className="text-sm font-semibold text-feast-red hover:underline transition-colors"
            >
              − Show less
            </button>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <AnimatedSection>
      <div className={`flex flex-col ${imageRight ? 'md:flex-row-reverse' : 'md:flex-row'} items-stretch rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(255,75,75,0.15)]`}>
        {imageBlock}
        {textBlock}
      </div>

      <style>{`
        @keyframes popoverIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </AnimatedSection>
  )
}

// ── Section ───────────────────────────────────────────────────────────────────
export default function AboutSection() {
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(SHEET_CSV_URL)
      .then(res => res.text())
      .then(text => { setSections(parseCSV(text)); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <section id="about" className="py-24 px-4 bg-gray-50 relative z-10">
      <div className="max-w-5xl mx-auto">
        <AnimatedSection className="mb-14">
          <div className="section-label text-center text-5xl">Who We Are</div>
        </AnimatedSection>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-feast-red border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {sections.map((section, index) => (
              <AboutRow key={section.id} section={section} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
