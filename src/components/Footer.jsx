// src/components/Footer.jsx
import { Facebook, Youtube, Instagram, Mail, Heart } from 'lucide-react'

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

  const quickLinks = [
    { label: 'Who We Are', href: '#about' },
    { label: 'Locations', href: '#locations' },
    { label: 'Feast Talk', href: '#series' },
    { label: 'Hangouts', href: '#hangouts' },
    { label: 'Media', href: '#fulltank' },
    { label: 'FAQs', href: '#faqs' },
  ]

  return (
    <footer className="relative bg-[#0a0a14] text-white overflow-hidden">
      {/* Glowing top accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[60px] bg-red-600/10 blur-2xl rounded-full" />

      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">

          {/* Brand Column */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                <img
                  src="https://tfvtalks.s3.dualstack.ap-southeast-1.amazonaws.com/1%20The%20FeastLight%20Archives%20/Images%20/Feast-Light-Logo-Rebrand-FINAL.png"
                  alt="Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-bold text-white text-lg tracking-tight">{siteName}</span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed">
              One of the happiest places on earth. A weekly prayer gathering of the Light of Jesus family, dreaming of 1000 Feasts all over the world.
            </p>
            {/* Socials */}
            <div className="flex gap-2 mt-1">
              {socials.map(({ href, Icon, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center
                             text-white/40 hover:bg-red-600 hover:text-white hover:border-red-600
                             transition-all duration-200"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <p className="text-[0.65rem] font-bold tracking-[0.18em] uppercase text-red-500 mb-5">Quick Links</p>
            <ul className="flex flex-col gap-2.5">
              {quickLinks.map(link => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-white/45 hover:text-white transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-3 h-[1px] bg-red-500/50 group-hover:w-5 group-hover:bg-red-500 transition-all duration-200" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-[0.65rem] font-bold tracking-[0.18em] uppercase text-red-500 mb-5">Get In Touch</p>
            <a
              href={`mailto:${email}`}
              className="text-sm text-white/45 hover:text-white transition-colors duration-200 flex items-center gap-2 mb-6"
            >
              <Mail size={14} className="text-red-500" />
              {email}
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=com.thefeast.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-500
                         text-white text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-red-600/25"
            >
              Download Feast App
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-[1px] bg-white/[0.06] mb-6" />

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[0.72rem] text-white/25">
          <span>© 2026 {siteName}. All Rights Reserved.</span>
          <div className="flex items-center gap-4">
            <a href={privacyPolicyUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            
          </div>
        </div>
      </div>
    </footer>
  )
}