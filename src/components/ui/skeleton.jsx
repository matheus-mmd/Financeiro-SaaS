import { cn } from "@/lib/utils";

/**
 * Componente Skeleton - Placeholder animado para loading
 * Usado para criar uma melhor experiência de loading (skeleton loading)
 */
function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-200", className)}
      {...props}
    />
  );
}

export { Skeleton };
