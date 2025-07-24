import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  saveAlarmsToStorage, 
  loadAlarmsFromStorage,
  saveAlarmGroupsToStorage,
  loadAlarmGroupsFromStorage,
  saveAlarmHistoryToStorage,
  loadAlarmHistoryFromStorage
} from '../utils/storage';
import { scheduleAlarm, cancelAlarm } from '../notifications/alarmManager';
import { PermissionManager } from '../utils/permissions';
import { BackupData } from '../utils/backup';

export interface Alarm {
  id: string;
  time: Date;
  isActive: boolean;
  label?: string;
  repeatDays?: number[];
  soundId?: string;
  groupId?: string; // 그룹 ID 추가
  priority?: 'low' | 'medium' | 'high'; // 우선순위 추가
  tags?: string[]; // 태그 추가
  createdAt: Date; // 생성 시간 추가
  lastTriggered?: Date; // 마지막 울린 시간 추가
}

export interface AlarmGroup {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  isActive: boolean;
  createdAt: Date;
}

// 알람 히스토리 인터페이스 추가
export interface AlarmHistory {
  id: string;
  alarmId: string;
  alarmLabel: string;
  triggeredAt: Date;
  snoozedAt?: Date;
  dismissedAt?: Date;
  action: 'triggered' | 'snoozed' | 'dismissed';
  responseTime?: number; // 사용자 응답 시간 (초)
}

interface AlarmContextType {
  alarms: Alarm[];
  alarmGroups: AlarmGroup[];
  alarmHistory: AlarmHistory[];
  addAlarm: (time: Date, label?: string, repeatDays?: number[], soundId?: string, groupId?: string) => Promise<boolean>;
  deleteAlarm: (id: string) => void;
  toggleAlarm: (id: string) => void;
  addAlarmGroup: (name: string, description?: string, color?: string, icon?: string) => string;
  deleteAlarmGroup: (id: string) => void;
  updateAlarmGroup: (id: string, updates: Partial<AlarmGroup>) => void;
  toggleAlarmGroup: (id: string) => void;
  getAlarmsByGroup: (groupId: string) => Alarm[];
  getAlarmStats: () => {
    total: number;
    active: number;
    byGroup: Record<string, number>;
    byPriority: Record<string, number>;
  };
  // 히스토리 관련 함수들 추가
  addAlarmHistory: (history: Omit<AlarmHistory, 'id'>) => void;
  getAlarmHistory: (alarmId?: string, days?: number) => AlarmHistory[];
  clearAlarmHistory: (days?: number) => void;
  getAlarmHistoryStats: () => {
    total: number;
    triggered: number;
    snoozed: number;
    dismissed: number;
    averageResponseTime: number;
  };
  // 백업 복원 기능 추가
  restoreFromBackup: (backupData: BackupData) => Promise<boolean>;
  isLoading: boolean;
  hasNotificationPermission: boolean;
  setAlarms: React.Dispatch<React.SetStateAction<Alarm[]>>;
}

const AlarmContext = createContext<AlarmContextType | undefined>(undefined);

// 기본 알람 그룹들
const DEFAULT_ALARM_GROUPS: AlarmGroup[] = [
  {
    id: 'work',
    name: '업무',
    description: '업무 관련 알람',
    color: '#FF6B6B',
    icon: '💼',
    isActive: true,
    createdAt: new Date()
  },
  {
    id: 'personal',
    name: '개인',
    description: '개인 일정 알람',
    color: '#4ECDC4',
    icon: '👤',
    isActive: true,
    createdAt: new Date()
  },
  {
    id: 'health',
    name: '건강',
    description: '운동, 약 복용 등',
    color: '#45B7D1',
    icon: '💪',
    isActive: true,
    createdAt: new Date()
  },
  {
    id: 'study',
    name: '학습',
    description: '공부, 수업 등',
    color: '#96CEB4',
    icon: '📚',
    isActive: true,
    createdAt: new Date()
  }
];

export const AlarmProvider = ({ children }: { children: ReactNode }) => {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [alarmGroups, setAlarmGroups] = useState<AlarmGroup[]>(DEFAULT_ALARM_GROUPS);
  const [alarmHistory, setAlarmHistory] = useState<AlarmHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasNotificationPermission, setHasNotificationPermission] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      saveAlarmsToStorage(alarms);
      saveAlarmGroupsToStorage(alarmGroups);
      saveAlarmHistoryToStorage(alarmHistory);
    }
  }, [alarms, alarmGroups, alarmHistory, isLoading]);

  const initializeApp = async () => {
    try {
      // 권한 상태 확인
      const permissionStatus = await PermissionManager.checkPermissionStatus();
      setHasNotificationPermission(permissionStatus);

      // 저장된 알람, 그룹, 히스토리 로드
      const savedAlarms = await loadAlarmsFromStorage();
      const savedGroups = await loadAlarmGroupsFromStorage();
      const savedHistory = await loadAlarmHistoryFromStorage();
      
      setAlarms(savedAlarms);
      setAlarmGroups(savedGroups.length > 0 ? savedGroups : DEFAULT_ALARM_GROUPS);
      setAlarmHistory(savedHistory);

      console.log('앱 초기화 완료:', {
        알람개수: savedAlarms.length,
        그룹개수: savedGroups.length,
        히스토리개수: savedHistory.length,
        알림권한: permissionStatus
      });
    } catch (error) {
      console.error('앱 초기화 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addAlarm = async (
    time: Date, 
    label?: string, 
    repeatDays?: number[], 
    soundId?: string,
    groupId?: string
  ): Promise<boolean> => {
    const newAlarm: Alarm = {
      id: Date.now().toString(),
      time: time,
      isActive: true,
      label: label || '알람',
      repeatDays: repeatDays || [1, 2, 3, 4, 5],
      soundId: soundId || 'default',
      groupId: groupId || 'personal', // 기본 그룹
      priority: 'medium', // 기본 우선순위
      tags: [],
      createdAt: new Date() // 생성 시간 추가
    };

    // 알람 스케줄링
    const success = await scheduleAlarm(
      newAlarm.id,
      newAlarm.time,
      newAlarm.label || '알람',
      newAlarm.repeatDays,
      newAlarm.soundId
    );

    if (success) {
      setAlarms(prev => [...prev, newAlarm]);
      console.log('✅ 새 알람 추가 성공:', newAlarm);
      return true;
    } else {
      console.error('❌ 알람 추가 실패');
      return false;
    }
  };

  const deleteAlarm = async (id: string) => {
    const alarm = alarms.find(a => a.id === id);
    if (alarm) {
      await cancelAlarm(id, alarm.repeatDays);
    }
    setAlarms(prev => prev.filter(alarm => alarm.id !== id));
    console.log('🗑️ 알람 삭제:', id);
  };

  const toggleAlarm = async (id: string) => {
    setAlarms(prev =>
      prev.map(alarm => {
        if (alarm.id === id) {
          const updatedAlarm = { ...alarm, isActive: !alarm.isActive };
          
          if (updatedAlarm.isActive) {
            scheduleAlarm(
              updatedAlarm.id,
              updatedAlarm.time,
              updatedAlarm.label || '알람',
              updatedAlarm.repeatDays
            );
            console.log('🔔 알람 활성화:', updatedAlarm.id);
          } else {
            cancelAlarm(updatedAlarm.id, updatedAlarm.repeatDays);
            console.log('🔕 알람 비활성화:', updatedAlarm.id);
          }
          
          return updatedAlarm;
        }
        return alarm;
      })
    );
  };

  // 알람 그룹 관련 함수들
  const addAlarmGroup = (name: string, description?: string, color?: string, icon?: string): string => {
    const newGroup: AlarmGroup = {
      id: Date.now().toString(),
      name,
      description,
      color: color || '#FF7F50',
      icon: icon || '📅',
      isActive: true,
      createdAt: new Date()
    };
    
    setAlarmGroups(prev => [...prev, newGroup]);
    console.log('✅ 새 알람 그룹 추가:', newGroup);
    return newGroup.id;
  };

  const deleteAlarmGroup = (id: string) => {
    // 그룹에 속한 알람들을 기본 그룹으로 이동
    setAlarms(prev => prev.map(alarm => 
      alarm.groupId === id ? { ...alarm, groupId: 'personal' } : alarm
    ));
    
    setAlarmGroups(prev => prev.filter(group => group.id !== id));
    console.log('🗑️ 알람 그룹 삭제:', id);
  };

  const updateAlarmGroup = (id: string, updates: Partial<AlarmGroup>) => {
    setAlarmGroups(prev => prev.map(group => 
      group.id === id ? { ...group, ...updates } : group
    ));
    console.log('📝 알람 그룹 업데이트:', id, updates);
  };

  const toggleAlarmGroup = (id: string) => {
    setAlarmGroups(prev => prev.map(group => 
      group.id === id ? { ...group, isActive: !group.isActive } : group
    ));
    console.log('🔄 알람 그룹 토글:', id);
  };

  const getAlarmsByGroup = (groupId: string): Alarm[] => {
    return alarms.filter(alarm => alarm.groupId === groupId);
  };

  const getAlarmStats = () => {
    const stats = {
      total: alarms.length,
      active: alarms.filter(a => a.isActive).length,
      byGroup: {} as Record<string, number>,
      byPriority: {} as Record<string, number>
    };

    // 그룹별 통계
    alarmGroups.forEach(group => {
      stats.byGroup[group.id] = getAlarmsByGroup(group.id).length;
    });

    // 우선순위별 통계
    alarms.forEach(alarm => {
      const priority = alarm.priority || 'medium';
      stats.byPriority[priority] = (stats.byPriority[priority] || 0) + 1;
    });

    return stats;
  };

  // 알람 히스토리 추가
  const addAlarmHistory = (history: Omit<AlarmHistory, 'id'>) => {
    const newHistory: AlarmHistory = {
      ...history,
      id: Date.now().toString()
    };
    
    setAlarmHistory(prev => [newHistory, ...prev]);
    
    // 알람의 마지막 울린 시간 업데이트
    if (history.action === 'triggered') {
      setAlarms(prev => 
        prev.map(alarm => 
          alarm.id === history.alarmId 
            ? { ...alarm, lastTriggered: history.triggeredAt }
            : alarm
        )
      );
    }
    
    console.log('📝 알람 히스토리 추가:', newHistory);
  };

  // 알람 히스토리 조회
  const getAlarmHistory = (alarmId?: string, days: number = 30): AlarmHistory[] => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    let filteredHistory = alarmHistory.filter(history => 
      history.triggeredAt >= cutoffDate
    );
    
    if (alarmId) {
      filteredHistory = filteredHistory.filter(history => 
        history.alarmId === alarmId
      );
    }
    
    return filteredHistory.sort((a, b) => 
      b.triggeredAt.getTime() - a.triggeredAt.getTime()
    );
  };

  // 알람 히스토리 삭제
  const clearAlarmHistory = (days?: number) => {
    if (days) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      setAlarmHistory(prev => 
        prev.filter(history => history.triggeredAt >= cutoffDate)
      );
    } else {
      setAlarmHistory([]);
    }
    console.log('🗑️ 알람 히스토리 삭제');
  };

  // 알람 히스토리 통계
  const getAlarmHistoryStats = () => {
    const total = alarmHistory.length;
    const triggered = alarmHistory.filter(h => h.action === 'triggered').length;
    const snoozed = alarmHistory.filter(h => h.action === 'snoozed').length;
    const dismissed = alarmHistory.filter(h => h.action === 'dismissed').length;
    
    const responseTimes = alarmHistory
      .filter(h => h.responseTime !== undefined)
      .map(h => h.responseTime!);
    
    const averageResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
      : 0;
    
    return {
      total,
      triggered,
      snoozed,
      dismissed,
      averageResponseTime
    };
  };

  // 백업에서 복원하는 함수
  const restoreFromBackup = async (backupData: BackupData): Promise<boolean> => {
    try {
      console.log('🔄 백업 복원 시작:', {
        알람개수: backupData.alarms.length,
        그룹개수: backupData.alarmGroups.length,
        히스토리개수: backupData.alarmHistory.length
      });

      // 기존 알람들 모두 취소
      for (const alarm of alarms) {
        await cancelAlarm(alarm.id, alarm.repeatDays);
      }

      // 백업 데이터로 복원
      setAlarms(backupData.alarms);
      setAlarmGroups(backupData.alarmGroups);
      setAlarmHistory(backupData.alarmHistory);

      // 활성 알람들 다시 스케줄링
      for (const alarm of backupData.alarms) {
        if (alarm.isActive) {
          await scheduleAlarm(
            alarm.id,
            alarm.time,
            alarm.label || '알람',
            alarm.repeatDays,
            alarm.soundId
          );
        }
      }

      console.log('✅ 백업 복원 완료');
      return true;
    } catch (error) {
      console.error('❌ 백업 복원 실패:', error);
      return false;
    }
  };

  const contextValue: AlarmContextType = {
    alarms,
    alarmGroups,
    alarmHistory,
    addAlarm,
    deleteAlarm,
    toggleAlarm,
    addAlarmGroup,
    deleteAlarmGroup,
    updateAlarmGroup,
    toggleAlarmGroup,
    getAlarmsByGroup,
    getAlarmStats,
    addAlarmHistory,
    getAlarmHistory,
    clearAlarmHistory,
    getAlarmHistoryStats,
    restoreFromBackup, // 복원 함수 추가
    isLoading,
    hasNotificationPermission,
    setAlarms,
  };

  return (
    <AlarmContext.Provider value={contextValue}>
      {children}
    </AlarmContext.Provider>
  );
};

export const useAlarm = () => {
  const context = useContext(AlarmContext);
  if (context === undefined) {
    throw new Error('useAlarm must be used within an AlarmProvider');
  }
  return context;
};
 