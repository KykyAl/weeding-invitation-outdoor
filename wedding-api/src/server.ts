import { app } from './app.js'
import { env } from './config/env.js'
import { pool } from './db/pool.js'

const server = app.listen(env.PORT, env.HOST, () => {
  console.log(`wedding-api listening on http://${env.HOST}:${env.PORT} (${env.NODE_ENV})`)
})

// Finish in-flight requests and release DB connections before exiting.
function shutdown(signal: string) {
  console.log(`${signal} received, shutting down…`)
  server.close(() => {
    pool.end().finally(() => process.exit(0))
  })
  setTimeout(() => process.exit(1), 10_000).unref()
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
