import { useEffect, useState } from 'react'
import { SearchIcon } from '@/components/icons'

type Props = { value?: string; onChange: (value: string | undefined) => void }

export function MobileSearch({ value, onChange }: Props) {
  const [term, setTerm] = useState(value ?? '')
  const [seen, setSeen] = useState(value)
  const [emitted, setEmitted] = useState<string | undefined | null>(null)

  if (value !== seen) {
    setSeen(value)
    if (value !== emitted && (value ?? '') !== term.trim()) setTerm(value ?? '')
  }

  useEffect(() => {
    const trimmed = term.trim() || undefined
    if (trimmed === value) return
    const timer = setTimeout(() => {
      setEmitted(trimmed)
      onChange(trimmed)
    }, 300)
    return () => clearTimeout(timer)
  }, [term, value, onChange])

  return (
    <form
      role="search"
      className="bg-bg-elevated flex h-[45px] flex-1 items-center gap-2 rounded-[10px] px-3"
      onSubmit={(event) => {
        event.preventDefault()
        onChange(term.trim() || undefined)
      }}
    >
      <SearchIcon className="text-fg-subtle size-[22px] shrink-0" />
      <input
        type="search"
        value={term}
        onChange={(event) => setTerm(event.target.value)}
        placeholder="Explorar coleções"
        aria-label="Buscar NFTs"
        className="text-fg placeholder:text-fg-subtle min-w-0 flex-1 bg-transparent text-sm font-bold placeholder:font-bold"
      />
    </form>
  )
}
