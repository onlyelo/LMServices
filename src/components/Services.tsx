import { motion } from 'framer-motion'
import { packs } from '@/data/site'
import { cn, euros, scrollToId } from '@/lib/utils'
import Section from './Section'
import Reveal from './Reveal'
import ShowerOption from './ShowerOption'

/** Pré-sélectionne le forfait dans le formulaire avant d'y faire défiler la page. */
function choosePack(id: string) {
  window.dispatchEvent(new CustomEvent('lms:select-pack', { detail: id }))
  scrollToId('#reservation')
}

/**
 * Trois offres alignées : l'option douche, puis les deux forfaits.
 *
 * En tablette la grille passe à deux colonnes et la dernière carte se centre
 * seule sur sa ligne, plutôt que de rester collée à gauche.
 */
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-7">
        <ShowerOption />

        {packs.map((p, i) => {
          const isLast = i === packs.length - 1
          return (
            <Reveal
              key={p.id}
              delay={(i + 1) * 0.05}
              className={cn(
                'h-full',
                isLast &&
                  'md:col-span-2 md:mx-auto md:w-full md:max-w-md lg:col-span-1 lg:max-w-none',
              )}
            >
              <motion.article
                whileHover={{ y: -6 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className={cn(
                  'card-lux relative flex h-full flex-col p-7',
                  p.featured && 'border-gold/45 shadow-goldglow',
                )}
              >
                {p.featured && (
                  <span className="absolute -top-3 left-7 rounded-full bg-gold px-3.5 py-1 text-[10px] font-semibold uppercase tracking-widest2 text-ink">
                    Le plus demandé
                  </span>
                )}

                <header>
                  <span className="text-[10px] uppercase tracking-widest2 text-cream-dim">
                    Forfait
                  </span>
                  <h3 className="mt-2 font-display text-3xl text-cream">{p.name}</h3>
                  <p className="mt-2 text-sm text-cream-dim">{p.subtitle}</p>
                </header>

                {/* Le prix unitaire est la vraie unité de facturation : il est
                    affiché en valeur principale pour ne pas laisser croire à un
                    forfait minimum. */}
                <div className="mt-6 border-y border-ink-line py-5">
                  <div className="flex items-end gap-2">
                    <span className="font-display text-4xl leading-none text-gold">
                      {euros(p.perWindow)}
                    </span>
                    <span className="pb-0.5 text-sm text-cream-dim">par fenêtre</span>
                  </div>
                </div>

                <p className="mt-5 text-sm leading-relaxed text-cream-dim">{p.pitch}</p>

                <ul className="mt-6 space-y-2.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-cream/90">
                      <svg
                        aria-hidden
                        viewBox="0 0 20 20"
                        className={cn(
                          'mt-0.5 h-4 w-4 shrink-0',
                          p.featured ? 'text-gold' : 'text-gold/70',
                        )}
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

                {/* mt-auto plaque le bas de carte : quelles que soient les
                    longueurs de listes, les boutons restent alignés. */}
                <div className="mt-auto pt-6">
                  <p className="rounded-xl border border-ink-line bg-ink-soft px-4 py-3 text-xs text-cream-dim">
                    {p.highlight}
                  </p>
                  <button
                    type="button"
                    onClick={() => choosePack(p.id)}
                    className={cn('mt-4 w-full', p.featured ? 'btn-gold' : 'btn-ghost')}
                  >
                    Choisir {p.name}
                  </button>
                </div>
              </motion.article>
            </Reveal>
          )
        })}
      </div>
    </Section>
  )
}
