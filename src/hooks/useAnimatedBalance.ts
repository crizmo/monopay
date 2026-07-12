import { useState, useCallback, useRef, useEffect } from 'react';

export function useAnimatedBalance(targetBalance: number, duration = 600): {
  displayBalance: number;
  flashClass: 'flash-green' | 'flash-red' | '';
} {
  const [displayBalance, setDisplayBalance] = useState(targetBalance);
  const [flashClass, setFlashClass] = useState<'flash-green' | 'flash-red' | ''>('');
  const prevBalance = useRef(targetBalance);
  const animFrame = useRef<number>(0);

  useEffect(() => {
    const diff = targetBalance - prevBalance.current;
    if (diff === 0) return;

    setFlashClass(diff > 0 ? 'flash-green' : 'flash-red');

    const startBalance = displayBalance;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startBalance + diff * eased);
      setDisplayBalance(current);

      if (progress < 1) {
        animFrame.current = requestAnimationFrame(animate);
      } else {
        prevBalance.current = targetBalance;
      }
    };

    cancelAnimationFrame(animFrame.current);
    animFrame.current = requestAnimationFrame(animate);

    const flashTimeout = setTimeout(() => setFlashClass(''), 800);

    return () => {
      cancelAnimationFrame(animFrame.current);
      clearTimeout(flashTimeout);
    };
  }, [targetBalance, duration]);

  return { displayBalance, flashClass };
}
