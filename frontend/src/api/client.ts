const BASE = '/api'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`API ${res.status}: ${text}`)
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

export const api = {
  // Family members
  getFamilyMembers: () => request<import('@/types').FamilyMember[]>('/family-members/'),
  createFamilyMember: (data: { name: string; color: string }) =>
    request<import('@/types').FamilyMember>('/family-members/', { method: 'POST', body: JSON.stringify(data) }),
  updateFamilyMember: (id: number, data: Partial<{ name: string; color: string }>) =>
    request<import('@/types').FamilyMember>(`/family-members/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteFamilyMember: (id: number) => request<void>(`/family-members/${id}/`, { method: 'DELETE' }),

  // Categories
  getCategories: () => request<import('@/types').Category[]>('/categories/'),
  createCategory: (data: { name: string; color: string }) =>
    request<import('@/types').Category>('/categories/', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id: number, data: Partial<{ name: string; color: string }>) =>
    request<import('@/types').Category>(`/categories/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteCategory: (id: number) => request<void>(`/categories/${id}/`, { method: 'DELETE' }),

  // Chores
  getChores: () => request<import('@/types').Chore[]>('/chores/'),
  createChore: (data: import('@/types').ChoreFormData) =>
    request<import('@/types').Chore>('/chores/', { method: 'POST', body: JSON.stringify(data) }),
  updateChore: (id: number, data: Partial<import('@/types').ChoreFormData>) =>
    request<import('@/types').Chore>(`/chores/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteChore: (id: number) => request<void>(`/chores/${id}/`, { method: 'DELETE' }),

  // Completions
  completeChore: (id: number, date: string) =>
    request<unknown>(`/chores/${id}/complete/`, { method: 'POST', body: JSON.stringify({ date }) }),
  uncompleteChore: (id: number, date: string) =>
    request<void>(`/chores/${id}/complete/`, { method: 'DELETE', body: JSON.stringify({ date }) }),

  // Calendar
  getCalendar: (start: string, end: string) =>
    request<import('@/types').ChoreOccurrence[]>(`/calendar/?start=${start}&end=${end}`),
}
