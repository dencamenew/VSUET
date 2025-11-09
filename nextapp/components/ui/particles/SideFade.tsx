import { cn } from "@/lib/utils";
import { RefObject } from "react";

export function SideFade({
    width = 40,
    height = 40,
    className,
    ref,
    transition = 0.3
}: {
    width: number | string;
    height: number | string;
    className?: string;
    ref?: RefObject<HTMLDivElement | null>,
    transition?: number
}) {

    return (
        <div
            ref={ref}
            style={{
                pointerEvents: 'none',
                width,
                height,
                transition: `opacity ${transition}s cubic-bezier(0.25, 1, 0.5, 1)`
            }}
            className={cn("absolute", className)}
        />
    );
};