// Drawer.tsx
import { ReactNode, useRef, useEffect, useState } from "react";
import { Moveable } from "../motion/Moveable";

export function Drawer({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const [drawerWidth, setDrawerWidth] = useState(320);

  useEffect(() => {
    if (drawerRef.current) {
      const width = drawerRef.current.offsetWidth;
      setDrawerWidth(width);
    }
  }, []);

  return (
    <Moveable
      condition={isOpen}
      from={{ x: drawerWidth, y: 0 }}
      to={{ x: 0, y: 0 }}
      unmount={true}
      backdrop={true}
      initial={false}
      onExitComplete={onClose}
      onClose={onClose}
    >
      <div
        ref={drawerRef}
        className="w-80 h-screen bg-card rounded-l-3xl p-6 border-l border-border overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </Moveable>
  );
}
