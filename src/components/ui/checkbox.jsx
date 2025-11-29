"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    return (
      <input
        type="checkbox"
        className={cn(
          "h-4 w-4 rounded border border-gray-300 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        checked={checked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        {...props}
      />
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
