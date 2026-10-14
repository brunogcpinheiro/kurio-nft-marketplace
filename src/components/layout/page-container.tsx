import { cn } from 'cn'
import type { ComponentProps } from 'react'

export function PageContainer({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('mx-auto w-full max-w-[1200px] px-4 md:px-6 xl:px-0', className)}
      {...props}
    />
  )
}
