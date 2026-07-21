// src/components/EquippingSection.jsx
import { ArrowRight } from 'lucide-react'
import AnimatedSection from './AnimatedSection'

export default function EquippingSection({ equipping }) {
  const {
    title = 'Equipping Series',
    body = "The Equipping Series is designed for Feast Light leaders and coordinators called to serve their communities with excellence. Whether you're leading a home gathering or overseeing a village group, these talks provide practical tools, spiritual nourishment, and leadership frameworks rooted in the Gospel.",
    imageUrl = '#',
    gradientFrom = '#FF4B4B',
    gradientTo = '#ff8080',
    viewMoreUrl = '#',
  } = equipping || {}

  return (
    <section className="py-24 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <AnimatedSection>
            <div className="section-label">Leadership</div>
            <h2 className="section-title mb-6">{title}</h2>
            <p className="text-gray-500 leading-relaxed text-[0.95rem] mb-4">{body}</p>
            <p className="text-gray-500 leading-relaxed text-[0.95rem] mb-10">
              Learn how to facilitate meaningful gatherings, care for your members, grow your community, and sustain your own spiritual health as a servant-leader.
            </p>
            <a
              href={viewMoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary px-3 py-3 w-60 flex items-center justify-center gap-2"
            >
              View More <ArrowRight size={16} />
            </a>
          </AnimatedSection>

          {/* Graphic */}
          <AnimatedSection delay={0.2}>
            <div
              className="rounded-3xl aspect-[4/3] flex items-center justify-center text-7xl
                         shadow-[0_20px_60px_rgba(255,75,75,0.28)] relative overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.15),transparent_60%)]" />
              <img src={imageUrl} alt="Equipping" className="relative z-10 w-full h-full object-cover" />
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}
