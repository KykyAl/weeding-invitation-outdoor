import { StatusScreen } from '@/components/ui'
import { copy } from '@/locales/id'
import { USE_SAMPLE_DATA } from '@/services/config'

export function NotFoundPage() {
  return (
    <StatusScreen title={copy.status.notFound}>
      <p>{copy.status.notFoundHint}</p>
      {import.meta.env.DEV && (
        <p className="mt-4">
          {copy.status.devHome}{' '}
          <a
            className="underline decoration-gold underline-offset-4"
            href={USE_SAMPLE_DATA ? '/wedding/sample-wedding?to=Andi' : '/wedding/example-wedding?to=Andi'}
          >
            {copy.status.devSample}
          </a>
        </p>
      )}
    </StatusScreen>
  )
}
