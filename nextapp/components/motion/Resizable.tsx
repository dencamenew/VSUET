import clsx from "clsx";
import { AnimatePresence, motion, TargetAndTransition } from "framer-motion";
import { PropsWithChildren } from "react";

type ResizableProps = PropsWithChildren<{
    width: number | string;
    height: number | string;
    className?: string;
    initial?: TargetAndTransition;
    open?: boolean;
    fromHeight?: boolean;
    fromWidth?: boolean;
    as?: ReturnType<typeof motion>,
    onAnimationComplete?: () => void;
}>;

export function Resizable({
    width,
    height,
    children,
    className,
    initial = { width: 0, height: 0 },
    open = true,
    fromHeight = false,
    fromWidth = true,
    as
}: ResizableProps) {
    const Component = as || motion.div;
    return (
        <AnimatePresence mode="wait">
            {open && (
                <Component
                    className={className}
                    initial={{
                        ...initial, 
                        ['--resize-width' as string]: initial.width ?? 0, ['--resize-height' as string]: initial.height ?? 0
                    }}
                    animate={{ width, height, ['--resize-width']: width, ['--resize-height']: height }}
                    exit={{ 
                        width: fromWidth ? 0 : width, height: fromHeight ? 0 : height, 
                        ['--resize-width']: fromWidth ? 0 : width, ['--resize-height']: fromHeight ? 0 : height 
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 340,
                        damping: 30,
                        mass: 0.5
                    }}
                >
                    {children}
                </Component>
            )}
        </AnimatePresence>
    );
};

export function ResizableX({className, children, ...props}: Partial<ResizableProps>) {
    return <Resizable 
        className={clsx("w-full", className)} 
        initial={{ height: "auto", width: '0' }}
        width="100%"
        height="auto"
        fromWidth
        {...props}
    >{children}</Resizable>;
}

export function ResizableY({className, children, ...props}: Partial<ResizableProps>) {
    return <Resizable 
        className={clsx("h-full", className)} 
        initial={{ width: "auto", height: '0' }}
        width="auto"
        height="100%"
        fromWidth={false}
        fromHeight
        {...props}
    >{children}</Resizable>;
}
