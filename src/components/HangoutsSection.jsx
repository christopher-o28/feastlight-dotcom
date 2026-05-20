// src/components/HangoutsSection.jsx
import { useState } from 'react'
import { ShoppingCart, List, ArrowRight, Download } from 'lucide-react'
import AnimatedSection, { StaggerChildren, StaggerItem } from './AnimatedSection'

function HangoutCard({ card }) {
  const {
    title,
    imageUrl,
    emoji = '',
    gradientFrom = '#1a1a2e',
    gradientTo = '#302b63',
    downloadUrl = '#',
    viewMoreUrl = '#',
  } = card

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-gray-100 flex flex-col h-full
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
        <h4 className="font-body text-feast-red font-bold text-[1.15rem] leading-snug mb-6 hover:text-feast-red-dark transition-colors">
          {title}
        </h4>
        
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
          <a
            href={viewMoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-feast-red hover:text-feast-red-dark transition-colors text-xs font-semibold"
          >
            
          </a>
        </div>
      </div>
    </div>
  )
}

// ─── Section ─────────────────────────────────────────────────────────────────

export default function HangoutsSection({ hangouts }) {
  const [showExtra, setShowExtra] = useState(false)

  // Filter out any empty rows from the Google Sheet (requires a non-empty title)
  const validHangouts = hangouts?.filter(card => card.title && card.title.trim() !== '') || []

  // Display up to 8 cards initially (perfect 2-row layout in a 4-column grid)
  const displayHangouts = validHangouts.slice(0, 8)
  
  // Remaining cards are placed in the expandable extra list
  const extraHangouts = validHangouts.slice(8)
  const hasExtra = extraHangouts.length > 0

  return (
    <section id="hangouts" className="py-24 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">

        {/* Heading */}
        <AnimatedSection className="mb-12">
          <div className="section-label">Connect</div>
          <h2 className="section-title">Hangouts</h2>
          // ✅ After
          <div className="text-gray-500 text-base mt-3 leading-relaxed">
            <ol className="">
              <li>What are the Hangouts Videos?</li>
             <li>This is the Feast Video designed for the Youth. It includes a 2 – 5 minute Feast Video Clip, Activity modules for the Facilitator, and Lyric Videos that you could use for the worship.</li>
            </ol>
          </div>
        </AnimatedSection>

        {/* Primary grid — showing up to 8 actual cards */}
        <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayHangouts.map((card, i) => (
            <StaggerItem key={card.id || i}>
              <HangoutCard card={card} />
            </StaggerItem>
          ))}
        </StaggerChildren>

        {/* Extra cards (revealed on "See More") */}
        {showExtra && hasExtra && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6
                          animate-[fadeIn_0.4s_ease_forwards]">
            {extraHangouts.map((card, i) => (
              <HangoutCard key={card.id || (i + 8)} card={card} />
            ))}
          </div>
        )}

        {/* See More / Show Less (conditionally rendered only if there are extra cards) */}
        {hasExtra && (
          <div className="flex justify-center mt-12">
            <button
              onClick={() => setShowExtra((prev) => !prev)}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full
                         bg-red-500 hover:bg-red-600 active:scale-95
                         text-white font-semibold text-sm tracking-wide
                         shadow-[0_4px_20px_rgba(239,68,68,0.35)]
                         hover:shadow-[0_8px_30px_rgba(239,68,68,0.45)]
                         transition-all duration-200"
            >
              {showExtra ? 'Show Less' : 'See More'}
              <ArrowRight
                size={15}
                className={`transition-transform duration-300 ${showExtra ? 'rotate-90' : ''}`}
              />
            </button>
          </div>
        )}

      </div>
    </section>
  )
}