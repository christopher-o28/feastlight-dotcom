// src/components/Navbar.jsx
import { useState, useEffect } from 'react'
import { Menu, X, User } from 'lucide-react'



const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'Who We Are', href: '#about' },
  { label: 'Locations', href: '#locations' },
  { label: 'Feast Talk', href: '#series' },
  { label: 'Hangouts', href: '#hangouts' },
  { label: 'Media', href: '#fulltank' },
  { label: 'FAQs', href: '#faqs' },
]

export default function Navbar({ settings }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const { logoImage = '/Feast-Light-Logo-x180.png', siteName = 'The Feast Light', siteTagline = 'Community of Hope' } = settings || {}

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleNav = (e, href) => {
    e.preventDefault()
    setMenuOpen(false)
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav
      className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${
        scrolled ? 'shadow-[0_2px_20px_rgba(0,0,0,0.08)]' : 'border-b border-gray-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-[70px] gap-4">
        {/* Logo */}
        <a href="#home" onClick={e => handleNav(e, '#home')} className="flex items-center gap-3 flex-shrink-0">
          <div className="w-12 h-12 bg-feast-red rounded-full flex items-center justify-center
                          shadow-[0_4px_14px_rgba(255,75,75,0.35)] flex-shrink-0 overflow-hidden">
            <img src={logoImage} alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div className="hidden sm:block leading-tight">
            <span className="block font-display font-bold text-feast-dark text-[1.05rem]">{siteName}</span>
            <span className="block text-[0.6rem] text-feast-red font-bold tracking-[0.1em] uppercase">{siteTagline}</span>
          </div>
        </a>

        {/* Desktop Nav */}
        <ul className="hidden lg:flex items-center gap-1 list-none">
          {NAV_LINKS.map(link => (
            <li key={link.label}>
              <a
                href={link.href}
                onClick={e => handleNav(e, link.href)}
                className="text-feast-charcoal font-medium text-[0.82rem] px-3 py-1.5 rounded-lg
                           hover:text-feast-red hover:bg-feast-red-light transition-all duration-200"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href="https://play.google.com/store/apps/details?id=com.thefeast.app"
              className="btn-primary text-[0.82rem] ml-2"
            >
              Download Feast App
            </a>
          </li>
        </ul>

        {/* Hamburger */}
        <button
          className="lg:hidden p-2 text-feast-charcoal hover:text-feast-red transition-colors"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ${
          menuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="border-t border-gray-100 px-4 py-3 flex flex-col">
          {NAV_LINKS.map(link => (
            <a
              key={link.label}
              href={link.href}
              onClick={e => handleNav(e, link.href)}
              className="py-3 border-b border-gray-100 font-medium text-feast-charcoal
                         hover:text-feast-red transition-colors last:border-none"
            >
              {link.label}
            </a>
          ))}
          <a
            href="https://play.google.com/store/apps/details?id=com.thefeast.app"
            className="btn-primary mt-4 justify-center"
          >
            Download Feast App
          </a>
        </div>
      </div>
    </nav>
  )
}
