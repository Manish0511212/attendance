const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers } })
  if (!response.ok) throw new Error((await response.json()).message || 'Request failed')
  return response.json()
}

export const api = {
  login: (body: { email: string; password: string }) => apiRequest<{ token: string; user: { role: string } }>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  attendance: (token: string) => apiRequest('/attendance', { headers: { Authorization: `Bearer ${token}` } }),
}
