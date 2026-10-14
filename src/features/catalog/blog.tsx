import type { HomeContent } from '@/api/schemas'
import { NftImage } from '@/components/nft-image'
import { OutOfScopeLink } from '@/components/out-of-scope-link'
import { Skeleton } from '@/components/ui/skeleton'

export function Blog({ posts }: { posts?: HomeContent['posts'] }) {
  return (
    <section aria-labelledby="blog-title" className="flex flex-col gap-10">
      <div className="flex flex-col gap-3 text-center">
        <h2 id="blog-title" className="text-fg text-[22px] leading-9 font-bold md:text-[28px]">
          Diário da Cunhagem
        </h2>
        <p className="text-fg-muted text-sm leading-[18px]">
          Histórias, guias e insights para colecionadores sobre o universo da propriedade digital.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        {posts
          ? posts.map((post) => (
              <article
                key={post.id}
                className="bg-bg-elevated flex flex-col overflow-hidden rounded-lg"
              >
                <NftImage
                  imageKey={post.imageKey}
                  name={post.title}
                  base={320}
                  sizes="268px"
                  className="h-[195px] w-full object-cover"
                  width={268}
                  height={195}
                />
                <div className="flex flex-1 flex-col gap-2 px-4 pt-3 pb-4">
                  <p className="text-fg-muted text-xs leading-4 font-medium">
                    {post.date}&nbsp;&nbsp;|&nbsp;&nbsp;{post.readingTime}
                  </p>
                  <h3 className="text-fg text-base leading-[21px] font-bold">{post.title}</h3>
                  <p className="text-fg-muted text-xs leading-4 font-medium">{post.excerpt}</p>
                  <OutOfScopeLink
                    label="O diário"
                    className="text-brand mt-auto flex items-center gap-1 text-xs font-bold"
                  >
                    Ler mais <span aria-hidden="true">→</span>
                  </OutOfScopeLink>
                </div>
              </article>
            ))
          : Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} className="h-[369px] rounded-lg" />
            ))}
      </div>
    </section>
  )
}
