// src/components/AboutSection.jsx
import { useEffect, useState } from 'react'
import AnimatedSection from './AnimatedSection'

const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTkZi9S2sUa1HkQ6v9PCeZfr0stItscA73BW4t2prGQifg4fFhorLez06Vqu-lTFc016yo3H1wf96PQ/pub?gid=851635418&single=true&output=csv'

function parseCSV(text) {
  const rows = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (char === '"') {
      inQuotes = !inQuotes
      current += char
    } else if (char === '\n' && !inQuotes) {
      rows.push(current)
      current = ''
    } else {
      current += char
    }
  }
  if (current) rows.push(current)

  const parseRow = (line) => {
    const values = []
    let val = ''
    let inQ = false
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '"') {
        inQ = !inQ
      } else if (line[i] === ',' && !inQ) {
        values.push(val.trim())
        val = ''
      } else {
        val += line[i]
      }
    }
    values.push(val.trim())
    return values
  }

  const headers = parseRow(rows[0])
  return rows.slice(1).map(row => {
    const values = parseRow(row)
    return headers.reduce((obj, h, i) => ({ ...obj, [h]: values[i] || '' }), {})
  }).filter(row => row.id && row.id.trim())
}

function AboutRow({ section, index }) {
  const { imageLink, title, body } = section
  const imageRight = index % 2 !== 0

  const imageBlock = (
    <div
      className="w-full md:w-1/2 min-h-[260px] sm:min-h-[320px] bg-contain bg-center bg-no-repeat bg-gray-100"
      style={{ backgroundImage: `url(${imageLink})` }}
    />
  )

  const textBlock = (
    <div className="w-full md:w-1/2 bg-white flex items-center p-8 sm:p-10 lg:p-14 min-h-[260px] sm:min-h-[320px]">
      <div>
        {title && (
          <p className="text-sm sm:text-base leading-relaxed text-gray-600">
            <strong className="text-feast-dark">{title}</strong>
          </p>
        )}
        {body && body.split('\n').filter(Boolean).map((para, i) => (
          <p key={i} className="text-sm sm:text-base leading-relaxed text-gray-500 mt-3">
            {para.trim()}
          </p>
        ))}
      </div>
    </div>
  )

  return (
    <AnimatedSection>
      <div className={`flex flex-col ${imageRight ? 'md:flex-row-reverse' : 'md:flex-row'} rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(255,75,75,0.15)]`}>
        {imageBlock}
        {textBlock}
      </div>
    </AnimatedSection>
  )
}

export default function AboutSection() {
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(SHEET_CSV_URL)
      .then(res => res.text())
      .then(text => {
        setSections(parseCSV(text))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <section id="about" className="py-24 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <AnimatedSection className="mb-14">
          <div className="section-label text-center text-5xl">Who We Are</div>
        </AnimatedSection>

        {/* Rows */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-feast-red border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {sections.map((section, index) => (
              <AboutRow key={section.id} section={section} index={index} />
            ))}
          </div>
        )}

      </div>
    </section>
  )
}