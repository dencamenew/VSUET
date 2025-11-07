import { ReactNode } from "react";

export function Drawer(
    {
        isOpen,
        onClose,
        children
    } : {
        isOpen: boolean,
        onClose: () => void,
        children: ReactNode
    }
) {

    return isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-end" onClick={onClose}>
            <div className="w-80 h-full bg-card rounded-l-3xl p-6 animate-slide-in-right border-l border-border overflow-y-auto">
                {children}
            </div>
        </div>
    );
};