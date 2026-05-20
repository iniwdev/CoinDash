import { useEffect, useRef, useState } from 'react';

/**
 * useAnimatedCounter
 * Smoothly interpolates a numeric value from its previous to its new value
 * using a requestAnimationFrame loop. Zero-dependency — no external libraries.
 *
 * @param {number} target     - The target value to animate toward
 * @param {number} duration   - Animation duration in ms (default 900ms)
 * @param {number} decimals   - Decimal places to keep during interpolation
 */
export function useAnimatedCounter(target, duration = 900, decimals = 2) {
  const [display, setDisplay] = useState(target);
  const prevRef  = useRef(target);
  const rafRef   = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    const from = prevRef.current;
    const to   = target;

    // Nothing to animate
    if (from === to) return;

    // Cancel any in-flight animation
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    startRef.current = null;

    const step = (timestamp) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed  = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic: feels snappy then settles — matches Bloomberg tick feel
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = from + (to - from) * eased;

      setDisplay(parseFloat(value.toFixed(decimals)));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        prevRef.current = to;
        setDisplay(to);
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration, decimals]);

  return display;
}

/**
 * usePriceTick
 * Simulates a live price tick by nudging a base value by a small random delta
 * every `intervalMs`. Returns { value, direction: 'up'|'down'|'flat' }.
 *
 * @param {number} baseValue  - Starting/anchor value
 * @param {number} intervalMs - How often to nudge (default 3000ms)
 * @param {number} volatility - Max % swing per tick (default 0.0012 = 0.12%)
 */
export function usePriceTick(baseValue, intervalMs = 3000, volatility = 0.0012) {
  const [state, setState] = useState({ value: baseValue, direction: 'flat' });
  const prevValue = useRef(baseValue);

  useEffect(() => {
    if (!baseValue) return;
    prevValue.current = baseValue;
    setState({ value: baseValue, direction: 'flat' });

    const id = setInterval(() => {
      const delta     = baseValue * volatility * (Math.random() * 2 - 1);
      const nextValue = parseFloat((prevValue.current + delta).toFixed(2));
      const direction = nextValue > prevValue.current ? 'up' : nextValue < prevValue.current ? 'down' : 'flat';
      prevValue.current = nextValue;
      setState({ value: nextValue, direction });
    }, intervalMs);

    return () => clearInterval(id);
  }, [baseValue, intervalMs, volatility]);

  return state;
}
