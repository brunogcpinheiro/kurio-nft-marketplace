export const env = {
  apiMocking: import.meta.env.VITE_API_MOCKING !== 'false',
  apiUrl: import.meta.env.VITE_API_URL || '/api',
  socketUrl: import.meta.env.VITE_SOCKET_URL || 'wss://realtime.kurio.local',
}
