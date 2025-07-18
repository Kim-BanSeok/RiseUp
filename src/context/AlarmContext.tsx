import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { saveAlarmsToStorage, loadAlarmsFromStorage } from '../utils/storage';
import { scheduleAlarm, cancelAlarm } from '../notifications/alarmManager';
import { PermissionManager } from '../utils/permissions';
import { Alert, Vibration, Platform, AppState } from 'react-native';
import { playSound, stopSound } from '../utils/sounds';

export interface Alarm {
  id: string;
  time: Date;
  isActive: boolean;
  label?: string;
  repeatDays?: number[];
  soundId?: string;
}

interface AlarmContextType {
  alarms: Alarm[];
  addAlarm: (time: Date, label?: string, repeatDays?: number[], soundId?: string) => Promise<boolean>;
  deleteAlarm: (id: string) => void;
  toggleAlarm: (id: string) => void;
  isLoading: boolean;
  hasNotificationPermission: boolean;
}

const AlarmContext = createContext<AlarmContextType | undefined>(undefined);

export const AlarmProvider = ({ children }: { children: ReactNode }) => {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasNotificationPermission, setHasNotificationPermission] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      saveAlarmsToStorage(alarms);
    }
  }, [alarms, isLoading]);

  const initializeApp = async () => {
    try {
      // 권한 상태 확인 (중복 요청 없이)
      const permissionStatus = await PermissionManager.checkPermissionStatus();
      setHasNotificationPermission(permissionStatus);

      // 저장된 알람 로드
      const savedAlarms = await loadAlarmsFromStorage();
      setAlarms(savedAlarms);

      console.log('앱 초기화 완료:', {
        알람개수: savedAlarms.length,
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
    soundId?: string
  ): Promise<boolean> => {
    const newAlarm: Alarm = {
      id: Date.now().toString(),
      time: time,
      isActive: true,
      label: label || '알람',
      repeatDays: repeatDays || [1, 2, 3, 4, 5],
      soundId: soundId || 'default',
    };

    // 알람 스케줄링 (사운드 ID 포함)
    const success = await scheduleAlarm(
      newAlarm.id,
      newAlarm.time,
      newAlarm.label || '알람',
      newAlarm.repeatDays,
      newAlarm.soundId // 사운드 ID 추가
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
            // 알람 켜기
            scheduleAlarm(
              updatedAlarm.id,
              updatedAlarm.time,
              updatedAlarm.label || '알람',
              updatedAlarm.repeatDays
            );
            console.log('🔔 알람 활성화:', updatedAlarm.id);
          } else {
            // 알람 끄기
            cancelAlarm(updatedAlarm.id, updatedAlarm.repeatDays);
            console.log('🔕 알람 비활성화:', updatedAlarm.id);
          }
          
          return updatedAlarm;
        }
        return alarm;
      })
    );
  };

  return (
    <AlarmContext.Provider value={{ 
      alarms, 
      addAlarm, 
      deleteAlarm, 
      toggleAlarm, 
      isLoading,
      hasNotificationPermission
    }}>
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
 