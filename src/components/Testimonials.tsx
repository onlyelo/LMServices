import { company } from '@/data/site'
import Section from './Section'
import Reveal from './Reveal'

/**
 * Emplacement réservé aux avis vérifiés.
 * Les faux témoignages ont été retirés : tant qu'aucun avis réel n'est
 * collecté, cette section annonce l'intégration à venir plutôt que d'afficher
 * du contenu inventé.
 */

function PlatformCard({
  name,
  note,
  icon,
}: {
  name: string
  note: string
  icon: React.ReactNode
}) {
  return (
    <div className="card-lux flex items-center gap-4 p-5">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ink-line bg-ink-soft text-gold">
        {icon}
      </span>
      <span>
        <span className="block text-sm font-medium text-cream">{name}</span>
        <span className="mt-0.5 block text-xs text-cream-dim">{note}</span>
      </span>
    </div>
  )
}

export default function Testimonials() {
  return (
    <Section
      id="avis"
      eyebrow="Avis clients"
      title="Leurs mots, pas les nôtres"
      className="bg-ink-soft/40"
    >
      <Reveal>
        <div className="card-lux relative overflow-hidden p-8 text-center sm:p-14">
          {/* Halo doré discret, purement décoratif */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(201,162,74,0.10),transparent_65%)]"
          />

          <div className="relative">
            <div className="flex justify-center gap-1.5" aria-hidden>
              {Array.from({ length: 5 }, (_, i) => (
                <svg key={i} viewBox="0 0 20 20" className="h-5 w-5 text-gold/25">
                  <path
                    fill="currentColor"
                    d="M10 1.6l2.47 5.3 5.53.65-4.1 3.9 1.1 5.6L10 14.3l-4.99 2.75 1.09-5.6-4.1-3.9 5.53-.65z"
                  />
                </svg>
              ))}
            </div>

            <p className="mx-auto mt-7 max-w-xl font-display text-2xl leading-snug text-cream sm:text-3xl">
              Les premiers avis vérifiés seront publiés ici.
            </p>

            <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-cream-dim">
              Nous préférons attendre de vrais retours plutôt que d’afficher des témoignages de
              complaisance. Les avis Google et Trustpilot seront intégrés directement sur cette page,
              sans filtre ni sélection.
            </p>

            <div className="mx-auto mt-9 grid max-w-lg gap-3 sm:grid-cols-2">
              <PlatformCard
                name="Google Avis"
                note="Intégration à venir"
                icon={
                  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
                    <path
                      fill="currentColor"
                      d="M12 10.2v3.9h5.5a4.8 4.8 0 01-2.1 3.1l3.3 2.6c1.9-1.8 3-4.4 3-7.5 0-.7-.06-1.4-.18-2.1H12z"
                    />
                    <path
                      fill="currentColor"
                      opacity=".55"
                      d="M12 22c2.7 0 5-.9 6.7-2.4l-3.3-2.6c-.9.6-2.1 1-3.4 1-2.6 0-4.9-1.8-5.7-4.2l-3.4 2.6A10 10 0 0012 22z"
                    />
                    <path
                      fill="currentColor"
                      opacity=".3"
                      d="M6.3 13.8a6 6 0 010-3.8L2.9 7.4a10 10 0 000 9.2l3.4-2.8z"
                    />
                  </svg>
                }
              />
              <PlatformCard
                name="Trustpilot"
                note="Intégration à venir"
                icon={
                  <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden>
                    <path
                      fill="currentColor"
                      d="M10 1.6l2.47 5.3 5.53.65-4.1 3.9 1.1 5.6L10 14.3l-4.99 2.75 1.09-5.6-4.1-3.9 5.53-.65z"
                    />
                  </svg>
                }
              />
            </div>

            <p className="mt-9 text-sm text-cream-dim">
              Déjà passé chez vous ?{' '}
              <a
                href={company.phoneHref}
                className="text-gold underline underline-offset-4 transition hover:text-gold-light"
              >
                Laissez-nous un avis
              </a>
              .
            </p>
          </div>
        </div>
      </Reveal>
    </Section>
  )
}
