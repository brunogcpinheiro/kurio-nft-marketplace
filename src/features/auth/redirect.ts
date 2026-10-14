export function safeRedirect(value: string | undefined, fallback = '/') {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return fallback
  if (value.startsWith('/login') || value.startsWith('/cadastro')) return fallback
  return value
}
