import { motion } from 'framer-motion'
import { showerOption as opt, showerPricing } from '@/data/site'
import { euros, scrollToId } from '@/lib/utils'
import Reveal from './Reveal'

/**
 * Option complémentaire, placée sous les trois forfaits.
 *
 * Les deux formules sont présentées en vis-à-vis, à poids visuel égal : ce
 * n'est pas une montée en gamme mais un choix — nettoyer, ou nettoyer et
 * protéger. Seule la seconde est mise en avant, parce qu'elle porte le
 * traitement.
 */
export default function ShowerOption() {
  return (
    <Reveal delay={0.05}>
      <motion.article
        whileHover={{ y: -4 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="card-lux relative overflow-hidden p-7 sm:p-9"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_100%_0%,rgba(201,162,74,0.09),transparent_60%)]"
        />

        <div className="relative">
          <div className="max-w-2xl">
            <span className="rounded-full border border-gold/40 px-3 py-1 text-[10px] font-medium uppercase tracking-widest2 text-gold">
              Option complémentaire
            </span>

            <h3 className="mt-5 font-display text-3xl text-cream sm:text-4xl">{opt.name}</h3>
            <p className="mt-2 text-sm text-cream-dim">{opt.tagline}</p>
            <p className="mt-6 text-sm leading-relaxed text-cream-dim">{opt.pitch}</p>
          </div>

          {/* Les deux formules en opposition, jamais empilées au-delà du mobile. */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {showerPricing.formulas.map((formula, i) => {
              const featured = i === 1
              return (
                <div
                  key={formula.id}
                  className={`flex flex-col rounded-2xl border bg-ink-soft p-6 ${
                    featured ? 'border-gold/45' : 'border-ink-line'
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-sm font-medium text-cream">{formula.name}</span>
                    <span
                      className={`font-display text-3xl leading-none ${
                        featured ? 'text-gold' : 'text-cream'
                      }`}
                    >
                      {euros(formula.price)}
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-cream-dim">{formula.detail}</p>

                  <ul className="mt-4 space-y-2">
                    {formula.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-xs text-cream-dim">
                        <svg
                          aria-hidden
                          viewBox="0 0 20 20"
                          className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${
                            featured ? 'text-gold' : 'text-gold/70'
                          }`}
                        >
                          <path
                            d="M4 10.5l4 4 8-9"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  {featured && (
                    <p className="mt-4 flex items-center gap-2 rounded-lg border border-gold/25 bg-gold/[0.06] px-3 py-2 text-[11px] text-cream">
                      <span aria-hidden className="text-gold">
                        ◆
                      </span>
                      Protection estimée : {opt.protectionMonths} mois
                    </p>
                  )}
                </div>
              )
            })}
          </div>

          <ul className="mt-6 space-y-2 border-t border-ink-line pt-6">
            {opt.conditions.map((c) => (
              <li key={c} className="flex gap-2.5 text-xs leading-relaxed text-cream-dim">
                <span aria-hidden className="text-gold">
                  —
                </span>
                <span>{c}</span>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('lms:add-shower'))
              scrollToId('#reservation')
            }}
            className="btn-ghost mt-6 w-full sm:w-auto"
          >
            Ajouter à ma demande
          </button>

          <p className="mt-5 text-xs leading-relaxed text-cream-dim">{opt.note}</p>
        </div>
      </motion.article>
    </Reveal>
  )
}
