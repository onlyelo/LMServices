import {
  company,
  openings,
  packs,
  showerOption,
  showerPricing,
  type OpeningId,
} from '@/data/site'

/**
 * Modèle de la demande de devis et mise en forme du message.
 * Ce fichier ne connaît aucun canal d'envoi : e-mail, WhatsApp ou une API
 * future consomment tous la même charge utile et le même formatage.
 */

export type OpeningCounts = Record<OpeningId, number>

export const emptyCounts: OpeningCounts = {
  standard: 0,
  double: 0,
  porteFenetre: 0,
  velux: 0,
  baie: 0,
}

export type BookingPayload = {
  name: string
  phone: string
  email?: string
  address: string
  postalCode: string
  city: string
  housing: string
  counts: OpeningCounts
  pack: string
  shower: boolean
  date: string
  message?: string
  /** Noms des fichiers sélectionnés — le contenu n'est pas transmis. */
  photoNames: string[]
  acceptedTerms: boolean
}

/** Détail de l’option douche, tarif inclus, selon le forfait retenu. */
export function showerDetail(v: { shower: boolean; pack: string }): string {
  if (!v.shower) return 'non'
  return v.pack === 'excellence'
    ? `oui — ${showerPricing.excellence} € avec traitement nano hydrophobe`
    : `oui — ${showerPricing.premium} € nettoyage complet`
}

export function totalOpenings(counts: OpeningCounts): number {
  return Object.values(counts).reduce((sum, n) => sum + n, 0)
}

export function packLabel(id: string): string {
  return packs.find((p) => p.id === id)?.name ?? id
}

/** Date ISO (aaaa-mm-jj) → format lisible en français. */
export function frDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}

/** « 4 fenêtres standard, 2 baies vitrées » — types à zéro ignorés. */
export function countsSummary(counts: OpeningCounts): string {
  const parts = openings
    .filter((o) => counts[o.id] > 0)
    .map((o) => `${counts[o.id]} × ${o.label}`)
  return parts.length > 0 ? parts.join(', ') : 'aucun ouvrant renseigné'
}

/**
 * Corps du message, en lignes.
 * Utilisé tel quel par WhatsApp et par le repli mailto ; EmailJS reprend les
 * mêmes valeurs sous forme de variables de template.
 */
export function buildMessageLines(v: BookingPayload): string[] {
  const lines = [
    `Demande de devis — Forfait ${packLabel(v.pack)}`,
    '',
    `Nom : ${v.name}`,
    `Téléphone : ${v.phone}`,
  ]

  if (v.email) lines.push(`E-mail : ${v.email}`)

  lines.push(
    `Adresse : ${v.address}, ${v.postalCode} ${v.city}`,
    `Type de logement : ${v.housing}`,
    '',
    'Ouvrants à traiter :',
  )

  for (const o of openings) {
    if (v.counts[o.id] > 0) {
      lines.push(`  • ${o.label} : ${v.counts[o.id]}`)
    }
  }
  lines.push(`  Total : ${totalOpenings(v.counts)} ouvrant(s)`)

  lines.push(
    '',
    `Forfait souhaité : ${packLabel(v.pack)}`,
    `Option ${showerOption.name} : ${showerDetail(v)}`,
    `Date souhaitée : ${frDate(v.date)}`,
  )

  if (v.photoNames.length > 0) {
    lines.push(
      '',
      `Photos jointes par le client (${v.photoNames.length}) :`,
      ...v.photoNames.map((n) => `  • ${n}`),
      '→ à envoyer directement dans la conversation.',
    )
  }

  lines.push('', 'Message :', v.message?.trim() || '(aucun)')

  lines.push(
    '',
    v.acceptedTerms
      ? 'Conditions d’annulation acceptées via le formulaire.'
      : 'Conditions d’annulation NON acceptées.',
    '—',
    `Envoyé depuis le site ${company.name} — ${company.fullName}`,
  )

  return lines
}

export function buildPlainMessage(v: BookingPayload): string {
  return buildMessageLines(v).join('\n')
}

export function buildSubject(v: BookingPayload): string {
  return `Demande de devis — Forfait ${packLabel(v.pack)} — ${v.name}`
}
