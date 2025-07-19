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
  templateId?: string; // 템플릿 ID 추가
  category?: string; // 카테고리 추가
  tags?: string[]; // 태그 추가
  completedAt?: Date; // 완료 시간 추가
  totalPauseTime?: number; // 총 일시정지 시간 추가
}

// 타이머 템플릿 인터페이스 추가
export interface TimerTemplate {
  id: string;
  name: string;
  description?: string;
  duration: number; // 밀리초
  category: string;
  icon: string;
  color: string;
  isDefault: boolean;
  createdAt: Date;
  usageCount: number; // 사용 횟수
}

// 타이머 히스토리 인터페이스 추가
export interface TimerHistory {
  id: string;
  timerId: string;
  timerName: string;
  duration: number; // 설정된 시간
  actualDuration: number; // 실제 소요 시간
  completedAt: Date;
  category?: string;
  templateId?: string;
  pauseCount: number; // 일시정지 횟수
  totalPauseTime: number; // 총 일시정지 시간
  efficiency: number; // 효율성 (0-100%)
}

// 타이머 카테고리 인터페이스 추가
export interface TimerCategory {
  id: string;
  name: string;
  description?: string;
  icon: string;
  color: string;
  isDefault: boolean;
  createdAt: Date;
  usageCount: number;
}

interface TimerContextType {
  timers: Timer[];
  timerTemplates: TimerTemplate[];
  timerHistory: TimerHistory[];
  timerCategories: TimerCategory[];
  addTimer: (name: string, duration: number, soundId?: string, templateId?: string, categoryId?: string) => void;
  deleteTimer: (id: string) => void;
  startTimer: (id: string) => void;
  pauseTimer: (id: string) => void;
  resetTimer: (id: string) => void;
  updateTimer: (id: string, updates: Partial<Timer>) => void;
  // 템플릿 관련 함수들 추가
  addTimerTemplate: (name: string, duration: number, category: string, description?: string, icon?: string, color?: string) => string;
  deleteTimerTemplate: (id: string) => void;
  updateTimerTemplate: (id: string, updates: Partial<TimerTemplate>) => void;
  createTimerFromTemplate: (templateId: string) => void;
  getTemplatesByCategory: (category: string) => TimerTemplate[];
  getTimerStats: () => {
    total: number;
    running: number;
    completed: number;
    byCategory: Record<string, number>;
    totalDuration: number;
  };
  // 히스토리 관련 함수들 추가
  addTimerHistory: (history: Omit<TimerHistory, 'id'>) => void;
  getTimerHistory: (timerId?: string, days?: number) => TimerHistory[];
  clearTimerHistory: (days?: number) => void;
  getTimerHistoryStats: () => {
    total: number;
    totalDuration: number;
    averageEfficiency: number;
    byCategory: Record<string, number>;
    byTemplate: Record<string, number>;
  };
  // 카테고리 관련 함수들 추가
  addTimerCategory: (name: string, description?: string, icon?: string, color?: string) => string;
  deleteTimerCategory: (id: string) => void;
  updateTimerCategory: (id: string, updates: Partial<TimerCategory>) => void;
  getTimersByCategory: (categoryId: string) => Timer[];
  getCategoryStats: (categoryId: string) => {
    totalTimers: number;
    completedTimers: number;
    totalDuration: number;
    averageEfficiency: number;
  };
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

const TIMERS_STORAGE_KEY = '@RiseUp:timers';
const TIMER_TEMPLATES_STORAGE_KEY = '@RiseUp:timerTemplates';
const TIMER_HISTORY_STORAGE_KEY = '@RiseUp:timerHistory';
const TIMER_CATEGORIES_STORAGE_KEY = '@RiseUp:timerCategories';

// 기본 타이머 템플릿들
const DEFAULT_TIMER_TEMPLATES: TimerTemplate[] = [
  {
    id: 'pomodoro',
    name: '뽀모도로',
    description: '25분 집중 작업',
    duration: 25 * 60 * 1000, // 25분
    category: 'productivity',
    icon: '⏰',
    color: '#FF6B6B',
    isDefault: true,
    createdAt: new Date(),
    usageCount: 0
  },
  {
    id: 'short-break',
    name: '짧은 휴식',
    description: '5분 휴식',
    duration: 5 * 60 * 1000, // 5분
    category: 'productivity',
    icon: '☕',
    color: '#4ECDC4',
    isDefault: true,
    createdAt: new Date(),
    usageCount: 0
  },
  {
    id: 'long-break',
    name: '긴 휴식',
    description: '15분 휴식',
    duration: 15 * 60 * 1000, // 15분
    category: 'productivity',
    icon: '⏳',
    color: '#45B7D1',
    isDefault: true,
    createdAt: new Date(),
    usageCount: 0
  },
  {
    id: 'cooking',
    name: '요리',
    description: '30분 요리',
    duration: 30 * 60 * 1000, // 30분
    category: 'daily',
    icon: '🍳',
    color: '#FFA500',
    isDefault: true,
    createdAt: new Date(),
    usageCount: 0
  },
  {
    id: 'exercise',
    name: '운동',
    description: '45분 운동',
    duration: 45 * 60 * 1000, // 45분
    category: 'health',
    icon: '💪',
    color: '#32CD32',
    isDefault: true,
    createdAt: new Date(),
    usageCount: 0
  },
  {
    id: 'study',
    name: '공부',
    description: '50분 공부',
    duration: 50 * 60 * 1000, // 50분
    category: 'education',
    icon: '📚',
    color: '#9B59B6',
    isDefault: true,
    createdAt: new Date(),
    usageCount: 0
  }
];

// 기본 타이머 카테고리들
const DEFAULT_TIMER_CATEGORIES: TimerCategory[] = [
  {
    id: 'productivity',
    name: '생산성',
    description: '업무 및 학습 관련 타이머',
    icon: '⚙️',
    color: '#FF6B6B',
    isDefault: true,
    createdAt: new Date(),
    usageCount: 0
  },
  {
    id: 'health',
    name: '건강',
    description: '운동 및 건강 관리 타이머',
    icon: '💪',
    color: '#4ECDC4',
    isDefault: true,
    createdAt: new Date(),
    usageCount: 0
  },
  {
    id: 'education',
    name: '교육',
    description: '공부 및 학습 타이머',
    icon: '📚',
    color: '#45B7D1',
    isDefault: true,
    createdAt: new Date(),
    usageCount: 0
  },
  {
    id: 'daily',
    name: '일상',
    description: '일상 생활 관련 타이머',
    icon: '🏠',
    color: '#96CEB4',
    isDefault: true,
    createdAt: new Date(),
    usageCount: 0
  },
  {
    id: 'custom',
    name: '커스텀',
    description: '사용자 정의 타이머',
    icon: '⚙️',
    color: '#FFA500',
    isDefault: true,
    createdAt: new Date(),
    usageCount: 0
  }
];

export const TimerProvider = ({ children }: { children: ReactNode }) => {
  const [timers, setTimers] = useState<Timer[]>([]);
  const [timerTemplates, setTimerTemplates] = useState<TimerTemplate[]>(DEFAULT_TIMER_TEMPLATES);
  const [timerHistory, setTimerHistory] = useState<TimerHistory[]>([]);
  const [timerCategories, setTimerCategories] = useState<TimerCategory[]>(DEFAULT_TIMER_CATEGORIES);
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
  const [isLoading, setIsLoading] = useState(true);

  // 저장된 타이머와 템플릿 로드
  useEffect(() => {
    loadTimers();
    loadTimerTemplates();
  }, []);

  // 타이머 상태 변경 시 저장
  useEffect(() => {
    saveTimers();
  }, [timers]);

  // 템플릿 상태 변경 시 저장
  useEffect(() => {
    saveTimerTemplates();
  }, [timerTemplates]);

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

  // 타이머 히스토리 저장
  useEffect(() => {
    saveTimerHistory();
  }, [timerHistory]);

  // 저장된 히스토리 로드
  useEffect(() => {
    loadTimerHistory();
  }, []);

  // 카테고리 저장
  useEffect(() => {
    saveTimerCategories();
  }, [timerCategories]);

  // 저장된 카테고리 로드
  useEffect(() => {
    loadTimerCategories();
  }, []);

  // 기존 타이머에 카테고리 추가 (마이그레이션용)
  const migrateTimerCategories = () => {
    setTimers(prev => 
      prev.map(timer => {
        if (!timer.category) {
          // 템플릿이 있는 경우 템플릿의 카테고리 사용
          if (timer.templateId) {
            const template = timerTemplates.find(t => t.id === timer.templateId);
            if (template) {
              return { ...timer, category: template.category };
            }
          }
          // 기본값으로 'uncategorized' 설정
          return { ...timer, category: 'uncategorized' };
        }
        return timer;
      })
    );
    console.log('✅ 타이머 카테고리 마이그레이션 완료');
  };

  // 컴포넌트 마운트 시 마이그레이션 실행
  useEffect(() => {
    if (timers.length > 0 && timerTemplates.length > 0) {
      const hasUncategorizedTimers = timers.some(timer => !timer.category);
      if (hasUncategorizedTimers) {
        migrateTimerCategories();
      }
    }
  }, [timers.length, timerTemplates.length]);

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

  const loadTimerTemplates = async () => {
    try {
      const saved = await AsyncStorage.getItem(TIMER_TEMPLATES_STORAGE_KEY);
      if (saved) {
        const parsedTemplates = JSON.parse(saved).map((template: any) => ({
          ...template,
          createdAt: new Date(template.createdAt),
        }));
        setTimerTemplates(parsedTemplates);
      }
    } catch (error) {
      console.error('타이머 템플릿 로드 실패:', error);
    }
  };

  const saveTimerTemplates = async () => {
    try {
      await AsyncStorage.setItem(TIMER_TEMPLATES_STORAGE_KEY, JSON.stringify(timerTemplates));
    } catch (error) {
      console.error('타이머 템플릿 저장 실패:', error);
    }
  };

  const loadTimerHistory = async () => {
    try {
      const saved = await AsyncStorage.getItem(TIMER_HISTORY_STORAGE_KEY);
      if (saved) {
        const parsedHistory = JSON.parse(saved).map((history: any) => ({
          ...history,
          completedAt: new Date(history.completedAt),
        }));
        setTimerHistory(parsedHistory);
      }
    } catch (error) {
      console.error('타이머 히스토리 로드 실패:', error);
    }
  };

  const saveTimerHistory = async () => {
    try {
      await AsyncStorage.setItem(TIMER_HISTORY_STORAGE_KEY, JSON.stringify(timerHistory));
    } catch (error) {
      console.error('타이머 히스토리 저장 실패:', error);
    }
  };

  const loadTimerCategories = async () => {
    try {
      const saved = await AsyncStorage.getItem(TIMER_CATEGORIES_STORAGE_KEY);
      if (saved) {
        const parsedCategories = JSON.parse(saved).map((category: any) => ({
          ...category,
          createdAt: new Date(category.createdAt),
        }));
        setTimerCategories(parsedCategories);
      }
    } catch (error) {
      console.error('타이머 카테고리 로드 실패:', error);
    }
  };

  const saveTimerCategories = async () => {
    try {
      await AsyncStorage.setItem(TIMER_CATEGORIES_STORAGE_KEY, JSON.stringify(timerCategories));
    } catch (error) {
      console.error('타이머 카테고리 저장 실패:', error);
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

    // 히스토리 추가
    const actualDuration = timer.duration - timer.remainingTime;
    const efficiency = Math.round((actualDuration / timer.duration) * 100);
    
    const history: Omit<TimerHistory, 'id'> = {
      timerId: timer.id,
      timerName: timer.name,
      duration: timer.duration,
      actualDuration,
      completedAt: new Date(),
      category: timer.category,
      templateId: timer.templateId,
      pauseCount: 0, // TODO: 일시정지 횟수 추적
      totalPauseTime: timer.totalPauseTime || 0,
      efficiency
    };

    addTimerHistory(history);
  };

  const addTimer = (name: string, duration: number, soundId: string = 'default', templateId?: string, categoryId?: string) => {
    const newTimer: Timer = {
      id: Date.now().toString(),
      name,
      duration,
      remainingTime: duration,
      isRunning: false,
      isCompleted: false,
      soundId,
      createdAt: new Date(),
      templateId,
      category: categoryId || 'uncategorized', // 기본값
      tags: [] // 기본값
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

  // 템플릿 추가
  const addTimerTemplate = (
    name: string, 
    duration: number, 
    category: string, 
    description?: string, 
    icon?: string, 
    color?: string
  ): string => {
    const newTemplate: TimerTemplate = {
      id: Date.now().toString(),
      name,
      description,
      duration,
      category,
      icon: icon || '⏰',
      color: color || '#FF7F50',
      isDefault: false,
      createdAt: new Date(),
      usageCount: 0
    };
    
    setTimerTemplates(prev => [...prev, newTemplate]);
    console.log('✅ 새 타이머 템플릿 추가:', newTemplate);
    return newTemplate.id;
  };

  // 템플릿 삭제
  const deleteTimerTemplate = (id: string) => {
    setTimerTemplates(prev => prev.filter(template => template.id !== id));
    console.log('🗑️ 타이머 템플릿 삭제:', id);
  };

  // 템플릿 업데이트
  const updateTimerTemplate = (id: string, updates: Partial<TimerTemplate>) => {
    setTimerTemplates(prev => 
      prev.map(template => 
        template.id === id 
          ? { ...template, ...updates }
          : template
      )
    );
    console.log(' 타이머 템플릿 업데이트:', id);
  };

  // 템플릿에서 타이머 생성 - 수정된 버전
  const createTimerFromTemplate = (templateId: string) => {
    const template = timerTemplates.find(t => t.id === templateId);
    if (template) {
      // 템플릿의 카테고리를 전달하여 타이머 생성
      addTimer(template.name, template.duration, 'default', templateId, template.category);
      
      // 사용 횟수 증가
      updateTimerTemplate(templateId, { 
        usageCount: template.usageCount + 1 
      });
      
      console.log('🔄 템플릿에서 타이머 생성:', template.name, '카테고리:', template.category);
    }
  };

  // 카테고리별 템플릿 조회
  const getTemplatesByCategory = (category: string): TimerTemplate[] => {
    return timerTemplates.filter(template => template.category === category);
  };

  // 타이머 통계
  const getTimerStats = () => {
    const total = timers.length;
    const running = timers.filter(t => t.isRunning).length;
    const completed = timers.filter(t => t.isCompleted).length;
    
    const byCategory: Record<string, number> = {};
    timers.forEach(timer => {
      const category = timer.category || 'uncategorized';
      byCategory[category] = (byCategory[category] || 0) + 1;
    });
    
    const totalDuration = timers.reduce((sum, timer) => sum + timer.duration, 0);
    
    return {
      total,
      running,
      completed,
      byCategory,
      totalDuration
    };
  };

  // 타이머 히스토리 추가
  const addTimerHistory = (history: Omit<TimerHistory, 'id'>) => {
    const newHistory: TimerHistory = {
      ...history,
      id: Date.now().toString()
    };
    
    setTimerHistory(prev => [newHistory, ...prev]);
    console.log('✅ 새 타이머 히스토리 추가:', newHistory);
  };

  // 타이머 히스토리 조회
  const getTimerHistory = (timerId?: string, days: number = 30): TimerHistory[] => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    let filteredHistory = timerHistory.filter(history => 
      history.completedAt >= cutoffDate
    );
    
    if (timerId) {
      filteredHistory = filteredHistory.filter(history => 
        history.timerId === timerId
      );
    }
    
    return filteredHistory.sort((a, b) => 
      b.completedAt.getTime() - a.completedAt.getTime()
    );
  };

  // 타이머 히스토리 삭제
  const clearTimerHistory = (days?: number) => {
    if (days) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      setTimerHistory(prev => 
        prev.filter(history => history.completedAt >= cutoffDate)
      );
    } else {
      setTimerHistory([]);
    }
    console.log('🗑️ 타이머 히스토리 삭제');
  };

  // 타이머 히스토리 통계
  const getTimerHistoryStats = () => {
    const total = timerHistory.length;
    const totalDuration = timerHistory.reduce((sum, history) => sum + history.actualDuration, 0);
    const averageEfficiency = timerHistory.length > 0 
      ? timerHistory.reduce((sum, history) => sum + history.efficiency, 0) / timerHistory.length
      : 0;
    
    const byCategory: Record<string, number> = {};
    const byTemplate: Record<string, number> = {};
    
    timerHistory.forEach(history => {
      if (history.category) {
        byCategory[history.category] = (byCategory[history.category] || 0) + 1;
      }
      if (history.templateId) {
        byTemplate[history.templateId] = (byTemplate[history.templateId] || 0) + 1;
      }
    });
    
    return {
      total,
      totalDuration,
      averageEfficiency,
      byCategory,
      byTemplate
    };
  };

  // 카테고리 추가
  const addTimerCategory = (
    name: string, 
    description?: string, 
    icon?: string, 
    color?: string
  ): string => {
    const newCategory: TimerCategory = {
      id: Date.now().toString(),
      name,
      description,
      icon: icon || '📁',
      color: color || '#FF7F50',
      isDefault: false,
      createdAt: new Date(),
      usageCount: 0
    };
    
    setTimerCategories(prev => [...prev, newCategory]);
    console.log('✅ 새 타이머 카테고리 추가:', newCategory);
    return newCategory.id;
  };

  // 카테고리 삭제
  const deleteTimerCategory = (id: string) => {
    const category = timerCategories.find(c => c.id === id);
    if (category?.isDefault) {
      console.log('⚠️ 기본 카테고리는 삭제할 수 없습니다');
      return;
    }
    
    setTimerCategories(prev => prev.filter(category => category.id !== id));
    console.log('🗑️ 타이머 카테고리 삭제:', id);
  };

  // 카테고리 업데이트
  const updateTimerCategory = (id: string, updates: Partial<TimerCategory>) => {
    setTimerCategories(prev => 
      prev.map(category => 
        category.id === id 
          ? { ...category, ...updates }
          : category
      )
    );
    console.log(' 타이머 카테고리 업데이트:', id);
  };

  // 카테고리별 타이머 조회
  const getTimersByCategory = (categoryId: string): Timer[] => {
    return timers.filter(timer => timer.category === categoryId);
  };

  // 카테고리 통계
  const getCategoryStats = (categoryId: string) => {
    const categoryTimers = getTimersByCategory(categoryId);
    const categoryHistory = timerHistory.filter(history => 
      history.category === categoryId
    );
    
    const totalTimers = categoryTimers.length;
    const completedTimers = categoryHistory.length;
    const totalDuration = categoryHistory.reduce((sum, history) => sum + history.actualDuration, 0);
    const averageEfficiency = categoryHistory.length > 0 
      ? categoryHistory.reduce((sum, history) => sum + history.efficiency, 0) / categoryHistory.length
      : 0;
    
    return {
      totalTimers,
      completedTimers,
      totalDuration,
      averageEfficiency
    };
  };

  const contextValue: TimerContextType = {
    timers,
    timerTemplates,
    timerHistory,
    timerCategories,
    addTimer,
    deleteTimer,
    startTimer,
    pauseTimer,
    resetTimer,
    updateTimer,
    addTimerTemplate,
    deleteTimerTemplate,
    updateTimerTemplate,
    createTimerFromTemplate,
    getTemplatesByCategory,
    getTimerStats,
    addTimerHistory,
    getTimerHistory,
    clearTimerHistory,
    getTimerHistoryStats,
    addTimerCategory,
    deleteTimerCategory,
    updateTimerCategory,
    getTimersByCategory,
    getCategoryStats,
  };

  return (
    <TimerContext.Provider value={contextValue}>
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
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};
