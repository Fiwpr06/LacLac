import { useEffect, useRef } from 'react';
import { Accelerometer } from 'expo-sensors';

export const useShakeDetector = (
  onShake: () => void,
  config?: {
    thresholdG?: number;
    debounceMs?: number;
    enabled?: boolean;
  },
) => {
  const threshold = config?.thresholdG ?? 1.8;
  const debounceMs = config?.debounceMs ?? 1000;
  const enabled = config?.enabled ?? true;
  const lastTriggered = useRef(0);
  const onShakeRef = useRef(onShake);

  useEffect(() => {
    onShakeRef.current = onShake;
  }, [onShake]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    Accelerometer.setUpdateInterval(200);

    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      const now = Date.now();

      if (magnitude > threshold && now - lastTriggered.current > debounceMs) {
        lastTriggered.current = now;
        onShakeRef.current();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [threshold, debounceMs, enabled]);
};
