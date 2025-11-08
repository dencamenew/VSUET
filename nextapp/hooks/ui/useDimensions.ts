import { DependencyList, useLayoutEffect, useState } from "react";

export function useDimensions(
  ref: React.RefObject<HTMLDivElement | null>,
  deps: DependencyList,
  condition: boolean = true,
  fromNull: boolean = true
) {
  const [dimensions, setDimensions] = useState(
    {
      width: fromNull ? 0 : window.innerWidth,
      height: fromNull ? 0 : window.innerHeight
    }
  );

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    const updateDimensions = () => {
      if (!condition) return;
      setDimensions({
        width: element.offsetWidth,
        height: element.offsetHeight
      });
    };

    const observer = new ResizeObserver(entries => {
      requestAnimationFrame(() => {
        if (!Array.isArray(entries) || !entries.length) return;
        updateDimensions();
      });
    });

    observer.observe(element);
    updateDimensions();

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, ...deps, condition]);

  return dimensions;
};