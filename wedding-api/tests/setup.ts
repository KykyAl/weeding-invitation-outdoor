// Point the app at the test database before anything imports src/config/env.ts.
import 'dotenv/config'

if (!process.env.TEST_DATABASE_URL) {
  throw new Error('TEST_DATABASE_URL is not set (see .env.example).')
}
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL
process.env.NODE_ENV = 'test'
// A minimal stand-in for the built frontend, for the link-preview page tests.
process.env.FRONTEND_DIST = new URL('./fixtures/frontend', import.meta.url).pathname
