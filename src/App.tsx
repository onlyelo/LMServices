import { lazy, Suspense } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import Services from './components/Services'
import Testimonials from './components/Testimonials'
import Faq from './components/Faq'
import Footer from './components/Footer'
import CallBar from './components/CallBar'

/**
 * Les deux sections les plus lourdes sortent du bundle initial : Zone embarque
 * Leaflet, Booking embarque Zod, React Hook Form et canvas-confetti. Le hero et
 * les forfaits — ce que le visiteur voit en premier — ne dépendent plus de leur
 * téléchargement.
 */
const Zone = lazy(() => import('./components/Zone'))
const Booking = lazy(() => import('./components/Booking'))

/**
 * Les substituts portent l'`id` de la section qu'ils remplacent : sans cela,
 * un clic sur « Réserver maintenant » avant la fin du chargement ne trouverait
 * aucune ancre `#reservation` vers laquelle défiler.
 */
function SectionFallback({ id }: { id: string }) {
  return (
    <section id={id} className="scroll-mt-20 py-20 sm:py-28">
      <div className="container-lux">
        <div className="h-96 animate-pulse rounded-2xl bg-gold/5" />
      </div>
    </section>
  )
}

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Services />
        <Suspense fallback={<SectionFallback id="zone" />}>
          <Zone />
        </Suspense>
        <Testimonials />
        <Suspense fallback={<SectionFallback id="reservation" />}>
          <Booking />
        </Suspense>
        <Faq />
      </main>
      <Footer />
      <CallBar />
    </>
  )
}
