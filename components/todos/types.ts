export type Priority = 'low' | 'medium' | 'high'
export type StatusFilter = 'all' | 'active' | 'completed'
export type Category = 'work' | 'personal' | 'learning' | 'home' | 'other'

export interface Task {
  id: string
  title: string
  completed: boolean
  createdAt: string // ISO string
  updatedAt: string // ISO string
  order: number // used for manual ordering (can be float)
  dueDate?: string // ISO date (YYYY-MM-DD)
  priority: Priority
  category?: Category
  tags?: string[]
  notes?: string
}


