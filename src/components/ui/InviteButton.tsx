import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'

const baseClass =
  'group relative inline-flex items-center justify-center gap-2 rounded-full border border-gold/60 ' +
  'bg-ivory/40 px-7 py-3 font-sans text-[0.6875rem] font-normal uppercase tracking-[0.3em] text-cocoa ' +
  'backdrop-blur-sm transition-[background-color,border-color,color] duration-500 ease-cinematic ' +
  'hover:border-gold hover:bg-ivory/80 active:bg-cream disabled:cursor-not-allowed disabled:opacity-50'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined; children: ReactNode }
type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children: ReactNode }

/** Minimal invitation-style action: "OPEN INVITATION", "VIEW MAP", "RSVP"... */
export function InviteButton(props: ButtonProps | LinkProps) {
  const className = [baseClass, props.className].filter(Boolean).join(' ')

  if (props.href !== undefined) {
    const { children, ...rest } = props
    return (
      <a target="_blank" rel="noopener noreferrer" {...rest} className={className}>
        {children}
      </a>
    )
  }

  const { children, type = 'button', ...rest } = props
  return (
    <button type={type} {...rest} className={className}>
      {children}
    </button>
  )
}
