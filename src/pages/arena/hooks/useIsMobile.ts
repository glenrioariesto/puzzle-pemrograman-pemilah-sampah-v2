import { useState, useEffect } from 'react';

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.innerWidth < 768 ||
      window.innerHeight < 520 ||
      (('ontouchstart' in window || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0)) && window.innerWidth < 1024)
    );
  });

  useEffect(() => {
    const handleResize = () => {
      const mobile = (
        window.innerWidth < 768 ||
        window.innerHeight < 520 ||
        (('ontouchstart' in window || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0)) && window.innerWidth < 1024)
      );
      setIsMobile(mobile);
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return isMobile;
}
