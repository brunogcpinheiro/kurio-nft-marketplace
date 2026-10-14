import type { HomeContent } from '@/api/schemas'

export const featuredSlug = 'sage-nomad-009'

export const homeContentFixture: Omit<HomeContent, 'featured'> = {
  hero: {
    eyebrow: 'Bem-vindo à Kurio',
    title: 'Seja dono do futuro\nda arte digital',
    mobileTitle: 'Seja dono da\ncultura digital',
    description:
      'Descubra NFTs selecionados de criadores emergentes e consagrados. Colecione arte digital rara, apoie artistas e tenha uma parte da cultura da internet.',
    mobileDescription: 'Descubra NFTs selecionados de criadores do mundo todo.',
    cta: 'Explorar',
    imageKey: 'emerald',
  },
  promos: [
    {
      id: 'genesis',
      title: 'Lançamentos gênesis\nde edição limitada',
      description:
        'Colecione edições escassas diretamente dos criadores antes da revelação pública.',
      cta: 'Explorar',
      imageKey: 'emerald',
    },
    {
      id: 'curated',
      title: 'Arte digital selecionada\ne muito mais',
      description:
        'Explore novos artistas, coleções verificadas e obras digitais que definem a cultura.',
      cta: 'Explorar',
      imageKey: 'ivory',
    },
  ],
  posts: [
    {
      id: 'propriedade',
      date: '12 de setembro',
      readingTime: 'Leitura de 6 min',
      title: 'Como funciona a propriedade de NFTs',
      excerpt: 'Aprenda a colecionar, negociar e verificar ativos digitais.',
      imageKey: 'ivory',
    },
    {
      id: 'artistas',
      date: '13 de setembro',
      readingTime: 'Leitura de 2 min',
      title: '10 artistas digitais para acompanhar',
      excerpt: 'Conheça criadores que moldam a cultura digital.',
      imageKey: 'emerald',
    },
    {
      id: 'raridade',
      date: '15 de setembro',
      readingTime: 'Leitura de 3 min',
      title: 'Raridade, atributos e procedência',
      excerpt: 'Entenda raridade, procedência, direitos autorais e utilidade.',
      imageKey: 'sage',
    },
    {
      id: 'carteira',
      date: '15 de setembro',
      readingTime: 'Leitura de 2 min',
      title: 'Como proteger sua carteira',
      excerpt: 'Proteja sua carteira, seus ativos e sua identidade.',
      imageKey: 'golden',
    },
  ],
}
