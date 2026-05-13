// src/components/AboutSection.jsx
import AnimatedSection, { StaggerChildren, StaggerItem } from './AnimatedSection'

function InfoCard({ card, isTopCard }) {
  const { title, body, style = 'light' } = card

  const heightClass = isTopCard ? 'min-h-96 sm:min-h-[26rem] lg:min-h-[28rem]' : 'min-h-80 sm:min-h-96 lg:min-h-[28rem]'
  const baseClass = `rounded-2xl p-6 sm:p-8 lg:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_12px_40px_rgba(255,75,75,0.18)] relative overflow-hidden ${heightClass} flex flex-col`

  const styleMap = {
    light: { wrapper: `${baseClass} bg-white`,  titleColor: 'text-feast-dark', bodyColor: 'text-gray-500' },
    dark: { wrapper: `${baseClass} bg-feast-dark`, titleColor: 'text-white', bodyColor: 'text-white/70' },
    red: { wrapper: `${baseClass} bg-feast-red`, titleColor: 'text-white', bodyColor: 'text-white/80' },
  }
  const s = styleMap[style] || styleMap.light

  return (
    <div className={s.wrapper}>
      {/* Title */}
      <h3 className={`font-display text-lg sm:text-xl lg:text-[1.3rem] font-bold ${s.titleColor} mb-2 sm:mb-3 leading-snug flex-shrink-0`}>{title}</h3>

      {/* Body */}
      <p className={`text-xs sm:text-sm leading-relaxed ${s.bodyColor} flex-grow`}>{body}</p>
    </div>
  )
}

export default function AboutSection({ cards }) {
  const displayCards = cards?.slice(0, 4) || []
  
  const reorderedCards = displayCards.length >= 4
    ? [displayCards[0], displayCards[3], displayCards[2], displayCards[1]]
    : displayCards

  return (
    <section id="about" className="py-24 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <AnimatedSection className="mb-14">
          <div className="section-label">Who We Are</div>
          <h1 className="section-title mb-4">
            What is FeastLight?
          </h1>
          
        </AnimatedSection>

        {/* Grid */}
        <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {reorderedCards.map((card, i) => (
            <StaggerItem key={card.id || i}>
              <InfoCard card={card} isTopCard={i < 2} />
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  )
}