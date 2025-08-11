'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Task, StatusFilter, Priority, Category } from './types'
import { useLocalStorage } from './useLocalStorage'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { X, Plus, CalendarIcon, ArrowUpDown, Edit2, Trash2, Check, Search } from 'lucide-react'

// Small helper to format dates
function todayISO() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const CATEGORY_OPTIONS: Category[] = ['work', 'personal', 'learning', 'home', 'other']
const PRIORITY_OPTIONS: Priority[] = ['low', 'medium', 'high']

export default function TodoApp() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('todo.tasks.v1', [])
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortAsc, setSortAsc] = useState(true)

  // Derived stats
  useNormalizeOrders(tasks, setTasks)

  const completed = tasks.filter(t => t.completed).length
  const total = tasks.length
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100)


// Normalize any tasks that may be missing an `order` field (e.g., from older local data)
// Assigns sequential order values
function useNormalizeOrders(tasks: Task[], setTasks: React.Dispatch<React.SetStateAction<Task[]>>) {
  useEffect(() => {
    const needsOrder = tasks.some((t: any) => t.order === undefined)
    if (needsOrder) {
      setTasks(prev => prev.map((t, i) => ({ ...t, order: t.order ?? i })))
    }
    // run only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

  const addTask = (title: string, opts?: Partial<Omit<Task, 'id' | 'title' | 'completed' | 'createdAt' | 'updatedAt' | 'order'>>) => {
    const now = new Date().toISOString()
    const minOrder = tasks.length ? Math.min(...tasks.map(t => t.order)) : 0
    const newTask: Task = {
      id: Math.random().toString(36).slice(2),
      title: title.trim(),
      completed: false,
      createdAt: now,
      updatedAt: now,
      order: minOrder - 1, // add to top
      priority: opts?.priority ?? 'medium',
      dueDate: opts?.dueDate,
      category: opts?.category ?? 'other',
      tags: opts?.tags ?? [],
      notes: opts?.notes ?? undefined,
    }
    setTasks(prev => [newTask, ...prev])
  }

  const updateTask = (id: string, update: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...update, updatedAt: new Date().toISOString() } : t))
  }

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const toggleComplete = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed, updatedAt: new Date().toISOString() } : t))
  }

  // Filter + search + sort
  const visibleTasks = useMemo(() => {
    let list = tasks
    if (filter === 'active') list = list.filter(t => !t.completed)
    if (filter === 'completed') list = list.filter(t => t.completed)

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(t =>
        t.title.toLowerCase().includes(q) ||
        (t.tags?.some(tag => tag.toLowerCase().includes(q))) ||
        (t.notes?.toLowerCase().includes(q))
      )
    }

    list = [...list].sort((a, b) => {
      const cmp = a.order - b.order
      return sortAsc ? cmp : -cmp
    })

    return list
  }, [tasks, filter, searchQuery, sortAsc])

  return (
    <div className="space-y-6">
      <Header
        total={total}
        completed={completed}
        progress={progress}
        filter={filter}
        onFilterChange={setFilter}
        sortAsc={sortAsc}
        onToggleSort={() => setSortAsc(s => !s)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <Composer onAdd={addTask} />
      <TaskList
        tasks={visibleTasks}
        onToggle={toggleComplete}
        onDelete={deleteTask}
        onUpdate={updateTask}
        onReorder={(sourceId, overId) => {
          setTasks(prev => {
            const idxFrom = prev.findIndex(t => t.id === sourceId)
            const idxTo = prev.findIndex(t => t.id === overId)
            if (idxFrom === -1 || idxTo === -1) return prev
            const next = [...prev]
            const [moved] = next.splice(idxFrom, 1)
            next.splice(idxTo, 0, moved)
            return next.map((t, i) => ({ ...t, order: i, updatedAt: new Date().toISOString() }))
          })
        }}
      />
    </div>
  )
}

function Header(props: {
  total: number
  completed: number
  progress: number
  filter: StatusFilter
  onFilterChange: (f: StatusFilter) => void
  sortAsc: boolean
  onToggleSort: () => void
  searchQuery: string
  onSearchChange: (s: string) => void
}) {
  const { total, completed, progress, filter, onFilterChange, sortAsc, onToggleSort, searchQuery, onSearchChange } = props
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-semibold">Todos</h2>
          <Badge variant="secondary" className="rounded-full">{completed}/{total}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onToggleSort} aria-label="Toggle sort order">
            <ArrowUpDown className="size-4" />
            <span className="ml-2 hidden sm:inline">{sortAsc ? 'Oldest first' : 'Newest first'}</span>
          </Button>
        </div>
      </div>

      <Progress value={progress} className="h-2 transition-all" />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Tabs value={filter} onValueChange={v => onFilterChange(v as StatusFilter)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search tasks, tags, notes..."
            className="pl-8"
            aria-label="Search tasks"
          />
        </div>
      </div>
    </div>
  )
}

function Composer({ onAdd }: { onAdd: (title: string, opts?: Partial<Task>) => void }) {
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [category, setCategory] = useState<Category>('other')
  const [dueDate, setDueDate] = useState<string | undefined>(undefined)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const submit = () => {
    if (!title.trim()) return
    onAdd(title, { priority, category, dueDate })
    setTitle('')
    setDueDate(undefined)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      submit()
    } else if (e.key === 'Escape') {
      setTitle('')
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-md border p-3">
      <div className="flex items-center gap-2">
        <Input
          ref={inputRef}
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Add a new task and press Enter"
          aria-label="Task title"
        />
        <Button onClick={submit} aria-label="Add task">
          <Plus className="size-4" />
          <span className="ml-2 hidden sm:inline">Add</span>
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
          <SelectTrigger className="w-[140px]"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            {PRIORITY_OPTIONS.map(p => (
              <SelectItem key={p} value={p}>{p[0].toUpperCase() + p.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            {CATEGORY_OPTIONS.map(c => (
              <SelectItem key={c} value={c}>{c[0].toUpperCase() + c.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={dueDate ?? ''}
            onChange={e => setDueDate(e.target.value || undefined)}
            className="w-[170px]"
            aria-label="Due date"
            min={todayISO()}
          />
        </div>
      </div>
    </div>
  )
}

function TaskList({ tasks, onToggle, onDelete, onUpdate, onReorder }: {
  tasks: Task[]
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onUpdate: (id: string, update: Partial<Task>) => void
  onReorder: (sourceId: string, overId: string) => void
}) {
  // Basic drag and drop using HTML5 API
  const [dragId, setDragId] = useState<string | null>(null)

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    setDragId(id)
    e.dataTransfer.setData('text/plain', id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, overId: string) => {
    e.preventDefault()
    const sourceId = dragId || e.dataTransfer.getData('text/plain')
    if (!sourceId || sourceId === overId) return

    onReorder(sourceId, overId)
    setDragId(null)
  }



  return (
    <div className="space-y-2">
      {tasks.length === 0 && (
        <p className="text-sm text-muted-foreground">No tasks match your filters.</p>
      )}
      <div className="flex flex-col gap-2">
        {tasks.map(task => (
          <div
            key={task.id}
            draggable
            onDragStart={(e) => handleDragStart(e, task.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, task.id)}
            className={cn(
              'group grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-md border p-3 transition-colors',
              task.completed ? 'bg-muted/40' : 'bg-background hover:bg-accent/50'
            )}
          >
            <div className="flex items-center">
              <Checkbox
                checked={task.completed}
                onCheckedChange={() => onToggle(task.id)}
                aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
              />
            </div>
            <TaskContent task={task} onUpdate={onUpdate} />
            <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <InlineEdit task={task} onUpdate={onUpdate} />
              <Button variant="ghost" size="icon" aria-label="Delete" onClick={() => onDelete(task.id)}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TaskContent({ task, onUpdate }: { task: Task, onUpdate: (id: string, update: Partial<Task>) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <div className={cn('text-sm', task.completed && 'line-through text-muted-foreground')}>{task.title}</div>
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        {task.category && <Badge variant="outline">{task.category}</Badge>}
        <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'default' : 'secondary'}>
          {task.priority}
        </Badge>
        {task.dueDate && (
          <span className="inline-flex items-center gap-1"> <CalendarIcon className="size-3" /> {task.dueDate}</span>
        )}
        {!!task.tags?.length && task.tags!.slice(0, 3).map(tag => (
          <Badge key={tag} variant="secondary" className="lowercase">#{tag}</Badge>
        ))}
      </div>
    </div>
  )
}

function InlineEdit({ task, onUpdate }: { task: Task, onUpdate: (id: string, update: Partial<Task>) => void }) {
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(task.title)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  const submit = () => {
    const title = value.trim()
    if (!title) return
    onUpdate(task.id, { title })
    setEditing(false)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') submit()
    if (e.key === 'Escape') {
      setValue(task.title)
      setEditing(false)
    }
  }

  if (!editing) {
    return (
      <Button variant="ghost" size="icon" aria-label="Edit" onClick={() => setEditing(true)}>
        <Edit2 className="size-4" />
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-1">
      <Input
        ref={inputRef}
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        className="h-8 w-52"
        aria-label="Edit task title"
      />
      <Button variant="ghost" size="icon" aria-label="Save" onClick={submit}>
        <Check className="size-4" />
      </Button>
      <Button variant="ghost" size="icon" aria-label="Cancel" onClick={() => { setValue(task.title); setEditing(false) }}>
        <X className="size-4" />
      </Button>
    </div>
  )
}















