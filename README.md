# 🕯 The Feast Light – Website

A modern, responsive React + Vite + Tailwind CSS website for The Feast Light Christian community, powered by **Google Sheets as a CMS**.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy env file
cp .env.example .env

# 3. Add your Google Sheet ID to .env (see setup below)

# 4. Start dev server
npm run dev

# 5. Build for production
npm run build
```

---

## 📊 Google Sheets CMS Setup

The website reads all content from a Google Spreadsheet. Editors update the sheet — the site auto-refreshes every 5 minutes.

### Step 1: Create the Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com) → **New Spreadsheet**
2. Name it: `The Feast Light CMS`
3. Create these **9 sheet tabs** (exact names, case-sensitive):

---

### Step 2: Set Up Each Sheet Tab

#### Tab: `SiteSettings`
| key | value |
|-----|-------|
| phone | +6328 725 9999 |
| email | thefeastlight@gmail.com |
| facebookUrl | https://facebook.com/thefeastlight |
| youtubeUrl | https://youtube.com/@thefeastlight |
| instagramUrl | https://instagram.com/thefeastlight |
| heroHeadline | Light the World with Faith & Hope |
| heroSubtitle | The Feast Light is a Catholic community... |
| heroVideoUrl | (paste a direct video URL or leave blank) |
| heroImageUrl | (paste an image URL or leave blank) |
| logoText | FL |
| siteName | The Feast Light |
| siteTagline | Community of Hope |

---

#### Tab: `AboutCards`
| id | title | body | icon | badge | style |
|----|-------|------|------|-------|-------|
| 1 | What is The Feast Light? | The Feast Light is a community... | ✝ | Our Community | light |
| 2 | Our Mission | To proclaim the Good News... | 🎯 | Our Purpose | dark |
| 3 | Our Vision | A nation and world transformed... | 👁 | Our Vision | red |
| 4 | Goodness & Hope | At the core of The Feast Light... | 🕊 | Our Values | light |

> `style` column: `light`, `dark`, or `red`

---

#### Tab: `LatestSeries`
| title | subtitle | body | imageUrl | imageEmoji | englishUrl | tagalogUrl |
|-------|----------|------|----------|------------|------------|------------|
| With All Your Strength | Loving God With A Healthy Body | This series explores... | (image URL or blank) | 💪 | https://... | https://... |

---

#### Tab: `TalkSeries`
| id | title | description | tag | imageUrl | emoji | gradientFrom | gradientTo |
|----|-------|-------------|-----|----------|-------|--------------|------------|
| 1 | No Longer Strangers | Discover how belonging... | Community | (URL or blank) | 🤝 | #1a1a2e | #302b63 |
| 2 | The Good Life | What does it truly mean... | Lifestyle | | 🌿 | #0d2818 | #1a4a2e |
| 3 | Elevator Talks | Short, powerful conversations... | Growth | | 🛗 | #2d2000 | #5a4200 |
| 4 | Grace Upon Grace | A series on the mercy of God... | Healing | | ✨ | #1e0a3c | #3d1a6b |

---

#### Tab: `Hangouts`
| id | title | description | imageUrl | emoji | gradientFrom | gradientTo | downloadUrl | viewMoreUrl |
|----|-------|-------------|----------|-------|--------------|------------|-------------|-------------|
| 1 | Worship Night | An evening of praise... | | 🎵 | #1a1a2e | #302b63 | https://... | https://... |
| 2 | Family Feast | A monthly lunch fellowship... | | 🍽 | #2d1515 | #6b2020 | https://... | https://... |
| 3 | Bible Study Circle | Dive deeper into Scripture... | | 📖 | #0d2818 | #1a4a2e | https://... | https://... |

---

#### Tab: `Locations`
| id | name | region | emoji | imageUrl | gradientFrom | gradientTo | link |
|----|------|--------|-------|----------|--------------|------------|------|
| 1 | Metro Manila | Philippines | 🏙 | | #1a1a2e | #302b63 | https://... |
| 2 | Asia Pacific | International | 🌏 | | #0a1e3c | #1a3d6b | https://... |
| 3 | Middle East | International | 🌙 | | #2d1515 | #6b2020 | https://... |
| 4 | Oceania | International | 🌿 | | #0d2818 | #1a4a2e | https://... |
| 5 | USA | International | 🗽 | | #2d2000 | #5a4200 | https://... |
| 6 | Europe | International | 🏰 | | #1e0a3c | #3d1a6b | https://... |

---

#### Tab: `Fulltank`
| youtubeId | title | description | viewMoreUrl |
|-----------|-------|-------------|-------------|
| dQw4w9WgXcQ | FULLTANK | FULLTANK is our signature... | https://... |

> `youtubeId` = the ID from `https://youtube.com/watch?v=**THIS_PART**`

---

#### Tab: `EquippingSeries`
| title | body | imageEmoji | gradientFrom | gradientTo | viewMoreUrl |
|-------|------|------------|--------------|------------|-------------|
| Equipping Series | The Equipping Series is designed... | 🎓 | #FF4B4B | #ff8080 | https://... |

---

#### Tab: `CTA`
| title | body | graphicEmoji | buildUrl | updateUrl |
|-------|------|--------------|----------|-----------|
| Do You Want to Nourish... | You don't need a big stage... | 🏡 | https://... | https://... |

---

### Step 3: Get the Sheet ID

From the URL `https://docs.google.com/spreadsheets/d/**SHEET_ID**/edit`, copy the Sheet ID.

Add to `.env`:
```
VITE_SHEET_ID=your_sheet_id_here
```

---

### Step 4: Make it Public OR use an API Key

**Option A – Public (easiest):**
- Sheet → Share → "Anyone with the link can view"
- No API key needed

**Option B – Private + API Key:**
- [Google Cloud Console](https://console.cloud.google.com)
- Enable "Google Sheets API"
- Create an API Key → restrict to Sheets API
- Add to `.env`: `VITE_GOOGLE_API_KEY=your_key`

---

## 🏗 Project Structure

```
feast-light/
├── src/
│   ├── components/
│   │   ├── TopBar.jsx          # Red contact bar
│   │   ├── Navbar.jsx          # Sticky navigation
│   │   ├── HeroSection.jsx     # Full-width hero
│   │   ├── AboutSection.jsx    # 2-column card grid
│   │   ├── LatestSeriesSection.jsx
│   │   ├── SuggestedTalksSection.jsx
│   │   ├── CTASection.jsx
│   │   ├── HangoutsSection.jsx
│   │   ├── EquippingSection.jsx
│   │   ├── FulltankSection.jsx
│   │   ├── LocationGrid.jsx
│   │   ├── Footer.jsx
│   │   ├── AnimatedSection.jsx # Framer Motion wrappers
│   │   ├── CMSBanner.jsx       # CMS connection status
│   │   └── LoadingScreen.jsx
│   ├── hooks/
│   │   ├── useSheetData.js     # Google Sheets CMS hook
│   │   └── useInView.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env.example
├── tailwind.config.js
├── vite.config.js
└── package.json
```

---

## 🎨 Tech Stack

| Tool | Purpose |
|------|---------|
| React 18 + Vite | Fast modern frontend |
| Tailwind CSS | Utility-first styling |
| Framer Motion | Scroll & entrance animations |
| Google Sheets API v4 | Headless CMS |
| Lucide React | Icons |

---

## 🖊 Editing Content (For Non-Technical Editors)

1. Open the Google Spreadsheet
2. Find the tab for the section you want to edit (e.g., `TalkSeries`)
3. Edit the cells — **the website auto-refreshes every 5 minutes**
4. For images: paste a direct public image URL (Google Drive, Cloudinary, Imgur, etc.)
5. For YouTube videos: paste just the video ID (the part after `v=` in the URL)

> **Tip:** Use [Cloudinary](https://cloudinary.com) (free) to host and optimize images.

---

## 🚢 Deployment

```bash
npm run build
# Deploy the /dist folder to Netlify, Vercel, or any static host
```

For **Netlify/Vercel**, add environment variables in the dashboard settings:
- `VITE_SHEET_ID` = your sheet ID
- `VITE_GOOGLE_API_KEY` = your API key (if using private sheets)
