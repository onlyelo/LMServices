import type { BookingPayload } from './booking'
import { sendViaTelegram, type SpamGuard } from './telegram'

/**
 * Point d'entrée unique du formulaire.
 * Un seul canal actif : le backend, qui relaie vers Telegram. Ajouter un
 * transport se fait ici, sans toucher à l'interface.
 */

export async function submitBooking(
  payload: BookingPayload,
  files: File[] = [],
  guard?: SpamGuard,
): Promise<void> {
  await sendViaTelegram(payload, files, guard)
}
