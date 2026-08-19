import { AnimatePresence, motion } from 'framer-motion'
import { travelFee } from '@/data/site'
import { MAX_RADIUS_KM } from '@/lib/geo'
import type { TravelState } from '@/lib/useTravelZone'

/**
 * Badge de zone affiché sous le code postal.
 * `unknown` et `idle` ne rendent rien : une commune introuvable ne doit pas
 * ressembler à une erreur de saisie, le devis reste possible dans tous les cas.
 */
export default function TravelBadge({ state }: { state: TravelState }) {
  if (state.status === 'idle' || state.status === 'unknown') return null

  if (state.status === 'loading') {
    return (
      <p className="mt-2 flex items-center gap-2 text-xs text-cream-dim">
        <span
          aria-hidden
          className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-cream-dim/60"
        />
        Vérification de la zone…
      </p>
    )
  }

  const { km, zone } = state
  const rounded = Math.round(km)

  const config = {
    free: {
      dot: 'bg-emerald-400',
      ring: 'border-emerald-400/40 bg-emerald-400/[0.08]',
      text: 'text-emerald-300',
      label: 'Déplacement offert',
    },
    fee: {
      dot: 'bg-amber-400',
      ring: 'border-amber-400/40 bg-amber-400/[0.08]',
      text: 'text-amber-300',
      label: `Forfait déplacement +${travelFee.fee} €`,
    },
    quote: {
      dot: 'bg-red-400',
      ring: 'border-red-400/40 bg-red-400/[0.08]',
      text: 'text-red-300',
      label: `Zone sur devis (> ${MAX_RADIUS_KM} km)`,
    },
  }[zone]

  return (
    <AnimatePresence mode="wait">
      <motion.p
        key={zone}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className={`mt-2 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${config.ring}`}
      >
        <span aria-hidden className={`h-2 w-2 shrink-0 rounded-full ${config.dot}`} />
        <span className={config.text}>{config.label}</span>
        <span className="text-cream-dim">· à {rounded} km</span>
      </motion.p>
    </AnimatePresence>
  )
}
