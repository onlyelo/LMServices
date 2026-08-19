import { motion } from 'framer-motion'
import { packs, pricingNotes } from '@/data/site'
import { cn, euros, scrollToId } from '@/lib/utils'
import Section from './Section'
import Reveal from './Reveal'
import ShowerOption from './ShowerOption'

/** Pré-sélectionne le forfait dans le formulaire avant d'y faire défiler la page. */
function choosePack(id: string) {
  window.dispatchEvent(new CustomEvent('lms:select-pack', { detail: id }))
  scrollToId('#reservation')
}

export default function Services() {
  return (
    <Section
      id="forfaits"
      eyebrow="Nos forfaits"
      title={
        <>
          Deux niveaux d’exigence.
          <br />
          <span className="text-cream-dim">Aucun compromis sur le résultat.</span>
        </>
      }
      intro="Le tarif dépend du nombre et du type d’ouvrants à traiter."
    >
      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        {packs.map((p, i) => (
          <Reveal key={p.id} delay={i * 0.05}>
            <motion.article
              whileHover={{ y: -6 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className={cn(
                'card-lux relative flex h-full flex-col p-7 sm:p-9',
                p.featured && 'border-gold/45 shadow-goldglow',
              )}
            >
              {p.featured && (
                <span className="absolute -top-3 left-7 rounded-full bg-gold px-3.5 py-1 text-[10px] font-semibold uppercase tracking-widest2 text-ink">
                  Le plus demandé
                </span>
              )}

              <header>
                <h3 className="font-display text-3xl text-cream sm:text-4xl">{p.name}</h3>
                <p className="mt-2 text-sm text-cream-dim">{p.subtitle}</p>
              </header>

              {/* Le prix unitaire est la vraie unite de facturation : il est affiche
                  en valeur principale pour ne pas laisser croire a un forfait minimum. */}
              <div className="mt-7 border-y border-ink-line py-6">
                <div className="flex items-end gap-2">
                  <span className="font-display text-5xl leading-none text-gold">
                    {euros(p.perWindow)}
                  </span>
                  <span className="pb-1 text-sm text-cream-dim">par fenêtre</span>
                </div>
              </div>

              <p className="mt-6 text-sm leading-relaxed text-cream-dim">{p.pitch}</p>

              <ul className="mt-7 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-cream/90">
                    <svg
                      aria-hidden
                      viewBox="0 0 20 20"
                      className={cn('mt-0.5 h-4 w-4 shrink-0', p.featured ? 'text-gold' : 'text-gold/70')}
                    >
                      <path
                        d="M4 10.5l4 4 8-9"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-7 rounded-xl border border-ink-line bg-ink-soft px-4 py-3 text-xs text-cream-dim">
                {p.highlight}
              </p>

              <div className="mt-7 pt-1">
                <button
                  type="button"
                  onClick={() => choosePack(p.id)}
                  className={cn('w-full', p.featured ? 'btn-gold' : 'btn-ghost')}
                >
                  Choisir {p.name}
                </button>
              </div>
            </motion.article>
          </Reveal>
        ))}
      </div>

      <div className="mt-6">
        <ShowerOption />
      </div>

      <Reveal delay={0.05}>
        <ul className="mt-10 grid gap-2.5 text-xs text-cream-dim sm:grid-cols-2">
          {pricingNotes.map((n) => (
            <li key={n} className="flex gap-2.5">
              <span className="text-gold" aria-hidden>
                —
              </span>
              <span>{n}</span>
            </li>
          ))}
        </ul>
      </Reveal>
    </Section>
  )
}
