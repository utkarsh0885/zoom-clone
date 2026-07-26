import * as React from "react";
import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-md bg-zoom-dark-elevated animate-pulse", className)}
      aria-hidden="true"
      {...props}
    />
  );
}

export function SkeletonHero() {
  return (
    <div className="flex flex-col items-center py-4 space-y-3">
      <Skeleton className="h-12 w-48" />
      <Skeleton className="h-4 w-32" />
    </div>
  );
}

export function SkeletonActionTile() {
  return (
    <div className="flex flex-col items-center gap-2">
      <Skeleton className="h-12 w-12 rounded-2xl" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

export function SkeletonMeetingCard() {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-zoom-dark-border bg-zoom-dark-surface">
      <Skeleton className="h-10 w-10 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-7 w-16 rounded" />
    </div>
  );
}
