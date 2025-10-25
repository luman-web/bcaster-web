// PostgreSQL connection pool
import { Pool } from 'pg'
 
if (!process.env.DATABASE_URL) {
  throw new Error('Invalid/Missing environment variable: "DATABASE_URL"')
}
 
const connectionString = process.env.DATABASE_URL
 
let pool: Pool
 
if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithPg = global as typeof globalThis & {
    _pgPool?: Pool
  }
 
  if (!globalWithPg._pgPool) {
    globalWithPg._pgPool = new Pool({
      connectionString,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })
  }
  pool = globalWithPg._pgPool
} else {
  // In production mode, it's best to not use a global variable.
  pool = new Pool({
    connectionString,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  })
}
 
// Export a module-scoped Pool. By doing this in a
// separate module, the pool can be shared across functions.
export default pool