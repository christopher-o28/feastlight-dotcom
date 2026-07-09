// src/components/TopBar.jsx
import { Facebook, Mail, Youtube, Phone } from 'lucide-react'

export default function TopBar({ settings }) {
  const {
    phone = '+6328 725 9999',
    email = 'thefeastlight@gmail.com',
    facebookUrl = '#',
    youtubeUrl = '#',
  } = settings || {}

  return (
    <div className="bg-[#FF474F] text-white text-xs py-1.5 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
        {/* Left: Contact */}
        <div className="flex items-center gap-4 flex-wrap">
          <a
            href={`tel:${phone.replace(/\s/g, '')}`}
            className="flex items-center gap-1.5 opacity-90 hover:opacity-100 transition-opacity"
          >
            <Phone size={11} />
            <span>Call Us Today: {phone}</span>
          </a>
          <span className="opacity-40 hidden sm:block">|</span>
          <a
            href={`mailto:${email}`}
            className="flex items-center gap-1.5 opacity-90 hover:opacity-100 transition-opacity hidden sm:flex"
          >
            <Mail size={11} />
            <span>{email}</span>
          </a>
        </div>

        {/* Right: Socials */}
        <div className="flex items-center gap-2">
          {[
            { href: facebookUrl, Icon: Facebook, label: 'Facebook' },
            { href: youtubeUrl, Icon: Youtube, label: 'YouTube' },
            { href: `mailto:${email}`, Icon: Mail, label: 'Email' },
          ].map(({ href, Icon, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center
                         hover:bg-white/35 transition-colors"
            >
              <Icon size={10} />
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
