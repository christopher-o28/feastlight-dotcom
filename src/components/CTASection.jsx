// src/components/CTASection.jsx
import { PlusCircle, Edit } from 'lucide-react'
import AnimatedSection from './AnimatedSection'

export default function CTASection({ cta }) {
  const {
    title = 'Do You Want to Nourish Your Home or Village with Goodness & Hope?',
    body = "You don't need a big stage or a large congregation. All you need is a willing heart and an open door. Start a Feast Light in your home today.",
    graphicImage = 'https://tfvtalks.s3.dualstack.ap-southeast-1.amazonaws.com/1%20The%20FeastLight%20Archives%20/Images%20/Do-You-Want-To-Nourish-Your-Village.jpg',
    buildUrl = 'https://tally.so/r/wdjq5o',
    updateUrl = 'https://tally.so/r/w2vE7j',
  } = cta || {}

  return (
    <section className="py-24 px-4 bg-feast-dark">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Graphic */}
          <AnimatedSection>
            <div className="rounded-3xl aspect-square max-w-sm mx-auto lg:mx-0
                            bg-gradient-to-br from-feast-red/20 to-feast-red/5
                            border border-feast-red/20 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_50%_50%,rgba(255,75,75,0.15),transparent_70%)] animate-pulse-slow" />
              {graphicImage && <img src={graphicImage} alt="Graphic" className="relative z-10 w-full h-full object-cover" />}
            </div>
          </AnimatedSection>

          {/* Text */}
          <AnimatedSection delay={0.15}>
            <div className="section-label" style={{ color: 'rgba(255,75,75,0.9)' }}>Start a Gathering</div>
            <h2 className="font-display text-3xl lg:text-4xl font-black text-white leading-tight mb-6">
              {title}
            </h2>
            <p className="text-white/60 leading-relaxed text-[0.95rem] mb-10 max-w-md">{body}</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="https://tally.so/r/wdjq5o" 
                  className="btn-primary px-6 py-3.5"
                  target="_blank"
                  rel="noopener noreferrer"
              >
              
                <PlusCircle size={17} /> Build a Feast Light Today
              </a>
              <a
                href="https://tally.so/r/w2vE7j"
                className="border-[1.5px] border-white/25 text-white/80 px-6 py-3.5 rounded-full
                           font-semibold text-sm flex items-center gap-2 transition-all duration-300
                           hover:border-white hover:bg-white/10 hover:-translate-y-0.5"
                target="_blank"
                rel="noopener noreferrer"
                
              >
                <Edit size={15} /> Update Your Feast Light Info
              </a>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}
