import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { company, navLinks } from '@/data/site'
import { cn, scrollToId } from '@/lib/utils'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Bloque le scroll de fond quand le menu plein écran est ouvert.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const go = (href: string) => {
    setOpen(false)
    // Laisse le menu se fermer avant de scroller, sinon le body est encore figé.
    window.setTimeout(() => scrollToId(href), 120)
  }

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-all duration-500',
          scrolled || open
            ? 'border-b border-ink-line bg-ink/90 backdrop-blur-md'
            : 'border-b border-transparent bg-transparent',
        )}
      >
        <div className="container-lux flex h-16 items-center justify-between sm:h-20">
          <a
            href="#accueil"
            onClick={(e) => {
              e.preventDefault()
              go('#accueil')
            }}
            className="group flex items-center gap-3"
          >
            {/* h-9 = 36 px, sous la limite de 40 px demandée sur mobile.
                width/height explicites : évitent le décalage de mise en page
                pendant le chargement de l’image. */}
            <img
              src="/logo.png"
              alt=""
              width={256}
              height={172}
              className="h-8 w-auto sm:h-9"
              decoding="async"
            />
            <span className="flex flex-col leading-none">
              <span className="font-display text-2xl tracking-tight text-cream">
                {company.name}
              </span>
              <span className="mt-1 hidden text-[10px] uppercase tracking-widest2 text-gold sm:inline">
                {company.fullName}
              </span>
            </span>
          </a>

          <nav className="hidden items-center gap-8 lg:flex">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={(e) => {
                  e.preventDefault()
                  go(l.href)
                }}
                className="text-sm text-cream-dim transition hover:text-gold"
              >
                {l.label}
              </a>
            ))}
            <a href={company.phoneHref} className="btn-gold !px-6 !py-2.5">
              {company.phone}
            </a>
          </nav>

          <button
            type="button"
            aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="relative z-50 flex h-11 w-11 flex-col items-center justify-center gap-[5px] lg:hidden"
          >
            <span
              className={cn(
                'block h-px w-6 bg-cream transition-all duration-300',
                open && 'translate-y-[6px] rotate-45',
              )}
            />
            <span
              className={cn('block h-px w-6 bg-cream transition-all duration-300', open && 'opacity-0')}
            />
            <span
              className={cn(
                'block h-px w-6 bg-cream transition-all duration-300',
                open && '-translate-y-[6px] -rotate-45',
              )}
            />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-ink/98 backdrop-blur-xl lg:hidden"
          >
            <div className="container-lux flex h-full flex-col justify-center pb-16">
              <nav className="flex flex-col gap-1">
                {navLinks.map((l, i) => (
                  <motion.a
                    key={l.href}
                    href={l.href}
                    onClick={(e) => {
                      e.preventDefault()
                      go(l.href)
                    }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 + i * 0.06, duration: 0.4 }}
                    className="border-b border-ink-line py-5 font-display text-3xl text-cream transition hover:text-gold"
                  >
                    {l.label}
                  </motion.a>
                ))}
              </nav>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="mt-10 flex flex-col gap-3"
              >
                <a href={company.phoneHref} className="btn-gold w-full">
                  Appeler le {company.phone}
                </a>
                <a href={`mailto:${company.email}`} className="btn-ghost w-full">
                  {company.email}
                </a>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
