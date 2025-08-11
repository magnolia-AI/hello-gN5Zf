import { Metadata } from 'next'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import TodoApp from '@/components/todos/TodoApp'

export const metadata: Metadata = {
  title: 'Todos — Modern App',
  description: 'A clean, modern todo app with filters, progress, and local persistence.'
}

export default function TodosPage() {
  return (
    <div className="min-h-full">
      <section className="container mx-auto px-4 py-10 md:py-14">
        <div className="mx-auto max-w-2xl">
          <Card>
            <CardHeader className="pb-2">
              {/* Header is rendered inside client component for live counters */}
            </CardHeader>
            <CardContent>
              <TodoApp />
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

