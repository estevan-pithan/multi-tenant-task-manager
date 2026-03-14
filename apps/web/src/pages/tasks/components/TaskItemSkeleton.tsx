import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function TaskItemSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
        </div>
        <div className="size-7 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <div className="h-3 w-36 animate-pulse rounded bg-muted" />
          <div className="h-3 w-36 animate-pulse rounded bg-muted" />
        </div>
      </CardContent>
    </Card>
  )
}
