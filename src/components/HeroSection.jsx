// src/components/HeroSection.jsx
import { motion } from 'framer-motion'
import { HandHeart, Play, ChevronDown } from 'lucide-react'

export default function HeroSection({ settings }) {
  const {
    heroHeadline = 'Light the World with Faith & Hope',
    heroSubtitle = "The Feast Light is a Catholic community gathering where we nourish homes, villages, and hearts with the goodness of God's word.",
    heroVideoUrl = 'https://feastlight.com/wp-content/uploads/2018/10/Feast-Video-Quick-Start-Bo-Sanchez.mp4',
    heroImageUrl = '',
  } = settings || {}

  const scrollDown = () => {
    document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section
      id="home"
      className="relative min-h-[90vh] max-h-[900px] flex items-center overflow-hidden bg-feast-dark"
    >
      {/* Background */}
      {heroVideoUrl ? (
        <video
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-65"
          src={heroVideoUrl}
        />
      ) : heroImageUrl ? (
        <img
          src={heroImageUrl}
          alt="Hero"
          className="absolute inset-0 w-full h-full object-cover opacity-25"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]" />
      )}

      {/* Glow overlays */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-1/2 h-full bg-[radial-gradient(circle_at_20%_30%,rgba(255,75,75,0.25),transparent_60%)]" />
        <div className="absolute bottom-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_80%_70%,rgba(255,75,75,0.12),transparent_60%)]" />
      </div>
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 py-20 w-full">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="max-w-2xl"
        >
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex items-center gap-3 mb-5"
          >
            <span className="w-8 h-[2px] bg-feast-red block" />
            <span className="text-feast-red text-xs font-bold tracking-[0.22em] uppercase">
              Welcome to Our Community
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="font-display text-white font-black leading-[1.08] mb-6"
            style={{ fontSize: 'clamp(2.4rem, 6vw, 5rem)' }}
          >
            {heroHeadline.split('Faith').length > 1 ? (
              <>
                {heroHeadline.split('Faith')[0]}
                <span className="text-feast-red">Faith</span>
                {heroHeadline.split('Faith')[1]}
              </>
            ) : (
              heroHeadline
            )}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-white/70 text-lg leading-relaxed mb-10 max-w-xl"
          >
            {heroSubtitle}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.6 }}
            className="flex flex-wrap gap-4"
          >
            <button
              onClick={() => document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-primary text-base px-8 py-4"
            >
              <HandHeart size={18} />
              Join Our Community
            </button>
            <button
              onClick={() => document.querySelector('#series')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-outline-white text-base px-8 py-4"
            >
              <Play size={16} fill="currentColor" />
              Watch Feast Talk
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={scrollDown}
        className="absolute bottom-6 left-0 right-0 flex flex-col items-center justify-center 
        gap-1.5 text-white/40 text-[0.65rem] tracking-[0.12em] uppercase animate-bounce-slow 
        hover:text-white/60 transition-colors text-center"
      >
        <ChevronDown size={20} />
        <span>Scroll to explore</span>
      </button>
    </section>
  )
}
