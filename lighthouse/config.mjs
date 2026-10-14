import { desktopConfig } from 'lighthouse'

const categories = ['performance', 'accessibility', 'best-practices', 'seo']

export const pages = [
  { key: 'inicio', path: '/' },
  { key: 'detalhe', path: '/nft/emerald-ape-042' },
]

export const profiles = {
  mobile: {
    extends: 'lighthouse:default',
    settings: { onlyCategories: categories },
  },
  desktop: {
    extends: 'lighthouse:default',
    settings: { ...desktopConfig.settings, onlyCategories: categories },
  },
}

export const runsPerPage = 3
export const baseUrl = 'http://localhost:4173'
