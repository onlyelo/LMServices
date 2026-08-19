import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { company, housingTypes, packs, serviceBase, showerOption } from '@/data/site'
import { cn, scrollToId } from '@/lib/utils'
import { emptyCounts, totalOpenings, type BookingPayload } from '@/lib/booking'
import { submitBooking } from '@/lib/submitBooking'
import { RateLimitError } from '@/lib/telegram'
import { FRENCH_PHONE, normalizePhone } from '@/lib/phone'
import { useTravelZone } from '@/lib/useTravelZone'
import Section from './Section'
import Reveal from './Reveal'
import OpeningCounter from './OpeningCounter'
import EstimatePreview from './EstimatePreview'
import TravelBadge from './TravelBadge'
import PhotoUpload from './PhotoUpload'
import SuccessOverlay from './SuccessOverlay'

const countsSchema = z.object({
  standard: z.number().int().min(0),
  double: z.number().int().min(0),
  porteFenetre: z.number().int().min(0),
  velux: z.number().int().min(0),
  baie: z.number().int().min(0),
})

const schema = z
  .object({
    name: z.string().trim().min(2, 'Indiquez votre nom.'),
    // Normalisé AVANT validation : la valeur qui sort du formulaire est donc
    // toujours au format national, quel que soit ce qui a été saisi.
    phone: z
      .string()
      .trim()
      .transform(normalizePhone)
      .refine((v) => FRENCH_PHONE.test(v), {
        message: 'Numéro invalide. Formats acceptés : 0X XX XX XX XX ou +33 X XX XX XX XX.',
      }),
    // Optionnel : le téléphone suffit à recontacter le client.
    email: z.union([z.literal(''), z.string().trim().email('Adresse e-mail invalide.')]),
    address: z.string().trim().min(5, 'Indiquez l’adresse de l’intervention.'),
    postalCode: z
      .string()
      .trim()
      .regex(/^\d{5}$/, 'Code postal à 5 chiffres.'),
    city: z.string().trim().min(2, 'Indiquez la ville.'),
    housing: z.string().min(1, 'Choisissez un type de logement.'),
    counts: countsSchema,
    pack: z.string().min(1, 'Choisissez un forfait.'),
    shower: z.boolean(),
    date: z.string().min(1, 'Choisissez une date souhaitée.'),
    message: z.string().trim().max(1200, '1200 caractères maximum.').optional(),
    acceptTerms: z.boolean(),
  })
  .refine((v) => totalOpenings(v.counts) > 0, {
    message: 'Indiquez au moins un ouvrant à traiter.',
    path: ['counts'],
  })
  .refine((v) => v.acceptTerms, {
    message: 'Vous devez accepter les conditions d’annulation.',
    path: ['acceptTerms'],
  })

type BookingValues = z.infer<typeof schema>

type Status =
  | { state: 'idle' }
  | { state: 'sent' }
  /** Le backend n’a pas répondu : on renvoie vers le téléphone. */
  | { state: 'error'; message: string }
  /** Quota journalier atteint : ce n’est pas une panne, le ton diffère. */
  | { state: 'quota'; message: string }

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return <p className="mt-1.5 text-xs text-red-400">{msg}</p>
}

export default function Booking() {
  const [status, setStatus] = useState<Status>({ state: 'idle' })
  const [photos, setPhotos] = useState<File[]>([])

  // Signaux anti-robot. Le champ piège reste hors de React Hook Form et hors
  // du schéma Zod : c’est un input natif que seule une machine remplit.
  const honeypotRef = useRef<HTMLInputElement>(null)
  const mountedAt = useRef(Date.now())

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BookingValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      address: '',
      postalCode: '',
      city: '',
      housing: '',
      counts: emptyCounts,
      pack: '',
      shower: false,
      date: '',
      message: '',
      acceptTerms: false,
    },
  })

  const counts = watch('counts')
  const shower = watch('shower')
  const pack = watch('pack')
  const postalCode = watch('postalCode')
  const city = watch('city')
  const total = totalOpenings(counts)

  // Géocodage débouncé du code postal : alimente le badge de zone et, le cas
  // échéant, le forfait déplacement ajouté à l’estimation.
  const travel = useTravelZone(postalCode, city)

  // Les boutons des cartes pré-remplissent forfait et option douche.
  useEffect(() => {
    const onSelect = (e: Event) => {
      const id = (e as CustomEvent<string>).detail
      if (id === 'premium' || id === 'excellence') {
        setValue('pack', id, { shouldValidate: true })
      }
    }
    const onShower = () => setValue('shower', true, { shouldValidate: true })
    window.addEventListener('lms:select-pack', onSelect)
    window.addEventListener('lms:add-shower', onShower)
    return () => {
      window.removeEventListener('lms:select-pack', onSelect)
      window.removeEventListener('lms:add-shower', onShower)
    }
  }, [setValue])

  const onSubmit = async (values: BookingValues) => {
    const payload: BookingPayload = {
      ...values,
      email: values.email || undefined,
      photoNames: photos.map((f) => f.name),
      acceptedTerms: values.acceptTerms,
    }

    try {
      await submitBooking(payload, photos, {
        website: honeypotRef.current?.value ?? '',
        elapsedMs: Date.now() - mountedAt.current,
      })
      setStatus({ state: 'sent' })
    } catch (err) {
      if (err instanceof RateLimitError) {
        setStatus({ state: 'quota', message: err.message })
        return
      }
      console.error('[LMS] échec de l’envoi du formulaire', err)
      setStatus({
        state: 'error',
        message: err instanceof Error ? err.message : 'Erreur inconnue.',
      })
    }
  }

  const closeSuccess = () => {
    reset()
    setPhotos([])
    setStatus({ state: 'idle' })
    // Le formulaire vidé, laisser le visiteur au milieu n’a plus de sens.
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
  }

  const today = new Date().toISOString().slice(0, 10)

  return (
    <Section id="reservation" eyebrow="Réservation" title="Demander un devis">
      <div className="grid gap-8 lg:grid-cols-5 lg:gap-12">
        <Reveal className="lg:col-span-3">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="card-lux p-6 sm:p-8">
            {/* Piège à robots. Sorti du flux plutôt que masqué par display:none :
                de nombreux robots ignorent délibérément les champs invisibles au
                sens CSS, mais remplissent ceux qui restent dans le DOM. Invisible
                au clavier (tabIndex -1) et aux lecteurs d’écran (aria-hidden). */}
            <div aria-hidden className="pointer-events-none absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden">
              <label htmlFor="website">Ne pas remplir ce champ</label>
              <input
                ref={honeypotRef}
                id="website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                defaultValue=""
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="min-w-0">
                <label className="label" htmlFor="name">
                  Nom et prénom
                </label>
                <input
                  id="name"
                  autoComplete="name"
                  className="field"
                  placeholder="Votre nom et prénom"
                  {...register('name')}
                />
                <FieldError msg={errors.name?.message} />
              </div>

              <div className="min-w-0">
                <label className="label" htmlFor="phone">
                  Téléphone
                </label>
                <input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  className="field"
                  placeholder="Votre numéro de téléphone"
                  {...register('phone')}
                />
                <FieldError msg={errors.phone?.message} />
              </div>

              <div className="min-w-0 sm:col-span-2">
                <label className="label" htmlFor="email">
                  E-mail <span className="normal-case tracking-normal">(facultatif)</span>
                </label>
                <input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  className="field"
                  placeholder="votre@email.com"
                  {...register('email')}
                />
                <FieldError msg={errors.email?.message} />
              </div>

              <div className="min-w-0 sm:col-span-2">
                <label className="label" htmlFor="address">
                  Adresse de l’intervention
                </label>
                <input
                  id="address"
                  autoComplete="street-address"
                  className="field"
                  placeholder="Votre adresse"
                  {...register('address')}
                />
                <FieldError msg={errors.address?.message} />
              </div>

              <div className="min-w-0">
                <label className="label" htmlFor="postalCode">
                  Code postal
                </label>
                <input
                  id="postalCode"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  maxLength={5}
                  className="field"
                  placeholder="Votre code postal"
                  {...register('postalCode')}
                />
                <FieldError msg={errors.postalCode?.message} />
                <TravelBadge state={travel} />
              </div>

              <div className="min-w-0">
                <label className="label" htmlFor="city">
                  Ville
                </label>
                <input
                  id="city"
                  autoComplete="address-level2"
                  className="field"
                  placeholder="Votre ville"
                  {...register('city')}
                />
                <FieldError msg={errors.city?.message} />
              </div>

              <div className="min-w-0 sm:col-span-2">
                <label className="label" htmlFor="housing">
                  Type de logement
                </label>
                <select id="housing" autoComplete="off" className="field" {...register('housing')}>
                  <option value="">Sélectionner…</option>
                  {housingTypes.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
                <FieldError msg={errors.housing?.message} />
              </div>

              <div className="min-w-0 sm:col-span-2">
                <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-2">
                  <span className="label !mb-0">Ouvrants à traiter</span>
                  <span className="text-xs text-cream-dim">
                    Total :{' '}
                    <span className={total > 0 ? 'text-gold' : 'text-cream-dim'}>{total}</span>
                  </span>
                </div>

                <OpeningCounter
                  counts={counts}
                  onChange={(update) =>
                    // getValues lit l’état courant du formulaire, pas la valeur
                    // capturée au rendu : les appuis rapides s’additionnent.
                    setValue('counts', update(getValues('counts')), { shouldValidate: true })
                  }
                />
                <FieldError msg={errors.counts?.message} />
                <p className="mt-2 text-xs text-cream-dim">
                  Un ordre de grandeur suffit — le devis est confirmé après photos ou visite.
                </p>

                <div className="mt-5">
                  <EstimatePreview
                    counts={counts}
                    shower={shower}
                    pack={pack}
                    travel={travel}
                  />
                </div>
              </div>

              <div className="min-w-0 sm:col-span-2">
                <span className="label">Forfait souhaité</span>
                <div className="grid gap-3 sm:grid-cols-2">
                  {packs.map((p) => (
                    <label
                      key={p.id}
                      className={cn(
                        'flex cursor-pointer items-start gap-3 rounded-xl border border-ink-line bg-ink-soft p-4 transition',
                        'hover:border-gold/50 has-[:checked]:border-gold has-[:checked]:bg-gold/[0.06]',
                      )}
                    >
                      <input
                        type="radio"
                        value={p.id}
                        className="mt-1 h-4 w-4 accent-[#C9A24A]"
                        {...register('pack')}
                      />
                      <span>
                        <span className="block text-sm font-medium text-cream">{p.name}</span>
                        <span className="mt-0.5 block text-xs text-cream-dim">
                          {p.perWindow} € par fenêtre standard
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
                <FieldError msg={errors.pack?.message} />

                <label
                  className={cn(
                    'mt-3 flex cursor-pointer items-start gap-3 rounded-xl border border-ink-line bg-ink-soft p-4 transition',
                    'hover:border-gold/50 has-[:checked]:border-gold has-[:checked]:bg-gold/[0.06]',
                  )}
                >
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 accent-[#C9A24A]"
                    {...register('shower')}
                  />
                  <span>
                    <span className="block text-sm font-medium text-cream">
                      Ajouter l’option {showerOption.name}
                    </span>
                    <span className="mt-0.5 block text-xs text-cream-dim">
                      {showerOption.premium} € en Premium — {showerOption.excellence} € en Excellence
                      avec traitement nano hydrophobe, pour la douche complète
                    </span>
                  </span>
                </label>
              </div>

              <div className="min-w-0 sm:col-span-2">
                <label className="label" htmlFor="date">
                  Date souhaitée
                </label>
                <input
                  id="date"
                  type="date"
                  autoComplete="off"
                  min={today}
                  className="field block w-full max-w-full"
                  {...register('date')}
                />
                <FieldError msg={errors.date?.message} />
              </div>

              <div className="min-w-0 sm:col-span-2">
                <label className="label" htmlFor="photos">
                  Photos <span className="normal-case tracking-normal">(facultatif)</span>
                </label>
                <PhotoUpload files={photos} onChange={setPhotos} />
              </div>

              <div className="min-w-0 sm:col-span-2">
                <label className="label" htmlFor="message">
                  Message <span className="normal-case tracking-normal">(facultatif)</span>
                </label>
                <textarea
                  id="message"
                  autoComplete="off"
                  rows={4}
                  className="field resize-y"
                  placeholder="Contraintes d’accès, étage, particularités du chantier…"
                  {...register('message')}
                />
                <FieldError msg={errors.message?.message} />
              </div>
            </div>

            <label
              className={cn(
                'mt-7 flex cursor-pointer items-start gap-3 rounded-xl border border-ink-line bg-ink-soft p-4 transition',
                'hover:border-gold/50 has-[:checked]:border-gold has-[:checked]:bg-gold/[0.06]',
              )}
            >
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 accent-[#C9A24A]"
                {...register('acceptTerms')}
              />
              <span className="text-sm text-cream">
                J’ai lu et j’accepte les{' '}
                <a
                  href="#conditions"
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    scrollToId('#conditions')
                  }}
                  className="text-gold underline underline-offset-2"
                >
                  conditions d’annulation
                </a>
                .
                <span className="mt-1 block text-xs leading-relaxed text-cream-dim">
                  Sans frais plus de 24 h avant l’intervention. Moins de 24 h ou rendez-vous non
                  honoré : 30 % du devis, sauf cas de force majeure justifié.
                </span>
              </span>
            </label>
            <FieldError msg={errors.acceptTerms?.message} />

            <button type="submit" disabled={isSubmitting} className="btn-gold mt-6 w-full">
              {isSubmitting ? 'Envoi en cours…' : 'Envoyer ma demande'}
            </button>

            {status.state === 'quota' && (
              <div className="mt-4 rounded-xl border border-amber-400/40 bg-amber-400/[0.07] px-4 py-3 text-sm text-cream">
                <p>{status.message}</p>
                <p className="mt-2 text-xs text-cream-dim">
                  Votre saisie est conservée. Pour une demande urgente, appelez le{' '}
                  <a href={company.phoneHref} className="text-gold underline underline-offset-2">
                    {company.phone}
                  </a>
                  .
                </p>
              </div>
            )}

            {status.state === 'error' && (
              <div className="mt-4 rounded-xl border border-red-400/40 bg-red-400/[0.07] px-4 py-3 text-sm text-cream">
                <p>L’envoi a échoué. Votre saisie est conservée, vous pouvez réessayer.</p>
                <p className="mt-2 text-xs text-cream-dim">{status.message}</p>
                <p className="mt-3 text-xs">
                  Vous pouvez aussi appeler le{' '}
                  <a href={company.phoneHref} className="text-gold underline underline-offset-2">
                    {company.phone}
                  </a>
                  .
                </p>
              </div>
            )}

            <p className="mt-4 text-xs leading-relaxed text-cream-dim">
              Vos informations servent uniquement à établir votre devis et vous recontacter. Elles
              transitent par Telegram et ne sont conservées sur aucun serveur —{' '}
              <a
                href="#conditions"
                onClick={(e) => {
                  e.preventDefault()
                  scrollToId('#conditions')
                }}
                className="text-gold underline underline-offset-2"
              >
                détail dans les conditions
              </a>
              .
            </p>
          </form>
        </Reveal>

        <Reveal delay={0.05} className="lg:col-span-2">
          <div className="card-lux flex h-full flex-col p-7">
            <h3 className="font-display text-2xl text-cream">Plus direct</h3>
            <p className="mt-2 text-sm leading-relaxed text-cream-dim">
              Un doute sur le forfait, une contrainte d’accès, une urgence ? Un appel règle la
              question en deux minutes.
            </p>

            <div className="mt-7 space-y-3">
              <a href={company.phoneHref} className="btn-gold w-full">
                {company.phone}
              </a>
              <a href={`mailto:${company.email}`} className="btn-ghost w-full">
                {company.email}
              </a>
            </div>

            <dl className="mt-8 space-y-5 border-t border-ink-line pt-7 text-sm">
              <div>
                <dt className="text-[10px] uppercase tracking-widest2 text-cream-dim">Basé à</dt>
                <dd className="mt-1 text-cream">{company.base}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-widest2 text-cream-dim">
                  Zone couverte
                </dt>
                <dd className="mt-1 text-cream">
                  {company.radiusKm} km autour de {serviceBase.name} — {company.region}
                </dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-widest2 text-cream-dim">
                  Disponibilité
                </dt>
                <dd className="mt-1 text-cream">Lundi – samedi, 8 h – 19 h</dd>
              </div>
            </dl>
          </div>
        </Reveal>
      </div>

      {status.state === 'sent' && <SuccessOverlay onClose={closeSuccess} />}
    </Section>
  )
}
