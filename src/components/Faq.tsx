import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { bookingTerms, cancellationNotes, faq, legalNotice, privacyNotice } from '@/data/site'
import { cn } from '@/lib/utils'
import Reveal from './Reveal'

/**
 * Questions fréquentes, en bas de page.
 *
 * Regroupe ce qui traînait auparavant en petites mentions au milieu du
 * parcours — TVA, stationnement, déplacement, annulation — plus les rubriques
 * légales. Tout est replié par défaut : la section informe sans peser.
 */

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 20 20"
      className={cn(
        'h-4 w-4 shrink-0 text-gold transition-transform duration-300',
        open && 'rotate-180',
      )}
    >
      <path
        d="M5 8l5 5 5-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function Panel({
  id,
  question,
  open,
  onToggle,
  children,
}: {
  id: string
  question: string
  open: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="card-lux overflow-hidden">
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={`faq-${id}`}
          className="flex w-full items-center justify-between gap-4 p-5 text-left transition hover:bg-ink-soft/60 sm:p-6"
        >
          <span className="text-sm text-cream sm:text-base">{question}</span>
          <Chevron open={open} />
        </button>
      </h3>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`faq-${id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-ink-line px-5 pb-6 pt-5 sm:px-6">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Faq() {
  const [open, setOpen] = useState<string | null>(null)
  const toggle = (id: string) => setOpen((cur) => (cur === id ? null : id))

  return (
    <section id="faq" className="scroll-mt-20 border-t border-ink-line py-16 sm:py-20">
      <div className="container-lux">
        <Reveal>
          <p className="eyebrow">Questions fréquentes</p>
          <h2 className="mt-3 font-display text-2xl text-cream sm:text-3xl">
            Ce qu’on nous demande le plus souvent
          </h2>

          {/* Deux colonnes sur grand écran : une pile de neuf accordéons pleine
              largeur serait interminable en fin de page. */}
          <div className="mt-8 grid gap-3 lg:grid-cols-2 lg:gap-4">
            {faq.map((item) => (
              <Panel
                key={item.id}
                id={item.id}
                question={item.question}
                open={open === item.id}
                onToggle={() => toggle(item.id)}
              >
                <p className="text-sm leading-relaxed text-cream-dim">{item.answer}</p>

                {item.id === 'reservation' && (
                  <dl className="mt-4 space-y-4 border-t border-ink-line pt-4">
                    {bookingTerms.map((t) => (
                      <div key={t.range}>
                        <dt className="flex flex-wrap items-baseline gap-x-3 text-xs">
                          <span className="text-cream">{t.range}</span>
                          <span className="font-medium text-gold">{t.deposit}</span>
                        </dt>
                        <dd className="mt-1 text-xs leading-relaxed text-cream-dim">{t.detail}</dd>
                      </div>
                    ))}
                  </dl>
                )}

                {item.id === 'annulation' && (
                  <ul className="mt-4 space-y-2 border-t border-ink-line pt-4">
                    {cancellationNotes.map((n) => (
                      <li key={n} className="flex gap-2.5 text-xs leading-relaxed text-cream-dim">
                        <span aria-hidden className="text-gold">
                          —
                        </span>
                        <span>{n}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
            ))}

            <Panel
              id="donnees"
              question="Que deviennent mes données personnelles ?"
              open={open === 'donnees'}
              onToggle={() => toggle('donnees')}
            >
              <p className="text-sm leading-relaxed text-cream-dim">{privacyNotice.body}</p>
              <p className="mt-4 text-xs leading-relaxed text-cream-dim">{privacyNotice.extra}</p>
            </Panel>

            <Panel
              id="legal"
              question="Mentions légales"
              open={open === 'legal'}
              onToggle={() => toggle('legal')}
            >
              <dl className="space-y-5">
                {legalNotice.map((entry) => (
                  <div key={entry.title}>
                    <dt className="text-xs font-medium text-cream">{entry.title}</dt>
                    <dd className="mt-1.5 text-xs leading-relaxed text-cream-dim">{entry.body}</dd>
                  </div>
                ))}
              </dl>
            </Panel>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
