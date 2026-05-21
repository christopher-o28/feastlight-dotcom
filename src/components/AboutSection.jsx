// src/components/AboutSection.jsx
import AnimatedSection from './AnimatedSection'

const sections = [
  {
    id: 1,
    imageLink: 'https://feastlight.com/wp-content/uploads/2022/01/What-is-FeastVideo.jpg',
    imageRight: false,
    content: (
      <>
        <p className="text-sm sm:text-base leading-relaxed text-gray-600">
          <strong className="text-feast-dark">The Feast Light</strong> is a small gathering of friends who want to
          receive life changing nourishment from the Feast Talk Series.
        </p>
        <p className="text-sm sm:text-base leading-relaxed text-gray-500 mt-3">
          The Feast Light, facilitated by a Planter, a weekly small gathering of people (from 3 or more while
          observing proper health and safety protocol) either in their homes or workplace, watching and listening
          to a Feast Talk Video or maybe conducted Online (using the latest Meeting app).
        </p>
      </>
    ),
  },
  {
    id: 2,
    imageLink: 'https://feastlight.com/wp-content/uploads/2022/01/Mission2.jpg',
    imageRight: true,
    content: (
      <>
        <p className="text-sm sm:text-base leading-relaxed text-gray-600">
          <strong className="text-feast-dark">Our Mission</strong> is to empower 1 Million Disciple Makers who can
          Disciple 1 Million Disciple Makers.
        </p>
      </>
    ),
  },
  {
    id: 3,
    imageLink: 'https://feastlight.com/wp-content/uploads/2022/01/Vision.jpg',
    imageRight: false,
    content: (
      <>
        <p className="text-sm sm:text-base leading-relaxed text-gray-600">
          Together, as a family, the Feast Light shares the same Vision of Light of Jesus by planting 100,000
          Feasts all throughout the World through Multiplication.
        </p>
        <p className="text-sm sm:text-base leading-relaxed text-gray-500 mt-3">
          And as one, we believe achieving the Vision can be done by strengthening and equipping Planters.
        </p>
      </>
    ),
  },
  {
    id: 4,
    imageLink: 'https://feastlight.com/wp-content/uploads/2022/01/The-Feast.jpg',
    imageRight: true,
    content: (
      <>
        <p className="text-sm sm:text-base leading-relaxed text-gray-600">
          On August 3, 1997, Bro. Bo established The Feast, a Sunday prayer gathering with Holy Mass, lively
          worship, and series of talks on practical Christian Living.
        </p>
        <p className="text-sm sm:text-base leading-relaxed text-gray-500 mt-3">
          In 2009, Bro. Bo, following leading from the Lord, assigned Feast Builders. Today, there are now over
          400 Feasts and counting, and the Light of Jesus Family already counts more than 20,000 committed
          members in the Philippines and more in key areas in Asia, Oceania, Middle East, Canada, United States
          of America, and the Bahamas.
        </p>
      </>
    ),
  },
  {
    id: 5,
    imageLink: 'https://feastlight.com/wp-content/uploads/2022/01/LOJ-TODAY.jpg',
    imageRight: false,
    content: (
      <>
        <p className="text-sm sm:text-base leading-relaxed text-gray-600">
          Today, the Light of Jesus Family is organized into three Regions, with each Region autonomous from
          each other. These are Mega Manila, Provincial and International.
        </p>
        <p className="text-sm sm:text-base leading-relaxed text-gray-500 mt-3">
          Supporting the Chief Presiding Elder (Regional Builder) is a Regional Council, composed of District
          Builders and Other Builders, appointed by the Regional Builder.
        </p>
        <p className="text-sm sm:text-base leading-relaxed text-gray-500 mt-3">
          Under the regions are Districts that are also autonomous from each other. A District has several live
          Feasts (headed by a Feast Builder) and Feast Light (headed by a Feast Emissary).
        </p>
      </>
    ),
  },
]

function AboutRow({ section }) {
  const { imageLink, imageRight, content } = section

  const imageBlock = (
    <div
      className="w-full md:w-1/2 min-h-[260px] sm:min-h-[320px] bg-contain bg-center bg-no-repeat bg-gray-100"
      style={{ backgroundImage: `url(${imageLink})` }}
    />
  )

  const textBlock = (
    <div className="w-full md:w-1/2 bg-white flex items-center p-8 sm:p-10 lg:p-14 min-h-[260px] sm:min-h-[320px]">
      <div>{content}</div>
    </div>
  )

  return (
    <AnimatedSection>
      <div className={`flex flex-col ${imageRight ? 'md:flex-row-reverse' : 'md:flex-row'} rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(255,75,75,0.15)]`}>
        {imageBlock}
        {textBlock}
      </div>
    </AnimatedSection>
  )
}

export default function AboutSection({ cards }) {
  return (
    <section id="about" className="py-24 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <AnimatedSection className="mb-14">
          <div className="section-label text-center text-5xl">Who We Are</div>
        </AnimatedSection>

        {/* Alternating Rows */}
        <div className="flex flex-col gap-6">
          {sections.map((section) => (
            <AboutRow key={section.id} section={section} />
          ))}
        </div>

      </div>
    </section>
  )
}
