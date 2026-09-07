import React from 'react';

export function Skeleton({ className = '', ...props }) {
  return (
    <div 
      className={`animate-pulse bg-slate-200/80 dark:bg-slate-800/80 rounded-xl ${className}`} 
      {...props} 
    />
  );
}

export function CaseCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl flex flex-col justify-between space-y-4 shadow-xs">
      <div className="space-y-3">
        {/* Top Icon & Badge */}
        <div className="flex justify-between items-start">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <Skeleton className="w-20 h-5 rounded-md" />
        </div>
        
        {/* Case Number & Title */}
        <div className="space-y-1.5">
          <Skeleton className="w-32 h-5 rounded-md" />
          <Skeleton className="w-48 h-4 rounded-md" />
        </div>

        {/* Description Lines */}
        <div className="space-y-1.5 pt-1">
          <Skeleton className="w-full h-3 rounded" />
          <Skeleton className="w-5/6 h-3 rounded" />
        </div>
      </div>

      {/* Footer Meta */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex justify-between items-center">
        <Skeleton className="w-28 h-3 rounded" />
        <Skeleton className="w-24 h-4 rounded-md" />
      </div>
    </div>
  );
}

export function StatCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div 
          key={i} 
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between"
        >
          <div className="flex items-center gap-3.5">
            <Skeleton className="w-11 h-11 rounded-xl shrink-0" />
            <div className="space-y-1.5">
              <Skeleton className="w-14 h-6 rounded-md" />
              <Skeleton className="w-20 h-3.5 rounded" />
            </div>
          </div>
          <Skeleton className="w-4 h-4 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function TableRowsSkeleton({ rows = 5, cols = 5 }) {
  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
      {Array.from({ length: rows }).map((_, rIdx) => (
        <div key={rIdx} className="py-3.5 px-5 flex items-center justify-between gap-4">
          {Array.from({ length: cols }).map((_, cIdx) => (
            <Skeleton 
              key={cIdx} 
              className={`h-4 rounded ${
                cIdx === 0 ? 'w-28' : cIdx === 1 ? 'w-40' : cIdx === cols - 1 ? 'w-16 ml-auto' : 'w-24'
              }`} 
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CaseDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="w-12 h-3.5 rounded" />
        <Skeleton className="w-3 h-3 rounded-full" />
        <Skeleton className="w-28 h-3.5 rounded" />
      </div>

      {/* Header Container Skeleton */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
          <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Skeleton className="w-36 h-6 rounded-md" />
              <Skeleton className="w-20 h-5 rounded-md" />
            </div>
            <Skeleton className="w-48 h-3.5 rounded" />
          </div>
        </div>

        <div className="flex items-center gap-6 sm:gap-10">
          <div className="space-y-1">
            <Skeleton className="w-14 h-2.5 rounded" />
            <Skeleton className="w-20 h-4 rounded" />
          </div>
          <div className="space-y-1">
            <Skeleton className="w-16 h-2.5 rounded" />
            <Skeleton className="w-16 h-4 rounded" />
          </div>
          <div className="space-y-1">
            <Skeleton className="w-16 h-2.5 rounded" />
            <Skeleton className="w-20 h-4 rounded" />
          </div>
          <Skeleton className="w-9 h-9 rounded-xl" />
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-4 pt-1">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="w-32 h-8 rounded-lg mb-2" />
        ))}
      </div>

      {/* Body Content Skeleton */}
      <div className="space-y-4 pt-2">
        <Skeleton className="w-full h-32 rounded-2xl" />
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="w-40 h-5 rounded" />
            <Skeleton className="w-28 h-8 rounded-xl" />
          </div>
          <TableRowsSkeleton rows={4} cols={5} />
        </div>
      </div>
    </div>
  );
}
