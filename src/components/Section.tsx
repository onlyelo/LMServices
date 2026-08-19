import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import Reveal from './Reveal'

type Props = {
  id: string
  eyebrow: string
  title: ReactNode
  intro?: ReactNode
  children: ReactNode
  className?: string
}

export default function Section({ id, eyebrow, title, intro, children, className }: Props) {
  return (
    <section id={id} className={cn('scroll-mt-20 py-20 sm:py-28', className)}>
      <div className="container-lux">
        <Reveal>
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="mt-3 h-section text-cream">{title}</h2>
          <div className="mt-5 h-px w-16 bg-gold-line" />
          {intro && <p className="mt-6 max-w-2xl text-cream-dim leading-relaxed">{intro}</p>}
        </Reveal>
        <div className="mt-12 sm:mt-16">{children}</div>
      </div>
    </section>
  )
}
