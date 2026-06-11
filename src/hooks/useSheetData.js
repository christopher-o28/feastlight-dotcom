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
//    - "Hangouts"       → hangout event cards (row 1 = section settings, rows 2+ = cards)
//    - "Locations"      → location region cards
//    - "SubRegions"     → sub-region details for each region
//    - "SubLocations"   → city details for each sub-region
//    - "Districts"      → district groupings per sub-region  ← NEW
//    - "DistrictLocations" → locations inside each district  ← NEW
//    - "Fulltank"       → fulltank video section
//    - "EquippingSeries"→ equipping section content
//    - "CTA"            → call-to-action section
//    - "Podcasts"       → podcast section header + items
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
//    SiteSettings:      key | value
//    AboutCards:        id | title | body | icon | style (dark|red|light)
//    LatestSeries:      title | subtitle | body | imageUrl | englishUrl | tagalogUrl
//    TalkSeries:        id | title | description | tag | imageUrl | trailerUrl | discussionGuideUrl | talkSlidesUrl | qrCodeDiscussionGuide | qrCodeTalkSlides | gradientFrom | gradientTo
//    Hangouts:          id | title | description | imageUrl | downloadUrl | viewMoreUrl | emoji
//                       (Row 1: sectionLabel | title | body for section header, Rows 2+: hangout card data)
//    Locations:         id | name | region | emoji | gradientFrom | gradientTo | link
//    SubRegions:        id | parentLocationId | name | emoji
//    SubLocations:      id | parentSubRegionId | name | emoji | address | phone | email | facebook | website
//    Districts:         id | parentSubRegionId | name | emoji
//    DistrictLocations: id | parentDistrictId | name | emoji | address | phone | email | facebook | website
//    Fulltank:          youtubeId | title | description | viewMoreUrl
//    EquippingSeries:   title | body | imageEmoji | gradientFrom | gradientTo | viewMoreUrl
//    CTA:               title | body | graphicEmoji | buildUrl | updateUrl
//    Podcasts:          id | seriesTitle | soundcloudUrl | embedLabel | sectionTitle | viewMoreUrl
//                       ↑ first row = first podcast item
//                         sectionTitle & viewMoreUrl only needed on the first row
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

// ─── SHARED sublocation field mapper ─────────────────────────────────────────
function mapLocationFields(row, fallbackId) {
  return {
    id: row.id || row.ID || row.Id || fallbackId,
    name: row.name || '',
    emoji: row.emoji || '',
    schedule: row.schedule || row.Schedule || '',   // ← ADD THIS LINE
    address: row.address || '',
    phone: row.phone || '',
    email: row.email || row.Email || '',
    facebook: row.facebook || row.Facebook || '',
    website: row.website || row.Website || '',
    instagram: row.instagram || row.Instagram || '',
    youtube: row.youtube || row.Youtube || row.YouTube || '',
    x: row.x || row.X || '',
    threads: row.threads || row.Threads || '',
    contactPerson: row.contactPerson || row['Contact Person'] || row['contact person'] || '',
    personalContactNumber: row.personalContactNumber || row['Personal Contact Number'] || row['personal contact number'] || '',
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
    { id: '1', title: 'What is The Feast Light?', body: 'The Feast Light is a community gathering held weekly in homes, villages, and communities where members come together to worship, hear God\'s word, pray, and support one another. It is an extension of the larger Feast community — bringing light to every corner of the country and the world.', icon: '✝', badge: 'Our Community', style: 'light' },
    { id: '2', title: 'Our Mission', body: 'To proclaim the Good News of Jesus Christ through vibrant, Spirit-filled communities that transform lives. We equip every believer to become a light in their home, neighborhood, and nation.', icon: '🎯', badge: 'Our Purpose', style: 'dark' },
    { id: '3', title: 'Our Vision', body: 'A nation and a world transformed by the love of God — one Feast Light at a time. We envision thriving communities of faith in every home, village, city, and country.', icon: '👁', badge: 'Our Vision', style: 'red' },
    { id: '4', title: 'Goodness & Hope for Every Home', body: 'At the core of The Feast Light is a simple yet powerful belief — every person deserves to experience the love of God. We welcome all: the searching, the faithful, the broken, and the hopeful.', icon: '🕊', badge: 'Our Values', style: 'light' },
  ],
  latestSeries: {
    title: 'Called to Witness',
    subtitle: 'How to Share the Good News to the World',
    body: '', imageUrl: '', imageEmoji: '', englishUrl: '#', tagalogUrl: '#',
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
    graphicEmoji: '', buildUrl: '#', updateUrl: '#',
  },
  hangouts: [
    { id: '1', title: 'Worship Night', description: 'An evening of praise, worship, and encountering God\'s presence together as a community.', downloadUrl: '#', viewMoreUrl: '#', emoji: '🎵', gradientFrom: '#1a1a2e', gradientTo: '#302b63' },
    { id: '2', title: 'Family Feast', description: 'A monthly lunch fellowship where members and their families gather, share meals, and celebrate.', downloadUrl: '#', viewMoreUrl: '#', emoji: '🍽', gradientFrom: '#2d1515', gradientTo: '#6b2020' },
    { id: '3', title: 'Bible Study Circle', description: 'Dive deeper into Scripture with guided small-group discussions. Grow in wisdom together.', downloadUrl: '#', viewMoreUrl: '#', emoji: '📖', gradientFrom: '#0d2818', gradientTo: '#1a4a2e' },
  ],
  hangoutsSettings: {
    sectionLabel: 'Connect',
    title: 'Hangouts',
    body: '1. What are the Hangouts Videos?\n2. This is the Feast Video designed for the Youth. It includes a 2 – 5 minute Feast Video Clip, Activity modules for the Facilitator, and Lyric Videos that you could use for the worship.',
  },
  equipping: {
    title: 'Equipping Series',
    body: 'The Equipping Series is designed for Feast Light leaders and coordinators called to serve their communities with excellence. Whether you\'re leading a home gathering or overseeing a village group, these talks provide practical tools, spiritual nourishment, and leadership frameworks rooted in the Gospel.',
    imageEmoji: '🎓', gradientFrom: '#FF4B4B', gradientTo: '#ff8080', viewMoreUrl: '#',
  },
  fulltank: {
    youtubeId: 'dQw4w9WgXcQ',
    title: 'FULLTANK',
    description: 'FULLTANK is our signature video series featuring inspiring messages, testimonies, and faith stories that will fill your heart and fuel your spirit for the week ahead. New videos every week.',
    viewMoreUrl: '#',
  },
  podcasts: {
    title: 'Podcasts',
    viewMoreUrl: '#',
    items: [
      { id: 'no-longer-strangers', seriesTitle: 'No Longer Strangers', soundcloudUrl: 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/your-playlist-id-1&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true', embedLabel: 'The Feast Radio · No Longer Strangers' },
      { id: 'the-good-life', seriesTitle: 'The Good Life', soundcloudUrl: 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/your-playlist-id-2&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true', embedLabel: 'The Feast Radio · The Good Life' },
    ],
  },
  locations: [
    {
      id: '1', name: 'Philippines', region: 'Southeast Asia', emoji: '🇵🇭',
      gradientFrom: '#1a1a2e', gradientTo: '#302b63', link: '#',
      subRegions: [
        {
          id: '1-1', name: 'Metro Manila', emoji: '🏙',
          subLocations: [
            { id: '1-1-1', name: 'Manila City', emoji: '🏛', address: '123 Main Street, Manila', phone: '+63 2 8888 0000', email: 'manila@feastlight.com' },
            { id: '1-1-2', name: 'Quezon City', emoji: '🌆', address: 'Quezon City, Philippines', phone: '+63 2 9999 0000', email: 'quezon@feastlight.com' },
            { id: '1-1-3', name: 'Makati City', emoji: '🏢', address: 'Makati City, Philippines', phone: '+63 2 7777 0000', email: 'makati@feastlight.com' },
          ],
          byDistrictLocation: [
            { id: '1-1-d1', name: 'Northern District', emoji: '🧭', subLocations: [{ id: '1-1-d1-1', name: 'Caloocan', emoji: '🏘', address: 'Caloocan, Metro Manila', phone: '+63 2 8111 0000', email: 'caloocan@feastlight.com' }, { id: '1-1-d1-2', name: 'Malabon', emoji: '🏘', address: 'Malabon, Metro Manila', phone: '+63 2 8112 0000', email: 'malabon@feastlight.com' }] },
            { id: '1-1-d2', name: 'Southern District', emoji: '🧭', subLocations: [{ id: '1-1-d2-1', name: 'Pasay', emoji: '🏙', address: 'Pasay, Metro Manila', phone: '+63 2 8333 0000', email: 'pasay@feastlight.com' }, { id: '1-1-d2-2', name: 'Parañaque', emoji: '🏙', address: 'Parañaque, Metro Manila', phone: '+63 2 8334 0000', email: 'paranaque@feastlight.com' }] },
          ],
        },
        {
          id: '1-2', name: 'Cebu', emoji: '🏝',
          subLocations: [
            { id: '1-2-1', name: 'Cebu City', emoji: '🏛', address: 'Cebu City, Philippines', phone: '+63 32 411 0000', email: 'cebucity@feastlight.com' },
            { id: '1-2-2', name: 'Lapu-Lapu City', emoji: '🌊', address: 'Lapu-Lapu City, Philippines', phone: '+63 32 412 0000', email: 'lapulapu@feastlight.com' },
          ],
          byDistrictLocation: [
            { id: '1-2-d1', name: 'Metro Cebu District', emoji: '🧭', subLocations: [{ id: '1-2-d1-1', name: 'Mandaue', emoji: '🏭', address: 'Mandaue City, Cebu', phone: '+63 32 413 0000', email: 'mandaue@feastlight.com' }, { id: '1-2-d1-2', name: 'Talisay', emoji: '🏘', address: 'Talisay City, Cebu', phone: '+63 32 414 0000', email: 'talisay@feastlight.com' }] },
          ],
        },
        {
          id: '1-3', name: 'Davao', emoji: '🌴',
          subLocations: [
            { id: '1-3-1', name: 'Davao City', emoji: '🌺', address: 'Davao City, Philippines', phone: '+63 82 222 0000', email: 'davaocity@feastlight.com' },
          ],
          byDistrictLocation: [
            { id: '1-3-d1', name: 'Davao del Sur District', emoji: '🧭', subLocations: [{ id: '1-3-d1-1', name: 'Digos', emoji: '🌿', address: 'Digos City, Davao del Sur', phone: '+63 82 223 0000', email: 'digos@feastlight.com' }] },
          ],
        },
      ],
    },
    {
      id: '2', name: 'Asia Pacific', region: 'International', emoji: '🌏',
      gradientFrom: '#0a1e3c', gradientTo: '#1a3d6b', link: '#',
      subRegions: [
        {
          id: '2-1', name: 'Singapore', emoji: '🏙',
          subLocations: [{ id: '2-1-1', name: 'Singapore Central', emoji: '🏛', address: 'Singapore', phone: '+65 6200 0000', email: 'singapore@feastlight.com' }],
          byDistrictLocation: [
            { id: '2-1-d1', name: 'East District', emoji: '🧭', subLocations: [{ id: '2-1-d1-1', name: 'Tampines', emoji: '🏘', address: 'Tampines, Singapore', phone: '+65 6201 0000', email: 'tampines@feastlight.com' }] },
            { id: '2-1-d2', name: 'West District', emoji: '🧭', subLocations: [{ id: '2-1-d2-1', name: 'Jurong', emoji: '🏭', address: 'Jurong, Singapore', phone: '+65 6202 0000', email: 'jurong@feastlight.com' }] },
          ],
        },
        {
          id: '2-2', name: 'Hong Kong', emoji: '🌃',
          subLocations: [{ id: '2-2-1', name: 'Hong Kong Island', emoji: '🌉', address: 'Hong Kong', phone: '+852 3000 0000', email: 'hongkong@feastlight.com' }],
          byDistrictLocation: [
            { id: '2-2-d1', name: 'Kowloon District', emoji: '🧭', subLocations: [{ id: '2-2-d1-1', name: 'Tsim Sha Tsui', emoji: '🏙', address: 'Tsim Sha Tsui, Kowloon', phone: '+852 3001 0000', email: 'tsimshatsui@feastlight.com' }] },
          ],
        },
        {
          id: '2-3', name: 'Thailand', emoji: '🛕',
          subLocations: [{ id: '2-3-1', name: 'Bangkok', emoji: '🏛', address: 'Bangkok, Thailand', phone: '+66 2 000 0000', email: 'bangkok@feastlight.com' }],
          byDistrictLocation: [
            { id: '2-3-d1', name: 'Central Bangkok District', emoji: '🧭', subLocations: [{ id: '2-3-d1-1', name: 'Silom', emoji: '🏢', address: 'Silom, Bangkok', phone: '+66 2 001 0000', email: 'silom@feastlight.com' }, { id: '2-3-d1-2', name: 'Sukhumvit', emoji: '🌆', address: 'Sukhumvit, Bangkok', phone: '+66 2 002 0000', email: 'sukhumvit@feastlight.com' }] },
          ],
        },
      ],
    },
    {
      id: '3', name: 'Middle East', region: 'International', emoji: '🌙',
      gradientFrom: '#2d1515', gradientTo: '#6b2020', link: '#',
      subRegions: [
        {
          id: '3-1', name: 'UAE', emoji: '🕌',
          subLocations: [
            { id: '3-1-1', name: 'Dubai', emoji: '🏙', address: 'Dubai, UAE', phone: '+971 4 000 0000', email: 'dubai@feastlight.com' },
            { id: '3-1-2', name: 'Abu Dhabi', emoji: '🏛', address: 'Abu Dhabi, UAE', phone: '+971 2 000 0000', email: 'abudhabi@feastlight.com' },
          ],
          byDistrictLocation: [
            { id: '3-1-d1', name: 'Dubai Districts', emoji: '🧭', subLocations: [{ id: '3-1-d1-1', name: 'Downtown Dubai', emoji: '🏙', address: 'Downtown Dubai, UAE', phone: '+971 4 001 0000', email: 'downtown.dubai@feastlight.com' }, { id: '3-1-d1-2', name: 'Dubai Marina', emoji: '⛵', address: 'Dubai Marina, UAE', phone: '+971 4 002 0000', email: 'dubaimarina@feastlight.com' }] },
            { id: '3-1-d2', name: 'Abu Dhabi Districts', emoji: '🧭', subLocations: [{ id: '3-1-d2-1', name: 'Al Reem Island', emoji: '🏝', address: 'Al Reem Island, Abu Dhabi', phone: '+971 2 001 0000', email: 'alreem@feastlight.com' }] },
          ],
        },
      ],
    },
    {
      id: '4', name: 'Oceania', region: 'International', emoji: '🌿',
      gradientFrom: '#0d2818', gradientTo: '#1a4a2e', link: '#',
      subRegions: [
        {
          id: '4-1', name: 'Australia', emoji: '🦘',
          subLocations: [
            { id: '4-1-1', name: 'Sydney', emoji: '🏙', address: 'Sydney, Australia', phone: '+61 2 0000 0000', email: 'sydney@feastlight.com' },
            { id: '4-1-2', name: 'Melbourne', emoji: '🏢', address: 'Melbourne, Australia', phone: '+61 3 0000 0000', email: 'melbourne@feastlight.com' },
          ],
          byDistrictLocation: [
            { id: '4-1-d1', name: 'Sydney Districts', emoji: '🧭', subLocations: [{ id: '4-1-d1-1', name: 'CBD', emoji: '🏙', address: 'Sydney CBD, Australia', phone: '+61 2 0001 0000', email: 'sydneycbd@feastlight.com' }, { id: '4-1-d1-2', name: 'Parramatta', emoji: '🏘', address: 'Parramatta, Sydney', phone: '+61 2 0002 0000', email: 'parramatta@feastlight.com' }] },
            { id: '4-1-d2', name: 'Melbourne Districts', emoji: '🧭', subLocations: [{ id: '4-1-d2-1', name: 'Southbank', emoji: '🌉', address: 'Southbank, Melbourne', phone: '+61 3 0001 0000', email: 'southbank@feastlight.com' }] },
          ],
        },
        {
          id: '4-2', name: 'New Zealand', emoji: '🦏',
          subLocations: [{ id: '4-2-1', name: 'Auckland', emoji: '🏝', address: 'Auckland, New Zealand', phone: '+64 9 000 0000', email: 'auckland@feastlight.com' }],
          byDistrictLocation: [
            { id: '4-2-d1', name: 'Auckland Districts', emoji: '🧭', subLocations: [{ id: '4-2-d1-1', name: 'North Shore', emoji: '🌊', address: 'North Shore, Auckland', phone: '+64 9 001 0000', email: 'northshore@feastlight.com' }, { id: '4-2-d1-2', name: 'Manukau', emoji: '🏘', address: 'Manukau, Auckland', phone: '+64 9 002 0000', email: 'manukau@feastlight.com' }] },
          ],
        },
      ],
    },
    {
      id: '5', name: 'USA', region: 'North America', emoji: '🗽',
      gradientFrom: '#2d2000', gradientTo: '#5a4200', link: '#',
      subRegions: [
        {
          id: '5-1', name: 'California', emoji: '🌞',
          subLocations: [
            { id: '5-1-1', name: 'Los Angeles', emoji: '🎥', address: 'Los Angeles, USA', phone: '+1 213 000 0000', email: 'losangeles@feastlight.com' },
            { id: '5-1-2', name: 'San Francisco', emoji: '🌉', address: 'San Francisco, USA', phone: '+1 415 000 0000', email: 'sanfrancisco@feastlight.com' },
          ],
          byDistrictLocation: [
            { id: '5-1-d1', name: 'LA Districts', emoji: '🧭', subLocations: [{ id: '5-1-d1-1', name: 'Hollywood', emoji: '🎬', address: 'Hollywood, Los Angeles', phone: '+1 213 001 0000', email: 'hollywood@feastlight.com' }, { id: '5-1-d1-2', name: 'Santa Monica', emoji: '🏖', address: 'Santa Monica, Los Angeles', phone: '+1 310 001 0000', email: 'santamonica@feastlight.com' }] },
            { id: '5-1-d2', name: 'Bay Area Districts', emoji: '🧭', subLocations: [{ id: '5-1-d2-1', name: 'Downtown SF', emoji: '🌁', address: 'Downtown San Francisco', phone: '+1 415 001 0000', email: 'downtownsf@feastlight.com' }] },
          ],
        },
        {
          id: '5-2', name: 'New York', emoji: '🗽',
          subLocations: [{ id: '5-2-1', name: 'New York City', emoji: '🏙', address: 'New York, USA', phone: '+1 212 000 0000', email: 'newyork@feastlight.com' }],
          byDistrictLocation: [
            { id: '5-2-d1', name: 'NYC Boroughs', emoji: '🧭', subLocations: [{ id: '5-2-d1-1', name: 'Manhattan', emoji: '🏙', address: 'Manhattan, New York', phone: '+1 212 001 0000', email: 'manhattan@feastlight.com' }, { id: '5-2-d1-2', name: 'Brooklyn', emoji: '🌉', address: 'Brooklyn, New York', phone: '+1 718 001 0000', email: 'brooklyn@feastlight.com' }] },
          ],
        },
        {
          id: '5-3', name: 'Illinois', emoji: '🏙',
          subLocations: [{ id: '5-3-1', name: 'Chicago', emoji: '🏢', address: 'Chicago, USA', phone: '+1 312 000 0000', email: 'chicago@feastlight.com' }],
          byDistrictLocation: [
            { id: '5-3-d1', name: 'Chicago Districts', emoji: '🧭', subLocations: [{ id: '5-3-d1-1', name: 'The Loop', emoji: '🏢', address: 'The Loop, Chicago', phone: '+1 312 001 0000', email: 'theloop@feastlight.com' }, { id: '5-3-d1-2', name: 'Lincoln Park', emoji: '🌳', address: 'Lincoln Park, Chicago', phone: '+1 773 001 0000', email: 'lincolnpark@feastlight.com' }] },
          ],
        },
      ],
    },
    {
      id: '6', name: 'Europe', region: 'International', emoji: '🏰',
      gradientFrom: '#1e0a3c', gradientTo: '#3d1a6b', link: '#',
      subRegions: [
        { id: '6-1', name: 'UK', emoji: '🏰', subLocations: [{ id: '6-1-1', name: 'London', emoji: '🏛', address: 'London, UK', phone: '+44 20 0000 0000', email: 'london@feastlight.com' }], byDistrictLocation: [] },
        { id: '6-2', name: 'France', emoji: '🗼', subLocations: [{ id: '6-2-1', name: 'Paris', emoji: '🗼', address: 'Paris, France', phone: '+33 1 0000 0000', email: 'paris@feastlight.com' }], byDistrictLocation: [] },
        { id: '6-3', name: 'Germany', emoji: '🏛', subLocations: [{ id: '6-3-1', name: 'Berlin', emoji: '🏛', address: 'Berlin, Germany', phone: '+49 30 0000 0000', email: 'berlin@feastlight.com' }], byDistrictLocation: [] },
      ],
    },
  ],
}

// ─── MAIN HOOK ────────────────────────────────────────────────────────────────
export function useSheetData() {
  const [data, setData] = useState(() => {
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
        districtRows,
        districtLocationRows,
        fulltankRows,
        equippingRows,
        ctaRows,
        podcastRows,
      ] = await Promise.all([
        fetchSheet('SiteSettings'),
        fetchSheet('AboutCards'),
        fetchSheet('LatestSeries'),
        fetchSheet('TalkSeries'),
        fetchSheet('Hangouts'),
        fetchSheet('Locations'),
        fetchSheet('SubRegions'),
        fetchSheet('SubLocations'),
        fetchSheet('Districts'),
        fetchSheet('DistrictLocations'),
        fetchSheet('Fulltank'),
        fetchSheet('EquippingSeries'),
        fetchSheet('CTA'),
        fetchSheet('Podcasts'),
      ])

      const siteSettings = settingsRows ? rowsToMap(settingsRows) : defaultData.siteSettings
      const latestSeriesRow = seriesRows?.[0] ?? {}
      const fulltankRow = fulltankRows?.[0] ?? {}
      const equippingRow = equippingRows?.[0] ?? {}
      const ctaRow = ctaRows?.[0] ?? {}

      // ── Extract Hangouts section settings from first row if present ────────
      let hangoutsSettings = defaultData.hangoutsSettings
      let hangoutCards = hangoutRows || []

      if (hangoutRows?.length > 0 && hangoutRows[0]?.sectionLabel) {
        hangoutsSettings = hangoutRows[0]
        hangoutCards = hangoutRows.slice(1)
      }

      // ── Build hierarchical location data ───────────────────────────────────
      let locations = locationRows?.length ? locationRows : defaultData.locations

      // ↓ FIXED: only requires subRegionRows — subLocations/districts are optional
      if (subRegionRows?.length) {

        // 1. Map districtLocations by parentDistrictId
        const districtLocationMap = {}
        if (districtLocationRows?.length) {
          districtLocationRows.forEach((row, i) => {
            const parentId = row.parentDistrictId || row.ParentDistrictId || row['Parent District Id'] || ''
            if (!parentId) return
            if (!districtLocationMap[parentId]) districtLocationMap[parentId] = []
            districtLocationMap[parentId].push(mapLocationFields(row, `${parentId}-${i + 1}`))
          })
        }

        // 2. Map districts by parentSubRegionId, attaching their districtLocations
        const districtMap = {}
        if (districtRows?.length) {
          districtRows.forEach((row, i) => {
            const parentId = row.parentSubRegionId || row.ParentSubRegionId || row['Parent Sub Region Id'] || ''
            const distId = row.id || row.ID || row.Id || `${parentId}-d${i + 1}`
            if (!parentId) return
            if (!districtMap[parentId]) districtMap[parentId] = []
            districtMap[parentId].push({
              id: distId,
              name: row.name || '',
              emoji: row.emoji || '',
              byDistrictLocations: districtLocationMap[distId] || [],
            })
          })
        }

        // 3. Map subLocations by parentSubRegionId
        const subLocationMap = {}
        if (subLocationRows?.length) {
          subLocationRows.forEach((sub, i) => {
            const parentId = sub.parentSubRegionId || sub.ParentSubRegionId || sub['Parent Sub Region Id'] || ''
            if (!parentId) return
            if (!subLocationMap[parentId]) subLocationMap[parentId] = []
            const subId = sub.id || sub.ID || sub.Id || `${parentId}-${i + 1}`
            const mappedSubLoc = mapLocationFields({ ...sub, id: subId }, subId)
            mappedSubLoc.byDistrictLocations = districtLocationMap[subId] || []
            subLocationMap[parentId].push(mappedSubLoc)
          })
        }

        // 4. Map subRegions by parentLocationId,
        //    attaching subLocations + byDistrictLocation
        const subRegionMap = {}
        subRegionRows.forEach((subRegion, i) => {
          const parentId = subRegion.parentLocationId || subRegion.ParentLocationId || subRegion['Parent Location Id'] || ''
          const subRegId = subRegion.id || subRegion.ID || subRegion.Id || `${parentId}-${i + 1}`
          if (!parentId) return
          if (!subRegionMap[parentId]) subRegionMap[parentId] = []
          subRegionMap[parentId].push({
            id: subRegId,
            name: subRegion.name || '',
            emoji: subRegion.emoji || '',
            subLocations: subLocationMap[subRegId] || [],
            byDistrictLocation: districtMap[subRegId] || [],
          })
        })

        // 5. Attach subRegions into each top-level location
        locations = locations.map(loc => ({
          ...loc,
          subRegions: loc.id ? (subRegionMap[loc.id] || []) : [],
        }))
      }

      const newData = {
        siteSettings: Object.keys(siteSettings).length ? siteSettings : defaultData.siteSettings,
        aboutCards: aboutRows?.length ? aboutRows : defaultData.aboutCards,
        latestSeries: latestSeriesRow.title ? latestSeriesRow : defaultData.latestSeries,
        talkSeries: talkRows?.length ? talkRows : defaultData.talkSeries,
        cta: ctaRow.title ? ctaRow : defaultData.cta,
        hangouts: hangoutCards?.length ? hangoutCards : defaultData.hangouts,
        hangoutsSettings: hangoutsSettings,
        equipping: equippingRow.title ? equippingRow : defaultData.equipping,
        fulltank: fulltankRow.youtubeId ? fulltankRow : defaultData.fulltank,
        podcasts: mapPodcastRows(podcastRows) ?? defaultData.podcasts,
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