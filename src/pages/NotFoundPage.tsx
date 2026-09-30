import { StatusScreen } from '@/components/ui'
import { copy } from '@/locales/id'
import { USE_SAMPLE_DATA } from '@/services/config'

export function NotFoundPage() {
  return (
    <StatusScreen title={copy.status.notFound}>
      <p>{copy.status.notFoundHint}</p>
      {USE_SAMPLE_DATA && (
        <p className="mt-4">
          Dev:{' '}
          <a className="underline decoration-gold underline-offset-4" href="/wedding/sample-wedding?to=Guest">
            {copy.status.devSample}
          </a>
        </p>
      )}
    </StatusScreen>
  )
}
