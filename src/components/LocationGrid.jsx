// src/components/LocationGrid.jsx
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import AnimatedSection, { StaggerChildren, StaggerItem } from './AnimatedSection'

function SubLocationCard({ subLocation }) {
  const {
    name,
    emoji = '',
    address = '',
    phone = '',
    email = '',
  } = subLocation

  return (
    <div className="relative bg-gradient-to-br from-white/5 to-white/[0.02] rounded-xl p-4
                    border border-white/10 hover:border-feast-red/40 transition-all duration-200
                    hover:shadow-[0_4px_20px_rgba(255,75,75,0.12)] hover:-translate-y-0.5 group
                    flex flex-col min-h-[100px] w-full">

      {/* Top accent line */}
      <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-feast-red/30 to-transparent rounded-full" />

      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        {emoji && (
          <div className="w-9 h-9 rounded-lg bg-feast-red/10 border border-feast-red/20
                          flex items-center justify-center text-lg flex-shrink-0">
            {emoji}
          </div>
        )}
        <h4 className="font-display font-bold text-white text-sm leading-snug pt-1">{name}</h4>
      </div>

      {/* Details */}
      <div className="space-y-2 pl-0">
        {address && (
          <div className="flex items-start gap-2">
            <span className="text-white/30 text-xs mt-0.5">📍</span>
            <p className="text-white/55 text-xs leading-relaxed">{address}</p>
          </div>
        )}
        {phone && (
          <a href={`tel:${phone}`}
             className="flex items-center gap-2 group/link">
            <span className="text-xs">📱</span>
            <span className="text-feast-red text-xs hover:text-red-400 transition-colors
                           group-hover/link:underline underline-offset-2">
              {phone}
            </span>
          </a>
        )}
        {email && (
          <a href={`mailto:${email}`}
             className="flex items-center gap-2 group/link">
            <span className="text-xs">✉️</span>
            <span className="text-feast-red text-xs hover:text-red-400 transition-colors
                           group-hover/link:underline underline-offset-2 break-all">
              {email}
            </span>
          </a>
        )}
      </div>
    </div>
  )
}

function SubRegionSection({ subRegion, isExpanded, onToggle }) {
  const { name, emoji, subLocations = [] } = subRegion

  return (
    <div className="mb-6 last:mb-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-feast-dark/40 rounded-lg border border-feast-red/20 hover:border-feast-red/40 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <div className="text-2xl">{emoji}</div>
          <div className="text-left">
            <h3 className="font-display font-bold text-white text-lg">{name}</h3>
            <p className="text-white/60 text-sm">{subLocations.length} location{subLocations.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="text-feast-red group-hover:text-white transition-colors">
          {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
        </div>
      </button>

      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[9999px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
        {/* Sticky region label above cards */}
        <div className="sticky top-0 z-20 mb-3 px-3 py-2.5 backdrop-blur-md bg-feast-dark/90 rounded-lg border border-feast-red/20 flex items-center gap-2 shadow-lg">
          <span className="text-xl">{emoji}</span>
          <span className="font-display font-bold text-white text-sm">{name}</span>
          <span className="text-white/40 text-xs ml-auto">{subLocations.length} location{subLocations.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 pb-2">
          {subLocations.map((subLoc, i) => (
            <SubLocationCard key={subLoc.id || i} subLocation={subLoc} />
          ))}
        </div>
      </div>
    </div>
  )
}

function LocationModal({ location, isOpen, onClose }) {
  const [expandedIndex, setExpandedIndex] = useState(null)

  if (!isOpen || !location) return null

  const { name, region, emoji = '🌏', gradientFrom = '#1a1a2e', gradientTo = '#302b63', subRegions = [] } = location

  const toggle = (index) => {
    setExpandedIndex(prev => prev === index ? null : index)
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 sm:p-4" onClick={onClose}>
      <div
        className="bg-feast-dark rounded-2xl max-w-5xl w-full h-[95vh] sm:h-auto sm:max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          className="sticky top-0 p-6 border-b border-feast-red/20 z-10 flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-5xl">{emoji}</div>
              <div>
                <div className="text-feast-red text-sm font-medium uppercase tracking-wider">{region}</div>
                <h2 className="font-display text-3xl font-black text-white">{name}</h2>
                <p className="text-white/70 text-sm mt-1">{subRegions.length} region{subRegions.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-colors flex-shrink-0"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Sub-regions */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto">
          {subRegions.length > 0 ? (
            subRegions.map((subRegion, i) => (
              <SubRegionSection
                key={i}
                subRegion={subRegion}
                isExpanded={expandedIndex === i}
                onToggle={() => toggle(i)}
              />
            ))
          ) : (
            <p className="text-white/50 text-center py-8">No sub-regions available</p>
          )}
        </div>
      </div>
    </div>
  )
}

function LocationCard({ location, onCardClick }) {
  const {
    name,
    region,
    imageUrl,
    gradientFrom = '#1a1a2e',
    gradientTo = '#302b63',
  } = location

  return (
    <button
      onClick={() => onCardClick(location)}
      className="block rounded-2xl overflow-hidden relative aspect-[4/3] cursor-pointer group shadow-lg w-full text-left bg-transparent border-none"
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover absolute inset-0 transition-transform duration-500 group-hover:scale-110"
        />
      ) : (
        <div
          className="w-full h-full absolute inset-0 transition-transform duration-500 group-hover:scale-110"
          style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
      <div className="absolute bottom-5 left-5 text-white">
        <div className="text-[0.68rem] font-medium tracking-wider opacity-75 uppercase mb-0.5">{region}</div>
        <div className="font-display font-bold text-lg leading-tight">{name}</div>
      </div>
    </button>
  )
}

export default function LocationGrid({ locations }) {
  const [selectedLocation, setSelectedLocation] = useState(null)
  const displayLocations = locations?.slice(0, 6) || []

  return (
    <section id="locations" className="py-24 px-4 bg-feast-dark">
      <div className="max-w-7xl mx-auto">
        <AnimatedSection className="mb-14">
          <div className="section-label" style={{ color: 'rgba(255,75,75,0.9)' }}>Global Community</div>
          <h2 className="font-display text-4xl lg:text-5xl font-black text-white mb-4">
            Find a Feast Light Near You
          </h2>
          <p className="text-white/50 text-base leading-relaxed max-w-lg">
            The Feast Light has spread across the Philippines and around the world. Find a community gathering near you.
          </p>
        </AnimatedSection>

        <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayLocations.map((loc, i) => (
            <StaggerItem key={loc.id || i}>
              <LocationCard location={loc} onCardClick={setSelectedLocation} />
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>

      <LocationModal
        location={selectedLocation}
        isOpen={selectedLocation !== null}
        onClose={() => setSelectedLocation(null)}
      />
    </section>
  )
}