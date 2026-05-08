// server.js — Google Sheets + Ollama (local AI, no API key needed)
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { google } from 'googleapis'

const app = express()
app.use(cors())
app.use(express.json())

// ── Env vars ───────────────────────────────────────────────────────────────
const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID
const SHEET_NAME     = process.env.GOOGLE_SHEET_NAME || 'Sheet1'
const CREDENTIALS    = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
const OLLAMA_URL     = process.env.OLLAMA_URL || 'http://localhost:11434'
const OLLAMA_MODEL   = process.env.OLLAMA_MODEL || 'llama3'

if (!SPREADSHEET_ID) { console.error('❌ Missing GOOGLE_SPREADSHEET_ID'); process.exit(1) }
if (!CREDENTIALS)    { console.error('❌ Missing GOOGLE_SERVICE_ACCOUNT_JSON'); process.exit(1) }

// ── Google Sheets auth ─────────────────────────────────────────────────────
let parsedCredentials
try {
  parsedCredentials = JSON.parse(CREDENTIALS)
} catch (e) {
  console.error('❌ GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON!')
  console.error('   Make sure it is on ONE line wrapped in single quotes in .env')
  process.exit(1)
}

const auth = new google.auth.GoogleAuth({
  credentials: parsedCredentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
})
const sheets = google.sheets({ version: 'v4', auth })

console.log('✅ Google Sheets client ready')
console.log('✅ Ollama model:', OLLAMA_MODEL, '→', OLLAMA_URL)
console.log('✅ Spreadsheet ID:', SPREADSHEET_ID)

// ── Helper: fetch sheet data ───────────────────────────────────────────────
async function getSheetContext() {
  try {
    const sheetRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: SHEET_NAME,
    })
    const rows = sheetRes.data.values || []
    if (rows.length < 2) return '(No data in sheet yet)'
    const [headers, ...data] = rows
    const formatted = data.map(row =>
      Object.fromEntries(headers.map((h, i) => [h, row[i] ?? '']))
    )
    return '=== FEAST LIGHT DATA ===\n' + JSON.stringify(formatted, null, 2)
  } catch (err) {
    console.error('❌ Sheet fetch error:', err.message)
    return '(Could not load sheet data)'
  }
}

// ─────────────────────────────────────────────
// POST /api/chat — Ollama chat with Sheet context
// ─────────────────────────────────────────────
app.post('/api/chat', async (req, res) => {
  try {
    const sheetContext = await getSheetContext()

    const systemPrompt = `You are a friendly assistant for The Feast Light — a Catholic community gathering movement founded by Bo Sanchez that nourishes homes, villages, and hearts with God's word.

Your role:
- Answer questions about The Feast Light: its mission, schedule, locations, events, and community.
- Help people find their nearest Feast Light gathering.
- Share information about leaders, upcoming talks, and how to join.
- Keep answers warm, faith-filled, and concise (2–4 sentences unless more detail is needed).
- If you don't know something, say so kindly and suggest visiting feastlight.com.

Here is the latest data from the community records:
${sheetContext}

Always respond in a warm, welcoming, community-oriented tone.`

    // Build messages in Ollama format
    const messages = [
      { role: 'system', content: systemPrompt },
      ...req.body.messages.map(m => ({ role: m.role, content: m.content })),
    ]

    const ollamaRes = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages,
        stream: false,
      }),
    })

    if (!ollamaRes.ok) {
      const err = await ollamaRes.text()
      console.error('❌ Ollama error:', err)
      return res.status(500).json({ error: 'Ollama error', details: err })
    }

    const data = await ollamaRes.json()
    const replyText = data.message?.content || "I'm sorry, I couldn't get a response."

    // Return in same shape the frontend expects
    res.json({
      content: [{ type: 'text', text: replyText }],
    })
  } catch (err) {
    console.error('❌ Chat error:', err.message)
    res.status(500).json({ error: 'Chat error', details: err.message })
  }
})

// ─────────────────────────────────────────────
// GET /api/sheet — Read all rows
// ─────────────────────────────────────────────
app.get('/api/sheet', async (req, res) => {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: SHEET_NAME,
    })
    const rows = response.data.values || []
    if (rows.length === 0) return res.json({ headers: [], rows: [] })
    const [headers, ...data] = rows
    const formatted = data.map(row =>
      Object.fromEntries(headers.map((h, i) => [h, row[i] ?? '']))
    )
    res.json({ headers, rows: formatted })
  } catch (err) {
    console.error('❌ Read error:', err.message)
    res.status(500).json({ error: 'Failed to read sheet', details: err.message })
  }
})

// ─────────────────────────────────────────────
// POST /api/sheet — Append a new row
// ─────────────────────────────────────────────
app.post('/api/sheet', async (req, res) => {
  const { data } = req.body
  if (!data || typeof data !== 'object')
    return res.status(400).json({ error: 'Missing required field: data (object)' })
  try {
    const headerRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!1:1`,
    })
    const headers = headerRes.data.values?.[0] || Object.keys(data)
    const row = headers.map(h => data[h] ?? '')
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: SHEET_NAME,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [row] },
    })
    res.json({ success: true, appended: data })
  } catch (err) {
    console.error('❌ Append error:', err.message)
    res.status(500).json({ error: 'Failed to append row', details: err.message })
  }
})

// ─────────────────────────────────────────────
// PUT /api/sheet/:rowIndex — Update a row
// ─────────────────────────────────────────────
app.put('/api/sheet/:rowIndex', async (req, res) => {
  const rowIndex = parseInt(req.params.rowIndex)
  const { data } = req.body
  if (isNaN(rowIndex) || rowIndex < 1)
    return res.status(400).json({ error: 'Invalid rowIndex.' })
  if (!data || typeof data !== 'object')
    return res.status(400).json({ error: 'Missing required field: data (object)' })
  try {
    const headerRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!1:1`,
    })
    const headers = headerRes.data.values?.[0] || Object.keys(data)
    const row = headers.map(h => data[h] ?? '')
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A${rowIndex + 1}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [row] },
    })
    res.json({ success: true, updatedRow: rowIndex, data })
  } catch (err) {
    console.error('❌ Update error:', err.message)
    res.status(500).json({ error: 'Failed to update row', details: err.message })
  }
})

// ─────────────────────────────────────────────
// DELETE /api/sheet/:rowIndex — Delete a row
// ─────────────────────────────────────────────
app.delete('/api/sheet/:rowIndex', async (req, res) => {
  const rowIndex = parseInt(req.params.rowIndex)
  if (isNaN(rowIndex) || rowIndex < 1)
    return res.status(400).json({ error: 'Invalid rowIndex.' })
  try {
    const metaRes = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID })
    const sheet = metaRes.data.sheets.find(s => s.properties.title === SHEET_NAME)
    if (!sheet) return res.status(404).json({ error: `Sheet "${SHEET_NAME}" not found` })
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId: sheet.properties.sheetId,
              dimension: 'ROWS',
              startIndex: rowIndex,
              endIndex: rowIndex + 1,
            },
          },
        }],
      },
    })
    res.json({ success: true, deletedRow: rowIndex })
  } catch (err) {
    console.error('❌ Delete error:', err.message)
    res.status(500).json({ error: 'Failed to delete row', details: err.message })
  }
})

app.listen(3001, () => console.log('✅ Proxy server running on http://localhost:3001'))