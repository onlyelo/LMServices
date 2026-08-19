import { openings } from '@/data/site'
import type { OpeningCounts } from '@/lib/booking'
import { cn } from '@/lib/utils'
import OpeningIcon from './OpeningIcon'

/**
 * Compteurs +/- par type d'ouvrant.
 * Les boutons sont dimensionnés pour le pouce (44 px) et le nombre est rendu
 * en `aria-live` : le lecteur d'écran annonce la nouvelle valeur sans que le
 * focus quitte le bouton.
 */
export default function OpeningCounter({
  counts,
  onChange,
}: {
  counts: OpeningCounts
  /**
   * Reçoit une fonction de mise à jour, jamais un objet figé : deux appuis
   * rapprochés sur le même bouton doivent s’additionner, or la valeur capturée
   * dans la closure du rendu est encore l’ancienne au second appui.
   */
  onChange: (update: (prev: OpeningCounts) => OpeningCounts) => void
}) {
  const bump = (id: keyof OpeningCounts, delta: number) => {
    onChange((prev) => ({ ...prev, [id]: Math.max(0, (prev[id] ?? 0) + delta) }))
  }

  return (
    <ul className="divide-y divide-ink-line rounded-xl border border-ink-line bg-ink-soft">
      {openings.map((o) => {
        const value = counts[o.id] ?? 0
        return (
          <li key={o.id} className="flex items-center gap-3 p-3 sm:gap-4 sm:p-4">
            <span
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border transition',
                value > 0
                  ? 'border-gold/50 bg-gold/[0.08] text-gold'
                  : 'border-ink-line bg-ink text-cream-dim',
              )}
            >
              <OpeningIcon id={o.id} className="h-5 w-5" />
            </span>

            <span className="min-w-0 flex-1">
              <span className="block text-sm text-cream">{o.label}</span>
              <span className="mt-0.5 block text-xs text-cream-dim">{o.hint}</span>
            </span>

            <span className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => bump(o.id, -1)}
                disabled={value === 0}
                aria-label={`Retirer une ${o.label}`}
                className="flex h-11 w-11 items-center justify-center rounded-lg border border-ink-line text-lg text-cream transition hover:border-gold hover:text-gold disabled:opacity-30 disabled:hover:border-ink-line disabled:hover:text-cream"
              >
                <span aria-hidden>−</span>
              </button>

              <output
                aria-live="polite"
                aria-label={`${o.label} : ${value}`}
                className={cn(
                  'w-9 text-center font-display text-xl tabular-nums',
                  value > 0 ? 'text-gold' : 'text-cream-dim',
                )}
              >
                {value}
              </output>

              <button
                type="button"
                onClick={() => bump(o.id, 1)}
                aria-label={`Ajouter une ${o.label}`}
                className="flex h-11 w-11 items-center justify-center rounded-lg border border-ink-line text-lg text-cream transition hover:border-gold hover:text-gold"
              >
                <span aria-hidden>+</span>
              </button>
            </span>
          </li>
        )
      })}
    </ul>
  )
}
