const API_BASE = '/api'

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Request failed' }))
    throw new Error(err.message || 'Request failed')
  }
  return res.json()
}

export const gestureAPI = {
  getAll: () => fetchJSON(`${API_BASE}/gestures`),

  create: (gesture) =>
    fetchJSON(`${API_BASE}/gestures`, {
      method: 'POST',
      body: JSON.stringify(gesture),
    }),

  update: (id, data) =>
    fetchJSON(`${API_BASE}/gestures/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id) =>
    fetchJSON(`${API_BASE}/gestures/${id}`, { method: 'DELETE' }),

  importModel: (modelData) =>
    fetchJSON(`${API_BASE}/gestures/import`, {
      method: 'POST',
      body: JSON.stringify(modelData),
    }),

  health: () => fetchJSON(`${API_BASE}/health`),
}
