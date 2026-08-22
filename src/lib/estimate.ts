import { openings, showerFormula, showerPricing } from '@/data/site'
import type { OpeningCounts } from './booking'

/**
 * Estimation à partir des compteurs du formulaire.
 *
 * Tout est tarifé à la pièce : aucune surface à saisir, donc aucun calcul
 * approximatif à faire par le visiteur. Le résultat est un plancher — il est
 * présenté partout comme « à partir de », jamais comme un devis.
 *
 * Chaque ligne porte une fourchette plutôt qu'un montant unique. Les vitres et
 * la douche ont deux forfaits indépendants : un client peut vouloir Premium sur
 * ses fenêtres et Excellence sur sa douche. Tant qu'un forfait n'est pas
 * choisi, la ligne correspondante s'étend de Premium à Excellence ; dès qu'il
 * l'est, elle se resserre sur un seul prix.
 */

/** Forfaits chiffrables. Signature en est exclu : il passe par devis. */
export type Tier = 'premium' | 'excellence'

/** Montant borné. `min === max` dès que le forfait de la ligne est connu. */
export type Range = { min: number; max: number }

export type EstimateLine = {
  id: string
  label: string
  quantity: number
  amount: Range
}

export type Estimate = {
  lines: EstimateLine[]
  total: Range
  /** Nombre d'ouvrants comptés, douche exclue. */
  itemCount: number
  /** Vrai quand tous les forfaits utiles sont choisis : un seul montant. */
  exact: boolean
}

export function isTier(value: string): value is Tier {
  return value === 'premium' || value === 'excellence'
}

/** Signature ne se chiffre pas en ligne : il n’a pas de grille par ouvrant. */
export function isQuoteOnly(pack: string): boolean {
  return pack === 'signature'
}

/** Prix d'une ligne : figé si le forfait est connu, étendu sinon. */
function priceFor(prices: { premium: number; excellence: number }, tier: Tier | null): Range {
  return tier
    ? { min: prices[tier], max: prices[tier] }
    : { min: prices.premium, max: prices.excellence }
}

export function estimate({
  counts,
  tier,
  shower,
  showerFormulaId,
  travelFeeEur = 0,
}: {
  counts: OpeningCounts
  /** Forfait retenu pour les vitres, null tant qu'il n'est pas choisi. */
  tier: Tier | null
  shower: boolean
  /** Formule retenue pour la douche, indépendante du forfait des vitres. */
  showerFormulaId: string | null
  /** Forfait déplacement à intégrer au total, 0 si la zone est offerte. */
  travelFeeEur?: number
}): Estimate {
  const lines: EstimateLine[] = []
  let min = 0
  let max = 0
  let itemCount = 0

  for (const opening of openings) {
    const quantity = counts[opening.id] ?? 0
    if (quantity <= 0) continue

    const unit = priceFor(opening, tier)
    const amount = { min: unit.min * quantity, max: unit.max * quantity }

    lines.push({ id: opening.id, label: opening.label, quantity, amount })
    min += amount.min
    max += amount.max
    itemCount += quantity
  }

  if (shower) {
    const chosen = showerFormula(showerFormulaId ?? '')
    const prices = showerPricing.formulas.map((f) => f.price)
    const amount = chosen
      ? { min: chosen.price, max: chosen.price }
      : { min: Math.min(...prices), max: Math.max(...prices) }

    lines.push({
      id: showerPricing.id,
      label: chosen ? `${showerPricing.label} · ${chosen.name}` : showerPricing.label,
      quantity: 1,
      amount,
    })
    min += amount.min
    max += amount.max
  }

  if (travelFeeEur > 0) {
    const amount = { min: travelFeeEur, max: travelFeeEur }
    lines.push({ id: 'travel', label: 'Déplacement', quantity: 1, amount })
    min += amount.min
    max += amount.max
  }

  return { lines, total: { min, max }, itemCount, exact: min === max }
}
