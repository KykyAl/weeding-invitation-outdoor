import { useEffect } from 'react'
import { CinematicWeddingScene } from '@/components/wedding'
import { InviteButton, StatusScreen } from '@/components/ui'
import { useGuestName } from '@/hooks/useGuestName'
import { useWedding } from '@/hooks/useWedding'
import { copy } from '@/locales/id'
import { getCouple } from '@/utils/format'

export function WeddingPage({ slug }: { slug: string }) {
  const { state, retry } = useWedding(slug)
  const guestName = useGuestName()

  useEffect(() => {
    if (state.status !== 'ready') return
    const [first, second] = getCouple(state.wedding)
    document.title = copy.meta.title(first.nickname, second.nickname)
  }, [state])

  switch (state.status) {
    case 'loading':
      return <StatusScreen title={copy.status.loading} busy />
    case 'not-found':
      return <StatusScreen title={copy.status.notFound}>{copy.status.notFoundHint}</StatusScreen>
    case 'error':
      return (
        <StatusScreen title={state.offline ? copy.status.offline : copy.status.error}>
          <p>{state.message}</p>
          {import.meta.env.DEV && <p className="mt-3 text-xs">{copy.status.devApiDown}</p>}
          <InviteButton onClick={retry} className="mt-6">
            {copy.status.retry}
          </InviteButton>
        </StatusScreen>
      )
    case 'ready':
      return <CinematicWeddingScene wedding={state.wedding} guestName={guestName} />
  }
}
