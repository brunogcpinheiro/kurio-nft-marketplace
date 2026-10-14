import { HttpResponse, type HttpResponseResolver, type PathParams } from 'msw'
import { ZodError, type ZodType } from 'zod'
import type { ErrorCode, User } from '@/api/schemas'
import { getDb, updateDb, type SessionRecord } from './db'
import { networkDelay } from './latency'
import { getScenario, scenarioState } from './scenarios'

export const sessionTtlMs = 30 * 60 * 1000

export class ApiFailure extends Error {
  constructor(
    public status: number,
    public code: ErrorCode,
    message: string,
    public fields?: Record<string, string>,
    public extra?: Record<string, unknown>,
  ) {
    super(message)
  }
}

export function fail(
  status: number,
  code: ErrorCode,
  message: string,
  fields?: Record<string, string>,
  extra?: Record<string, unknown>,
) {
  return HttpResponse.json({ error: { code, message, fields }, ...extra }, { status })
}

export function json<T>(body: T, status = 200) {
  return HttpResponse.json(body as Record<string, unknown>, { status })
}

export function noContent() {
  return new HttpResponse(null, { status: 204 })
}

export async function parseBody<T>(request: Request, schema: ZodType<T>): Promise<T> {
  let raw: unknown = null
  try {
    raw = await request.json()
  } catch {
    throw new ApiFailure(422, 'VALIDATION', 'Corpo da requisição inválido')
  }
  return schema.parse(raw)
}

function fieldsFromZod(error: ZodError) {
  const fields: Record<string, string> = {}
  for (const issue of error.issues) {
    const path = issue.path.join('.') || '_'
    if (!fields[path]) fields[path] = issue.message
  }
  return fields
}

export function bearerToken(request: Request) {
  const header = request.headers.get('authorization')
  return header?.startsWith('Bearer ') ? header.slice(7) : null
}

export function findSession(token: string | null): SessionRecord | null {
  if (!token) return null
  const session = getDb().sessions.find((s) => s.token === token)
  if (!session) return null
  if (session.expiresAt < Date.now()) {
    updateDb((db) => {
      db.sessions = db.sessions.filter((s) => s.token !== token)
    })
    return null
  }
  return session
}

export function requireSession(request: Request): { user: User; session: SessionRecord } {
  const session = findSession(bearerToken(request))
  if (!session) throw new ApiFailure(401, 'UNAUTHENTICATED', 'Sua sessão expirou. Entre novamente.')
  const user = getDb().users.find((u) => u.user.id === session.userId)?.user
  if (!user) throw new ApiFailure(401, 'UNAUTHENTICATED', 'Sua sessão expirou. Entre novamente.')
  updateDb(() => {
    session.expiresAt = Date.now() + sessionTtlMs
  })
  return { user, session }
}

export function optionalSession(request: Request) {
  const session = findSession(bearerToken(request))
  if (!session) return null
  const user = getDb().users.find((u) => u.user.id === session.userId)?.user
  return user ? { user, session } : null
}

export function cartOwnerKey(request: Request) {
  const session = optionalSession(request)
  if (session) return `user:${session.user.id}`
  const guest = request.headers.get('x-guest-cart')
  return guest ? `guest:${guest}` : null
}

type RouteOptions = { key?: string; private?: boolean; flaky?: boolean }

export function guard<Params extends PathParams = PathParams>(
  resolver: HttpResponseResolver<Params>,
): HttpResponseResolver<Params> {
  return async (info) => {
    try {
      return await resolver(info)
    } catch (error) {
      if (error instanceof ZodError) {
        return fail(422, 'VALIDATION', 'Verifique os campos destacados.', fieldsFromZod(error))
      }
      if (error instanceof ApiFailure) {
        return fail(error.status, error.code, error.message, error.fields, error.extra)
      }
      throw error
    }
  }
}

export function mocked<Params extends PathParams = PathParams>(
  options: RouteOptions,
  resolver: HttpResponseResolver<Params>,
): HttpResponseResolver<Params> {
  const guarded = guard(resolver)
  return async (info) => {
    await networkDelay(options.key ?? '')
    const scenario = getScenario()
    if (scenario === 'offline') return HttpResponse.error()
    if (scenario === 'server-error' && options.flaky && scenarioState.serverErrorHits < 3) {
      scenarioState.serverErrorHits += 1
      return fail(503, 'UNAVAILABLE', 'Serviço temporariamente indisponível. Tente novamente.')
    }
    if (
      scenario === 'session-expired' &&
      options.private &&
      !scenarioState.sessionExpiredConsumed &&
      bearerToken(info.request)
    ) {
      scenarioState.sessionExpiredConsumed = true
      const token = bearerToken(info.request)
      updateDb((db) => {
        db.sessions = db.sessions.filter((s) => s.token !== token)
      })
      return fail(401, 'UNAUTHENTICATED', 'Sua sessão expirou. Entre novamente.')
    }
    return guarded(info)
  }
}

export async function sha256(value: string) {
  const data = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('')
}

export function hashPassword(password: string) {
  return sha256(`kurio:${password}`)
}
