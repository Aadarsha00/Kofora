import { cn } from "@/lib/utils";

export const Spinner = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin",
        className
      )}
    />
  );
};