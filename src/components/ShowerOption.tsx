import { motion } from 'framer-motion'
import { showerOption as opt } from '@/data/site'
import { euros, scrollToId } from '@/lib/utils'
import Reveal from './Reveal'

/**
 * Prestation complémentaire, volontairement présentée différemment des deux
 * forfaits : bandeau large plutôt que troisième colonne, pour qu'elle ne se
 * lise pas comme une offre concurrente.
 *
 * Les deux prix correspondent aux deux forfaits, pas à deux options séparées :
 * Premium nettoie, Excellence nettoie et protège. C'est ce que calcule
 * l'estimation, donc c'est ce qu'annonce la carte.
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

        <div className="relative grid gap-8 lg:grid-cols-5 lg:gap-10">
          <div className="lg:col-span-3">
            <span className="rounded-full border border-gold/40 px-3 py-1 text-[10px] font-medium uppercase tracking-widest2 text-gold">
              Option complémentaire
            </span>

            <h3 className="mt-5 font-display text-3xl text-cream sm:text-4xl">{opt.name}</h3>
            <p className="mt-2 text-sm text-cream-dim">{opt.tagline}</p>

            <p className="mt-6 text-sm leading-relaxed text-cream-dim">{opt.pitch}</p>
          </div>

          <div className="lg:col-span-2">
            <div className="space-y-3">
              <TierCard
                name="Premium"
                price={opt.premium}
                subtitle="Nettoyage complet"
                features={opt.premiumFeatures}
              />
              <TierCard
                name="Excellence"
                price={opt.excellence}
                subtitle="Nettoyage + traitement nano hydrophobe"
                features={opt.excellenceFeatures}
                highlighted
                badge={`Protection estimée : ${opt.protectionMonths} mois`}
              />
            </div>

            <button
              type="button"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('lms:add-shower'))
                scrollToId('#reservation')
              }}
              className="btn-ghost mt-4 w-full"
            >
              Ajouter à ma demande
            </button>

            <p className="mt-4 text-[11px] leading-relaxed text-cream-dim">
              Prix pour la douche complète, en complément d’un forfait. Le tarif suit le forfait
              choisi pour l’intervention.
            </p>
          </div>
        </div>

        <p className="relative mt-7 border-t border-ink-line pt-5 text-xs leading-relaxed text-cream-dim">
          {opt.note}
        </p>
      </motion.article>
    </Reveal>
  )
}

function TierCard({
  name,
  price,
  subtitle,
  features,
  highlighted = false,
  badge,
}: {
  name: string
  price: number
  subtitle: string
  features: readonly string[]
  highlighted?: boolean
  badge?: string
}) {
  return (
    <div
      className={`rounded-2xl border bg-ink-soft p-5 ${
        highlighted ? 'border-gold/40' : 'border-ink-line'
      }`}
    >
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-[10px] uppercase tracking-widest2 text-cream-dim">{name}</span>
        <span
          className={`font-display text-2xl ${highlighted ? 'text-gold' : 'text-cream'}`}
        >
          {euros(price)}
        </span>
      </div>

      <p className="mt-1.5 text-sm text-cream">{subtitle}</p>

      <ul className="mt-3 space-y-1.5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-xs text-cream-dim">
            <svg aria-hidden viewBox="0 0 20 20" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold">
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

      {badge && (
        <p className="mt-3 flex items-center gap-2 rounded-lg border border-gold/25 bg-gold/[0.06] px-3 py-2 text-[11px] text-cream">
          <span aria-hidden className="text-gold">
            ◆
          </span>
          {badge}
        </p>
      )}
    </div>
  )
}
