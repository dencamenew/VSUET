import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function Moveable({
    children,
    condition,
    from = { x: 0, y: 0 },
    to = { x: 0, y: 0 },
    unmount = false,
    backdrop,
    initial = true,
    onExitComplete,
    onClose
}: {
    children: React.ReactNode;
    condition: boolean;
    from?: { x: number; y: number };
    to?: { x: number; y: number };
    initial?: boolean;
    unmount?: boolean;
    backdrop?: boolean;
    onExitComplete?: () => void;
    onClose?: () => void;
}) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const contentElement = (
        <AnimatePresence
            initial={initial}
            mode="wait"
            onExitComplete={onExitComplete}
        >
            {(condition || !unmount) && (
                <motion.div
                    key="moveable-content"
                    initial={from}
                    animate={condition ? to : from}
                    exit={from}
                    transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 40,
                    }}
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );

    const backdropElement = (
        <AnimatePresence>
            {(condition || !unmount) && (
                <motion.div
                    onClick={onClose}
                    key="backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: condition ? 0.5 : 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: '#000',
                        zIndex: 90,
                    }}
                />
            )}
        </AnimatePresence>
    );

    if (backdrop && mounted) {
        return createPortal(
            <>
                {backdropElement}
                <div style={{ position: 'fixed', right: 0, top: 0, zIndex: 100 }}>
                    {contentElement}
                </div>
            </>,
            document.body
        );
    }

    return contentElement;
}
