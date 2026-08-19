import { motion } from 'framer-motion'
import { showerOption as opt } from '@/data/site'
import { euros, scrollToId } from '@/lib/utils'
import Reveal from './Reveal'

/**
 * Option complémentaire, présentée au même gabarit que les forfaits pour tenir
 * dans la grille à trois colonnes — mais bordée d'or et badgée, pour qu'elle
 * ne se lise pas comme un troisième forfait concurrent.
 *
 * Les deux prix correspondent aux deux forfaits, pas à deux options séparées :
 * Premium nettoie, Excellence nettoie et protège. C'est ce que calcule
 * l'estimation, donc c'est ce qu'annonce la carte.
 */
export default function ShowerOption() {
  return (
    <Reveal className="h-full">
      <motion.article
        whileHover={{ y: -6 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="card-lux relative flex h-full flex-col overflow-hidden p-7"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_100%_0%,rgba(201,162,74,0.09),transparent_60%)]"
        />

        <div className="relative flex h-full flex-col">
          <header>
            <span className="text-[10px] uppercase tracking-widest2 text-gold">
              Option complémentaire
            </span>
            <h3 className="mt-2 font-display text-3xl text-cream">{opt.name}</h3>
            <p className="mt-2 text-sm text-cream-dim">{opt.tagline}</p>
          </header>

          <div className="mt-6 border-y border-ink-line py-5">
            <div className="flex items-end gap-2">
              <span className="font-display text-4xl leading-none text-gold">
                {euros(opt.premium)}
              </span>
              <span className="pb-0.5 text-sm text-cream-dim">en Premium</span>
            </div>
            <p className="mt-2 text-sm text-cream-dim">
              <span className="text-cream">{euros(opt.excellence)}</span> en Excellence, traitement
              nano hydrophobe compris
            </p>
          </div>

          <p className="mt-5 text-sm leading-relaxed text-cream-dim">{opt.pitch}</p>

          <ul className="mt-6 space-y-2.5">
            {[...opt.premiumFeatures, ...opt.excellenceFeatures.slice(1)].map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm text-cream/90">
                <svg aria-hidden viewBox="0 0 20 20" className="mt-0.5 h-4 w-4 shrink-0 text-gold">
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

          <div className="mt-auto pt-6">
            <p className="flex items-center gap-2 rounded-xl border border-gold/25 bg-gold/[0.06] px-4 py-3 text-xs text-cream">
              <span aria-hidden className="text-gold">
                ◆
              </span>
              Protection estimée : {opt.protectionMonths} mois
            </p>
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
          </div>
        </div>
      </motion.article>
    </Reveal>
  )
}
