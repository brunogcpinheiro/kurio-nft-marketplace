import { toast } from 'sonner'

export function notifyOutOfScope(label?: string) {
  toast('Indisponível nesta versão', {
    description: label
      ? `${label} não faz parte desta entrega.`
      : 'Esta área não faz parte desta entrega.',
  })
}
