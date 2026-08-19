import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  cancellationNotes,
  cancellationPolicy,
  legalNotice,
  parkingNotice,
  privacyNotice,
  serviceBase,
  travelFee,
  travelTiers,
} from '@/data/site'
import { cn } from '@/lib/utils'
import Reveal from './Reveal'

type PanelId = 'annulation' | 'deplacement' | 'donnees' | 'legal'

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
  title,
  summary,
  open,
  onToggle,
  children,
}: {
  id: PanelId
  title: string
  summary: string
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
          aria-controls={`panel-${id}`}
          className="flex w-full items-center justify-between gap-4 p-6 text-left transition hover:bg-ink-soft/60"
        >
          <span>
            <span className="block font-display text-xl text-cream">{title}</span>
            <span className="mt-1 block text-xs text-cream-dim">{summary}</span>
          </span>
          <Chevron open={open} />
        </button>
      </h3>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`panel-${id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-ink-line px-6 pb-7 pt-6">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Conditions() {
  // Tout replié par défaut : la section informe, elle ne doit pas peser.
  const [open, setOpen] = useState<PanelId | null>(null)
  const toggle = (id: PanelId) => setOpen((cur) => (cur === id ? null : id))

  return (
    <section id="conditions" className="scroll-mt-20 border-t border-ink-line py-14">
      <div className="container-lux">
        <Reveal>
          <h2 className="text-[10px] uppercase tracking-widest2 text-cream-dim">
            Conditions générales
          </h2>
          <div className="mt-6 grid gap-4">
          <Panel
            id="annulation"
            title="Annulation et report"
            summary="Sans frais au-delà de 24 h — report toujours possible"
            open={open === 'annulation'}
            onToggle={() => toggle('annulation')}
          >
            <ul className="divide-y divide-ink-line">
              {cancellationPolicy.map((p) => (
                <li key={p.when} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-4">
                  <span className="min-w-[9.5rem] flex-1 text-sm text-cream">{p.when}</span>
                  <span
                    className={cn(
                      'text-sm font-medium',
                      p.free ? 'text-gold' : 'text-cream-dim',
                    )}
                  >
                    {p.fee}
                  </span>
                  <span className="w-full text-xs leading-relaxed text-cream-dim">{p.detail}</span>
                </li>
              ))}
            </ul>

            <ul className="mt-5 space-y-2.5 border-t border-ink-line pt-5">
              {cancellationNotes.map((n) => (
                <li key={n} className="flex gap-2.5 text-xs leading-relaxed text-cream-dim">
                  <span aria-hidden className="text-gold">
                    —
                  </span>
                  <span>{n}</span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel
            id="deplacement"
            title="Frais de déplacement"
            summary={`Offert jusqu’à ${travelFee.freeRadiusKm} km de ${serviceBase.name}`}
            open={open === 'deplacement'}
            onToggle={() => toggle('deplacement')}
          >
            <ul className="divide-y divide-ink-line">
              {travelTiers.map((t) => (
                <li key={t.range} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-4">
                  <span className="min-w-[9.5rem] flex-1 text-sm text-cream">{t.range}</span>
                  <span
                    className={cn(
                      'text-sm font-medium',
                      t.free ? 'text-gold' : 'text-cream-dim',
                    )}
                  >
                    {t.amount}
                  </span>
                  <span className="w-full text-xs leading-relaxed text-cream-dim">{t.label}</span>
                </li>
              ))}
            </ul>
            <p className="mt-5 border-t border-ink-line pt-5 text-xs leading-relaxed text-cream-dim">
              Le forfait de {travelFee.fee} € est unique et facturé une seule fois par intervention,
              quels que soient le forfait choisi et la durée sur place.
            </p>

            <div className="mt-5 border-t border-ink-line pt-5">
              <p className="text-xs font-medium text-cream">Stationnement</p>
              <p className="mt-1.5 text-xs leading-relaxed text-cream-dim">{parkingNotice.full}</p>
            </div>
          </Panel>

          <Panel
            id="donnees"
            title="Données personnelles"
            summary="Aucune donnée conservée sur nos serveurs"
            open={open === 'donnees'}
            onToggle={() => toggle('donnees')}
          >
            <p className="text-sm leading-relaxed text-cream-dim">{privacyNotice.body}</p>
            <p className="mt-4 text-xs leading-relaxed text-cream-dim">{privacyNotice.extra}</p>
          </Panel>

          <Panel
            id="legal"
            title="Mentions légales"
            summary={`${legalNotice.length} rubriques`}
            open={open === 'legal'}
            onToggle={() => toggle('legal')}
          >
            <dl className="space-y-5">
              {legalNotice.map((item) => (
                <div key={item.title}>
                  <dt className="text-xs font-medium text-cream">{item.title}</dt>
                  <dd className="mt-1.5 text-xs leading-relaxed text-cream-dim">{item.body}</dd>
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
