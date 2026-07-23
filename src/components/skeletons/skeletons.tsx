export function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-lg bg-white p-5 shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800 dark:shadow-gray-900">
      <div className="h-5 w-1/3 rounded bg-gray-200 dark:bg-gray-800" />
      <div className="mt-2 h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-800" />
      <div className="mt-3 flex gap-6">
        <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-800" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse rounded-lg border border-gray-200 dark:border-gray-800">
      <div className="h-10 bg-gray-50 rounded-t-lg dark:bg-gray-800" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 border-t border-gray-100 flex items-center px-4 dark:border-gray-800">
          <div className="h-4 w-1/4 rounded bg-gray-200 dark:bg-gray-800" />
        </div>
      ))}
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div className="animate-pulse rounded-lg bg-white p-4 shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800 dark:shadow-gray-900">
      <div className="h-3 w-20 rounded bg-gray-200 dark:bg-gray-800" />
      <div className="mt-2 h-8 w-12 rounded bg-gray-200 dark:bg-gray-800" />
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="animate-pulse grid gap-6 max-w-2xl">
      <div className="h-10 w-full rounded bg-gray-200 dark:bg-gray-800" />
      <div className="h-10 w-full rounded bg-gray-200 dark:bg-gray-800" />
      <div className="h-10 w-full rounded bg-gray-200 dark:bg-gray-800" />
    </div>
  );
}
