interface SkeletonLoaderProps {
    className?: string
    width?: string
    height?: string
    variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
}

export default function SkeletonLoader({
    className = '',
    width = 'w-full',
    height = 'h-4',
    variant = 'rounded'
}: SkeletonLoaderProps) {
    const variantClasses = {
        text: 'rounded',
        circular: 'rounded-full',
        rectangular: 'rounded-none',
        rounded: 'rounded-lg'
    }

    return (
        <div
            className={`
        bg-gray-200 dark:bg-gray-700 
        animate-pulse 
        ${variantClasses[variant]} 
        ${width} 
        ${height} 
        ${className}
      `}
        />
    )
}

// Pre-built skeleton patterns
export function DashboardSkeleton() {
    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header Skeleton */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <SkeletonLoader variant="circular" width="w-12" height="h-12" />
                        <div className="space-y-2">
                            <SkeletonLoader width="w-48" height="h-6" />
                            <SkeletonLoader width="w-64" height="h-4" />
                        </div>
                    </div>
                    <SkeletonLoader width="w-32" height="h-10" />
                </div>
            </div>

            {/* Stats Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <SkeletonLoader variant="circular" width="w-8" height="h-8" />
                            <div className="space-y-2">
                                <SkeletonLoader width="w-16" height="h-6" />
                                <SkeletonLoader width="w-24" height="h-4" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Chart Skeleton */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                <SkeletonLoader width="w-full" height="h-80" />
            </div>
        </div>
    )
}

export function SidebarSkeleton() {
    return (
        <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                    <SkeletonLoader variant="circular" width="w-8" height="h-8" />
                    <SkeletonLoader width="w-20" height="h-5" />
                </div>
            </div>

            <div className="p-4 space-y-2">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                        <SkeletonLoader variant="circular" width="w-5" height="h-5" />
                        <SkeletonLoader width="w-24" height="h-4" />
                    </div>
                ))}
            </div>
        </aside>
    )
} 