import { cn } from "@/lib/utils";
import type { ContainerProps } from "@/types/ui.types";

export function Container({ children, className }: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-12 xl:px-16",
        className,
      )}
    >
      {children}
    </div>
  );
}
