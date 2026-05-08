import { useState } from 'react'
import { ChevronDown, Send } from 'lucide-react'
import AnimatedSection from './AnimatedSection'
import { useSubmitFAQ } from '../hooks/useSubmitFAQ'

export default function FAQSection() {
  const [openFAQ, setOpenFAQ] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    concern: '',
    question: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const { submitFAQ, loading } = useSubmitFAQ()

  const faqs = [
    {
      id: 1,
      question: 'What is a Feast Light?',
      answer: 'A Feast Light is a gathering in your home or community where people come together to share food, fellowship, and faith. It\'s about nourishing both body and soul with goodness and hope.'
    },
    {
      id: 2,
      question: 'How do I start a Feast Light?',
      answer: 'To start a Feast Light, simply have a willing heart and an open door. Invite your friends, family, or neighbors to gather, share a meal, and fellowship together. Focus on creating a welcoming atmosphere.'
    },
    {
      id: 3,
      question: 'Do I need a large congregation to host?',
      answer: 'No! You don\'t need a large congregation or big stage. A Feast Light can start small in your home with just a few people. The impact of genuine fellowship and community is what matters.'
    },
    {
      id: 4,
      question: 'How often should we gather?',
      answer: 'The frequency is up to you! Some gather weekly, others monthly. The key is consistency and creating a rhythm that works for your community.'
    },
    {
      id: 5,
      question: 'What should we do during a Feast Light?',
      answer: 'Share a meal together, have meaningful conversations, pray if you\'re comfortable doing so, and create an environment of openness and acceptance. The focus is on genuine connection.'
    }
  ]

  const toggleFAQ = (id) => {
    setOpenFAQ(openFAQ === id ? null : id)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Submit to Google Sheets
    const result = await submitFAQ(formData)
    
    if (result.success) {
      setSubmitted(true)
      setFormData({ name: '', email: '', concern: '', question: '' })
      
      // Reset success message after 3 seconds
      setTimeout(() => setSubmitted(false), 3000)
    }
  }

  return (
    <section id="faqs" className="py-24 px-4 bg-feast-dark">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <AnimatedSection>
          <div className="text-center mb-16">
            <div className="section-label mb-3" style={{ color: 'rgba(255,75,75,0.9)' }}>Have Questions?</div>
            <h2 className="font-display text-3xl lg:text-4xl font-black text-white leading-tight mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Find answers to common questions about Feast Light gatherings.
            </p>
          </div>
        </AnimatedSection>

        {/* FAQ Items */}
        <AnimatedSection delay={0.1}>
          <div className="space-y-3 mb-12">
            {faqs.map((faq) => (
              <div key={faq.id} className="border border-white/10 rounded-lg overflow-hidden hover:border-feast-red/30 transition-all duration-300">
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full px-6 py-4 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-all duration-300"
                >
                  <span className="text-white font-semibold text-left">{faq.question}</span>
                  <ChevronDown 
                    size={20} 
                    className={`text-feast-red/70 transition-transform duration-300 ${openFAQ === faq.id ? 'rotate-180' : ''}`}
                  />
                </button>
                
                {openFAQ === faq.id && (
                  <div className="px-6 py-4 bg-white/5 border-t border-white/10">
                    <p className="text-white/70 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </AnimatedSection>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-12" />

        {/* Ask a Question Form */}
        <AnimatedSection delay={0.2}>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h3 className="font-display text-2xl font-black text-white mb-6">
              Didn't find your answer?
            </h3>
            
            {submitted ? (
              <div className="bg-feast-red/20 border border-feast-red/50 rounded-lg p-4 mb-6">
                <p className="text-feast-red font-semibold">✓ Thank you! We've received your question and will get back to you soon.</p>
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-white/80 font-semibold text-sm mb-2">Your Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Example: Juan A. Dela Cruz"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white
                             placeholder-white/40 focus:outline-none focus:border-feast-red/50 focus:bg-white/15
                             transition-all duration-300"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-white/80 font-semibold text-sm mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Example: juan.delaCruz@gmail.com"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white
                             placeholder-white/40 focus:outline-none focus:border-feast-red/50 focus:bg-white/15
                             transition-all duration-300"
                />
              </div>

              {/* Concern */}
              <div>
                <label className="block text-white/80 font-semibold text-sm mb-2">Concern/Topic</label>
                <input
                  type="text"
                  name="concern"
                  value={formData.concern}
                  onChange={handleInputChange}
                  placeholder="e.g., Getting Started, Community Building..."
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white
                             placeholder-white/40 focus:outline-none focus:border-feast-red/50 focus:bg-white/15
                             transition-all duration-300"
                />
              </div>

              {/* Question */}
              <div>
                <label className="block text-white/80 font-semibold text-sm mb-2">Your Question</label>
                <textarea
                  name="question"
                  value={formData.question}
                  onChange={handleInputChange}
                  placeholder="Please share your question or concern in detail..."
                  required
                  rows="5"
                  className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white
                             placeholder-white/40 focus:outline-none focus:border-feast-red/50 focus:bg-white/15
                             transition-all duration-300 resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2 font-semibold
                           transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-r-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={18} /> Send Your Question
                  </>
                )}
              </button>
            </form>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
