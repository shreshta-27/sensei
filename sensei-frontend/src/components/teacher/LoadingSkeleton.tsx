'use client';

export function CardSkeleton() {
  return (
    <div className="faculty-card p-5 space-y-3">
      <div className="faculty-skeleton h-4 w-1/3" />
      <div className="faculty-skeleton h-8 w-1/2" />
      <div className="faculty-skeleton h-3 w-2/3" />
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="faculty-card p-4 space-y-3">
          <div className="faculty-skeleton h-10 w-10 rounded-lg" />
          <div className="faculty-skeleton h-6 w-16" />
          <div className="faculty-skeleton h-3 w-20" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="faculty-card overflow-hidden">
      <div className="p-4 border-b border-faculty-border">
        <div className="faculty-skeleton h-5 w-32" />
      </div>
      <div className="divide-y divide-faculty-border">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex items-center gap-4">
            <div className="faculty-skeleton h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="faculty-skeleton h-4 w-1/3" />
              <div className="faculty-skeleton h-3 w-1/2" />
            </div>
            <div className="faculty-skeleton h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="faculty-skeleton h-8 w-48" />
        <div className="faculty-skeleton h-4 w-64" />
      </div>
      <StatsSkeleton />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
