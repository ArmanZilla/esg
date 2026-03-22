import type { CSSProperties } from 'react';

/* ─── Skeleton Primitives ────────────────────────── */

function Bone({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return <div className={`skeleton-pulse rounded-xl ${className}`} style={style} />;
}

/* ─── KPI Grid Skeleton ──────────────────────────── */

export function KpiSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-800 rounded-2xl p-6"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <Bone className="h-3 w-24 mb-4" />
          <Bone className="h-10 w-20 mb-3" />
          <Bone className="h-2.5 w-32" />
        </div>
      ))}
    </div>
  );
}

/* ─── Chart Grid Skeleton ─────────────────────────── */

export function ChartSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-slate-900 border border-slate-800 rounded-2xl p-6"
        >
          <Bone className="h-3.5 w-40 mb-6" />
          <div className="flex items-end gap-3 h-[300px] pt-8">
            {Array.from({ length: 6 }).map((_, j) => (
              <Bone
                key={j}
                className="flex-1"
                style={{ height: `${30 + Math.random() * 60}%` }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Table Skeleton ──────────────────────────────── */

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between">
        <Bone className="h-3.5 w-24" />
        <Bone className="h-8 w-28 rounded-lg" />
      </div>
      <div className="p-4 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Bone className="h-4 w-16" />
            <Bone className="h-4 flex-1" />
            <Bone className="h-4 w-20" />
            <Bone className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Full Page Skeleton ──────────────────────────── */

export function PageSkeleton() {
  return (
    <div className="w-full space-y-8 animate-fade-up">
      {/* Header */}
      <div>
        <Bone className="h-8 w-64 mb-2" />
        <Bone className="h-4 w-96" />
      </div>
      <KpiSkeleton count={4} />
      <ChartSkeleton count={2} />
      <TableSkeleton />
    </div>
  );
}
