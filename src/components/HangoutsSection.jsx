// src/components/HangoutsSection.jsx
import { useState } from 'react'
import { ArrowRight, Download, X, AlertCircle, BookOpen, ChevronDown, ChevronUp } from 'lucide-react'
import AnimatedSection, { StaggerChildren, StaggerItem } from './AnimatedSection'

const FILE_COLUMNS = [
  { key: 'powerpointUrl',  label: 'Powerpoint' },
  { key: 'songUrl',        label: 'Song' },
  { key: 'songUrl2',       label: 'Song 2' },
  { key: 'videoUrl',       label: 'Video Teaching' },
  { key: 'prayerVideoUrl', label: 'Prayer Video' },
  { key: 'fontsUrl',       label: 'Fonts' },
  { key: 'fontsUrl2',      label: 'Fonts 2' },
  { key: 'notesUrl',       label: 'Notes for the Facilitator' },
  { key: 'welcomeNoteUrl', label: 'TFV HangOut Welcome Note' },
]

function toDirectDownloadUrl(url) {
  if (!url) return url
  const match =
    url.match(/\/file\/d\/([^/]+)/) ||
    url.match(/[?&]id=([^&]+)/)
  if (match) {
    return `https://drive.google.com/uc?export=download&id=${match[1]}`
  }
  return url
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function HangoutCard({ card, expandedCardId, setExpandedCardId }) {
  const {
    title,
    imageUrl,
    emoji = '',
    description = '',
    gradientFrom = '#1a1a2e',
    gradientTo = '#302b63',
    readMeUrl = '',
  } = card

  const cardId = card.id || card.title
  const expanded = expandedCardId === cardId
  const [showDownloads, setShowDownloads] = useState(false)

  const fileLinks = FILE_COLUMNS
    .map(({ key, label }) => ({ label, url: toDirectDownloadUrl(card[key]) }))
    .filter(({ url }) => url && url.trim() !== '' && url.trim() !== '#')

  const hasReadMe = readMeUrl && readMeUrl.trim() !== '' && readMeUrl.trim() !== '#'

  const allLinks = [
    ...(hasReadMe ? [{ label: 'Read Me', url: toDirectDownloadUrl(readMeUrl), icon: 'readMe' }] : []),
    ...fileLinks,
  ]

  return (
    <div className="h-full bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100 flex flex-col relative overflow-visible
                    transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_12px_40px_rgba(255,75,75,0.15)]">
      {/* Image */}
      <div
        className="w-full aspect-square flex items-center justify-center relative overflow-hidden rounded-t-2xl"
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
        <h4 className="font-body text-feast-red font-bold text-[1.15rem] leading-snug mb-2">
          {title}
        </h4>

        {description && (
          <div className="mb-4 relative">
            {/* Collapsed preview — always occupies fixed space */}
            <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 whitespace-pre-wrap">
              {description}
            </p>

            {/* Expanded overlay — floats downward, clipped by nothing above */}
            {expanded && (
              <div className="absolute top-0 left-0 right-0 z-[45]
                              bg-white border border-gray-200 rounded-xl shadow-xl p-3 -mx-1 -mt-1"
                   style={{ backgroundColor: '#ffffff' }}>
                <p className="text-gray-500 text-sm leading-relaxed whitespace-pre-wrap">
                  {description}
                </p>
                <button
                  onClick={() => setExpandedCardId(null)}
                  className="mt-2 flex items-center gap-1 text-feast-red hover:text-red-700 text-xs font-semibold transition-colors"
                >
                  <span className="text-base leading-none">−</span> Show less
                </button>
              </div>
            )}

            {!expanded && (
              <button
                onClick={() => setExpandedCardId(cardId)}
                className="mt-1.5 flex items-center gap-1 text-feast-red hover:text-red-700 text-xs font-semibold transition-colors"
              >
                <span className="text-base leading-none">+</span> Show more
              </button>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-auto pt-4 border-t border-gray-100 flex flex-col gap-2">
          <div className="relative">
            <button
              onClick={() => allLinks.length > 0 && setShowDownloads(prev => !prev)}
              disabled={allLinks.length === 0}
              className={`w-full flex items-center justify-between gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200
                ${allLinks.length === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : showDownloads
                    ? 'bg-red-50 text-feast-red border border-feast-red/30'
                    : 'bg-feast-red hover:bg-red-600 text-white'
                }`}
            >
              <span className="flex items-center gap-2">
                <Download size={14} className="shrink-0" />
                {allLinks.length === 0 ? 'No files' : `Downloads (${allLinks.length})`}
              </span>
              {allLinks.length > 0 && (
                showDownloads
                  ? <ChevronUp size={14} className="shrink-0" />
                  : <ChevronDown size={14} className="shrink-0" />
              )}
            </button>

            {/* Download list — floats above layout */}
            {showDownloads && (
              <div className="absolute bottom-full left-0 right-0 mb-2 z-[45]
                              bg-white border border-feast-red/15 rounded-xl shadow-lg
                              flex flex-col gap-1 p-2">
                {allLinks.map(({ label, url, icon }) => (
                  <a
                    key={label}
                    href={url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold
                               border border-feast-red/20 text-feast-red hover:bg-feast-red hover:text-white transition-all duration-200"
                  >
                    {icon === 'readMe'
                      ? <BookOpen size={13} className="shrink-0" />
                      : <Download size={13} className="shrink-0" />}
                    <span className="truncate">{label}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Section ─────────────────────────────────────────────────────────────────

const CARDS_PER_PAGE = 8

export default function HangoutsSection({ hangouts, hangoutsSettings }) {
  const [currentPage, setCurrentPage] = useState(1)
  const [expandedCardId, setExpandedCardId] = useState(null)

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
    setExpandedCardId(null)
    document.getElementById('hangouts')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section id="hangouts" className="py-24 px-4 bg-gray-50" style={{ isolation: 'auto' }}>
      <div className="max-w-7xl mx-auto">

        <AnimatedSection className="mb-12">
          <div className="section-label">{sectionLabel}</div>
          <h2 className="section-title">{title}</h2>
          <div className="text-gray-500 text-base mt-3 leading-relaxed whitespace-pre-wrap">
            {normalizedBody}
          </div>
        </AnimatedSection>

        <StaggerChildren key={currentPage} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {pageHangouts.map((card, i) => {
            const cardId = card.id || card.title
            const isExpanded = expandedCardId === cardId
            return (
              <StaggerItem key={card.id || (startIdx + i)}>
                <div className="h-full" style={{ position: 'relative', zIndex: isExpanded ? 45 : 1 }}>
                  <HangoutCard
                    card={card}
                    expandedCardId={expandedCardId}
                    setExpandedCardId={setExpandedCardId}
                  />
                </div>
              </StaggerItem>
            )
          })}
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
            >
              Next <ArrowRight size={14} />
            </button>
          </div>
        )}

      </div>
    </section>
  )
}
