// src/components/LocationGrid.jsx
import { useState, useMemo, useEffect } from 'react'
import { ChevronDown, ChevronUp, Search, X, MapPin } from 'lucide-react'
import AnimatedSection, { StaggerChildren, StaggerItem } from './AnimatedSection'

// ─── helpers ────────────────────────────────────────────────────────────────

/** Collect every leaf DistrictLocationCard object from the full data tree */
function flattenLocations(locations = []) {
  const results = []

  function visitDistrict(dl, parentNames) {
    results.push({ ...dl, _breadcrumb: parentNames })
  }

  function visitSubLocation(sl, parentNames) {
    if (sl.byDistrictLocations?.length) {
      sl.byDistrictLocations.forEach(dl => visitDistrict(dl, [...parentNames, sl.name]))
    } else {
      results.push({ ...sl, _breadcrumb: parentNames })
    }
  }

  function visitSubRegion(sr, parentNames) {
    const names = [...parentNames, sr.name]
    sr.subLocations?.forEach(sl => visitSubLocation(sl, names))
    sr.byDistrictLocation?.forEach(sl => visitSubLocation(sl, names))
  }

  locations.forEach(loc => {
    const topNames = [loc.name]
    loc.subRegions?.forEach(sr => visitSubRegion(sr, topNames))
  })

  return results
}

const RESULTS_PER_PAGE = 6

/**
 * Match only against the card's own fields — NOT the breadcrumb ancestors.
 * This means searching "Manila" will only surface cards whose own name,
 * address, schedule, contact info, etc. contain "Manila", not every card
 * that happens to live under a "Manila" parent region.
 */
function matchesQuery(dl, query) {
  const q = query.trim()
  if (q.length < 2) return false
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`\\b${escaped}\\b`, 'gi')
  const ownFields = [
    dl.name,
    dl.address,
    dl.schedule,
    dl.phone,
    dl.email,
    dl.contactPerson,
    dl.personalContactNumber,
    dl.facebook,
    dl.website,
    dl.instagram,
    dl.youtube,
    dl.x,
    dl.threads,
  ]
  return ownFields.some(f => f && regex.test(String(f)))
}

// ─── Highlight helper ────────────────────────────────────────────────────────

/**
 * Splits `text` on every case-insensitive occurrence of `query` and wraps
 * each match in a highlighted <mark> span styled in feast-red.
 */
function Highlight({ text, query }) {
  if (!text) return null
  const str = String(text)
  const q = query?.trim()
  if (!q || q.length < 2) return <>{str}</>

  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  // \b ensures we match the whole word only, not substrings inside other words
  const regex = new RegExp(`\\b${escaped}\\b`, 'gi')

  const parts = []
  let lastIndex = 0
  let match

  while ((match = regex.exec(str)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: str.slice(lastIndex, match.index), highlight: false })
    }
    parts.push({ text: match[0], highlight: true })
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < str.length) {
    parts.push({ text: str.slice(lastIndex), highlight: false })
  }

  if (parts.length === 0 || parts.every(p => !p.highlight)) return <>{str}</>

  return (
    <>
      {parts.map((part, i) =>
        part.highlight ? (
          <mark
            key={i}
            className="bg-feast-red/25 text-feast-red font-semibold rounded-[3px] px-[2px] not-italic"
            style={{ boxShadow: '0 0 0 1px rgba(255,75,75,0.35)' }}
          >
            {part.text}
          </mark>
        ) : (
          <span key={i}>{part.text}</span>
        )
      )}
    </>
  )
}

// ─── sub-components ──────────────────────────────────────────────────────────

function DistrictLocationCard({ districtLocation, query = '' }) {
  const {
    name,
    schedule = '',
    address = '',
    phone = '',
    email = '',
    facebook = '',
    website = '',
    instagram = '',
    youtube = '',
    x = '',
    threads = '',
    contactPerson = '',
    personalContactNumber = '',
  } = districtLocation

  const H = ({ text }) => <Highlight text={text} query={query} />

  return (
    <div className="relative bg-gradient-to-br from-white/5 to-white/[0.02] rounded-xl p-4
                    border border-white/10 hover:border-feast-red/40 transition-all duration-200
                    hover:shadow-[0_4px_20px_rgba(255,75,75,0.12)] hover:-translate-y-0.5 group
                    flex flex-col min-h-[100px] w-full">
      <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-feast-red/30 to-transparent rounded-full" />
      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 rounded-lg bg-feast-red/10 border border-feast-red/20
                        flex items-center justify-center p-1.5 flex-shrink-0">
          <img src="https://tfvtalks.s3.dualstack.ap-southeast-1.amazonaws.com/01%20The%20FeastLight%20Archives%20/Images%20/Feast-Light-Logo-Rebrand-FINAL.png" alt="Feast Light" className="w-full h-full object-contain opacity-80" />
        </div>
        <h4 className="font-display font-bold text-white text-sm leading-snug pt-1"><H text={name} /></h4>
      </div>
      <div className="space-y-2 pl-0">
        {address && (
          <div className="flex items-start gap-2">
            <span className="text-white text-xs mt-0.5 shrink-0">Location: </span>
            <p className="text-white/55 text-xs leading-relaxed"><H text={address} /></p>
          </div>
        )}
        {schedule && (
          <div className="flex items-start gap-2">
            <span className="text-white text-xs shrink-0">Schedule: </span>
            <p className="text-white/55 text-xs leading-relaxed"><H text={schedule} /></p>
          </div>
        )}
        {phone && (
          <a href={`tel:${phone}`} className="flex items-center gap-2 group/link text-white">
            <span className="text-xs shrink-0">Contact No: </span>
            <span className="text-feast-red text-xs hover:text-red-400 transition-colors group-hover/link:underline underline-offset-2"><H text={phone} /></span>
          </a>
        )}
        {email && (
          <a href={`mailto:${email}`} className="flex items-center gap-2 group/link text-white">
            <span className="text-xs shrink-0">Email Address: </span>
            <span className="text-feast-red text-xs hover:text-red-400 transition-colors group-hover/link:underline underline-offset-2 break-all"><H text={email} /></span>
          </a>
        )}
        {facebook && (
          <a href={facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 group/link text-white">
            <span className="text-xs shrink-0">Facebook Page: </span>
            <span className="text-feast-red text-xs hover:text-red-400 transition-colors group-hover/link:underline underline-offset-2 break-all"><H text={facebook} /></span>
          </a>
        )}
        {website && (
          <a href={website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 group/link">
            <span className="text-xs text-white shrink-0">Website Link: </span>
            <span className="text-feast-red text-xs hover:text-red-400 transition-colors group-hover/link:underline underline-offset-2 break-all"><H text={website} /></span>
          </a>
        )}
        {instagram && (
          <a href={instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 group/link">
            <span className="text-xs text-white shrink-0">Instagram Page: </span>
            <span className="text-feast-red text-xs hover:text-red-400 transition-colors group-hover/link:underline underline-offset-2 break-all"><H text={instagram} /></span>
          </a>
        )}
        {youtube && (
          <a href={youtube} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 group/link">
            <span className="text-xs text-white shrink-0">Youtube Page: </span>
            <span className="text-feast-red text-xs hover:text-red-400 transition-colors group-hover/link:underline underline-offset-2 break-all"><H text={youtube} /></span>
          </a>
        )}
        {x && (
          <a href={x} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 group/link">
            <span className="text-xs text-white shrink-0">X (Twitter) Page: </span>
            <span className="text-feast-red text-xs hover:text-red-400 transition-colors group-hover/link:underline underline-offset-2 break-all"><H text={x} /></span>
          </a>
        )}
        {threads && (
          <a href={threads} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 group/link">
            <span className="text-xs text-white shrink-0">Threads Page: </span>
            <span className="text-feast-red text-xs hover:text-red-400 transition-colors group-hover/link:underline underline-offset-2 break-all"><H text={threads} /></span>
          </a>
        )}
        {contactPerson && (
          <div className="flex items-center gap-2 pt-2 border-t border-white/5 mt-2">
            <span className="text-white text-xs shrink-0">Contact Person: </span>
            <span className="text-white/80 text-xs font-medium"><H text={contactPerson} /></span>
          </div>
        )}
        {personalContactNumber && (
          <a href={`tel:${personalContactNumber}`} className="flex items-center gap-2 group/link text-white">
            <span className="text-xs shrink-0">Personal Contact No: </span>
            <span className="text-feast-red text-xs hover:text-red-400 transition-colors group-hover/link:underline underline-offset-2"><H text={personalContactNumber} /></span>
          </a>
        )}
      </div>
    </div>
  )
}

function SubLocationSection({ subLocation }) {
  const { name, byDistrictLocations = [] } = subLocation
  const [isExpanded, setIsExpanded] = useState(false)

  if (!byDistrictLocations || byDistrictLocations.length === 0) {
    return <DistrictLocationCard districtLocation={subLocation} />
  }

  return (
    <div className="mb-0 last:mb-0 bg-white/[0.02] rounded-xl border border-white/10 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-white/[0.02] transition-colors group"
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 flex items-center justify-center flex-shrink-0">
            <img src="https://tfvtalks.s3.dualstack.ap-southeast-1.amazonaws.com/01%20The%20FeastLight%20Archives%20/Images%20/Feast-Light-Logo-Rebrand-FINAL.png" alt="Feast Light" className="w-full h-full object-contain opacity-70" />
          </div>
          <div className="text-left">
            <h4 className="font-display font-bold text-white text-lg tracking-wide">{name}</h4>
            <p className="text-white/40 text-xs mt-0.5">{byDistrictLocations.length} Feastlight Location{byDistrictLocations.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="text-feast-red group-hover:text-white transition-colors">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </button>
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[9999px] opacity-100 border-t border-white/10' : 'max-h-0 opacity-0'}`}>
        <div className="p-4 sm:p-5 bg-black/20">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {byDistrictLocations.map((districtLoc, i) => (
              <DistrictLocationCard key={districtLoc.id || i} districtLocation={districtLoc} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function SubRegionSection({ subRegion, isExpanded, onToggle }) {
  const { name, subLocations = [] } = subRegion

  return (
    <div className="mb-2 last:mb-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-feast-dark/40 rounded-lg border border-feast-red/20 hover:border-feast-red/40 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-feast-red/10 border border-feast-red/20 p-1 flex items-center justify-center flex-shrink-0">
            <img src="https://tfvtalks.s3.dualstack.ap-southeast-1.amazonaws.com/01%20The%20FeastLight%20Archives%20/Images%20/Feast-Light-Logo-Rebrand-FINAL.png" alt="Feast Light" className="w-full h-full object-contain opacity-80" />
          </div>
          <div className="text-left">
            <h3 className="font-display font-bold text-white text-lg">{name}</h3>
            <p className="text-white/60 text-sm">
              {(subRegion.subLocations?.length || 0) + (subRegion.byDistrictLocation?.reduce((acc, dist) => acc + (dist.byDistrictLocations?.length || 0), 0) || 0)} Feastlight Location{((subRegion.subLocations?.length || 0) + (subRegion.byDistrictLocation?.reduce((acc, dist) => acc + (dist.byDistrictLocations?.length || 0), 0) || 0)) !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="text-feast-red group-hover:text-white transition-colors">
          {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
        </div>
      </button>
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[9999px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
        <div className="flex flex-col gap-3 pb-2">
          {subRegion.subLocations && subRegion.subLocations.filter(sl => !sl.byDistrictLocations?.length).length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mb-3">
              {subRegion.subLocations.filter(sl => !sl.byDistrictLocations?.length).map((subLoc, i) => (
                <SubLocationSection key={subLoc.id || i} subLocation={subLoc} />
              ))}
            </div>
          )}
          {subRegion.subLocations && subRegion.subLocations.filter(sl => sl.byDistrictLocations?.length > 0).map((subLoc, i) => (
            <SubLocationSection key={`acc-${subLoc.id || i}`} subLocation={subLoc} />
          ))}
          {subRegion.byDistrictLocation && subRegion.byDistrictLocation.length > 0 && (
            subRegion.byDistrictLocation.map((district, i) => (
              <SubLocationSection key={district.id || i} subLocation={district} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function LocationModal({ location, isOpen, onClose }) {
  const [expandedIndex, setExpandedIndex] = useState(null)

  // Lock the background page scroll while the modal is open.
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'

      return () => {
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        window.scrollTo({ top: scrollY, left: 0, behavior: 'instant' })
      }
    }
  }, [isOpen])

  if (!isOpen || !location) return null

  const { name, region, gradientFrom = '#1a1a2e', gradientTo = '#302b63', subRegions = [] } = location

  const toggle = (index) => setExpandedIndex(prev => prev === index ? null : index)

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 sm:p-4" onClick={onClose}>
      <div
        className="bg-feast-dark rounded-2xl max-w-5xl w-full h-[95vh] sm:h-auto sm:max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="sticky top-0 p-6 border-b border-feast-red/20 z-10 flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
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
  const { name, region, imageUrl, gradientFrom = '#1a1a2e', gradientTo = '#302b63' } = location

  return (
    <button
      onClick={() => onCardClick(location)}
      className="block rounded-2xl overflow-hidden relative aspect-[4/3] cursor-pointer group shadow-lg w-full text-left bg-transparent border-none"
    >
      {imageUrl ? (
        <img src={imageUrl} alt={name} className="w-full h-full object-cover absolute inset-0 transition-transform duration-500 group-hover:scale-110" />
      ) : (
        <div className="w-full h-full absolute inset-0 transition-transform duration-500 group-hover:scale-110" style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }} />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
      <div className="absolute bottom-5 left-5 text-white">
        <div className="text-[0.68rem] font-medium tracking-wider opacity-75 uppercase mb-0.5">{region}</div>
        <div className="font-display font-bold text-lg leading-tight">{name}</div>
      </div>
    </button>
  )
}

// ─── Search result card ──────────────────────────────────────────────────────

function SearchResultCard({ districtLocation, query = '' }) {
  const { _breadcrumb = [] } = districtLocation

  return (
    <div className="relative">
      {_breadcrumb.length > 0 && (
        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
          <MapPin size={11} className="text-feast-red flex-shrink-0" />
          {_breadcrumb.map((crumb, i) => (
            <span key={i} className="text-white/40 text-[10px]">
              {crumb}{i < _breadcrumb.length - 1 && <span className="ml-1.5 text-white/20">›</span>}
            </span>
          ))}
        </div>
      )}
      <DistrictLocationCard districtLocation={districtLocation} query={query} />
    </div>
  )
}

// ─── Main export ─────────────────────────────────────────────────────────────

export default function LocationGrid({ locations }) {
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [query, setQuery] = useState('')
  const [visibleCount, setVisibleCount] = useState(RESULTS_PER_PAGE)

  const displayLocations = locations?.slice(0, 6) || []

  // Flatten all leaf locations for search
  const allFlatLocations = useMemo(() => flattenLocations(locations), [locations])

  const searchResults = useMemo(() => {
    const q = query.trim()
    if (!q) return []
    return allFlatLocations.filter(dl => matchesQuery(dl, q))
  }, [query, allFlatLocations])

  // Reset visible count whenever query changes
  const handleQueryChange = (e) => {
    setQuery(e.target.value)
    setVisibleCount(RESULTS_PER_PAGE)
  }

  const handleClear = () => {
    setQuery('')
    setVisibleCount(RESULTS_PER_PAGE)
  }

  const isSearching = query.trim().length >= 2
  const visibleResults = searchResults.slice(0, visibleCount)
  const hasMore = visibleCount < searchResults.length
  const isShowingAll = visibleCount >= searchResults.length && visibleCount > RESULTS_PER_PAGE

  return (
    <section id="locations" className="py-24 px-4 bg-feast-dark">
      <div className="max-w-7xl mx-auto">
        <AnimatedSection className="mb-10">
          <div className="section-label" style={{ color: 'rgba(255,75,75,0.9)' }}>Global Community</div>
          <h2 className="font-display text-4xl lg:text-5xl font-black text-white mb-4">
            Find a Feast Light Near You
          </h2>
          <p className="text-white/50 text-base leading-relaxed max-w-lg">
            The Feast Light has spread across the Philippines and around the world. Find a community gathering near you.
          </p>
        </AnimatedSection>

        {/* ── Search bar ── */}
        <AnimatedSection className="mb-10">
          <div className="relative max-w-xl">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none"
            />
            <input
              type="text"
              value={query}
              onChange={handleQueryChange}
              placeholder="Search by name, location, schedule, contact…"
              className="w-full bg-white/[0.05] border border-white/10 hover:border-white/20 focus:border-feast-red/50
                         rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder:text-white/30
                         outline-none transition-colors duration-200
                         focus:bg-white/[0.07] focus:shadow-[0_0_0_3px_rgba(255,75,75,0.12)]"
            />
            {query && (
              <button
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors"
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </AnimatedSection>

        {/* ── Search results ── */}
        {isSearching ? (
          <div>
            {searchResults.length > 0 ? (
              <>
                {/* Result count */}
                <p className="text-white/40 text-xs mb-4">
                  Showing <span className="text-white/60">{visibleResults.length}</span> of{' '}
                  <span className="text-white/60">{searchResults.length}</span> result{searchResults.length !== 1 ? 's' : ''} for{' '}
                  &ldquo;<span className="text-white/60">{query}</span>&rdquo;
                </p>

                {/* Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {visibleResults.map((dl, i) => (
                    <SearchResultCard key={dl.id || i} districtLocation={dl} query={query.trim()} />
                  ))}
                </div>

                {/* Show More / Show Less */}
                {(hasMore || isShowingAll) && (
                  <div className="flex items-center justify-center gap-3 mt-8">
                    {hasMore && (
                      <button
                        onClick={() => setVisibleCount(c => c + RESULTS_PER_PAGE)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl
                                   bg-white/[0.05] border border-white/10
                                   hover:border-feast-red/40 hover:bg-feast-red/10
                                   text-white/70 hover:text-white text-sm font-medium
                                   transition-all duration-200"
                      >
                        <ChevronDown size={15} />
                        Show More
                        <span className="text-white/30 text-xs">
                          ({Math.min(RESULTS_PER_PAGE, searchResults.length - visibleCount)} more)
                        </span>
                      </button>
                    )}
                    {isShowingAll && (
                      <button
                        onClick={() => setVisibleCount(RESULTS_PER_PAGE)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl
                                   bg-white/[0.05] border border-white/10
                                   hover:border-feast-red/40 hover:bg-feast-red/10
                                   text-white/70 hover:text-white text-sm font-medium
                                   transition-all duration-200"
                      >
                        <ChevronUp size={15} />
                        Show Less
                      </button>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                  <Search size={20} className="text-white/20" />
                </div>
                <p className="text-white/50 text-sm">No locations found for &ldquo;<span className="text-white/70">{query}</span>&rdquo;</p>
                <p className="text-white/25 text-xs mt-1">Try a different name, city, or schedule</p>
              </div>
            )}
          </div>
        ) : (
          /* ── Default card grid ── */
          <StaggerChildren className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayLocations.map((loc, i) => (
              <StaggerItem key={loc.id || i}>
                <LocationCard location={loc} onCardClick={setSelectedLocation} />
              </StaggerItem>
            ))}
          </StaggerChildren>
        )}
      </div>

      <LocationModal
        location={selectedLocation}
        isOpen={selectedLocation !== null}
        onClose={() => setSelectedLocation(null)}
      />
    </section>
  )
}
