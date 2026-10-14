export function shortHash(value: string, head = 6, tail = 4) {
  if (value.length <= head + tail + 1) return value
  return `${value.slice(0, head)}…${value.slice(-tail)}`
}

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

export function formatDate(iso: string) {
  return dateFormatter.format(new Date(iso)).replace('.', '')
}
