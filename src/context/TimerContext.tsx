import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Alert, Vibration } from 'react-native';
import { playSound, stopSound } from '../utils/sounds';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from '../components/CustomAlert';

export interface Timer {
  id: string;
  name: string;
  duration: number; // 초기 설정 시간 (밀리초)
  remainingTime: number; // 남은 시간 (밀리초)
  isRunning: boolean;
  isCompleted: boolean;
  soundId: string;
  createdAt: Date;
}

interface TimerContextType {
  timers: Timer[];
  addTimer: (name: string, duration: number, soundId?: string) => void;
  deleteTimer: (id: string) => void;
  startTimer: (id: string) => void;
  pauseTimer: (id: string) => void;
  resetTimer: (id: string) => void;
  updateTimer: (id: string, updates: Partial<Timer>) => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

const TIMERS_STORAGE_KEY = '@RiseUp:timers';

export const TimerProvider = ({ children }: { children: ReactNode }) => {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    buttons: Array<{
      text: string;
      style?: 'default' | 'cancel' | 'destructive';
      onPress?: () => void;
    }>;
  }>({
    visible: false,
    title: '',
    message: '',
    buttons: []
  });

  // 저장된 타이머 로드
  useEffect(() => {
    loadTimers();
  }, []);

  // 타이머 상태 변경 시 저장
  useEffect(() => {
    saveTimers();
  }, [timers]);

  // 실행 중인 타이머들 업데이트
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prevTimers => 
        prevTimers.map(timer => {
          if (timer.isRunning && timer.remainingTime > 0) {
            const newRemainingTime = Math.max(0, timer.remainingTime - 10);
            
            if (newRemainingTime === 0) {
              // 타이머 완료
              handleTimerComplete(timer);
              return {
                ...timer,
                remainingTime: 0,
                isRunning: false,
                isCompleted: true
              };
            }
            
            return {
              ...timer,
              remainingTime: newRemainingTime
            };
          }
          return timer;
        })
      );
    }, 10);

    return () => clearInterval(interval);
  }, []);

  const loadTimers = async () => {
    try {
      const saved = await AsyncStorage.getItem(TIMERS_STORAGE_KEY);
      if (saved) {
        const parsedTimers = JSON.parse(saved).map((timer: any) => ({
          ...timer,
          createdAt: new Date(timer.createdAt),
          isRunning: false, // 앱 재시작 시 모든 타이머 일시정지
        }));
        setTimers(parsedTimers);
      }
    } catch (error) {
      console.error('타이머 로드 실패:', error);
    }
  };

  const saveTimers = async () => {
    try {
      await AsyncStorage.setItem(TIMERS_STORAGE_KEY, JSON.stringify(timers));
    } catch (error) {
      console.error('타이머 저장 실패:', error);
    }
  };

  // TimerContext에서 Alert 대신 커스텀 알림 사용
  const handleTimerComplete = (timer: Timer) => {
    console.log('🔔 타이머 완료:', timer.name);
    
    // 진동
    Vibration.vibrate([200, 100, 200, 100, 200]);
    
    // 사운드 재생
    if (timer.soundId) {
      playSound(timer.soundId);
      // 3초 후 사운드 정지
      setTimeout(() => stopSound(), 3000);
    }
    
    // 커스텀 알림 표시는 TimerScreen에서 처리하도록 변경
    // Alert 대신 콜백 함수 사용
  };

  const addTimer = (name: string, duration: number, soundId: string = 'default') => {
    const newTimer: Timer = {
      id: Date.now().toString(),
      name,
      duration,
      remainingTime: duration,
      isRunning: false,
      isCompleted: false,
      soundId,
      createdAt: new Date()
    };
    
    setTimers(prev => [...prev, newTimer]);
    console.log('✅ 새 타이머 추가:', newTimer);
  };

  const deleteTimer = (id: string) => {
    setTimers(prev => prev.filter(timer => timer.id !== id));
    console.log('🗑️ 타이머 삭제:', id);
  };

  const startTimer = (id: string) => {
    setTimers(prev => 
      prev.map(timer => 
        timer.id === id 
          ? { ...timer, isRunning: true, isCompleted: false }
          : timer
      )
    );
    console.log('▶️ 타이머 시작:', id);
  };

  const pauseTimer = (id: string) => {
    setTimers(prev => 
      prev.map(timer => 
        timer.id === id 
          ? { ...timer, isRunning: false }
          : timer
      )
    );
    console.log('⏸️ 타이머 일시정지:', id);
  };

  const resetTimer = (id: string) => {
    setTimers(prev => 
      prev.map(timer => 
        timer.id === id 
          ? { 
              ...timer, 
              remainingTime: timer.duration,
              isRunning: false,
              isCompleted: false
            }
          : timer
      )
    );
    console.log('🔄 타이머 리셋:', id);
  };

  const updateTimer = (id: string, updates: Partial<Timer>) => {
    setTimers(prev => 
      prev.map(timer => 
        timer.id === id 
          ? { ...timer, ...updates }
          : timer
      )
    );
  };

  return (
    <TimerContext.Provider value={{
      timers,
      addTimer,
      deleteTimer,
      startTimer,
      pauseTimer,
      resetTimer,
      updateTimer
    }}>
      {children}
      {/* 커스텀 Alert */}
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onRequestClose={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
      />
    </TimerContext.Provider>
  );
};

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within TimerProvider');
  }
  return context;
};
