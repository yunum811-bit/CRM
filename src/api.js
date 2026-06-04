const API_BASE = '/api'

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  }
  const res = await fetch(url, config)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

export const api = {
  // Auth
  login: (username, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  getUsers: () => request('/auth/users'),
  createUser: (data) => request('/auth/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id, data) => request(`/auth/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteUser: (id) => request(`/auth/users/${id}`, { method: 'DELETE' }),
  getRoles: () => request('/auth/roles'),
  updateRolePermissions: (id, pages) => request(`/auth/roles/${id}/permissions`, { method: 'PUT', body: JSON.stringify({ pages }) }),

  // Dashboard
  getDashboard: () => request('/dashboard'),

  // Deals (flow-based)
  getDealsByStep: (step, search = '') => request(`/deals?step=${step}${search ? `&search=${encodeURIComponent(search)}` : ''}`),
  getDeal: (id) => request(`/deals/${id}`),
  createDeal: (data) => request('/deals', { method: 'POST', body: JSON.stringify(data) }),
  updateDeal: (id, data) => request(`/deals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  moveStep: (id, newStep) => request(`/deals/${id}/move`, { method: 'POST', body: JSON.stringify({ step: newStep }) }),
  deleteDeal: (id) => request(`/deals/${id}`, { method: 'DELETE' }),

  // Customers
  getCustomers: (search = '') => request(`/customers${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  getCustomer: (id) => request(`/customers/${id}`),
  createCustomer: (data) => request('/customers', { method: 'POST', body: JSON.stringify(data) }),
  updateCustomer: (id, data) => request(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCustomer: (id) => request(`/customers/${id}`, { method: 'DELETE' }),

  // Messenger Expenses
  getMessengerByDeal: (dealId) => request(`/messenger/deal/${dealId}`),
  getMessengerAll: (status = '') => request(`/messenger${status ? `?status=${encodeURIComponent(status)}` : ''}`),
  createMessenger: (data) => request('/messenger', { method: 'POST', body: JSON.stringify(data) }),
  updateMessenger: (id, data) => request(`/messenger/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteMessenger: (id) => request(`/messenger/${id}`, { method: 'DELETE' }),
  getMessengerSummary: (dealId) => request(`/messenger/summary/${dealId}`),

  // Call Logs
  getCallLogsByDeal: (dealId) => request(`/call-logs/deal/${dealId}`),
  createCallLog: (data) => request('/call-logs', { method: 'POST', body: JSON.stringify(data) }),
  deleteCallLog: (id) => request(`/call-logs/${id}`, { method: 'DELETE' }),

  // Company Settings
  getCompanySettings: () => request('/company'),
  updateCompanySettings: (data) => request('/company', { method: 'PUT', body: JSON.stringify(data) }),
  uploadLogo: (logoData) => request('/company/logo', { method: 'POST', body: JSON.stringify({ logo_data: logoData }) }),

  // Legal Actions
  getLegalByDeal: (dealId) => request(`/legal/deal/${dealId}`),
  getLegalAll: (status = '') => request(`/legal${status ? `?status=${encodeURIComponent(status)}` : ''}`),
  createLegal: (data) => request('/legal', { method: 'POST', body: JSON.stringify(data) }),
  updateLegal: (id, data) => request(`/legal/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteLegal: (id) => request(`/legal/${id}`, { method: 'DELETE' }),
  getLegalSummary: (dealId) => request(`/legal/summary/${dealId}`),
}
