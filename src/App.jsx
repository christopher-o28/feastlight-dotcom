// src/App.jsx
import { useSheetData } from './hooks/useSheetData'
import TopBar from './components/TopBar'
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import AboutSection from './components/AboutSection'
import LatestSeriesSection from './components/LatestSeriesSection'
import SuggestedTalksSection from './components/SuggestedTalksSection'
import CTASection from './components/CTASection'
import HangoutsSection from './components/HangoutsSection'
import EquippingSection from './components/EquippingSection'
import FulltankSection from './components/FulltankSection'
import LocationGrid from './components/LocationGrid'
import Footer from './components/Footer'
import LoadingScreen from './components/LoadingScreen'
import CMSBanner from './components/CMSBanner'
import FAQSection from './components/FAQSection'



export default function App() {
  const { data, loading, error, lastUpdated } = useSheetData()

  if (loading) return <LoadingScreen />

  const {
    siteSettings,
    aboutCards,
    latestSeries,
    talkSeries,
    cta,
    hangouts,
    equipping,
    fulltank,
    podcasts,
    locations,
  } = data

  return (
    <div className="min-h-screen font-body">
      {/* CMS Status Banner */}
      <CMSBanner error={error} lastUpdated={lastUpdated} />

      {/* Top Contact Bar */}
      <TopBar settings={siteSettings} />

      {/* Sticky Navbar */}
      <Navbar settings={siteSettings} />

      {/* Main Content */}
      <main>
        {/* 1. Hero */}
        <HeroSection settings={siteSettings} />

        {/* 2. About / Card Grid */}
        <AboutSection cards={aboutCards} />

        {/* 3. Locations */}
        <LocationGrid locations={locations} />

        {/* 4. Latest Series */}
        <LatestSeriesSection series={latestSeries} />

        {/* 5. Suggested Talks */}
        <SuggestedTalksSection talks={talkSeries} />

        {/* 6. CTA */}
        <CTASection cta={cta} />

        {/* 7. Hangouts */}
        <HangoutsSection hangouts={hangouts} />

        {/* 8. Equipping Series */}
        <EquippingSection equipping={equipping} />

        {/* 9. Fulltank + Podcasts */}
        <FulltankSection fulltank={fulltank} podcasts={podcasts} />  {/* ← ADDED podcasts */}

        {/* 10. FAQ */}
        <FAQSection />
      </main>

      {/* Footer */}
      <Footer settings={siteSettings} />
    </div>
  )
}
