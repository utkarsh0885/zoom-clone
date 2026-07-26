import * as React from "react"
import { cn } from "@/lib/utils"

interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
}

export function SectionHeader({ title, description, className, ...props }: SectionHeaderProps) {
  return (
    <div className={cn("mb-3 mt-1", className)} {...props}>
      <h2 className="text-[13px] font-semibold tracking-wide uppercase text-zoom-text-muted">{title}</h2>
      {description && <p className="text-zoom-text-dim text-[11px] mt-0.5">{description}</p>}
    </div>
  )
}
