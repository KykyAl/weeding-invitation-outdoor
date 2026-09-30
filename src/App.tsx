import { NotFoundPage } from '@/pages/NotFoundPage'
import { WeddingPage } from '@/pages/WeddingPage'
import { matchRoute } from '@/utils/route'

export default function App() {
  const route = matchRoute(window.location.pathname)

  switch (route.name) {
    case 'wedding':
      return <WeddingPage key={route.slug} slug={route.slug} />
    case 'not-found':
      return <NotFoundPage />
  }
}
