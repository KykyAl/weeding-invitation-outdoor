import { useId, useRef, useState, type FormEvent } from 'react'
import type { Attendance, RsvpRequest } from '@/types'
import { InviteButton } from '@/components/ui'
import type { RsvpFieldErrors } from '@/hooks/useRsvp'
import { copy } from '@/locales/id'

const MESSAGE_MAX = 500

interface RsvpFormProps {
  defaultName?: string
  defaults?: Partial<RsvpRequest>
  maxGuests: number
  submitting: boolean
  error?: string
  serverErrors?: RsvpFieldErrors
  onSubmit: (payload: RsvpRequest) => void
}

const fieldClass =
  'mt-2 w-full border-0 border-b border-gold/40 bg-transparent px-0 py-2 text-base text-cocoa placeholder:text-cocoa-soft/50 ' +
  'transition-[border-color,box-shadow] focus:border-cocoa focus:shadow-[0_1px_0_0_var(--color-cocoa)] focus:outline-none aria-[invalid=true]:border-[#9a5249]'

/** Nama · Kehadiran · Jumlah Tamu · Ucapan — minimal, underlined, invitation-like. */
export function RsvpForm({ defaultName = '', defaults, maxGuests, submitting, error, serverErrors, onSubmit }: RsvpFormProps) {
  const id = useId()
  const nameRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState(defaults?.name ?? defaultName)
  const [attendance, setAttendance] = useState<Attendance | null>(defaults?.attendance ?? null)
  const [guests, setGuests] = useState(Math.min(maxGuests, Math.max(1, defaults?.guestCount ?? 1)))
  const [message, setMessage] = useState(defaults?.message ?? '')
  const [errors, setErrors] = useState<RsvpFieldErrors>({})
  // Server (422) errors show until the guest edits that field; a new response resets them.
  const [server, setServer] = useState({ source: serverErrors, visible: serverErrors ?? {} })
  if (server.source !== serverErrors) setServer({ source: serverErrors, visible: serverErrors ?? {} })
  const dismissServer = (field: keyof RsvpFieldErrors) =>
    setServer((prev) => ({ ...prev, visible: { ...prev.visible, [field]: undefined } }))
  const shown = { ...server.visible, ...errors }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const next: RsvpFieldErrors = {}
    if (!name.trim()) next.name = copy.rsvp.nameRequired
    if (!attendance) next.attendance = copy.rsvp.attendanceRequired
    setErrors(next)
    if (next.name) nameRef.current?.focus()
    if (next.name || !attendance) return
    onSubmit({
      name: name.trim(),
      attendance,
      guestCount: attendance === 'attending' ? guests : 0,
      message: message.trim() || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="w-full max-w-[20rem] text-left" aria-busy={submitting || undefined}>
      <label htmlFor={`${id}-name`} className="eyebrow block">
        {copy.rsvp.name}
      </label>
      <input
        ref={nameRef}
        id={`${id}-name`}
        name="name"
        autoComplete="name"
        maxLength={80}
        value={name}
        onChange={(e) => {
          setName(e.target.value)
          if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }))
          dismissServer('name')
        }}
        placeholder={copy.rsvp.namePlaceholder}
        aria-invalid={!!shown.name}
        aria-describedby={shown.name ? `${id}-name-error` : undefined}
        className={fieldClass}
      />
      {shown.name && (
        <p id={`${id}-name-error`} className="mt-1.5 text-xs text-[#9a5249]">
          {shown.name}
        </p>
      )}

      <fieldset className="mt-7" aria-describedby={shown.attendance ? `${id}-att-error` : undefined}>
        <legend className="eyebrow">{copy.rsvp.attendance}</legend>
        <div className="mt-3 grid grid-cols-2 gap-3">
          {(['attending', 'not_attending'] as const).map((value) => (
            <label key={value} className="relative cursor-pointer">
              <input
                type="radio"
                name="attendance"
                value={value}
                checked={attendance === value}
                onChange={() => {
                  setAttendance(value)
                  setErrors((prev) => ({ ...prev, attendance: undefined }))
                  dismissServer('attendance')
                }}
                className="peer sr-only"
              />
              <span className="block rounded-full border border-gold/40 py-2.5 text-center text-[0.6875rem] tracking-[0.24em] uppercase transition-colors duration-500 peer-checked:border-gold peer-checked:bg-gold peer-checked:text-ivory peer-focus-visible:outline peer-focus-visible:outline-1 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-gold">
                {value === 'attending' ? copy.rsvp.attending : copy.rsvp.notAttending}
              </span>
            </label>
          ))}
        </div>
        {shown.attendance && (
          <p id={`${id}-att-error`} className="mt-1.5 text-xs text-[#9a5249]">
            {shown.attendance}
          </p>
        )}
      </fieldset>

      {attendance === 'attending' && (
        <div className="mt-7">
          <span id={`${id}-guests`} className="eyebrow block">
            {copy.rsvp.guests}
          </span>
          <div className="mt-3 flex items-center justify-between border-b border-gold/40 pb-2" role="group" aria-labelledby={`${id}-guests`}>
            <button
              type="button"
              onClick={() => setGuests((g) => Math.max(1, g - 1))}
              disabled={guests <= 1}
              aria-label={copy.rsvp.decrease}
              className="h-9 w-9 rounded-full border border-gold/40 text-lg leading-none disabled:opacity-30"
            >
              −
            </button>
            <output aria-live="polite" className="font-serif text-xl">
              {copy.rsvp.guestsValue(guests)}
            </output>
            <button
              type="button"
              onClick={() => setGuests((g) => Math.min(maxGuests, g + 1))}
              disabled={guests >= maxGuests}
              aria-label={copy.rsvp.increase}
              className="h-9 w-9 rounded-full border border-gold/40 text-lg leading-none disabled:opacity-30"
            >
              +
            </button>
          </div>
        </div>
      )}

      <label htmlFor={`${id}-message`} className="eyebrow mt-7 block">
        {copy.rsvp.message}
      </label>
      <textarea
        id={`${id}-message`}
        name="message"
        rows={3}
        maxLength={MESSAGE_MAX}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={copy.rsvp.messagePlaceholder}
        aria-describedby={`${id}-count`}
        className={`${fieldClass} resize-none font-serif italic`}
      />
      <p id={`${id}-count`} className="mt-1 text-right text-[0.625rem] tracking-wider text-cocoa-soft">
        {copy.rsvp.counter(message.length, MESSAGE_MAX)}
      </p>

      {error && (
        <p role="alert" className="mt-4 text-center text-sm text-[#9a5249]">
          {error}
        </p>
      )}

      <div className="mt-6 flex justify-center">
        <InviteButton type="submit" disabled={submitting}>
          {submitting ? copy.rsvp.submitting : copy.rsvp.submit}
        </InviteButton>
      </div>
    </form>
  )
}
