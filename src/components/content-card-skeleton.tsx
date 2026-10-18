import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function ContentCardSkeleton({ type }: { type: 'channel' | 'movie' | 'series' }) {
    const aspectRatio = type === 'movie' ? 'aspect-[9/16]' : 'aspect-video';

    return (
        <div className="space-y-2">
            <div className={cn('relative overflow-hidden rounded-lg', aspectRatio)}>
                <Skeleton className="h-full w-full" />
            </div>
            <div className="space-y-1.5">
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-3 w-3/4" />
            </div>
        </div>
    )
}
