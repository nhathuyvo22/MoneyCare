import { useState, useEffect, useRef } from 'react';

/**
 * Hook animate số từ giá trị cũ sang giá trị mới bằng requestAnimationFrame
 * Hỗ trợ easing mượt mà, định dạng tiền tệ VNĐ và tôn trọng prefers-reduced-motion
 */
export function useCountUp(endValue, {
  duration = 1000,
  startValue = null,
  easing = (t) => 1 - Math.pow(1 - t, 3), // cubic ease-out
  decimals = 0,
} = {}) {
  const [displayValue, setDisplayValue] = useState(endValue);
  const prevValueRef = useRef(startValue !== null ? startValue : 0);
  const animFrameRef = useRef(null);

  useEffect(() => {
    // Kiểm tra cài đặt prefers-reduced-motion của người dùng
    const prefersReducedMotion = typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setDisplayValue(endValue);
      prevValueRef.current = endValue;
      return;
    }

    const start = prevValueRef.current;
    const target = Number(endValue) || 0;
    const change = target - start;

    if (change === 0) {
      setDisplayValue(target);
      return;
    }

    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easing(progress);
      const current = start + change * easedProgress;

      setDisplayValue(current);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(target);
        prevValueRef.current = target;
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [endValue, duration]);

  return displayValue;
}
