// src/hooks/useSubmitFAQ.js
// Hook to submit FAQ form data to Google Sheets via Google Apps Script

import { useState } from 'react'

const SCRIPT_URL = import.meta.env.VITE_FAQ_SCRIPT_URL

export function useSubmitFAQ() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const submitFAQ = async (formData) => {
    if (!SCRIPT_URL) {
      console.warn('VITE_FAQ_SCRIPT_URL not configured. Form data logged to console only.')
      console.log('FAQ Submission:', formData)
      return { success: true, local: true }
    }

    setLoading(true)
    setError(null)

    try {
      // Get current time in Philippine Standard Time (UTC+8)
      const phtTime = new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Manila',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      })

      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          name: formData.name,
          email: formData.email,
          concern: formData.concern,
          question: formData.question,
          timestamp: phtTime,
        }).toString(),
      })

      // no-cors mode doesn't return readable response
      // assume success if no error thrown
      return { success: true }
    } catch (err) {
      console.error('Error submitting FAQ:', err)
      setError('Failed to submit. Please try again.')
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  return { submitFAQ, loading, error }
}
