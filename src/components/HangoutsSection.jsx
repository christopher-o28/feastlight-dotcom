// src/components/HangoutsSection.jsx
import { useState } from 'react'
import { Download, ArrowRight } from 'lucide-react'
import AnimatedSection, { StaggerChildren, StaggerItem } from './AnimatedSection'

function HangoutCard({ card }) {
  const {
    title,
    description,
    imageUrl,
    emoji = '🎵',
    gradientFrom = '#1a1a2e',
    gradientTo = '#302b63',
    downloadUrl = '#',
    viewMoreUrl = '#',
  } = card

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.08)]
                    transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_12px_40px_rgba(255,75,75,0.18)]">
      {/* Image */}
      <div
        className="h-52 flex items-center justify-center text-6xl relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }}
      >
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-6xl">{emoji}</span>
        )}
      </div>

      {/* Body */}
      <div className="p-6">
        <h4 className="font-display text-feast-dark font-bold text-[1.1rem] mb-2">{title}</h4>
        <p className="text-gray-400 text-sm leading-relaxed mb-5">{description}</p>
        <div className="flex gap-3">
          <a href={downloadUrl} className="btn-primary text-xs px-4 py-2">
            <Download size={13} /> Download
          </a>
          <a href={viewMoreUrl} className="btn-outline-red text-xs px-4 py-2">
            View More <ArrowRight size={13} />
          </a>
        </div>
      </div>
    </div>
  )
}

// ─── Static card data ────────────────────────────────────────────────────────

const NEW_CARDS = [
  {
    id: 'faith',
    title: 'Growing in Faith Together',
    description: 'Strengthen your walk through shared experiences and encouragement.',
    emoji: '🌱',
    gradientFrom: '#2d3436',
    gradientTo: '#e17055',
  },
  {
    id: 'friendships',
    title: 'Building Strong Friendships',
    description: 'Connect deeply with others in a supportive and uplifting environment.',
    emoji: '🤝',
    gradientFrom: '#005c97',
    gradientTo: '#363795',
  },
  {
    id: 'purpose',
    title: 'Living with Purpose',
    description: 'Discover how to align your daily life with faith and intention.',
    emoji: '🎯',
    gradientFrom: '#16213e',
    gradientTo: '#e94560',
  },
]

const EXTRA_CARDS = [
  {
    id: 'bible',
    title: 'Bible Study Circle',
    description: 'Explore scripture with curiosity and community in an open, reflective space.',
    emoji: '📖',
    gradientFrom: '#1d3557',
    gradientTo: '#457b9d',
  },
  {
    id: 'prayer',
    title: 'Prayer & Reflection',
    description: 'Find stillness and connection through guided prayer and intentional silence.',
    emoji: '🕊️',
    gradientFrom: '#355c7d',
    gradientTo: '#c06c84',
  },
  {
    id: 'outreach',
    title: 'Outreach Together',
    description: 'Serve your local community and experience the joy of giving back with others.',
    emoji: '🌍',
    gradientFrom: '#11998e',
    gradientTo: '#38ef7d',
  },
]

// ─── Section ─────────────────────────────────────────────────────────────────

export default function HangoutsSection({ hangouts }) {
  const [showExtra, setShowExtra] = useState(false)

  const displayHangouts = hangouts?.slice(0, 3) || []
  const allVisible = [...displayHangouts, ...NEW_CARDS]

  return (
    <section id="hangouts" className="py-24 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">

        {/* Heading */}
        <AnimatedSection className="mb-12">
          <div className="section-label">Connect</div>
          <h2 className="section-title">Hangouts</h2>
          <p className="text-gray-500 text-base mt-3 max-w-lg leading-relaxed">
            More than a gathering — we are a family. Our hangouts are spaces where
            friendships are forged and faith grows deeper.
          </p>
        </AnimatedSection>

        {/* Primary grid — existing + 3 new cards */}
        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allVisible.map((card, i) => (
            <StaggerItem key={card.id || i}>
              <HangoutCard card={card} />
            </StaggerItem>
          ))}
        </StaggerChildren>

        {/* Extra cards (revealed on "See More") */}
        {showExtra && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6
                          animate-[fadeIn_0.4s_ease_forwards]">
            {EXTRA_CARDS.map((card) => (
              <HangoutCard key={card.id} card={card} />
            ))}
          </div>
        )}

        {/* See More / Show Less */}
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

      </div>
    </section>
  )
}