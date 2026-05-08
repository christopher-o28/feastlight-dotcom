// src/components/Footer.jsx
import { Facebook, Youtube, Instagram, Mail } from 'lucide-react'

export default function Footer({ settings }) {
  const {
    logoImage = '/Feast-Light-Logo-x180.png',
    siteName = 'The Feast Light',
    facebookUrl = '#',
    youtubeUrl = '#',
    instagramUrl = '#',
    email = 'thefeastlight@gmail.com',
    privacyPolicyUrl = 'https://feast.ph/privacy-policy/',
  } = settings || {}

  const socials = [
    { href: facebookUrl, Icon: Facebook, label: 'Facebook' },
    { href: youtubeUrl, Icon: Youtube, label: 'YouTube' },
    { href: instagramUrl, Icon: Instagram, label: 'Instagram' },
    { href: `mailto:${email}`, Icon: Mail, label: 'Email' },
  ]

  return (
    <footer className="bg-[#0d0d18] text-white/45 py-10 px-4">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-5">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-feast-red rounded-full flex items-center justify-center
                          overflow-hidden flex-shrink-0">
            <img src={logoImage} alt="Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-display font-bold text-white/75 text-base">{siteName}</span>
        </div>

        {/* Tagline */}
        <p className="text-[0.75rem] tracking-wider text-white/30 uppercase">
          Nourishing Homes &amp; Villages with Goodness &amp; Hope
        </p>

        {/* Socials */}
        <div className="flex gap-3">
          {socials.map(({ href, Icon, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center
                         hover:border-feast-red hover:text-feast-red transition-all duration-200"
            >
              <Icon size={14} />
            </a>
          ))}
        </div>

        <div className="w-full border-t border-white/[0.07] my-1" />

        {/* Copyright */}
        <div className="flex flex-wrap gap-3 items-center justify-center text-[0.75rem]">
          <span>© Copyright 2012–2026 | All Rights Reserved</span>
          <span className="opacity-30">|</span>
          <a href={privacyPolicyUrl} target="_blank" rel="noopener noreferrer" className="hover:text-feast-red transition-colors">Privacy Policy</a>
        </div>
      </div>
    </footer>
  )
}
