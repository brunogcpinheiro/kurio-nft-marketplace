import { isAxiosError } from 'axios'
import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import { apiErrorSchema, type ApiError, type ErrorCode } from './schemas'

export function getApiError(error: unknown): ApiError['error'] | null {
  if (!isAxiosError(error) || !error.response) return null
  const parsed = apiErrorSchema.safeParse(error.response.data)
  return parsed.success ? parsed.data.error : null
}

export function hasErrorCode(error: unknown, code: ErrorCode) {
  return getApiError(error)?.code === code
}

export function isNetworkError(error: unknown) {
  return isAxiosError(error) && !error.response
}

export function isTimeoutError(error: unknown) {
  return isAxiosError(error) && error.code === 'ECONNABORTED'
}

export function errorMessage(error: unknown, fallback = 'Algo deu errado. Tente novamente.') {
  const api = getApiError(error)
  if (api) return api.message
  if (isTimeoutError(error)) return 'O servidor demorou demais para responder.'
  if (isNetworkError(error)) return 'Sem conexão com o servidor.'
  return fallback
}

export function applyFieldErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  knownFields: readonly Path<T>[],
) {
  const api = getApiError(error)
  if (!api?.fields) return false
  let applied = false
  for (const [field, message] of Object.entries(api.fields)) {
    if ((knownFields as readonly string[]).includes(field)) {
      setError(field as Path<T>, { type: 'server', message })
      applied = true
    }
  }
  return applied
}
