import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import { Button } from "../ui/button";
import { X } from "lucide-react";

export function Modal(
    {
        isOpen,
        onClose,
        hasBackdrop = true,
        children
    }: {
        isOpen: boolean,
        onClose: () => void,
        hasBackdrop?: boolean,
        children?: React.ReactNode
    }
) {
    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed top-0 left-0 z-[100] w-screen h-screen flex items-center justify-center pointer-events-none"
                    transition={{ duration: 0.2 }}
                >
                    {/* Animated Backdrop */}
                    {hasBackdrop && (
                        <motion.div
                            className="absolute inset-0 bg-foreground/30"
                            initial={{ opacity: 0, pointerEvents: "none" }}
                            animate={{ opacity: 1, pointerEvents: "auto" }}
                            exit={{ opacity: 0, pointerEvents: "none"  }}
                            transition={{ duration: 0.6 }}
                            onClick={onClose}
                        />
                    )}

                    {/* Modal Content */}
                    <motion.div
                        className="pointer-events-auto bg-background relative rounded-2xl shadow-2xl max-h-[92vh] overflow-hidden max-w-[95vw] md:max-w-[80vw] z-10"
                        initial={{
                            y: "calc(50vh + 50%)",
                        }}
                        animate={{
                            y: 0,
                        }}
                        exit={{
                            y: "calc(50vh + 50%)",
                        }}
                        transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 40,
                            mass: 0.5,
                            restDelta: 0.01
                        }}
                        onClick={(e) => e.stopPropagation()} // Предотвращаем закрытие при клике на контент
                    >
                        <div className="w-full h-full min-h-40 rounded-2xl overflow-hidden relative">
                            {/* Close Button */}
                            <div className="absolute top-4 right-4 z-50">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onClose}
                                    className="text-muted-foreground hover:text-foreground rounded-md"
                                >
                                    <X className="size-8" />
                                </Button>
                            </div>

                            {/* Content */}
                            <div className="size-full max-h-[92vh] overflow-y-auto p-6 pt-4">
                                {children}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}
