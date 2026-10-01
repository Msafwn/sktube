import { useRef, useCallback, useEffect, useState } from 'react';

/**
 * Custom Hook: useThrottleCallback
 * Throttles execution of an action/function (e.g. button click, scroll handler)
 * Prevents rapid spam clicking from sending multiple API calls.
 * 
 * @param {Function} callback - The function to throttle
 * @param {number} delay - Minimum interval between calls in milliseconds (default: 800ms)
 * @returns {Function} - Throttled callback
 */
export const useThrottleCallback = (callback, delay = 800) => {
  const lastCallRef = useRef(0);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback((...args) => {
    const now = Date.now();
    if (now - lastCallRef.current >= delay) {
      lastCallRef.current = now;
      return callbackRef.current(...args);
    }
  }, [delay]);
};

/**
 * Custom Hook: useThrottleValue
 * Throttles a fast-changing value (e.g. scroll position, window dimensions)
 * 
 * @param {any} value - The input value
 * @param {number} delay - Delay in milliseconds (default: 300ms)
 * @returns {any} - Throttled value
 */
export const useThrottleValue = (value, delay = 300) => {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastExecutedRef = useRef(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      const now = Date.now();
      if (now - lastExecutedRef.current >= delay) {
        setThrottledValue(value);
        lastExecutedRef.current = now;
      }
    }, delay - (Date.now() - lastExecutedRef.current));

    return () => clearTimeout(handler);
  }, [value, delay]);

  return throttledValue;
};

export default useThrottleCallback;
