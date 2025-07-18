import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Vibration, AppState } from 'react-native';
import { playSound } from '../utils/sounds';
import BackgroundTimerManager from '../utils/BackgroundTimerManager';
import NotificationManager from '../notifications/NotificationManager';

export interface IntervalPhase {
  id: string;
  name: string;
  duration: number; // 초 단위
  color: string;
  soundId?: string;
}

export interface IntervalTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  phases: IntervalPhase[];
  totalCycles: number;
  category: 'workout' | 'study' | 'meditation' | 'custom';
}

export interface IntervalSession {
  id: string;
  templateId: string;
  templateName: string;
  startTime: Date;
  endTime?: Date;
  completedCycles: number;
  totalCycles: number;
  currentPhaseIndex: number;
  isCompleted: boolean;
  isPaused: boolean;
}

export interface IntervalHistory {
  id: string;
  templateId: string;
  templateName: string;
  startTime: Date;
  endTime: Date;
  completedCycles: number;
  totalCycles: number;
  totalDuration: number; // 실제 소요 시간 (초)
}

interface IntervalContextType {
  // 템플릿 관리
  templates: IntervalTemplate[];
  addTemplate: (template: Omit<IntervalTemplate, 'id'>) => void;
  removeTemplate: (id: string) => void;
  updateTemplate: (id: string, updates: Partial<IntervalTemplate>) => void;
  
  // 세션 관리
  currentSession: IntervalSession | null;
  startSession: (templateId: string) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  stopSession: () => void;
  resetSession: () => void;
  
  // 타이머 상태
  remainingTime: number;
  currentPhase: IntervalPhase | null;
  currentCycle: number;
  isRunning: boolean;
  
  // 히스토리
  history: IntervalHistory[];
  clearHistory: () => void;
}

const IntervalContext = createContext<IntervalContextType | undefined>(undefined);

const TEMPLATES_STORAGE_KEY = '@RiseUp:intervalTemplates';
const HISTORY_STORAGE_KEY = '@RiseUp:intervalHistory';

// 기본 템플릿들
const DEFAULT_TEMPLATES: IntervalTemplate[] = [
  {
    id: 'workout_basic',
    name: '기본 운동',
    description: '30초 운동, 10초 휴식',
    icon: '💪',
    category: 'workout',
    totalCycles: 8,
    phases: [
      {
        id: 'work',
        name: '운동',
        duration: 30,
        color: '#FF6B6B',
        soundId: 'default'
      },
      {
        id: 'rest',
        name: '휴식',
        duration: 10,
        color: '#4ECDC4',
        soundId: 'default'
      }
    ]
  },
  {
    id: 'pomodoro',
    name: '포모도로',
    description: '25분 집중, 5분 휴식',
    icon: '🍅',
    category: 'study',
    totalCycles: 4,
    phases: [
      {
        id: 'focus',
        name: '집중 시간',
        duration: 25 * 60,
        color: '#FF6B6B',
        soundId: 'default'
      },
      {
        id: 'break',
        name: '휴식 시간',
        duration: 5 * 60,
        color: '#4ECDC4',
        soundId: 'default'
      }
    ]
  },
  {
    id: 'tabata',
    name: '타바타',
    description: '20초 고강도, 10초 휴식',
    icon: '🔥',
    category: 'workout',
    totalCycles: 8,
    phases: [
      {
        id: 'work',
        name: '고강도',
        duration: 20,
        color: '#FF4757',
        soundId: 'default'
      },
      {
        id: 'rest',
        name: '휴식',
        duration: 10,
        color: '#2ED573',
        soundId: 'default'
      }
    ]
  },
  {
    id: 'meditation',
    name: '명상 호흡',
    description: '4초 들숨, 4초 멈춤, 4초 날숨',
    icon: '🧘‍♂️',
    category: 'meditation',
    totalCycles: 10,
    phases: [
      {
        id: 'inhale',
        name: '들숨',
        duration: 4,
        color: '#74B9FF',
        soundId: 'gentle'
      },
      {
        id: 'hold',
        name: '멈춤',
        duration: 4,
        color: '#A29BFE',
        soundId: 'gentle'
      },
      {
        id: 'exhale',
        name: '날숨',
        duration: 4,
        color: '#6C5CE7',
        soundId: 'gentle'
      }
    ]
  }
];

export const IntervalProvider = ({ children }: { children: ReactNode }) => {
  const [templates, setTemplates] = useState<IntervalTemplate[]>(DEFAULT_TEMPLATES);
  const [currentSession, setCurrentSession] = useState<IntervalSession | null>(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [history, setHistory] = useState<IntervalHistory[]>([]);
  
  // 백그라운드 관리자
  const backgroundManager = useRef(BackgroundTimerManager.getInstance());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // 현재 상태 계산
  const currentPhase = currentSession && currentSession.currentPhaseIndex < getCurrentTemplate()?.phases.length 
    ? getCurrentTemplate()?.phases[currentSession.currentPhaseIndex] || null
    : null;
  
  const currentCycle = currentSession ? Math.floor(currentSession.currentPhaseIndex / getCurrentTemplate()?.phases.length) + 1 : 0;

  function getCurrentTemplate() {
    return currentSession ? templates.find(t => t.id === currentSession.templateId) : null;
  }

  // 백그라운드 복귀 시 동기화
  useEffect(() => {
    const handleBackgroundSync = async (timerState: any) => {
      if (timerState && currentSession && isRunning) {
        console.log('백그라운드에서 복귀, 타이머 동기화 중...');
        
        // 백그라운드에서 경과된 시간 계산
        const currentTime = Date.now();
        const elapsedSeconds = Math.floor((currentTime - startTimeRef.current) / 1000);
        const totalPhaseTime = currentPhase?.duration || 0;
        const newRemainingTime = Math.max(0, totalPhaseTime - elapsedSeconds);
        
        setRemainingTime(newRemainingTime);
        
        // 시간이 다 지났으면 다음 페이즈로
        if (newRemainingTime === 0) {
          handlePhaseComplete();
        }
      }
    };

    backgroundManager.current.addListener(handleBackgroundSync);
    
    return () => {
      backgroundManager.current.removeListener(handleBackgroundSync);
    };
  }, [currentSession, isRunning, currentPhase]);

  // 데이터 로드/저장
  useEffect(() => {
    loadData();
    loadBackgroundState();
  }, []);

  useEffect(() => {
    saveTemplates();
  }, [templates]);

  useEffect(() => {
    saveHistory();
  }, [history]);

  // 백그라운드 상태 로드
  const loadBackgroundState = async () => {
    const savedState = await backgroundManager.current.loadTimerState();
    if (savedState && savedState.isRunning) {
      console.log('백그라운드에서 실행 중인 타이머 복원');
      // 복원 로직 구현
      await restoreTimerFromBackground(savedState);
    }
  };

  // 백그라운드에서 타이머 복원
  const restoreTimerFromBackground = async (savedState: any) => {
    try {
      const template = templates.find(t => t.id === savedState.sessionId);
      if (!template) return;

      // 세션 복원
      const restoredSession: IntervalSession = {
        id: savedState.sessionId,
        templateId: savedState.sessionId,
        templateName: template.name,
        startTime: new Date(savedState.startTime),
        completedCycles: 0,
        totalCycles: template.totalCycles,
        currentPhaseIndex: savedState.currentPhaseIndex,
        isCompleted: false,
        isPaused: false
      };

      setCurrentSession(restoredSession);
      setRemainingTime(savedState.remainingTime);
      setIsRunning(true);
      startTimeRef.current = savedState.startTime;

      console.log('타이머 백그라운드 복원 완료');
    } catch (error) {
      console.error('백그라운드 타이머 복원 실패:', error);
    }
  };

  // 타이머 로직 (기존과 동일하지만 백그라운드 저장 추가)
  useEffect(() => {
    if (isRunning && remainingTime > 0) {
      intervalRef.current = setInterval(() => {
        setRemainingTime(prev => {
          const newTime = prev - 1;
          
          // 백그라운드 상태 저장
          if (currentSession) {
            backgroundManager.current.saveTimerState({
              isRunning: true,
              startTime: startTimeRef.current,
              remainingTime: newTime,
              currentPhaseIndex: currentSession.currentPhaseIndex,
              sessionId: currentSession.templateId
            });
          }
          
          if (newTime <= 0) {
            handlePhaseComplete();
            return 0;
          }
          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, remainingTime, currentSession]);

  const loadData = async () => {
    try {
      const [savedTemplates, savedHistory] = await Promise.all([
        AsyncStorage.getItem(TEMPLATES_STORAGE_KEY),
        AsyncStorage.getItem(HISTORY_STORAGE_KEY)
      ]);

      if (savedTemplates) {
        const parsed = JSON.parse(savedTemplates);
        setTemplates([...DEFAULT_TEMPLATES, ...parsed.filter((t: IntervalTemplate) => 
          !DEFAULT_TEMPLATES.some(dt => dt.id === t.id)
        )]);
      }

      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error('인터벌 데이터 로드 실패:', error);
    }
  };

  const saveTemplates = async () => {
    try {
      const customTemplates = templates.filter(t => 
        !DEFAULT_TEMPLATES.some(dt => dt.id === t.id)
      );
      await AsyncStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(customTemplates));
    } catch (error) {
      console.error('템플릿 저장 실패:', error);
    }
  };

  const saveHistory = async () => {
    try {
      await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error('히스토리 저장 실패:', error);
    }
  };

  const handlePhaseComplete = async () => {
    if (!currentSession) return;

    const template = getCurrentTemplate();
    if (!template) return;

    // 알림 처리
    const notificationManager = NotificationManager.getInstance();
    await notificationManager.showIntervalPhaseNotification(
      currentPhase?.name || '다음 단계',
      template.totalCycles * template.phases.length - currentSession.currentPhaseIndex - 1,
      template.totalCycles * template.phases.length
    );

    // 사운드 재생 및 진동
    if (currentPhase?.soundId) {
      playSound(currentPhase.soundId);
    }
    Vibration.vibrate([0, 200, 100, 200]);

    const nextPhaseIndex = currentSession.currentPhaseIndex + 1;
    const totalPhases = template.phases.length * template.totalCycles;

    if (nextPhaseIndex >= totalPhases) {
      // 세션 완료
      completeSession();
    } else {
      // 다음 페이즈로 이동
      setCurrentSession(prev => prev ? {
        ...prev,
        currentPhaseIndex: nextPhaseIndex
      } : null);

      const nextPhase = template.phases[nextPhaseIndex % template.phases.length];
      setRemainingTime(nextPhase.duration);
      startTimeRef.current = Date.now();
      
      // 다음 페이즈 알림 예약
      await schedulePhaseNotification(nextPhase.name, nextPhase.duration);
    }
  };

  // 페이즈 알림 스케줄링
  const schedulePhaseNotification = async (phaseName: string, delay: number = 0) => {
    try {
      const notificationManager = NotificationManager.getInstance();
      
      if (delay > 0) {
        // 페이즈 완료 시 알림
        await notificationManager.scheduleNotification(
          'interval_phase_complete',
          '인터벌 타이머',
          `${phaseName} 완료! 다음 단계를 시작하세요.`,
          new Date(Date.now() + delay * 1000)
        );
      } else {
        // 즉시 알림
        await notificationManager.showNotification(
          'interval_phase_current',
          '인터벌 타이머',
          `${phaseName} 시작!`
        );
      }
    } catch (error) {
      console.error('알림 스케줄링 실패:', error);
    }
  };

  const completeSession = async () => {
    if (!currentSession) return;

    const template = getCurrentTemplate();
    if (!template) return;

    // 백그라운드 상태 초기화
    await backgroundManager.current.clearTimerState();

    const historyEntry: IntervalHistory = {
      id: Date.now().toString(),
      templateId: currentSession.templateId,
      templateName: template.name,
      startTime: currentSession.startTime,
      endTime: new Date(),
      completedCycles: template.totalCycles,
      totalCycles: template.totalCycles,
      totalDuration: Math.floor((Date.now() - currentSession.startTime.getTime()) / 1000)
    };

    setHistory(prev => [historyEntry, ...prev]);
    setCurrentSession(null);
    setIsRunning(false);
    setRemainingTime(0);

    // 완료 알림
    await schedulePhaseNotification('세션 완료! 🎉');
    
    Alert.alert(
      '🎉 세션 완료!',
      `${template.name} 세션을 성공적으로 완료했습니다!`,
      [{ text: '확인' }]
    );
  };

  const addTemplate = (template: Omit<IntervalTemplate, 'id'>) => {
    const newTemplate: IntervalTemplate = {
      ...template,
      id: `custom_${Date.now()}`
    };
    setTemplates(prev => [...prev, newTemplate]);
  };

  const removeTemplate = (id: string) => {
    if (DEFAULT_TEMPLATES.some(t => t.id === id)) return; // 기본 템플릿은 삭제 불가
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  const updateTemplate = (id: string, updates: Partial<IntervalTemplate>) => {
    setTemplates(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const startSession = async (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (!template) return;

    const newSession: IntervalSession = {
      id: Date.now().toString(),
      templateId,
      templateName: template.name,
      startTime: new Date(),
      completedCycles: 0,
      totalCycles: template.totalCycles,
      currentPhaseIndex: 0,
      isCompleted: false,
      isPaused: false
    };

    setCurrentSession(newSession);
    setRemainingTime(template.phases[0].duration);
    setIsRunning(true);
    startTimeRef.current = Date.now();

    // 백그라운드 상태 저장
    await backgroundManager.current.saveTimerState({
      isRunning: true,
      startTime: startTimeRef.current,
      remainingTime: template.phases[0].duration,
      currentPhaseIndex: 0,
      sessionId: templateId
    });

    // 첫 페이즈 시작 알림
    await schedulePhaseNotification(template.phases[0].name);
  };

  const pauseSession = async () => {
    setIsRunning(false);
    if (currentSession) {
      setCurrentSession(prev => prev ? { ...prev, isPaused: true } : null);
      
      // 백그라운드 상태 업데이트
      await backgroundManager.current.saveTimerState({
        isRunning: false,
        startTime: startTimeRef.current,
        remainingTime,
        currentPhaseIndex: currentSession.currentPhaseIndex,
        sessionId: currentSession.templateId
      });
    }
  };

  const resumeSession = async () => {
    setIsRunning(true);
    startTimeRef.current = Date.now() - (getCurrentTemplate()?.phases[currentSession?.currentPhaseIndex || 0]?.duration || 0) + remainingTime;
    
    if (currentSession) {
      setCurrentSession(prev => prev ? { ...prev, isPaused: false } : null);
      
      // 백그라운드 상태 업데이트
      await backgroundManager.current.saveTimerState({
        isRunning: true,
        startTime: startTimeRef.current,
        remainingTime,
        currentPhaseIndex: currentSession.currentPhaseIndex,
        sessionId: currentSession.templateId
      });
    }
  };

  const stopSession = async () => {
    setCurrentSession(null);
    setIsRunning(false);
    setRemainingTime(0);
    
    // 백그라운드 상태 초기화
    await backgroundManager.current.clearTimerState();
  };

  const resetSession = async () => {
    if (currentSession) {
      const template = getCurrentTemplate();
      if (template) {
        setCurrentSession(prev => prev ? {
          ...prev,
          currentPhaseIndex: 0,
          isPaused: false
        } : null);
        setRemainingTime(template.phases[0].duration);
        setIsRunning(false);
        startTimeRef.current = Date.now();
        
        // 백그라운드 상태 초기화
        await backgroundManager.current.clearTimerState();
      }
    }
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <IntervalContext.Provider value={{
      templates,
      addTemplate,
      removeTemplate,
      updateTemplate,
      currentSession,
      startSession,
      pauseSession,
      resumeSession,
      stopSession,
      resetSession,
      remainingTime,
      currentPhase,
      currentCycle,
      isRunning,
      history,
      clearHistory
    }}>
      {children}
    </IntervalContext.Provider>
  );
};

export const useInterval = () => {
  const context = useContext(IntervalContext);
  if (context === undefined) {
    throw new Error('useInterval must be used within an IntervalProvider');
  }
  return context;
}; 