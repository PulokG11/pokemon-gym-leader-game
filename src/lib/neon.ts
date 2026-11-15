// Minimal client for the Neon Data API (PostgREST-compatible) with Neon Auth
// anonymous tokens. Players never sign in: the browser fetches a short-lived
// anonymous JWT and calls the functions in the database's `api` schema.

const AUTH_URL = import.meta.env.VITE_NEON_AUTH_URL as string | undefined
const DATA_API_URL = import.meta.env.VITE_NEON_DATA_API_URL as string | undefined

export const neonConfigured = Boolean(AUTH_URL && DATA_API_URL)

export class RpcError extends Error {
  constructor(message: string, public status: number) { super(message) }
}

let cached: { jwt: string; expiresAt: number } | null = null
let pending: Promise<string> | null = null

const decodeExp = (jwt: string): number => {
  try {
    const payload = JSON.parse(atob(jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return typeof payload.exp === 'number' ? payload.exp * 1000 : Date.now() + 5 * 60_000
  } catch {
    return Date.now() + 5 * 60_000
  }
}

async function anonymousToken(): Promise<string> {
  if (cached && cached.expiresAt - 60_000 > Date.now()) return cached.jwt
  pending ??= (async () => {
    const res = await fetch(`${AUTH_URL}/token/anonymous`)
    if (!res.ok) throw new RpcError('offline', res.status)
    const { token } = (await res.json()) as { token: string }
    cached = { jwt: token, expiresAt: decodeExp(token) }
    return token
  })().finally(() => { pending = null })
  return pending
}

/** Calls api.<name>(args) through the Data API; throws RpcError with the Postgres message on failure. */
export async function rpc<T>(name: string, args: Record<string, unknown>): Promise<T> {
  if (!neonConfigured) throw new RpcError('offline', 0)
  let res: Response
  try {
    const jwt = await anonymousToken()
    res = await fetch(`${DATA_API_URL}/rpc/${name}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(args),
    })
  } catch (e) {
    if (e instanceof RpcError) throw e
    throw new RpcError('offline', 0)
  }
  if (res.status === 401) cached = null
  const text = await res.text()
  const body = text ? JSON.parse(text) : null
  if (!res.ok) throw new RpcError(body?.message ?? `http_${res.status}`, res.status)
  return body as T
}
