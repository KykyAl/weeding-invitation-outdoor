// Point the app at the test database before anything imports src/config/env.ts.
import 'dotenv/config'

if (!process.env.TEST_DATABASE_URL) {
  throw new Error('TEST_DATABASE_URL is not set (see .env.example).')
}
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL
process.env.NODE_ENV = 'test'
