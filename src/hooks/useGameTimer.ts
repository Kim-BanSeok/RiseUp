import { useState, useRef, useEffect, useCallback } from 'react';

interface UseGameTimerProps {
  initialTime: number;
  onTimeUp?: () => void;
  autoStart?: boolean;
}

interface UseGameTimerReturn {
  timeLeft: number;
  isRunning: boolean;
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: (newTime?: number) => void;
  addTime: (seconds: number) => void;
}

export const useGameTimer = ({
  initialTime,
  onTimeUp,
  autoStart = false
}: UseGameTimerProps): UseGameTimerReturn => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    console.log('⏰ [타이머] 시작');
    setIsRunning(true);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          console.log('⏰ [타이머] 시간 종료');
          setIsRunning(false);
          if (onTimeUp) {
            onTimeUp();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [onTimeUp]);

  const pause = useCallback(() => {
    console.log('⏰ [타이머] 일시정지');
    setIsRunning(false);
    clearTimer();
  }, [clearTimer]);

  const resume = useCallback(() => {
    console.log('⏰ [타이머] 재시작');
    if (timeLeft > 0) {
      start();
    }
  }, [timeLeft, start]);

  const reset = useCallback((newTime?: number) => {
    console.log('⏰ [타이머] 리셋:', newTime || initialTime);
    clearTimer();
    setIsRunning(false);
    setTimeLeft(newTime || initialTime);
  }, [initialTime, clearTimer]);

  const addTime = useCallback((seconds: number) => {
    console.log('⏰ [타이머] 시간 추가:', seconds);
    setTimeLeft(prev => Math.max(0, prev + seconds));
  }, []);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  // 자동 시작
  useEffect(() => {
    if (autoStart && timeLeft > 0 && !isRunning) {
      start();
    }
  }, [autoStart, timeLeft, isRunning, start]);

  return {
    timeLeft,
    isRunning,
    start,
    pause,
    resume,
    reset,
    addTime
  };
}; 