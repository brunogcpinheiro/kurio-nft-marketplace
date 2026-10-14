import { useState } from 'react'
import { cn } from 'cn'
import type { Nft } from '@/api/schemas'
import { SearchIcon } from '@/components/icons'
import { NftImage } from '@/components/nft-image'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'

const views = ['Frente', 'Detalhe', 'Fundo', 'Assinatura']

export function Gallery({ nft }: { nft: Nft }) {
  const [active, setActive] = useState(0)
  const [zoom, setZoom] = useState(false)
  return (
    <div className="flex gap-7">
      <ul className="hidden w-[100px] flex-col gap-4 md:flex" aria-label="Miniaturas">
        {views.map((label, index) => (
          <li key={label}>
            <button
              type="button"
              onClick={() => setActive(index)}
              aria-pressed={active === index}
              aria-label={`Ver ${label.toLowerCase()}`}
              className={cn(
                'bg-bg-elevated block size-[100px] overflow-hidden rounded-lg border',
                active === index ? 'border-brand-strong' : 'border-transparent',
              )}
            >
              <NftImage
                imageKey={nft.imageKey}
                name={nft.name}
                base={160}
                sizes="100px"
                className="size-full object-cover"
                width={100}
                height={100}
              />
            </button>
          </li>
        ))}
      </ul>
      <div className="bg-bg-elevated relative flex aspect-square flex-1 items-center justify-center rounded-md p-4 md:size-[444px] md:flex-none">
        <NftImage
          imageKey={nft.imageKey}
          name={nft.name}
          base={640}
          priority
          sizes="(min-width: 768px) 404px, 90vw"
          className="size-full rounded-3xl object-cover"
          width={404}
          height={404}
        />
        <button
          type="button"
          onClick={() => setZoom(true)}
          aria-label="Ampliar imagem"
          className="bg-surface border-surface-strong text-fg absolute top-4 right-4 hidden size-[30px] items-center justify-center rounded-full border md:flex"
        >
          <SearchIcon className="size-5" />
        </button>
      </div>
      <Dialog open={zoom} onOpenChange={setZoom}>
        <DialogContent className="bg-bg max-w-[940px] border-0 p-4">
          <DialogTitle className="sr-only">{nft.name}</DialogTitle>
          <DialogDescription className="sr-only">Imagem ampliada do NFT</DialogDescription>
          <NftImage
            imageKey={nft.imageKey}
            name={nft.name}
            base={900}
            sizes="900px"
            className="mx-auto w-full max-w-[900px] rounded-3xl"
            width={900}
            height={900}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
