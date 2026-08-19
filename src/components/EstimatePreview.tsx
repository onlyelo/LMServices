import { AnimatePresence, motion } from 'framer-motion'
import { parkingNotice, serviceBase, travelFee } from '@/data/site'
import type { OpeningCounts } from '@/lib/booking'
import { estimate, estimateRange, isTier } from '@/lib/estimate'
import { MAX_RADIUS_KM } from '@/lib/geo'
import type { TravelState } from '@/lib/useTravelZone'
import { euros } from '@/lib/utils'

/**
 * Estimation en direct, sous les compteurs du formulaire.
 * Volontairement présentée comme un plancher : le montant est toujours
 * introduit par « à partir de », et la mention du devis définitif reste
 * visible même quand le chiffre est affiché.
 */
export default function EstimatePreview({
  counts,
  shower,
  pack,
  travel,
}: {
  counts: OpeningCounts
  shower: boolean
  pack: string
  travel: TravelState
}) {
  const tier = isTier(pack) ? pack : null

  // Le forfait déplacement n'entre dans le total que si la commune est
  // effectivement localisée dans la couronne 25–50 km.
  const appliedTravelFee = travel.status === 'ok' && travel.zone === 'fee' ? travelFee.fee : 0

  const range = estimateRange(counts, shower, appliedTravelFee)
  const result = tier ? estimate(counts, shower, tier, appliedTravelFee) : range.premium
  const isEmpty = result.lines.length === 0

  return (
    <div className="relative overflow-hidden rounded-xl border border-gold/35 bg-gradient-to-b from-gold/[0.09] to-ink-soft p-5 sm:p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_100%_0%,rgba(201,162,74,0.12),transparent_60%)]"
      />

      <div className="relative">
        <p className="eyebrow">Estimation approximative</p>

        <div aria-live="polite" className="mt-3">
          {isEmpty ? (
            <p className="text-sm text-cream-dim">
              Renseignez vos ouvrants pour obtenir une estimation.
            </p>
          ) : tier ? (
            <p className="flex flex-wrap items-baseline gap-x-2">
              <span className="text-sm text-cream-dim">À partir de</span>
              <span className="font-display text-4xl leading-none text-gold sm:text-5xl">
                {euros(result.total)}
              </span>
            </p>
          ) : (
            <>
              <p className="flex flex-wrap items-baseline gap-x-2">
                <span className="text-sm text-cream-dim">Entre</span>
                <span className="font-display text-3xl leading-none text-gold sm:text-4xl">
                  {euros(range.premium.total)}
                </span>
                <span className="text-sm text-cream-dim">et</span>
                <span className="font-display text-3xl leading-none text-gold sm:text-4xl">
                  {euros(range.excellence.total)}
                </span>
              </p>
              <p className="mt-2 text-xs text-cream-dim">
                Choisissez un forfait ci-dessous pour affiner le montant.
              </p>
            </>
          )}
        </div>

        <AnimatePresence initial={false}>
          {!isEmpty && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <ul className="mt-5 space-y-2 border-t border-gold/20 pt-4">
                {result.lines.map((line) => {
                  // Le déplacement est un montant fixe : il ne varie pas d'un
                  // forfait à l'autre et ne doit donc pas s'afficher en fourchette.
                  const isFlat = line.id === 'travel'
                  const high = range.excellence.lines.find((l) => l.id === line.id)?.total ?? 0

                  return (
                    <li key={line.id} className="flex items-baseline justify-between gap-4 text-xs">
                      <span className="text-cream-dim">
                        {!isFlat && <span className="text-cream">{line.quantity} × </span>}
                        {line.label}
                        {tier && !isFlat && (
                          <span className="text-cream-dim/70"> à {euros(line.unitPrice)}</span>
                        )}
                        {isFlat && (
                          <span className="text-cream-dim/70"> ({travelFee.freeRadiusKm}–{MAX_RADIUS_KM} km)</span>
                        )}
                      </span>
                      <span className="shrink-0 tabular-nums text-cream">
                        {tier || isFlat
                          ? euros(line.total)
                          : `${euros(line.total)} – ${euros(high)}`}
                      </span>
                    </li>
                  )
                })}
              </ul>

              <TravelNote travel={travel} />

              <p className="mt-2 text-[11px] leading-relaxed text-cream-dim">
                {parkingNotice.short}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="mt-4 border-t border-gold/20 pt-4 text-[11px] leading-relaxed text-cream-dim">
          Tarif indicatif — le devis définitif est établi après visite ou échange.
        </p>
      </div>
    </div>
  )
}

/** Précision sur le déplacement, adaptée à ce que la géolocalisation a trouvé. */
function TravelNote({ travel }: { travel: TravelState }) {
  if (travel.status === 'ok') {
    if (travel.zone === 'free') {
      return (
        <p className="mt-4 text-xs text-emerald-300/90">
          Déplacement offert — votre commune est à moins de {travelFee.freeRadiusKm} km de{' '}
          {serviceBase.name}.
        </p>
      )
    }
    if (travel.zone === 'quote') {
      return (
        <p className="mt-4 text-xs text-cream-dim">
          Au-delà de {MAX_RADIUS_KM} km : intervention possible, déplacement à convenir sur devis.
        </p>
      )
    }
    return (
      <p className="mt-4 text-xs text-cream-dim">
        Forfait déplacement inclus dans l’estimation ci-dessus.
      </p>
    )
  }

  return (
    <p className="mt-4 text-xs text-cream-dim">
      + {euros(travelFee.fee)} de déplacement possible selon votre commune (offert jusqu’à{' '}
      {travelFee.freeRadiusKm} km de {serviceBase.name}).
    </p>
  )
}
