import type { Task, TaskRequest, TaskStatus } from '../types'

const API_BASE = import.meta.env.VITE_API_URL ?? ''

async function readError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { message?: string }
    return body.message || `Request failed (${response.status})`
  } catch {
    return `Request failed (${response.status})`
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers)
  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  let response: Response
  try {
    response = await fetch(`${API_BASE}${path}`, { ...init, headers })
  } catch {
    throw new Error('Cannot reach the API. Start the Spring Boot backend on port 8080.')
  }

  if (response.status === 204) {
    return undefined as T
  }

  if (!response.ok) {
    throw new Error(await readError(response))
  }

  return response.json() as Promise<T>
}

export function fetchTasks(status?: TaskStatus): Promise<Task[]> {
  const query = status ? `?status=${status}` : ''
  return request<Task[]>(`/tasks${query}`)
}

export function createTask(payload: TaskRequest): Promise<Task> {
  return request<Task>('/tasks', { method: 'POST', body: JSON.stringify(payload) })
}

export function updateTask(id: number, payload: TaskRequest): Promise<Task> {
  return request<Task>(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
}

export function deleteTask(id: number): Promise<void> {
  return request<void>(`/tasks/${id}`, { method: 'DELETE' })
}
