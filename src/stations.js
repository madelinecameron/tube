// Stations are resolved server-side at request time, never hardcoded as video IDs.
// Live-stream IDs churn constantly (channels restart streams); a query survives that.
// The `id` is what the client sends to /api/station/:id — the query lives on the server.
export const STATIONS = [
  { id: 'lofi', label: 'lo-fi' },
  { id: 'jazz', label: 'jazz' },
  { id: 'ambient', label: 'ambient' },
  { id: 'classical', label: 'classical' }
]
