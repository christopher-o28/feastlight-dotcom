# Google Sheets Data Persistence Fix

## What was fixed:
✅ **Data now persists** across page reloads using localStorage caching
✅ **Better error logging** - console shows what's happening
✅ **Fallback behavior** - uses cached data if Google Sheets fetch fails
✅ **Auto-refresh** - data updates every 5 minutes in background

## How to verify it's working:

### 1. Check Browser Console (F12 → Console tab)
Look for one of these messages:

**Success:**
```
✓ Successfully fetched data from Google Sheets
```

**Cache/Default (expected if no internet or Sheets not configured):**
```
⚠ Google Sheets fetch failed, using cached or default data: ...
VITE_SHEET_ID not configured. Using default data. Please set VITE_SHEET_ID in your .env file.
```

### 2. Verify .env Configuration

Create or check your `.env` file at the project root:

```
VITE_SHEET_ID=your_actual_sheet_id_here
VITE_GOOGLE_API_KEY=your_api_key_here
VITE_FAQ_SCRIPT_URL=your_script_url_here
```

**To find your Sheet ID:**
1. Open your Google Sheet
2. Copy the ID from the URL: `https://docs.google.com/spreadsheets/d/`**SHEET_ID**`/edit`
3. Paste it in your `.env` file

### 3. Clear Old Cache (if needed)

If data is still showing old information:

1. Open DevTools (F12)
2. Go to **Application** tab
3. Click **Local Storage** 
4. Find your domain and clear these keys:
   - `feast_light_data`
   - `feast_light_last_updated`
5. Reload the page

### 4. Check Google Sheets Setup

Ensure your sheet tabs exist with correct names:
- [ ] `SiteSettings` - key/value pairs
- [ ] `AboutCards` - id, title, body, icon, style
- [ ] `LatestSeries` - title, subtitle, body, etc.
- [ ] `TalkSeries` - id, title, description, tag, etc.
- [ ] `Hangouts` - id, title, description, etc.
- [ ] `Locations` - id, name, region, emoji, etc.
- [ ] `Fulltank` - youtubeId, title, description
- [ ] `EquippingSeries` - title, body, imageEmoji, etc.
- [ ] `CTA` - title, body, graphicEmoji, buildUrl, updateUrl
- [ ] `FAQSubmissions` - timestamp, name, email, concern, question (optional)

### 5. Test the Fix

1. **On first load**: Data fetches from Google Sheets
2. **On reload**: Data loads from localStorage (instant, no loading screen)
3. **In background**: Data auto-updates from Google Sheets every 5 minutes
4. **If offline**: Cached data is used instead

### 6. Monitor Data Updates

Check when data was last updated:
- Open DevTools → Application → Local Storage
- Look for `feast_light_last_updated` - shows ISO timestamp

---

## Troubleshooting

**Problem: Data still disappears on reload**
- Check `.env` file has `VITE_SHEET_ID`
- Verify the Sheet ID is correct (no extra spaces)
- Check if the Google Sheet is published/public
- Clear localStorage and reload

**Problem: Old data is cached**
- Clear localStorage (see step 3 above)
- Or manually delete the cache entries
- Reload page

**Problem: "fetch failed" error**
- Check your Sheet ID in `.env`
- Verify Google Sheet is published to the web
- Check browser console for specific error message
- Ensure sheet tabs are named exactly as listed above

---

**Still having issues?** Check the browser console (F12) for error messages that can help diagnose the problem.
