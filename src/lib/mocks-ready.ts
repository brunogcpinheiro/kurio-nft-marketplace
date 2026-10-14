let resolveReady: () => void = () => undefined

export const mocksReady = new Promise<void>((resolve) => {
  resolveReady = resolve
})

export function markMocksReady() {
  resolveReady()
}
