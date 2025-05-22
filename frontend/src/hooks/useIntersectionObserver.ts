import { useState, useEffect, useRef } from 'react';

export const useIntersectionObserver = (options: IntersectionObserverInit = {}) => {
  const [isInView, setIsInView] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasTriggered) {
          setIsInView(true);
          setHasTriggered(true);
        }
      },
      { threshold: 0.3, ...options }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [hasTriggered, options]);

  return [elementRef, isInView, hasTriggered] as const;
};
