import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import AnimatedSection from './AnimatedSection'

export default function FAQSection() {
  const [openFAQ, setOpenFAQ] = useState(null)

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
    },
    {
      id: 6,
      question: 'How to put up a Feast Light?',
      answer: (
        <ol className="list-decimal pl-5 space-y-2 mt-1">
          <li> Register a Feast Light register on this link <a href="https://tally.so/r/wdjq5o" target="_blank" rel="noopener noreferrer" className="text-feast-red hover:text-red-400 underline underline-offset-2 transition-colors">https://tally.so/r/wdjq5o</a></li>
          <li> In the register field, fill out the region, district, city/province/state, first name, last name, email address and contact number.</li>
          <li> Download a video talk from your chosen Feast Series and other resources.</li>
          <li> Gather 5 or more people.</li>
          <li> Play the video.</li>
          <li> Talk about your insights and reflections from the video.</li>
          <li> Do it again next week!</li>
        </ol>
      )
    },
     {
      id: 7,
      question: 'What are the equipments that we need in accordance with having a Feast Light?',
      answer: ( 
        <ol className="list-decimal pl-5 space-y-2 mt-1">
          <li> Laptop</li>
          <li> Projector (especially if you're having a huge number of attendees)</li>
          <li> Video talk of the series</li>
        </ol>
    )
    },
    
  ]

  const toggleFAQ = (id) => {
    setOpenFAQ(openFAQ === id ? null : id)
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
                      className={`text-feast-red/70 transition-transform duration-300 flex-shrink-0 ${openFAQ === faq.id ? 'rotate-180' : ''}`}
                    />
                </button>
                
                {openFAQ === faq.id && (
                  <div className="px-6 py-4 bg-white/5 border-t border-white/10">
                    <div className="text-white/70 leading-relaxed">{faq.answer}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}
