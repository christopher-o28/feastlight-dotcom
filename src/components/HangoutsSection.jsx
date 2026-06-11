// src/components/HangoutsSection.jsx
import { useState } from 'react'
import { ShoppingCart, List, ArrowRight, Download, X } from 'lucide-react'
import AnimatedSection, { StaggerChildren, StaggerItem } from './AnimatedSection'

// File type icon based on label keyword
function getFileIcon(label) {
  const l = label.toLowerCase()
  if (l.includes('powerpoint') || l.includes('ppt')) return '📊'
  if (l.includes('song') || l.includes('lyric') || l.includes('music')) return '🎵'
  if (l.includes('video') || l.includes('teaching')) return '🎬'
  if (l.includes('font')) return '🔤'
  if (l.includes('note') || l.includes('facilitator')) return '📄'
  if (l.includes('welcome')) return '📝'
  return '📎'
}

// Each file column: { key, label }
const FILE_COLUMNS = [
  { key: 'powerpointUrl', label: 'Powerpoint' },
  { key: 'songUrl',       label: 'Song' },
  { key: 'videoUrl',      label: 'Video Teaching' },
  { key: 'fontsUrl',      label: 'Fonts' },
  { key: 'notesUrl',      label: 'Notes for the Facilitator' },
  { key: 'welcomeNoteUrl',label: 'TFV HangOut Welcome Note' },
]

function DownloadModal({ files, title, onClose }) {
  // files = [{ label, url }, ...]
  const [clicked, setClicked] = useState({})

  const handleDownload = (url, i) => {
    const a = document.createElement('a')
    a.href = url
    a.target = '_blank'
    a.rel = 'noopener noreferrer'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setClicked(prev => ({ ...prev, [i]: true }))
  }

  const allClicked = files.every((_, i) => clicked[i])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-3">
          <div>
            <h3 className="font-bold text-gray-800 text-sm leading-snug">{title}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{files.length} files — click each to download</p>
          </div>
          <button onClick={onClose} className="ml-3 text-gray-400 hover:text-gray-600 transition-colors shrink-0 mt-0.5">
            <X size={18} />
          </button>
        </div>

        {/* File list */}
        <ul className="px-3 pb-3 space-y-1.5 max-h-72 overflow-y-auto">
          {files.map(({ label, url }, i) => (
            <li key={i}>
              <button
                onClick={() => handleDownload(url, i)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all
                  ${clicked[i]
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-gray-50 hover:bg-red-50 text-gray-700 hover:text-feast-red border border-transparent hover:border-red-100'
                  }`}
              >
                <span className="text-lg shrink-0">{getFileIcon(label)}</span>
                <span className="truncate flex-1 font-medium text-xs">{label}</span>
                <span className="shrink-0 text-xs font-semibold">
                  {clicked[i] ? '✓' : <Download size={13} />}
                </span>
              </button>
            </li>
          ))}
        </ul>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <span className="text-[11px] text-gray-400">
            {Object.keys(clicked).length}/{files.length} downloaded
          </span>
          <button
            onClick={onClose}
            className={`text-xs font-semibold px-4 py-1.5 rounded-full transition-all
              ${allClicked ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'}`}
          >
            {allClicked ? 'All done ✓' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  )
}

function HangoutCard({ card }) {
  const {
    title,
    imageUrl,
    emoji = '',
    description = '',
    gradientFrom = '#1a1a2e',
    gradientTo = '#302b63',
    // individual file columns
    powerpointUrl = '',
    songUrl = '',
    videoUrl = '',
    fontsUrl = '',
    notesUrl = '',
    welcomeNoteUrl = '',
  } = card

  const [expanded, setExpanded] = useState(false)
  const [showModal, setShowModal] = useState(false)

  // Build files array from individual columns — only include non-empty ones
  const files = FILE_COLUMNS
    .map(({ key, label }) => ({ label, url: card[key] }))
    .filter(({ url }) => url && url.trim() !== '' && url.trim() !== '#')

  const handleClick = () => {
    if (files.length === 0) return
    if (files.length === 1) {
      // Single file — download directly
      const a = document.createElement('a')
      a.href = files[0].url
      a.target = '_blank'
      a.rel = 'noopener noreferrer'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } else {
      // Multiple files — show modal with labeled list
      setShowModal(true)
    }
  }

  return (
    <>
      {showModal && (
        <DownloadModal
          files={files}
          title={title}
          onClose={() => setShowModal(false)}
        />
      )}

      <div className="bg-white rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100 flex flex-col
                      transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_12px_40px_rgba(255,75,75,0.15)]">
        {/* Image */}
        <div
          className="w-full aspect-square flex items-center justify-center text-6xl relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }}
        >
          {imageUrl ? (
            <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
          ) : (
            <span className="text-6xl">{emoji}</span>
          )}
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col flex-grow">
          <h4 className="font-body text-feast-red font-bold text-[1.15rem] leading-snug mb-2 hover:text-feast-red-dark transition-colors">
            {title}
          </h4>

          {description && (
            <div className="mb-4">
              <p className={`text-gray-500 text-sm leading-relaxed transition-all duration-300 whitespace-pre-wrap ${expanded ? '' : 'line-clamp-3'}`}>
                {description}
              </p>
              <button
                onClick={() => setExpanded(prev => !prev)}
                className="mt-1.5 flex items-center gap-1 text-feast-red hover:text-feast-red-dark text-xs font-semibold transition-colors"
                aria-label={expanded ? 'Show less' : 'Show more'}
              >
                <span className="text-base leading-none">{expanded ? '−' : '+'}</span>
                {expanded ? 'Show less' : 'Show more'}
              </button>
            </div>
          )}

          {/* Footer Actions */}
          <div className="mt-auto pt-4 border-t border-gray-100">
            <button
              onClick={handleClick}
              disabled={files.length === 0}
              className="flex items-center gap-1.5 text-feast-red hover:text-feast-red-dark transition-colors text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Download size={14} />
              {files.length === 0
                ? 'No files'
                : files.length === 1
                  ? 'Download'
                  : `Download (${files.length} files)`}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Section ─────────────────────────────────────────────────────────────────

const CARDS_PER_PAGE = 8

export default function HangoutsSection({ hangouts, hangoutsSettings }) {
  const [currentPage, setCurrentPage] = useState(1)

  const {
    sectionLabel = 'Connect',
    title = 'Hangouts',
    body = 'What are the Hangouts Videos?\nThis is the Feast Video designed for the Youth. It includes a 2 – 5 minute Feast Video Clip, Activity modules for the Facilitator, and Lyric Videos that you could use for the worship.',
  } = hangoutsSettings || {}

  const normalizedBody = body?.replace(/\\n/g, '\n') ?? ''
  const validHangouts = hangouts?.filter(card => card.title && card.title.trim() !== '') || []
  const totalPages = Math.ceil(validHangouts.length / CARDS_PER_PAGE)
  const startIdx = (currentPage - 1) * CARDS_PER_PAGE
  const pageHangouts = validHangouts.slice(startIdx, startIdx + CARDS_PER_PAGE)

  const goToPage = (page) => {
    setCurrentPage(page)
    document.getElementById('hangouts')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section id="hangouts" className="py-24 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">

        <AnimatedSection className="mb-12">
          <div className="section-label">{sectionLabel}</div>
          <h2 className="section-title">{title}</h2>
          <div className="text-gray-500 text-base mt-3 leading-relaxed whitespace-pre-wrap">
            {normalizedBody}
          </div>
        </AnimatedSection>

        <StaggerChildren key={currentPage} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pageHangouts.map((card, i) => (
            <StaggerItem key={card.id || (startIdx + i)}>
              <HangoutCard card={card} />
            </StaggerItem>
          ))}
        </StaggerChildren>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">

            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gray-100
                         text-gray-500 text-sm font-medium
                         hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed
                         transition-all duration-200"
              aria-label="Previous page"
            >
              <ArrowRight size={14} className="rotate-180" /> Prev
            </button>

            {(() => {
              const pages = []
              const delta = 1
              pages.push(1)
              if (currentPage - delta > 2) pages.push('...')
              for (
                let i = Math.max(2, currentPage - delta);
                i <= Math.min(totalPages - 1, currentPage + delta);
                i++
              ) { pages.push(i) }
              if (currentPage + delta < totalPages - 1) pages.push('...')
              if (totalPages > 1) pages.push(totalPages)

              return pages.map((page, idx) =>
                page === '...' ? (
                  <span key={`ellipsis-${idx}`} className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm">···</span>
                ) : (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all duration-200
                      ${currentPage === page
                        ? 'bg-red-400 text-white shadow-[0_4px_14px_rgba(239,68,68,0.35)]'
                        : 'border border-gray-200 bg-white text-gray-600 hover:border-red-300 hover:text-red-400'
                      }`}
                    aria-label={`Page ${page}`}
                    aria-current={currentPage === page ? 'page' : undefined}
                  >
                    {page}
                  </button>
                )
              )
            })()}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-red-400
                         text-red-400 text-sm font-medium bg-white
                         hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed
                         transition-all duration-200"
              aria-label="Next page"
            >
              Next <ArrowRight size={14} />
            </button>

          </div>
        )}

      </div>
    </section>
  )
}