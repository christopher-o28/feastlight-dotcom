// src/hooks/useSheetData.js
// ─────────────────────────────────────────────────────────────────────────────
// Google Sheets CMS Hook
//
// SETUP INSTRUCTIONS:
// 1. Create a Google Spreadsheet with these sheet tabs (exact names matter):
//    - "SiteSettings"   → global config (phone, email, socials, hero content)
//    - "AboutCards"     → the 4 info grid cards
//    - "LatestSeries"   → current series info + download links
//    - "TalkSeries"     → suggested talk cards
//    - "Hangouts"       → hangout event cards
//    - "Locations"      → location region cards
//    - "SubRegions"     → sub-region details for each region
//    - "SubLocations"   → city details for each sub-region
//    - "Fulltank"       → fulltank video section
//    - "EquippingSeries"→ equipping section content
//    - "CTA"            → call-to-action section
//    - "Podcasts"       → podcast section header + items  ← NEW
//
// 2. Publish the spreadsheet:
//    File → Share → Publish to web → Select "Entire Document" → CSV format
//    OR use Google Sheets API v4 with an API key
//
// 3. Set VITE_SHEET_ID in your .env file:
//    VITE_SHEET_ID=your_spreadsheet_id_here
//    VITE_GOOGLE_API_KEY=your_api_key_here (optional, for private sheets)
//
// 4. Sheet Column Formats:
//    SiteSettings:   key | value
//    AboutCards:     id | title | body | icon | style (dark|red|light)
//    LatestSeries:   title | subtitle | body | imageUrl | englishUrl | tagalogUrl
//    TalkSeries:     id | title | description | tag | imageUrl | trailerUrl | discussionGuideUrl | talkSlidesUrl | qrCodeDiscussionGuide | qrCodeTalkSlides | gradientFrom | gradientTo
//    Hangouts:       id | title | description | imageUrl | downloadUrl | viewMoreUrl | emoji
//    Locations:      id | name | region | emoji | gradientFrom | gradientTo | link
//    SubRegions:     id | parentLocationId | name | emoji
//    SubLocations:   id | parentSubRegionId | name | emoji | address | phone | email
//    Fulltank:       youtubeId | title | description | viewMoreUrl
//    EquippingSeries:title | body | imageEmoji | gradientFrom | gradientTo | viewMoreUrl
//    CTA:            title | body | graphicEmoji | buildUrl | updateUrl
//    Podcasts:       id | seriesTitle | soundcloudUrl | embedLabel | sectionTitle | viewMoreUrl
//                    ↑ first row = first podcast item
//                      sectionTitle & viewMoreUrl only needed on the first row
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react'

const SHEET_ID = import.meta.env.VITE_SHEET_ID
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY

// Convert Google Sheets JSON API response rows → array of objects
function rowsToObjects(rows) {
  if (!rows || rows.length < 2) return []
  const [headers, ...data] = rows
  return data.map(row =>
    Object.fromEntries(headers.map((h, i) => [h?.trim(), row[i]?.trim?.() ?? row[i] ?? '']))
  )
}

// Fetch a single named sheet tab via Google Sheets API v4
async function fetchSheet(sheetName) {
  if (!SHEET_ID) return null
  const base = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(sheetName)}`
  const url = API_KEY ? `${base}?key=${API_KEY}` : base
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch sheet: ${sheetName}`)
  const data = await res.json()
  return rowsToObjects(data.values)
}

// Convert flat key-value rows → plain object
function rowsToMap(rows) {
  if (!rows) return {}
  return Object.fromEntries(rows.map(r => [r.key, r.value]))
}

// ─── MAP Podcasts sheet rows → podcasts prop shape ────────────────────────────
// Google Sheet columns: id | seriesTitle | soundcloudUrl | embedLabel | sectionTitle | viewMoreUrl
// sectionTitle and viewMoreUrl are read from the first row only.
function mapPodcastRows(rows) {
  if (!rows?.length) return null
  return {
    title: rows[0].sectionTitle || 'Podcasts',
    viewMoreUrl: rows[0].viewMoreUrl || '#',
    items: rows.map(row => ({
      id: row.id || row.seriesTitle?.toLowerCase().replace(/\s+/g, '-'),
      seriesTitle: row.seriesTitle || '',
      soundcloudUrl: row.soundcloudUrl || '',
      embedLabel: row.embedLabel || '',
    })),
  }
}

// ─── DEFAULT FALLBACK DATA (used when no Sheet ID is configured) ───────────
export const defaultData = {
  siteSettings: {
    phone: '+6328 725 9999',
    email: 'thefeastlight@gmail.com',
    facebookUrl: 'https://facebook.com',
    youtubeUrl: 'https://youtube.com',
    instagramUrl: 'https://instagram.com',
    heroHeadline: 'Light the World with Faith & Hope',
    heroSubtitle: 'The Feast Light is a Catholic community gathering where we nourish homes, villages, and hearts with the goodness of God\'s word.',
    heroVideoUrl: 'https://feastlight.com/wp-content/uploads/2018/10/Feast-Video-Quick-Start-Bo-Sanchez.mp4',
    heroImageUrl: '',
    logoText: '',
    siteName: 'The Feast Light',
    siteTagline: 'Community of Hope',
  },
  aboutCards: [
    {
      id: '1',
      title: 'What is The Feast Light?',
      body: 'The Feast Light is a community gathering held weekly in homes, villages, and communities where members come together to worship, hear God\'s word, pray, and support one another. It is an extension of the larger Feast community — bringing light to every corner of the country and the world.',
      icon: '✝',
      badge: 'Our Community',
      style: 'light',
    },
    {
      id: '2',
      title: 'Our Mission',
      body: 'To proclaim the Good News of Jesus Christ through vibrant, Spirit-filled communities that transform lives. We equip every believer to become a light in their home, neighborhood, and nation.',
      icon: '🎯',
      badge: 'Our Purpose',
      style: 'dark',
    },
    {
      id: '3',
      title: 'Our Vision',
      body: 'A nation and a world transformed by the love of God — one Feast Light at a time. We envision thriving communities of faith in every home, village, city, and country.',
      icon: '👁',
      badge: 'Our Vision',
      style: 'red',
    },
    {
      id: '4',
      title: 'Goodness & Hope for Every Home',
      body: 'At the core of The Feast Light is a simple yet powerful belief — every person deserves to experience the love of God. We welcome all: the searching, the faithful, the broken, and the hopeful.',
      icon: '🕊',
      badge: 'Our Values',
      style: 'light',
    },
  ],
  latestSeries: {
    title: 'How Did We Get Here?',
    subtitle: 'Making Sense of Life When Everything Falls Apart',
    body: '',
    imageUrl: '',
    imageEmoji: '',
    englishUrl: '#',
    tagalogUrl: '#',
  },
  talkSeries: [
    { id: '1', title: 'No Longer Strangers', description: 'Discover how belonging to a community can heal isolation and draw us closer to God.', tag: 'Community', imageUrl: '', trailerUrl: 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4', discussionGuideUrl: '#', talkSlidesUrl: '#', qrCodeDiscussionGuide: '', qrCodeTalkSlides: '', emoji: '🤝', gradientFrom: '#1a1a2e', gradientTo: '#302b63' },
    { id: '2', title: 'The Good Life', description: 'What does it truly mean to live well? Explore a God-centered life full of meaning.', tag: 'Lifestyle', imageUrl: '', trailerUrl: 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4', discussionGuideUrl: '#', talkSlidesUrl: '#', qrCodeDiscussionGuide: '', qrCodeTalkSlides: '', emoji: '🌿', gradientFrom: '#0d2818', gradientTo: '#1a4a2e' },
    { id: '3', title: 'Elevator Talks', description: 'Short, powerful conversations that take your faith to the next level.', tag: 'Growth', imageUrl: '', trailerUrl: 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4', discussionGuideUrl: '#', talkSlidesUrl: '#', qrCodeDiscussionGuide: '', qrCodeTalkSlides: '', emoji: '🛗', gradientFrom: '#2d2000', gradientTo: '#5a4200' },
    { id: '4', title: 'Grace Upon Grace', description: 'A series on the inexhaustible mercy of God that renews, restores, and revives.', tag: 'Healing', imageUrl: '', trailerUrl: 'https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4', discussionGuideUrl: '#', talkSlidesUrl: '#', qrCodeDiscussionGuide: '', qrCodeTalkSlides: '', emoji: '✨', gradientFrom: '#1e0a3c', gradientTo: '#3d1a6b' },
  ],
  cta: {
    title: 'Do You Want to Nourish Your Home or Village with Goodness & Hope?',
    body: 'You don\'t need a big stage or a large congregation. All you need is a willing heart and an open door. Start a Feast Light in your home today.',
    graphicEmoji: '',
    buildUrl: '#',
    updateUrl: '#',
  },
  hangouts: [
    { id: '1', title: 'Worship Night', description: 'An evening of praise, worship, and encountering God\'s presence together as a community.', downloadUrl: '#', viewMoreUrl: '#', emoji: '🎵', gradientFrom: '#1a1a2e', gradientTo: '#302b63' },
    { id: '2', title: 'Family Feast', description: 'A monthly lunch fellowship where members and their families gather, share meals, and celebrate.', downloadUrl: '#', viewMoreUrl: '#', emoji: '🍽', gradientFrom: '#2d1515', gradientTo: '#6b2020' },
    { id: '3', title: 'Bible Study Circle', description: 'Dive deeper into Scripture with guided small-group discussions. Grow in wisdom together.', downloadUrl: '#', viewMoreUrl: '#', emoji: '📖', gradientFrom: '#0d2818', gradientTo: '#1a4a2e' },
  ],
  equipping: {
    title: 'Equipping Series',
    body: 'The Equipping Series is designed for Feast Light leaders and coordinators called to serve their communities with excellence. Whether you\'re leading a home gathering or overseeing a village group, these talks provide practical tools, spiritual nourishment, and leadership frameworks rooted in the Gospel.',
    imageEmoji: '🎓',
    gradientFrom: '#FF4B4B',
    gradientTo: '#ff8080',
    viewMoreUrl: '#',
  },
  fulltank: {
    youtubeId: 'dQw4w9WgXcQ',
    title: 'FULLTANK',
    description: 'FULLTANK is our signature video series featuring inspiring messages, testimonies, and faith stories that will fill your heart and fuel your spirit for the week ahead. New videos every week.',
    viewMoreUrl: '#',
  },
  // ── NEW: Podcasts default fallback ────────────────────────────────────────
  podcasts: {
    title: 'Podcasts',
    viewMoreUrl: '#',
    items: [
      {
        id: 'no-longer-strangers',
        seriesTitle: 'No Longer Strangers',
        soundcloudUrl:
          'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/your-playlist-id-1&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true',
        embedLabel: 'The Feast Radio · No Longer Strangers',
      },
      {
        id: 'the-good-life',
        seriesTitle: 'The Good Life',
        soundcloudUrl:
          'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/your-playlist-id-2&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true',
        embedLabel: 'The Feast Radio · The Good Life',
      },
    ],
  },
  locations: [
    {
      id: '1',
      name: 'Philippines',
      region: 'Southeast Asia',
      emoji: '🇵🇭',
      gradientFrom: '#1a1a2e',
      gradientTo: '#302b63',
      link: '#',
      subRegions: [
        {
          id: '1-1',
          name: 'Metro Manila',
          emoji: '🏙',
          subLocations: [
            { id: '1-1-1', name: 'Manila City', emoji: '🏛', address: '123 Main Street, Manila', phone: '+63 2 8888 0000', email: 'manila@feastlight.com' },
            { id: '1-1-2', name: 'Quezon City', emoji: '🌆', address: 'Quezon City, Philippines', phone: '+63 2 9999 0000', email: 'quezon@feastlight.com' },
            { id: '1-1-3', name: 'Makati City', emoji: '🏢', address: 'Makati City, Philippines', phone: '+63 2 7777 0000', email: 'makati@feastlight.com' },
          ]
        },
        {
          id: '1-2',
          name: 'Cebu',
          emoji: '🏝',
          subLocations: [
            { id: '1-2-1', name: 'Cebu City', emoji: '🏛', address: 'Cebu City, Philippines', phone: '+63 32 411 0000', email: 'cebucity@feastlight.com' },
            { id: '1-2-2', name: 'Lapu-Lapu City', emoji: '🌊', address: 'Lapu-Lapu City, Philippines', phone: '+63 32 412 0000', email: 'lapulapu@feastlight.com' },
          ]
        },
        {
          id: '1-3',
          name: 'Davao',
          emoji: '🌴',
          subLocations: [
            { id: '1-3-1', name: 'Davao City', emoji: '🌺', address: 'Davao City, Philippines', phone: '+63 82 222 0000', email: 'davaocity@feastlight.com' },
          ]
        },
      ]
    },
    {
      id: '2',
      name: 'Asia Pacific',
      region: 'International',
      emoji: '🌏',
      gradientFrom: '#0a1e3c',
      gradientTo: '#1a3d6b',
      link: '#',
      subRegions: [
        {
          id: '2-1',
          name: 'Singapore',
          emoji: '🏙',
          subLocations: [
            { id: '2-1-1', name: 'Singapore Central', emoji: '🏛', address: 'Singapore', phone: '+65 6200 0000', email: 'singapore@feastlight.com' },
          ]
        },
        {
          id: '2-2',
          name: 'Hong Kong',
          emoji: '🌃',
          subLocations: [
            { id: '2-2-1', name: 'Hong Kong Island', emoji: '🌉', address: 'Hong Kong', phone: '+852 3000 0000', email: 'hongkong@feastlight.com' },
          ]
        },
        {
          id: '2-3',
          name: 'Thailand',
          emoji: '🛕',
          subLocations: [
            { id: '2-3-1', name: 'Bangkok', emoji: '🏛', address: 'Bangkok, Thailand', phone: '+66 2 000 0000', email: 'bangkok@feastlight.com' },
          ]
        },
      ]
    },
    {
      id: '3',
      name: 'Middle East',
      region: 'International',
      emoji: '🌙',
      gradientFrom: '#2d1515',
      gradientTo: '#6b2020',
      link: '#',
      subRegions: [
        {
          id: '3-1',
          name: 'UAE',
          emoji: '🕌',
          subLocations: [
            { id: '3-1-1', name: 'Dubai', emoji: '🏙', address: 'Dubai, UAE', phone: '+971 4 000 0000', email: 'dubai@feastlight.com' },
            { id: '3-1-2', name: 'Abu Dhabi', emoji: '🏛', address: 'Abu Dhabi, UAE', phone: '+971 2 000 0000', email: 'abudhabi@feastlight.com' },
          ]
        },
      ]
    },
    {
      id: '4',
      name: 'Oceania',
      region: 'International',
      emoji: '🌿',
      gradientFrom: '#0d2818',
      gradientTo: '#1a4a2e',
      link: '#',
      subRegions: [
        {
          id: '4-1',
          name: 'Australia',
          emoji: '🦘',
          subLocations: [
            { id: '4-1-1', name: 'Sydney', emoji: '🏙', address: 'Sydney, Australia', phone: '+61 2 0000 0000', email: 'sydney@feastlight.com' },
            { id: '4-1-2', name: 'Melbourne', emoji: '🏢', address: 'Melbourne, Australia', phone: '+61 3 0000 0000', email: 'melbourne@feastlight.com' },
          ]
        },
        {
          id: '4-2',
          name: 'New Zealand',
          emoji: '🦏',
          subLocations: [
            { id: '4-2-1', name: 'Auckland', emoji: '🏝', address: 'Auckland, New Zealand', phone: '+64 9 000 0000', email: 'auckland@feastlight.com' },
          ]
        },
      ]
    },
    {
      id: '5',
      name: 'USA',
      region: 'North America',
      emoji: '🗽',
      gradientFrom: '#2d2000',
      gradientTo: '#5a4200',
      link: '#',
      subRegions: [
        {
          id: '5-1',
          name: 'California',
          emoji: '🌞',
          subLocations: [
            { id: '5-1-1', name: 'Los Angeles', emoji: '🎥', address: 'Los Angeles, USA', phone: '+1 213 000 0000', email: 'losangeles@feastlight.com' },
            { id: '5-1-2', name: 'San Francisco', emoji: '🌉', address: 'San Francisco, USA', phone: '+1 415 000 0000', email: 'sanfrancisco@feastlight.com' },
          ]
        },
        {
          id: '5-2',
          name: 'New York',
          emoji: '🗽',
          subLocations: [
            { id: '5-2-1', name: 'New York City', emoji: '🏙', address: 'New York, USA', phone: '+1 212 000 0000', email: 'newyork@feastlight.com' },
          ]
        },
        {
          id: '5-3',
          name: 'Illinois',
          emoji: '🏙',
          subLocations: [
            { id: '5-3-1', name: 'Chicago', emoji: '🏢', address: 'Chicago, USA', phone: '+1 312 000 0000', email: 'chicago@feastlight.com' },
          ]
        },
      ]
    },
    {
      id: '6',
      name: 'Europe',
      region: 'International',
      emoji: '🏰',
      gradientFrom: '#1e0a3c',
      gradientTo: '#3d1a6b',
      link: '#',
      subRegions: [
        {
          id: '6-1',
          name: 'UK',
          emoji: '🏰',
          subLocations: [
            { id: '6-1-1', name: 'London', emoji: '🏛', address: 'London, UK', phone: '+44 20 0000 0000', email: 'london@feastlight.com' },
          ]
        },
        {
          id: '6-2',
          name: 'France',
          emoji: '🗼',
          subLocations: [
            { id: '6-2-1', name: 'Paris', emoji: '🗼', address: 'Paris, France', phone: '+33 1 0000 0000', email: 'paris@feastlight.com' },
          ]
        },
        {
          id: '6-3',
          name: 'Germany',
          emoji: '🏛',
          subLocations: [
            { id: '6-3-1', name: 'Berlin', emoji: '🏛', address: 'Berlin, Germany', phone: '+49 30 0000 0000', email: 'berlin@feastlight.com' },
          ]
        },
      ]
    },
  ],
}

// ─── MAIN HOOK ────────────────────────────────────────────────────────────────
export function useSheetData() {
  const [data, setData] = useState(() => {
    // Try to load from localStorage first
    try {
      const cached = localStorage.getItem('feast_light_data')
      return cached ? JSON.parse(cached) : defaultData
    } catch {
      return defaultData
    }
  })
  const [loading, setLoading] = useState(!!SHEET_ID)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(() => {
    try {
      return localStorage.getItem('feast_light_last_updated') || null
    } catch {
      return null
    }
  })

  const fetchAll = async () => {
    if (!SHEET_ID) {
      setLoading(false)
      console.warn('VITE_SHEET_ID not configured. Using default data. Please set VITE_SHEET_ID in your .env file.')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const [
        settingsRows,
        aboutRows,
        seriesRows,
        talkRows,
        hangoutRows,
        locationRows,
        subRegionRows,
        subLocationRows,
        fulltankRows,
        equippingRows,
        ctaRows,
        podcastRows,           // ← NEW
      ] = await Promise.all([
        fetchSheet('SiteSettings'),
        fetchSheet('AboutCards'),
        fetchSheet('LatestSeries'),
        fetchSheet('TalkSeries'),
        fetchSheet('Hangouts'),
        fetchSheet('Locations'),
        fetchSheet('SubRegions'),
        fetchSheet('SubLocations'),
        fetchSheet('Fulltank'),
        fetchSheet('EquippingSeries'),
        fetchSheet('CTA'),
        fetchSheet('Podcasts'), // ← NEW
      ])

      const siteSettings = settingsRows ? rowsToMap(settingsRows) : defaultData.siteSettings
      const latestSeriesRow = seriesRows?.[0] ?? {}
      const fulltankRow = fulltankRows?.[0] ?? {}
      const equippingRow = equippingRows?.[0] ?? {}
      const ctaRow = ctaRows?.[0] ?? {}

      // Merge hierarchical location data
      let locations = locationRows?.length ? locationRows : defaultData.locations
      if (subRegionRows?.length && subLocationRows?.length) {
        const subLocationMap = {}
        subLocationRows.forEach(sub => {
          const parentId = sub.parentSubRegionId
          if (!subLocationMap[parentId]) subLocationMap[parentId] = []
          subLocationMap[parentId].push({
            id: sub.id || `${parentId}-${subLocationMap[parentId].length + 1}`,
            name: sub.name,
            emoji: sub.emoji || '',
            address: sub.address || '',
            phone: sub.phone || '',
            email: sub.email || '',
          })
        })

        const subRegionMap = {}
        subRegionRows.forEach(subRegion => {
          const parentId = subRegion.parentLocationId
          if (!subRegionMap[parentId]) subRegionMap[parentId] = []
          subRegionMap[parentId].push({
            id: subRegion.id,
            name: subRegion.name,
            emoji: subRegion.emoji || '🏛',
            subLocations: subLocationMap[subRegion.id] || [],
          })
        })

        locations = locations.map(loc => ({
          ...loc,
          subRegions: subRegionMap[loc.id] || [],
        }))
      }

      const newData = {
        siteSettings: Object.keys(siteSettings).length ? siteSettings : defaultData.siteSettings,
        aboutCards: aboutRows?.length ? aboutRows : defaultData.aboutCards,
        latestSeries: latestSeriesRow.title ? latestSeriesRow : defaultData.latestSeries,
        talkSeries: talkRows?.length ? talkRows : defaultData.talkSeries,
        cta: ctaRow.title ? ctaRow : defaultData.cta,
        hangouts: hangoutRows?.length ? hangoutRows : defaultData.hangouts,
        equipping: equippingRow.title ? equippingRow : defaultData.equipping,
        fulltank: fulltankRow.youtubeId ? fulltankRow : defaultData.fulltank,
        podcasts: mapPodcastRows(podcastRows) ?? defaultData.podcasts, // ← NEW
        locations,
      }

      setData(newData)
      const timestamp = new Date().toISOString()
      setLastUpdated(timestamp)

      try {
        localStorage.setItem('feast_light_data', JSON.stringify(newData))
        localStorage.setItem('feast_light_last_updated', timestamp)
      } catch (storageErr) {
        console.warn('Failed to save to localStorage:', storageErr)
      }

      console.log('✓ Successfully fetched data from Google Sheets')
    } catch (err) {
      console.warn('⚠ Google Sheets fetch failed, using cached or default data:', err.message)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  return { data, loading, error, lastUpdated, refetch: fetchAll }
}
