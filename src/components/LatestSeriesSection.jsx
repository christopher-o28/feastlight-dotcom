// src/components/LatestSeriesSection.jsx
import { ArrowRight } from 'lucide-react'
import AnimatedSection from './AnimatedSection'

export default function LatestSeriesSection({ series }) {
  const {
    title = 'Called to Witness',
    subtitle = 'How to Share the Good News to the World',
    body = '',
    imageUrl: sheetImageUrl,
    imageEmoji = '',

  } = series || {}

  const imageUrl = sheetImageUrl || '/called_to_witness.png';

  return (
    <section id="series" className="py-24 px-4 bg-white">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Left */}
          <AnimatedSection className="lg:col-span-6 xl:col-span-5">
            <div className="text-feast-red text-xs font-bold tracking-[0.22em] uppercase mb-4 flex items-center gap-2">
              <span className="w-6 h-[2px] bg-feast-red" />
              Latest Series
            </div>
            <h2 className="font-display text-4xl lg:text-5xl font-black text-feast-dark leading-tight mb-3">
              {title}
            </h2>
            <p className="text-xl text-feast-red font-semibold mb-6">{subtitle}</p>
            <p className="text-gray-500 leading-relaxed text-[0.95rem] mb-10 max-w-md">{body}</p>
            <div className="flex flex-wrap gap-3">
              <a href="#talks" className="btn-primary px-6 py-3 flex items-center gap-2">
                View More <ArrowRight size={16} />
              </a>
            </div>
          </AnimatedSection>


          {/* Right: Artwork */}
          <AnimatedSection delay={0.2} className="lg:col-span-6 xl:col-span-7">
            <div className={`rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.18)] relative
                            bg-gradient-to-br from-[#1a1a2e] to-[#302b63] flex items-center justify-center ${!imageUrl ? 'aspect-[4/3]' : ''}`}>
              {imageUrl ? (
                <img src={imageUrl} alt={title} className="w-full h-auto" />
              ) : (
                <>
                  <span className="absolute top-4 right-6 text-[8rem] font-black text-white opacity-[0.06] select-none leading-none"></span>
                  <div className="text-center text-white relative z-10 p-8">
                    <div className="text-6xl mb-5">{imageEmoji}</div>
                    <h3 className="font-display text-2xl font-black mb-2">{title}</h3>
                    <p className="text-white/60 text-sm">{subtitle}</p>
                  </div>
                  <span className="absolute bottom-5 left-5 bg-feast-red text-white text-xs font-bold px-4 py-1.5 rounded-full tracking-wider">
                    NEW SERIES
                  </span>
                </>

              )}
            </div>
          </AnimatedSection>
        </div>

      </div>

    </section>
  )
}
