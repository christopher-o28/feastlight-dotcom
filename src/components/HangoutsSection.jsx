// src/components/HangoutsSection.jsx
import { useState } from 'react'
import { ShoppingCart, List, ArrowRight, Download } from 'lucide-react'
import AnimatedSection, { StaggerChildren, StaggerItem } from './AnimatedSection'

function HangoutCard({ card }) {
  const {
    title,
    imageUrl,
    emoji = '',
    description = '',
    gradientFrom = '#1a1a2e',
    gradientTo = '#302b63',
    downloadUrl = '#',
  } = card

  const [expanded, setExpanded] = useState(false)

  return (
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
        <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
          
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-feast-red hover:text-feast-red-dark transition-colors text-xs font-semibold"
          >
            <Download size={14} /> Download
          </a> 
        </div>
      </div>
    </div>
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

  // Normalize newlines from Google Sheets (may arrive as literal \n string)
  const normalizedBody = body?.replace(/\\n/g, '\n') ?? ''

  // Filter out any empty rows from the Google Sheet (requires a non-empty title)
  const validHangouts = hangouts?.filter(card => card.title && card.title.trim() !== '') || []

  const totalPages = Math.ceil(validHangouts.length / CARDS_PER_PAGE)
  const startIdx = (currentPage - 1) * CARDS_PER_PAGE
  const pageHangouts = validHangouts.slice(startIdx, startIdx + CARDS_PER_PAGE)

  const goToPage = (page) => {
    setCurrentPage(page)
    // Smooth scroll back to top of section
    document.getElementById('hangouts')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section id="hangouts" className="py-24 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">

        {/* Heading */}
        <AnimatedSection className="mb-12">
          <div className="section-label">{sectionLabel}</div>
          <h2 className="section-title">{title}</h2>

          <div className="text-gray-500 text-base mt-3 leading-relaxed whitespace-pre-wrap">
            {normalizedBody}
          </div>
        </AnimatedSection>

        {/* Cards grid */}
        <StaggerChildren key={currentPage} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pageHangouts.map((card, i) => (
            <StaggerItem key={card.id || (startIdx + i)}>
              <HangoutCard card={card} />
            </StaggerItem>
          ))}
        </StaggerChildren>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">

            {/* ← Prev */}
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

            {/* Page numbers with ellipsis */}
            {(() => {
              const pages = []
              const delta = 1 // pages around current

              // Always show page 1
              pages.push(1)

              // Left ellipsis
              if (currentPage - delta > 2) pages.push('...')

              // Pages around current
              for (
                let i = Math.max(2, currentPage - delta);
                i <= Math.min(totalPages - 1, currentPage + delta);
                i++
              ) {
                pages.push(i)
              }

              // Right ellipsis
              if (currentPage + delta < totalPages - 1) pages.push('...')

              // Always show last page
              if (totalPages > 1) pages.push(totalPages)

              return pages.map((page, idx) =>
                page === '...' ? (
                  <span key={`ellipsis-${idx}`} className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm">
                    ···
                  </span>
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

            {/* Next → */}
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