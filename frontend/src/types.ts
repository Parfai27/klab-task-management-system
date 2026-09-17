export type TaskStatus = 'PENDING' | 'COMPLETED'
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH'
export type StatusFilter = 'ALL' | TaskStatus

export interface Task {
  id: number
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  createdAt: string
}

export interface TaskRequest {
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
}
