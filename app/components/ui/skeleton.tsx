import { cn } from "~/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "rounded-md bg-white/5 bg-[linear-gradient(110deg,transparent_40%,oklch(1_0_0/0.06)_50%,transparent_60%)] bg-[length:200%_100%] motion-safe:animate-shimmer",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
