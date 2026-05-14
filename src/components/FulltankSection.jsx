// src/components/FulltankSection.jsx
import { Play, ArrowRight } from 'lucide-react'
import AnimatedSection from './AnimatedSection'

export default function FulltankSection({ fulltank, podcasts }) {
  const {
    youtubeId = '',
    title = 'FULLTANK',
    description = 'FULLTANK is our signature video series featuring inspiring messages, testimonies, and faith stories that will fill your heart and fuel your spirit for the week ahead. New videos every week.',
    viewMoreUrl = '#',
  } = fulltank || {}

  const {
    title: podcastsTitle = 'Podcasts',
    viewMoreUrl: podcastsViewMoreUrl = '#',
    items = [],
  } = podcasts || {}

  return (
    <>
      {/* ── FULLTANK SECTION ── */}
      <section id="fulltank" className="py-24 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Video */}
            <AnimatedSection>
              <div className="rounded-2xl overflow-hidden aspect-video shadow-[0_20px_60px_rgba(0,0,0,0.18)]">
                {youtubeId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
                    title="Fulltank Video"
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#1a1a2e] to-[#302b63]
                                  flex flex-col items-center justify-center gap-4 text-white">
                    <button className="w-16 h-16 bg-feast-red rounded-full flex items-center justify-center
                                       shadow-[0_8px_24px_rgba(255,75,75,0.4)] hover:scale-110 transition-transform duration-200">
                      <Play size={24} fill="white" className="ml-1" />
                    </button>
                    <span className="text-white/50 text-sm tracking-widest uppercase">
                      Configure YouTube ID in Google Sheets
                    </span>
                  </div>
                )}
              </div>
            </AnimatedSection>

            {/* Text */}
            <AnimatedSection delay={0.15}>
              <div className="section-label">Inspirational Video</div>
              <h2 className="font-display text-5xl font-black text-feast-dark mb-6">{title}</h2>
              <p className="text-gray-500 leading-relaxed text-[0.95rem] mb-4">{description}</p>
              <a
                href={viewMoreUrl}
                className="btn-primary mt-6 px-6 py-3 w-60 flex items-center justify-center gap-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                View More <ArrowRight size={16} />
              </a>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ── PODCASTS SECTION ── */}
      <section id="podcasts" className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <AnimatedSection>
            <h2 className="font-display text-4xl font-black text-feast-dark mb-12">
              {podcastsTitle}
            </h2>
          </AnimatedSection>

          {/* Podcast Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {items.map((podcast, index) => (
              <AnimatedSection key={podcast.id || index} delay={index * 0.12}>
                <div className="flex flex-col gap-3">
                  {/* Series Title */}
                  <h3 className="font-semibold text-feast-dark text-base">
                    {podcast.seriesTitle}
                  </h3>

                  {/* SoundCloud Embed */}
                  <div className="rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                    <iframe
                      title={podcast.seriesTitle}
                      width="100%"
                      height="450"
                      scrolling="no"
                      frameBorder="no"
                      allow="autoplay"
                      src={podcast.soundcloudUrl}
                      className="block"
                    />
                  </div>

                  {/* Embed label */}
                  {podcast.embedLabel && (
                    <p className="text-xs text-gray-400 mt-1">{podcast.embedLabel}</p>
                  )}
                </div>
              </AnimatedSection>
            ))}
          </div>

          {/* View More */}
          {podcastsViewMoreUrl && podcastsViewMoreUrl !== '#' && (
            <AnimatedSection delay={0.25}>
              <div className="mt-12">
                <a
                  href={podcastsViewMoreUrl}
                  className="btn-primary px-6 py-3 w-48 flex items-center justify-center gap-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View More <ArrowRight size={16} />
                </a>
              </div>
            </AnimatedSection>
          )}

        </div>
      </section>
    </>
  )
}
