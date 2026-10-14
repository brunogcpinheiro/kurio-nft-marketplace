import { useRef, useState } from 'react'
import { ImageIcon } from '@/components/icons'
import { Button } from '@/components/ui/button'

type Props = {
  value: string | null
  name: string
  onChange: (dataUrl: string | null) => void
  pending?: boolean
}

const maxBytes = 1024 * 1024

async function resize(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  const scale = Math.max(size / bitmap.width, size / bitmap.height)
  const w = bitmap.width * scale
  const h = bitmap.height * scale
  ctx.drawImage(bitmap, (size - w) / 2, (size - h) / 2, w, h)
  return canvas.toDataURL('image/webp', 0.85)
}

export function AvatarField({ value, name, onChange, pending }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File | undefined) {
    if (!file) return
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setError('Use uma imagem PNG, JPG ou WebP')
      return
    }
    if (file.size > maxBytes) {
      setError('Use uma imagem de até 1 MB')
      return
    }
    setError(null)
    onChange(await resize(file))
  }

  return (
    <div className="flex flex-col gap-2.5">
      <span id="avatar-label" className="text-fg text-[15px] leading-[15px]">
        Avatar
      </span>
      <div className="flex items-center gap-6">
        <span className="bg-surface flex size-12 items-center justify-center overflow-hidden rounded-full">
          {value ? (
            <img
              src={value}
              alt={`Avatar de ${name}`}
              className="size-full object-cover"
              width={48}
              height={48}
            />
          ) : (
            <ImageIcon className="text-brand-strong size-6" aria-hidden="true" />
          )}
        </span>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="sr-only"
          aria-labelledby="avatar-label"
          aria-describedby={error ? 'avatar-error' : undefined}
          onChange={(event) => void handleFile(event.target.files?.[0])}
          data-testid="avatar-input"
        />
        <Button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={pending}
          className="h-10 w-[99px] rounded-[3px] text-sm font-bold"
        >
          Alterar
        </Button>
        <button
          type="button"
          onClick={() => onChange(null)}
          disabled={pending || !value}
          className="text-fg text-sm disabled:opacity-50"
        >
          Remover
        </button>
      </div>
      {error ? (
        <p id="avatar-error" role="alert" className="text-danger text-xs">
          {error}
        </p>
      ) : null}
    </div>
  )
}
