import { useState, useEffect, useCallback } from "react";

export const useCooldownTimer = (initialSeconds: number = 0) => {
  const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!isActive || remainingSeconds <= 0) {
      if (remainingSeconds <= 0) {
        setIsActive(false);
      }
      return;
    }

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          setIsActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, remainingSeconds]);

  const startTimer = useCallback((minutes: number) => {
    setRemainingSeconds(Math.ceil(minutes * 60));
    setIsActive(true);
  }, []);

  const reset = useCallback(() => {
    setRemainingSeconds(0);
    setIsActive(false);
  }, []);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, []);

  return {
    remainingSeconds,
    isActive,
    formattedTime: formatTime(remainingSeconds),
    startTimer,
    reset,
  };
};
