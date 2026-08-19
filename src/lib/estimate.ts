import { openings, showerPricing } from '@/data/site'
import type { OpeningCounts } from './booking'

/**
 * Estimation à partir des compteurs du formulaire.
 *
 * Tout est tarifé à la pièce : aucune surface à saisir, donc aucun calcul
 * approximatif à faire par le visiteur. Le résultat est un plancher — il est
 * présenté partout comme « à partir de », jamais comme un devis.
 */

export type Tier = 'premium' | 'excellence'

export type EstimateLine = {
  id: string
  label: string
  quantity: number
  unitPrice: number
  total: number
}

export type Estimate = {
  lines: EstimateLine[]
  total: number
  /** Nombre d'ouvrants comptés, douche exclue. */
  itemCount: number
}

export function isTier(value: string): value is Tier {
  return value === 'premium' || value === 'excellence'
}

export function estimate(
  counts: OpeningCounts,
  shower: boolean,
  tier: Tier,
  /** Forfait déplacement à intégrer au total, 0 si la zone est offerte. */
  travelFeeEur = 0,
): Estimate {
  const lines: EstimateLine[] = []
  let total = 0
  let itemCount = 0

  for (const opening of openings) {
    const quantity = counts[opening.id] ?? 0
    if (quantity <= 0) continue

    const unitPrice = opening[tier]
    const lineTotal = quantity * unitPrice
    lines.push({
      id: opening.id,
      label: opening.label,
      quantity,
      unitPrice,
      total: lineTotal,
    })
    total += lineTotal
    itemCount += quantity
  }

  if (shower) {
    const unitPrice = showerPricing[tier]
    lines.push({
      id: showerPricing.id,
      // Excellence inclut le traitement, Premium non : le libellé le dit.
      label:
        tier === 'excellence'
          ? `${showerPricing.label} + traitement nano`
          : showerPricing.label,
      quantity: 1,
      unitPrice,
      total: unitPrice,
    })
    total += unitPrice
  }

  if (travelFeeEur > 0) {
    lines.push({
      id: 'travel',
      label: 'Déplacement',
      quantity: 1,
      unitPrice: travelFeeEur,
      total: travelFeeEur,
    })
    total += travelFeeEur
  }

  return { lines, total, itemCount }
}

/**
 * Quand aucun forfait n'est encore choisi, les deux sont calculés pour
 * afficher une fourchette : le visiteur voit l'écart entre les niveaux avant
 * de trancher, plutôt qu'un chiffre sorti d'un forfait qu'il n'a pas choisi.
 */
export function estimateRange(counts: OpeningCounts, shower: boolean, travelFeeEur = 0) {
  return {
    premium: estimate(counts, shower, 'premium', travelFeeEur),
    excellence: estimate(counts, shower, 'excellence', travelFeeEur),
  }
}
