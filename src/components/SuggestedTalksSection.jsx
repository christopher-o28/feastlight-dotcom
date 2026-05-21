// src/components/TalksSearchBar.jsx
import { useState, useMemo, useCallback, useEffect } from 'react'
import { Search, X, ChevronDown, ChevronUp, Download, ArrowLeft, ArrowRight, Play, ChevronRight, FileText, File } from 'lucide-react'


// ─── Constants ────────────────────────────────────────────────────────────────

const TAGS = [
  'English', 'Tagalog', 'Visayan', '2026', '2025', '2024', '2023', '2022', '2021',
  '2020', '2019', '2018', '2017', '2016', '2015', '2014', '2013', '2012', '2011', '2010', '2009',
]

const PAGE_SIZE = 6

// ─── Google Sheets Fetcher ────────────────────────────────────────────────────
// Fetches subtalks from a published Google Sheet (CSV export URL)
// Sheet columns (order matters): seriesId, talkNumber, talkTitle, talkVideoUrl,
//   talkVideoUrlDownload, talkThumbnailUrl, discussionGuideUrl, discussionGuideQrUrl,
//   talkSlidesUrl, talkSlidesQrUrl, keyMessage, quote, description
//
// To get your Google Sheet CSV URL:
//   File → Share → Publish to web → Sheet tab → CSV → Copy link
//   Example: https://docs.google.com/spreadsheets/d/SHEET_ID/export?format=csv&gid=SHEET_GID

// Cache for subtalks data
const subtalksCacheMap = new Map()

export async function fetchSubtalksFromSheet(sheetCsvUrl) {
  // Check cache first
  if (subtalksCacheMap.has(sheetCsvUrl)) {
    return subtalksCacheMap.get(sheetCsvUrl)
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000) // 10 second timeout

  try {
    const res = await fetch(sheetCsvUrl, { signal: controller.signal })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const text = await res.text()
    const rows = text.trim().split('\n').map(row => parseCSVRow(row))
    const [header, ...dataRows] = rows

    const result = dataRows
      .filter(row => row.length >= 2 && row[0])
      .map(row => ({
        seriesId: (row[0] || '').trim(),
        talkNumber: (row[1] || '').trim(),
        talkTitle: (row[2] || '').trim(),
        talkVideoUrl: (row[3] || '').trim(),
        talkVideoUrlDownload: (row[4] || '').trim(),
        talkThumbnailUrl: (row[5] || '').trim(),
        discussionGuideUrl: (row[6] || '#').trim(),
        discussionGuideQrUrl: (row[7] || '').trim(),
        talkSlidesUrl: (row[8] || '#').trim(),
        talkSlidesQrUrl: (row[9] || '').trim(),
        keyMessage: (row[10] || '').trim(),
        quote: (row[11] || '').trim(),
        description: (row[12] || '').trim(),
      }))

    // Cache the result
    subtalksCacheMap.set(sheetCsvUrl, result)
    return result
  } finally {
    clearTimeout(timeout)
  }
}

function parseCSVRow(row) {
  const result = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < row.length; i++) {
    const ch = row[i]
    if (ch === '"') {
      if (inQuotes && row[i + 1] === '"') { current += '"'; i++ }
      else inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      result.push(current); current = ''
    } else {
      current += ch
    }
  }
  result.push(current)
  return result
}

// ─── Highlight matched text ───────────────────────────────────────────────────

function Highlighted({ text, query }) {
  if (!query) return <>{text}</>
  const re = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  const parts = text.split(re)
  return (
    <>
      {parts.map((part, i) =>
        re.test(part)
          ? <mark key={i} className="bg-yellow-100 rounded-[2px] px-px not-italic">{part}</mark>
          : part
      )}
    </>
  )
}

// ─── QR Image (real upload) or generated fallback ────────────────────────────

function QRPlaceholder({ seed, imageUrl }) {
  if (imageUrl) {
    return (
      <div style={{
        width: 80, height: 80,
        borderRadius: 10,
        border: '1.5px solid rgba(255,255,255,.15)',
        overflow: 'hidden',
        background: '#fff',
        flexShrink: 0,
      }}>
        <img src={imageUrl} alt="QR code" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
    )
  }
  const colors = ['#e53e3e', 'rgba(255,107,107,.32)', 'rgba(255,255,255,.08)']
  const cells = Array.from({ length: 25 }, (_, i) => {
    let v = (seed * 17 + i * 7 + (i % 3) * 13) % 3
    if ([0, 1, 4, 5, 20, 21, 24].includes(i)) v = 0
    if ([2, 3, 22, 23].includes(i)) v = 2
    return v
  })
  return (
    <div style={{
      width: 80, height: 80, borderRadius: 10, border: '1.5px solid rgba(255,255,255,.12)',
      display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 3, padding: 8,
      background: '#0d0d1a', flexShrink: 0,
    }}>
      {cells.map((v, i) => (
        <div key={i} style={{ background: colors[v], borderRadius: 1.5, aspectRatio: '1' }} />
      ))}
    </div>
  )
}

// ─── TalkVideoPlayer ─────────────────────────────────────────────────────────

function getEmbedUrl(url) {
  if (!url) return null
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=1&rel=0`
  const vm = url.match(/vimeo\.com\/(\d+)/)
  if (vm) return `https://player.vimeo.com/video/${vm[1]}?autoplay=1`
  return null
}

function isDirectVideo(url) {
  if (!url) return false
  return /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url)
}

function TalkVideoPlayer({ url, talkNumber, description, thumbnailUrl }) {
  const [active, setActive] = useState(false)
  const embedUrl = getEmbedUrl(url)
  const isDirect = isDirectVideo(url)
  const hasVideo = !!(url && (embedUrl || isDirect))

  const containerStyle = {
    borderRadius: 14, overflow: 'hidden', position: 'relative',
    background: '#0a0a14', border: '1px solid rgba(255,255,255,.07)',
    aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center',
  }

  if (active && hasVideo) {
    if (embedUrl) {
      return (
        <div style={containerStyle}>
          <iframe src={embedUrl} title={talkNumber || 'Talk video'}
            allow="autoplay; fullscreen; picture-in-picture" allowFullScreen
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }} />
        </div>
      )
    }
    if (isDirect) {
      return (
        <div style={containerStyle}>
          <video src={url} controls autoPlay
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', background: '#000' }} />
        </div>
      )
    }
  }

  return (
    <div
      style={{ ...containerStyle, cursor: hasVideo ? 'pointer' : 'default' }}
      onClick={() => hasVideo && setActive(true)}
      onMouseEnter={e => { if (hasVideo) { const r = e.currentTarget.querySelector('.tvp-ring'); if (r) r.style.borderColor = '#e53e3e' } }}
      onMouseLeave={e => { if (hasVideo) { const r = e.currentTarget.querySelector('.tvp-ring'); if (r) r.style.borderColor = 'rgba(255,107,107,.5)' } }}
    >
      {thumbnailUrl
        ? <img src={thumbnailUrl} alt={talkNumber} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        : <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #0d2015 0%, #0a1520 100%)' }} />
      }
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.38)' }} />
      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(255,107,107,.7)' }}>
          {talkNumber || 'Trailer Video'}
        </div>
        <div className="tvp-ring" style={{
          width: 56, height: 56, borderRadius: '50%',
          border: '2px solid rgba(255,107,107,.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'border-color .2s', background: 'rgba(0,0,0,.3)',
        }}>
          <div style={{
            width: 0, height: 0, borderTop: '10px solid transparent', borderBottom: '10px solid transparent',
            borderLeft: hasVideo ? '18px solid rgba(255,107,107,.9)' : '18px solid rgba(255,255,255,.2)', marginLeft: 4,
          }} />
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)' }}>
          {hasVideo ? 'Click to watch' : (description?.slice(0, 32) || 'No video yet')}
        </div>
      </div>
    </div>
  )
}

// ─── SubtalkRow ───────────────────────────────────────────────────────────────
// A single row inside the SubtalksPanel, with its own mini video+resources modal

function SubtalkRow({ subtalk, onOpen, isStatic = false }) {
  const hasVideo = !!(subtalk.talkVideoUrl)

  const baseStyle = isStatic
    ? {
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 16px',
      borderRadius: 12,
      background: 'linear-gradient(135deg, rgba(255,107,107,.12) 0%, rgba(255,107,107,.08) 100%)',
      border: '1px solid rgba(255,107,107,.35)',
      cursor: 'pointer',
      transition: 'all .2s cubic-bezier(0.34, 1.3, 0.64, 1)',
      boxShadow: '0 8px 20px rgba(255,107,107,.15)',
      transform: 'translateY(-2px)',
    }
    : {
      display: 'flex', alignItems: 'center', gap: 14,
      padding: '14px 16px',
      borderRadius: 12,
      background: 'linear-gradient(135deg, rgba(255,107,107,.04) 0%, rgba(255,107,107,.02) 100%)',
      border: '1px solid rgba(255,107,107,.15)',
      cursor: 'pointer',
      transition: 'all .2s cubic-bezier(0.34, 1.3, 0.64, 1)',
      boxShadow: '0 2px 8px rgba(0,0,0,.2)',
    }

  return (
    <div
      onClick={() => onOpen(subtalk)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onOpen(subtalk)}
      style={baseStyle}
      onMouseEnter={isStatic ? undefined : e => {
        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,107,107,.12) 0%, rgba(255,107,107,.08) 100%)'
        e.currentTarget.style.borderColor = 'rgba(255,107,107,.35)'
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 8px 20px rgba(255,107,107,.15)'
      }}
      onMouseLeave={isStatic ? undefined : e => {
        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,107,107,.04) 0%, rgba(255,107,107,.02) 100%)'
        e.currentTarget.style.borderColor = 'rgba(255,107,107,.15)'
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,.2)'
      }}
    >
      {/* Thumbnail or icon */}
      <div style={{
        width: 64, height: 48, borderRadius: 8, overflow: 'hidden', flexShrink: 0,
        background: '#0d1a12', border: '1.5px solid rgba(255,107,107,.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative',
        boxShadow: '0 4px 12px rgba(255,107,107,.1)',
      }}>
        {subtalk.talkThumbnailUrl
          ? <img src={subtalk.talkThumbnailUrl} alt={subtalk.talkTitle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: 0, height: 0, borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderLeft: hasVideo ? '10px solid rgba(255,107,107,.7)' : '10px solid rgba(255,255,255,.2)', marginLeft: 2 }} />
        }
        {subtalk.talkThumbnailUrl && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 0, height: 0, borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderLeft: '9px solid rgba(255,255,255,.8)', marginLeft: 2 }} />
          </div>
        )}
      </div>

      {/* Title + talk number */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#e53e3e', marginBottom: 4, opacity: 0.9 }}>
          {subtalk.talkNumber}
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#f0f4f8', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {subtalk.talkTitle || subtalk.description || 'Untitled Talk'}
        </div>
        {subtalk.description && (
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {subtalk.description}
          </div>
        )}
      </div>

      {/* Chevron */}
      <ChevronRight size={16} style={{ color: 'rgba(255,107,107,.5)', flexShrink: 0, transition: 'all .2s' }} />
    </div>
  )
}

// ─── SubtalkCard (Grid View) ──────────────────────────────────────────────────
// Card display for subtalks in grid layout at the bottom of modal

function SubtalkCard({ subtalk, onOpen }) {
  const hasVideo = !!(subtalk.talkVideoUrl)

  return (
    <div
      onClick={() => onOpen(subtalk)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onOpen(subtalk)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 12,
        overflow: 'hidden',
        background: '#1a1a2a',
        border: '1px solid rgba(255,255,255,.08)',
        cursor: 'pointer',
        transition: 'all .2s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(255,107,107,.3)'
        e.currentTarget.style.background = '#1f1f30'
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(255,107,107,.15)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,.08)'
        e.currentTarget.style.background = '#1a1a2a'
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {/* Thumbnail */}
      <div style={{
        width: '100%',
        height: 120,
        overflow: 'hidden',
        background: '#0d1a12',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {subtalk.talkThumbnailUrl
          ? <img src={subtalk.talkThumbnailUrl} alt={subtalk.talkTitle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(255,107,107,.1) 0%, rgba(255,107,107,.05) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 0, height: 0, borderTop: '12px solid transparent', borderBottom: '12px solid transparent', borderLeft: hasVideo ? '20px solid rgba(255,107,107,.6)' : '20px solid rgba(255,255,255,.2)', marginLeft: 4 }} />
          </div>
        }
        {subtalk.talkThumbnailUrl && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 0, height: 0, borderTop: '8px solid transparent', borderBottom: '8px solid transparent', borderLeft: '14px solid rgba(255,255,255,.8)', marginLeft: 2 }} />
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,107,107,.6)' }}>
          {subtalk.talkNumber}
        </div>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#f0f4f8', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {subtalk.talkTitle || subtalk.description || 'Untitled Talk'}
        </div>
        {subtalk.description && (
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,.45)', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {subtalk.description}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── SubtalkModal ─────────────────────────────────────────────────────────────
// Mini modal for a single subtalk (video + resources)

function SubtalkModal({ subtalk, seriesCard, onClose }) {
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', handler); document.body.style.overflow = '' }
  }, [onClose])

  return (
    <>
      <style>{`
        .sub-modal-scroll::-webkit-scrollbar { width: 4px }
        .sub-modal-scroll::-webkit-scrollbar-track { background: transparent }
        .sub-modal-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,.12); border-radius: 99px }
      `}</style>
      <div
        className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6"
        style={{ background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(8px)' }}
        onClick={e => { if (e.target === e.currentTarget) onClose() }}
      >
        <div
          role="dialog" aria-modal="true"
          style={{
            background: '#111118', borderRadius: 18, width: '100%', maxWidth: 720,
            maxHeight: '88vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,.07)', flexShrink: 0,
          }}>
            <button
              onClick={onClose}
              style={{
                width: 30, height: 30, borderRadius: '50%', border: '1px solid rgba(255,255,255,.18)',
                background: 'rgba(0,0,0,.4)', color: '#fff', fontSize: 14, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}
            >
              <ArrowLeft size={13} />
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(255,107,107,.7)', marginBottom: 2 }}>
                {subtalk.talkNumber} · {seriesCard?.title}
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#fff', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {subtalk.talkTitle || subtalk.description || 'Talk'}
              </div>
            </div>
            <button
              onClick={onClose}
              style={{
                width: 30, height: 30, borderRadius: '50%', border: '1px solid rgba(255,255,255,.18)',
                background: 'rgba(0,0,0,.4)', color: '#fff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <X size={13} />
            </button>
          </div>

          {/* Body */}
          <div className="sub-modal-scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Video - Full Width */}
              <div>
                <TalkVideoPlayer
                  url={subtalk.talkVideoUrl}
                  talkNumber={subtalk.talkNumber}
                  description={subtalk.description}
                  thumbnailUrl={subtalk.talkThumbnailUrl}
                />
              </div>

              {/* Talk Number and Title - Horizontal */}
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 100 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: '#e53e3e', opacity: 0.9 }}>
                    {subtalk.talkNumber}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#f0f4f8', lineHeight: 1.3 }}>
                    {subtalk.talkTitle || subtalk.description || 'Untitled Talk'}
                  </div>
                </div>
              </div>

              {/* Quote */}
              {subtalk.quote && (
                <div style={{
                  borderLeft: '3px solid rgba(255,107,107,.5)', padding: '10px 14px',
                  background: 'rgba(255,107,107,.05)', borderRadius: '0 8px 8px 0',
                }}>
                  <p style={{ fontSize: 13, fontStyle: 'italic', fontWeight: 600, color: 'rgba(255,255,255,.62)', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap', overflowWrap: 'break-word' }}>
                    {subtalk.quote}
                  </p>
                </div>
              )}

              {/* Key Message */}
              {subtalk.keyMessage && (
                <div style={{
                  display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 14px',
                  background: 'rgba(229,62,62,.07)', borderRadius: 8, border: '1px solid rgba(229,62,62,.15)',
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#e53e3e', marginTop: 5, flexShrink: 0 }} />
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.52)', lineHeight: 1.6 }}>
                    {subtalk.keyMessage}
                  </div>
                </div>
              )}



              {/* Description */}
              {subtalk.description && (
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,.45)', lineHeight: 1.7, margin: 0 }}>
                  {subtalk.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── ResourceCard (reusable) ──────────────────────────────────────────────────

function ResourceCard({ label, downloadUrl, qrUrl, seed }) {
  return (
    <div style={{
      background: '#1a1a2a', border: '1px solid rgba(255,255,255,.08)',
      borderRadius: 14, padding: '14px 16px',
      display: 'flex', alignItems: 'center', gap: 16, overflow: 'hidden',
    }}>
      <QRPlaceholder seed={seed} imageUrl={qrUrl} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,.3)' }}>Resource</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#f0f4f8', lineHeight: 1.2 }}>{label}</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,.3)', marginBottom: 4 }}>Scan QR or click to download</div>
        <a
          href={downloadUrl} download
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '8px 18px', borderRadius: 999, background: '#e53e3e', color: '#fff',
            fontSize: 12, fontWeight: 700, textDecoration: 'none', letterSpacing: '.04em',
            transition: 'background .15s', alignSelf: 'flex-start',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#c53030'}
          onMouseLeave={e => e.currentTarget.style.background = '#e53e3e'}
        >
          <Download size={12} /> Download
        </a>
      </div>
    </div>
  )
}

// ─── SubtalksPanel ────────────────────────────────────────────────────────────
// Collapsible panel inside TalkModal showing all subtalks for this series

function SubtalksPanel({ seriesId, seriesCard, subtalksMap, isLoading }) {
  const [expanded, setExpanded] = useState(true)
  const [activeSubtalk, setActiveSubtalk] = useState(null)

  const subtalks = subtalksMap[seriesId] || []

  if (isLoading) {
    return (
      <div style={{ padding: '14px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 16, height: 16, borderRadius: '50%',
          border: '2px solid rgba(255,107,107,.3)', borderTopColor: '#e53e3e',
          animation: 'spin .7s linear infinite',
        }} />
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,.35)' }}>Loading talks…</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (!subtalks.length) return null

  return (
    <div style={{ marginTop: 4 }}>
      {/* Header toggle */}
      <button
        onClick={() => setExpanded(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          padding: '12px 0', color: '#fff',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8, background: 'rgba(229,62,62,.2)',
            border: '1.5px solid rgba(229,62,62,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(229,62,62,.1)',
          }}>
            <Play size={12} style={{ color: '#e53e3e', marginLeft: 2 }} />
          </div>

          <span style={{
            fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase',
            padding: '4px 10px', borderRadius: 999,
            background: 'rgba(229,62,62,.15)', color: '#e53e3e',
            border: '1px solid rgba(229,62,62,.3)',
            boxShadow: '0 2px 6px rgba(229,62,62,.1)',
          }}>
            {subtalks.length} TALKS
          </span>
        </div>
        {expanded
          ? <ChevronUp size={16} style={{ color: 'rgba(255,255,255,.45)', transition: 'all .2s' }} />
          : <ChevronDown size={16} style={{ color: 'rgba(255,255,255,.45)', transition: 'all .2s' }} />
        }
      </button>

      {/* Subtalk list */}
      {expanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 4, paddingBottom: 12 }}>
          {subtalks.map((st, i) => (
            <div key={i}>
              <SubtalkRow
                subtalk={st}
                onOpen={(subtalk) => {
                  if (activeSubtalk?.talkNumber === subtalk.talkNumber) {
                    setActiveSubtalk(null)
                  } else {
                    setActiveSubtalk(subtalk)
                  }
                }}
                isStatic={activeSubtalk?.talkNumber === st.talkNumber}
              />

              {/* Inline subtalk details */}
              {activeSubtalk?.talkNumber === st.talkNumber && (
                <div style={{ padding: '16px 12px', borderRadius: 12, background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.1)', marginTop: 8 }}>

                  {/* Video - Full Width */}
                  <div style={{ marginBottom: 16 }}>
                    <TalkVideoPlayer
                      url={st.talkVideoUrl}
                      talkNumber={st.talkNumber}
                      description={st.description}
                      thumbnailUrl={st.talkThumbnailUrl}
                    />
                  </div>

                  {/* Talk Number and Title */}
                  <div style={{ marginBottom: 16 }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: '#f0f4f8', lineHeight: 1.3 }}>
                      {st.talkNumber}: {st.talkTitle || st.description || 'Untitled Talk'}
                    </span>
                  </div>

                  {/* Quote */}
                  {st.quote && (
                    <div style={{
                      borderLeft: '2px solid rgba(255,255,255,.2)', padding: '10px 14px',
                      background: 'rgba(255,255,255,.02)', borderRadius: '0 8px 8px 0',
                      marginBottom: 12,
                    }}>
                      <p style={{ fontSize: 13, fontStyle: 'italic', color: 'rgba(255,255,255,.9)', lineHeight: 1.8, margin: 0, whiteSpace: 'pre-wrap', overflowWrap: 'break-word' }}>
                        {st.quote}
                      </p>
                    </div>
                  )}

                  {/* Key Message */}
                  {st.keyMessage && (
                    <div style={{
                      display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 14px',
                      background: 'rgba(255,255,255,.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,.1)',
                      marginBottom: 16,
                    }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,.5)', marginTop: 5, flexShrink: 0 }} />
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.9)', lineHeight: 1.6 }}>
                        {st.keyMessage}
                      </div>
                    </div>
                  )}



                  {/* Description */}
                  {st.description && (
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,.45)', lineHeight: 1.7, margin: 0 }}>
                      {st.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── TalkModal ────────────────────────────────────────────────────────────────

function TalkModal({ card, allCards, onClose, onNavigate, subtalksMap, subtalksLoading }) {
  const {
    id, title, fullDescription, description, tag, tag2, emoji = '📖',
    imageUrl, gradientFrom = '#1a1a2e', gradientTo = '#302b63',
    downloadUrl = '#', trailerUrl = '', discussionGuideUrl = '#', talkSlidesUrl = '#',
    discussionGuideQrUrl = '', talkSlidesQrUrl = '',
    talkSubtitle = '', keyMessage = '', quote = '', talkNumber = '',
    talkVideoUrl = '', talkThumbnailUrl = '', talkTitle = '',
    seriesId = '',
  } = card

  const [playing, setPlaying] = useState(!!trailerUrl)
  const [selectedSubtalk, setSelectedSubtalk] = useState(null)

  const currentIndex = allCards.findIndex(c => c.id === id)
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < allCards.length - 1

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && hasPrev) onNavigate(allCards[currentIndex - 1])
      if (e.key === 'ArrowRight' && hasNext) onNavigate(allCards[currentIndex + 1])
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose, onNavigate, allCards, currentIndex, hasPrev, hasNext])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Resolve seriesId: use explicit field or fall back to card id
  const resolvedSeriesId = seriesId || id || ''

  return (
    <>
      <style>{`
        .talk-modal-scroll::-webkit-scrollbar { width: 4px }
        .talk-modal-scroll::-webkit-scrollbar-track { background: transparent }
        .talk-modal-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,.12); border-radius: 99px }
      `}</style>

      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      >
        <div
          role="dialog" aria-modal="true" aria-labelledby="modal-title"
          style={{
            background: '#111118', borderRadius: 20, width: '100%', maxWidth: 860,
            maxHeight: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{ position: 'relative', minHeight: 60, display: 'flex', alignItems: 'flex-end', overflow: 'hidden', flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,.07)' }}>
            <button
              onClick={onClose} aria-label="Close modal"
              style={{
                position: 'absolute', top: 12, right: 12, zIndex: 25,
                width: 34, height: 34, borderRadius: '50%',
                border: '1px solid rgba(255,255,255,.2)', background: 'rgba(0,0,0,.4)',
                color: '#fff', fontSize: 16, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,.12)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.4)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,.4)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.2)' }}
            >
              <X size={14} />
            </button>
            <div style={{ position: 'relative', zIndex: 2, padding: '12px 32px', width: '100%' }}>
              <h2 id="modal-title" style={{ fontSize: 18, fontWeight: 800, color: '#fff', lineHeight: 1.15, margin: 0, marginBottom: 4 }}>
                {title}
              </h2>
              {talkSubtitle && (
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', margin: 0 }}>{talkSubtitle}</p>
              )}
            </div>
          </div>

          {/* Scrollable Body */}
          <div className="talk-modal-scroll" style={{ flex: 1, overflowY: 'auto', background: '#111118' }}>
            <div style={{ padding: '0 0 24px' }}>

              {/* Banner */}
              <div style={{ position: 'relative', minHeight: 260, display: 'flex', alignItems: 'flex-end', overflow: 'hidden', marginBottom: 24 }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #0d0d1a 0%, #1a0a2e 40%, #0a1a0a 100%)' }} />
                <div style={{
                  position: 'absolute', inset: 0,
                  backgroundImage: 'repeating-linear-gradient(0deg,rgba(255,107,107,.04) 0 1px,transparent 1px 48px),repeating-linear-gradient(90deg,rgba(255,107,107,.04) 0 1px,transparent 1px 48px)',
                }} />

                {trailerUrl && playing && (
                  <video controls autoPlay src={trailerUrl} title={`${title} trailer`}
                    style={{ position: 'absolute', inset: 0, zIndex: 20, width: '100%', height: '100%', objectFit: 'cover', background: '#000' }}
                    onEnded={() => setPlaying(false)} />
                )}

                {!playing && (
                  <>
                    {imageUrl && (
                      <img src={imageUrl} alt={title}
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }} />
                    )}
                    {trailerUrl && (
                      <div style={{ position: 'absolute', inset: 0, zIndex: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <button
                          onClick={() => setPlaying(true)} aria-label="Play trailer"
                          style={{
                            width: 72, height: 72, borderRadius: '50%',
                            border: '2.5px solid rgba(255,107,107,.7)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', background: 'rgba(0,0,0,.35)', transition: 'all .2s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,107,107,.15)'; e.currentTarget.style.borderColor = '#e53e3e' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,.35)'; e.currentTarget.style.borderColor = 'rgba(255,107,107,.7)' }}
                        >
                          <div style={{ width: 0, height: 0, borderTop: '12px solid transparent', borderBottom: '12px solid transparent', borderLeft: '20px solid rgba(255,107,107,.85)', marginLeft: 4 }} />
                        </button>
                      </div>
                    )}
                  </>
                )}

                {!playing && (
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.78) 0%, transparent 55%)' }} />
                )}

                <div style={{ position: 'relative', zIndex: 2, padding: '28px 32px', width: '100%' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(255, 64, 64, 1.0)', marginBottom: 8 }}>
                    Series &bull; {tag2 || tag}
                  </div>
                </div>
              </div>

              {/* Content area */}
              <div style={{ padding: '0 28px' }}>

                {/* Tags */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '14px 0 4px', flexWrap: 'wrap' }}>
                  {tag && (
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: 999, background: 'rgba(255,107,107,.1)', color: 'rgba(255,107,107,.85)', border: '1px solid rgba(255,107,107,.2)' }}>
                      {tag}
                    </span>
                  )}
                  {tag2 && (
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: 999, background: 'rgba(255,255,255,.06)', color: 'rgba(255,255,255,.42)', border: '1px solid rgba(255,255,255,.1)' }}>
                      {tag2}
                    </span>
                  )}
                </div>

                {/* 2-column content */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24, padding: '20px 0' }}>

                  {/* Left: Video + Resources */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <TalkVideoPlayer
                      url={talkVideoUrl}
                      talkNumber={talkNumber}
                      description={description}
                      thumbnailUrl={talkThumbnailUrl}
                    />
                    {(() => {
                      const seriesSubtalks = subtalksMap[resolvedSeriesId] || []
                      const sorted = [...seriesSubtalks].sort((a, b) => {
                        const na = parseInt(a.talkNumber?.replace(/\D/g, '') || '0')
                        const nb = parseInt(b.talkNumber?.replace(/\D/g, '') || '0')
                        return na - nb
                      })
                      return sorted.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {sorted.map((st, i) => (
                            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,.04)', borderRadius: 8, border: '1px solid rgba(255,255,255,.08)' }}>
                              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: '#e53e3e', opacity: 0.8, minWidth: 40 }}>{st.talkNumber}</span>
                              <span style={{ fontSize: 12, color: 'rgba(255,255,255,.65)', flex: 1 }}>{st.talkTitle || st.description}</span>
                              <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                                {st.talkVideoUrlDownload && (
                                  <a href={st.talkVideoUrlDownload} download target="_blank" rel="noreferrer" title="Download Video"
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: 6, background: '#fff', color: '#e53e3e', textDecoration: 'none', transition: 'background .15s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#f0f0f0'}
                                    onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                                  >
                                    <Download size={11} />
                                  </a>
                                )}
                                {st.talkSlidesUrl && st.talkSlidesUrl !== '#' && (
                                  <a href={st.talkSlidesUrl} download target="_blank" rel="noreferrer" title="Download Talk Slide"
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: 6, background: '#e53e3e', color: '#fff', textDecoration: 'none', transition: 'background .15s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#c53030'}
                                    onMouseLeave={e => e.currentTarget.style.background = '#e53e3e'}
                                  >
                                    <FileText size={11} />
                                  </a>
                                )}
                                {st.discussionGuideUrl && st.discussionGuideUrl !== '#' && (
                                  <a href={st.discussionGuideUrl} download target="_blank" rel="noreferrer" title="Download Discussion Guide"
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, borderRadius: 6, background: '#3b82f6', color: '#fff', textDecoration: 'none', transition: 'background .15s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#2563eb'}
                                    onMouseLeave={e => e.currentTarget.style.background = '#3b82f6'}
                                  >
                                    <File size={11} />
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )
                    })()}
                  </div>
                </div>

                {/* ── Subtalks Panel ── */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,.06)', marginTop: 8 }}>
                  <SubtalksPanel
                    seriesId={resolvedSeriesId}
                    seriesCard={card}
                    subtalksMap={subtalksMap}
                    isLoading={subtalksLoading}
                  />
                </div>

              </div>
            </div>
          </div>

          {/* Prev/Next footer */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            borderTop: '1px solid rgba(255,255,255,.07)', padding: '12px 20px', flexShrink: 0, background: '#0e0e16',
          }}>
            <button
              onClick={() => hasPrev && onNavigate(allCards[currentIndex - 1])}
              disabled={!hasPrev}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.76rem', fontWeight: 600,
                color: hasPrev ? 'rgba(255,255,255,.4)' : 'rgba(255,255,255,.15)',
                background: 'none', border: 'none', cursor: hasPrev ? 'pointer' : 'not-allowed', transition: 'color .15s',
              }}
              onMouseEnter={e => { if (hasPrev) e.currentTarget.style.color = '#e53e3e' }}
              onMouseLeave={e => { e.currentTarget.style.color = hasPrev ? 'rgba(255,255,255,.4)' : 'rgba(255,255,255,.15)' }}
            >
              <ArrowLeft size={13} /> Prev
            </button>
            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,.2)', fontVariantNumeric: 'tabular-nums' }}>
              {currentIndex + 1} of {allCards.length}
            </span>
            <button
              onClick={() => hasNext && onNavigate(allCards[currentIndex + 1])}
              disabled={!hasNext}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.76rem', fontWeight: 600,
                color: hasNext ? 'rgba(255,255,255,.4)' : 'rgba(255,255,255,.15)',
                background: 'none', border: 'none', cursor: hasNext ? 'pointer' : 'not-allowed', transition: 'color .15s',
              }}
              onMouseEnter={e => { if (hasNext) e.currentTarget.style.color = '#e53e3e' }}
              onMouseLeave={e => { e.currentTarget.style.color = hasNext ? 'rgba(255,255,255,.4)' : 'rgba(255,255,255,.15)' }}
            >
              Next <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── TalksSearchBar ───────────────────────────────────────────────────────────

export default function TalksSearchBar({
  talks = [],
  // Optional: pass a Google Sheets CSV URL to auto-fetch subtalks
  // e.g. "https://docs.google.com/spreadsheets/d/SHEET_ID/export?format=csv&gid=0"
  subtalkSheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTkZi9S2sUa1HkQ6v9PCeZfr0stItscA73BW4t2prGQifg4fFhorLez06Vqu-lTFc016yo3H1wf96PQ/pub?gid=2081298058&single=true&output=csv',
  // Optional: pass pre-loaded subtalks map { seriesId: [subtalk, ...] }
  initialSubtalksMap = {},
}) {
  const [query, setQuery] = useState('')
  const [activeTag, setActiveTag] = useState('')
  const [page, setPage] = useState(1)
  const [selectedCard, setSelectedCard] = useState(null)
  const [subtalksMap, setSubtalksMap] = useState(initialSubtalksMap)
  const [subtalksLoading, setSubtalksLoading] = useState(false)

  // Fetch subtalks from Google Sheet on mount (if URL provided)
  useEffect(() => {
    if (!subtalkSheetUrl) return

    let isMounted = true
    setSubtalksLoading(true)

    fetchSubtalksFromSheet(subtalkSheetUrl)
      .then(rows => {
        if (!isMounted) return
        const map = {}
        rows.forEach(row => {
          if (!row.seriesId) return
          const key = String(row.seriesId).trim()   // ← normalize to string
          if (!map[key]) map[key] = []
          map[key].push(row)
        })
        setSubtalksMap(map)
      })
      .catch(err => {
        if (!isMounted) return
        console.error('Subtalks fetch error:', err.message)
        // Don't clear map on error - keep previous data if available
      })
      .finally(() => {
        if (isMounted) setSubtalksLoading(false)
      })

    return () => { isMounted = false }
  }, [subtalkSheetUrl])

  // 🔍 TEMPORARY DEBUG — remove after fixing

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return talks.filter(talk => {
      if (!talk.tag) return false
      const matchQuery = !q
        || talk.title?.toLowerCase().includes(q)
        || talk.tag?.toLowerCase().includes(q)
        || talk.tag2?.toLowerCase().includes(q)
        || talk.description?.toLowerCase().includes(q)
      const matchTag = !activeTag || talk.tag === activeTag || talk.tag2 === activeTag
      return matchQuery && matchTag
    })
  }, [talks, query, activeTag])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const startIndex = (page - 1) * PAGE_SIZE
  const endIndex = Math.min(startIndex + PAGE_SIZE, filtered.length)
  const visible = filtered.slice(startIndex, endIndex)

  const handleQuery = useCallback((e) => { setQuery(e.target.value); setPage(1) }, [])
  const handleClear = useCallback(() => { setQuery(''); setPage(1) }, [])
  const handleTag = useCallback((tag) => { setActiveTag(tag); setPage(1) }, [])
  const openModal = useCallback((card) => setSelectedCard(card), [])
  const closeModal = useCallback(() => setSelectedCard(null), [])
  const navigateModal = useCallback((card) => setSelectedCard(card), [])
  const goToPage = useCallback((p) => setPage(Math.max(1, Math.min(p, totalPages))), [totalPages])

  return (
    <section id="talks" className="py-24 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="w-full">

          {selectedCard && (
            <TalkModal
              card={selectedCard}
              allCards={filtered}
              onClose={closeModal}
              onNavigate={navigateModal}
              subtalksMap={subtalksMap}
              subtalksLoading={subtalksLoading}
            />
          )}

          {/* Top row */}
          <div className="flex items-center justify-between gap-3 flex-wrap mb-5">
            <div className="flex flex-wrap gap-2">
              {['All', ...TAGS].map(tag => {
                const val = tag === 'All' ? '' : tag
                const isActive = activeTag === val
                return (
                  <button
                    key={tag}
                    onClick={() => handleTag(val)}
                    className={[
                      'rounded-full px-4 py-1.5 text-[0.72rem] font-semibold',
                      'border transition-all duration-150 leading-none',
                      isActive
                        ? 'bg-red-400 border-red-400 text-white'
                        : 'bg-transparent border-red-300 text-red-500 hover:bg-red-50',
                    ].join(' ')}
                  >
                    {tag}
                  </button>
                )
              })}
            </div>

            <div className="flex items-center gap-2 border border-red-300 rounded-full px-3.5 h-9 w-48 shrink-0 bg-white focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100 transition-all duration-150">
              <Search size={13} className="text-red-400 shrink-0" />
              <input
                type="text" value={query} onChange={handleQuery}
                placeholder="Search talks…"
                className="flex-1 bg-transparent outline-none text-[0.8rem] text-gray-700 placeholder-red-300 min-w-0"
              />
              {query && (
                <button onClick={handleClear} aria-label="Clear search">
                  <X size={12} className="text-red-400 hover:text-red-600 transition-colors" />
                </button>
              )}
            </div>
          </div>

          {/* Result meta */}
          <p className="text-[0.75rem] text-gray-400 mb-4">
            {filtered.length === talks.length
              ? <>Showing <span className="text-gray-600 font-medium">{PAGE_SIZE}</span> of <span className="text-gray-600 font-medium">{talks.length}</span> talks (Page <span className="text-gray-600 font-medium">{totalPages > 0 ? page : 0}</span> of <span className="text-gray-600 font-medium">{totalPages}</span>)</>
              : <><span className="text-gray-600 font-medium">{filtered.length}</span> result{filtered.length !== 1 ? 's' : ''} found (Page <span className="text-gray-600 font-medium">{totalPages > 0 ? page : 0}</span> of <span className="text-gray-600 font-medium">{totalPages}</span>)</>
            }
          </p>

          {/* Grid */}
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <p className="text-base font-medium text-gray-600 mb-1">No talks found</p>
              <p className="text-sm">Try a different keyword or clear the filter.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 mb-10 lg:grid-cols-3 gap-3">
                {visible.map((card, i) => {
                  const resolvedId = card.seriesId || card.id
                  const subtalkCount = subtalksMap[resolvedId]?.length || 0
                  return (
                    <TalkCard
                      key={card.id ?? i}
                      card={card}
                      query={query}
                      subtalkCount={subtalkCount}
                      onClick={() => openModal(card)}
                    />
                  )
                })}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6 mb-10 flex-wrap">
                  <button
                    onClick={() => goToPage(page - 1)} disabled={page === 1}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[0.82rem] font-semibold transition-all duration-150 ${page === 1 ? 'text-gray-300 cursor-not-allowed bg-gray-100' : 'text-red-500 border border-red-400 hover:bg-red-50 active:scale-[.97]'
                      }`}
                  >
                    <ArrowLeft size={14} /> Prev
                  </button>

                  <div className="flex gap-1">
                    {(() => {
                      const pages = []
                      if (totalPages <= 5) {
                        for (let i = 1; i <= totalPages; i++) pages.push(i)
                      } else {
                        pages.push(1)
                        const s = Math.max(2, page - 1)
                        const e = Math.min(totalPages - 1, page + 1)
                        if (s > 2) pages.push('...')
                        for (let i = s; i <= e; i++) pages.push(i)
                        if (e < totalPages - 1) pages.push('...')
                        pages.push(totalPages)
                      }
                      return pages.map((p, idx) => (
                        p === '...' ? (
                          <span key={`e-${idx}`} className="text-gray-400 px-1">…</span>
                        ) : (
                          <button
                            key={p} onClick={() => goToPage(p)}
                            className={`inline-flex items-center justify-center rounded-lg w-9 h-9 text-[0.82rem] font-semibold transition-all duration-150 ${page === p ? 'bg-red-400 text-white' : 'text-gray-600 border border-gray-300 hover:border-red-400 hover:text-red-500 active:scale-[.97]'
                              }`}
                          >
                            {p}
                          </button>
                        )
                      ))
                    })()}
                  </div>

                  <button
                    onClick={() => goToPage(page + 1)} disabled={page === totalPages}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[0.82rem] font-semibold transition-all duration-150 ${page === totalPages ? 'text-gray-300 cursor-not-allowed bg-gray-100' : 'text-red-500 border border-red-400 hover:bg-red-50 active:scale-[.97]'
                      }`}
                  >
                    Next <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  )
}

function TalkCard({ card, query, onClick, subtalkCount = 0 }) {
  const {
    title, description, tag, tag2, emoji = '📖',
    imageUrl, gradientFrom = '#1a1a2e', gradientTo = '#302b63',
  } = card

  return (
    <div
      onClick={onClick} role="button" tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      className="bg-white rounded-2xl overflow-hidden border border-gray-100
                 cursor-pointer group transition-all duration-200
                 hover:-translate-y-1 hover:border-red-200
                 hover:shadow-[0_10px_32px_rgba(229,62,62,0.12)]
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300
                 flex flex-col relative"
    >
      {/* Subtalk count badge */}
      {subtalkCount > 0 && (
        <div style={{
          position: 'absolute', top: 8, right: 8, zIndex: 10,
          background: 'rgba(229,62,62,.92)', color: '#fff',
          fontSize: 9, fontWeight: 800, letterSpacing: '.08em',
          padding: '3px 7px', borderRadius: 999,
          backdropFilter: 'blur(4px)',
          boxShadow: '0 2px 6px rgba(229,62,62,.4)',
        }}>
          {subtalkCount} TALKS
        </div>
      )}

      {/* Square image */}
      <div
        className="relative overflow-hidden w-full"
        style={{
          aspectRatio: '16 / 9',
          background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})`,
        }}
      >
        {imageUrl ? (
          <img src={imageUrl} alt={title} loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl transition-transform duration-500 group-hover:scale-110">
              {emoji}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Body */}
      <div className="p-3 bg-white flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="inline-block bg-red-50 text-red-500 text-[0.6rem] font-bold tracking-wider uppercase rounded-full px-2.5 py-0.5 shrink-0">
            {tag}
          </span>
          {tag2 && (
            <span className="inline-block bg-blue-50 text-blue-600 text-[0.6rem] font-bold tracking-wider uppercase rounded-full px-2.5 py-0.5 shrink-0">
              {tag2}
            </span>
          )}
        </div>
        <h4 className="text-[0.82rem] font-bold text-gray-900 leading-snug line-clamp-2">
          <Highlighted text={title} query={query} />
        </h4>
        <p className="text-[0.68rem] text-gray-500 line-clamp-2">{description}</p>
      </div>
    </div>
  )
}