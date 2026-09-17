import { useCallback, useEffect, useMemo, useState } from 'react'
import { createTask, deleteTask, fetchTasks, updateTask } from '../api/tasks'
import type { StatusFilter, Task, TaskRequest } from '../types'

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [allTasks, setAllTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [search, setSearch] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const status = statusFilter === 'ALL' ? undefined : statusFilter
      const [filtered, all] = await Promise.all([
        fetchTasks(status),
        status ? fetchTasks() : Promise.resolve(null),
      ])
      setTasks(filtered)
      setAllTasks(all ?? filtered)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const visibleTasks = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return tasks
    return tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query),
    )
  }, [tasks, search])

  const stats = useMemo(
    () => ({
      total: allTasks.length,
      pending: allTasks.filter((task) => task.status === 'PENDING').length,
      completed: allTasks.filter((task) => task.status === 'COMPLETED').length,
    }),
    [allTasks],
  )

  async function create(payload: TaskRequest) {
    await createTask(payload)
    await refresh()
  }

  async function update(id: number, payload: TaskRequest) {
    await updateTask(id, payload)
    await refresh()
  }

  async function remove(id: number) {
    await deleteTask(id)
    await refresh()
  }

  async function toggleStatus(task: Task) {
    await update(task.id, {
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status === 'PENDING' ? 'COMPLETED' : 'PENDING',
    })
  }

  return {
    visibleTasks,
    stats,
    loading,
    error,
    statusFilter,
    setStatusFilter,
    search,
    setSearch,
    refresh,
    create,
    update,
    remove,
    toggleStatus,
  }
}
