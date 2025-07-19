import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alarm, AlarmGroup, AlarmHistory } from '../context/AlarmContext';

export interface BackupData {
  version: string;
  timestamp: Date;
  alarms: Alarm[];
  alarmGroups: AlarmGroup[];
  alarmHistory: AlarmHistory[];
  metadata: {
    totalAlarms: number;
    totalGroups: number;
    totalHistory: number;
    appVersion: string;
  };
}

export interface BackupInfo {
  id: string;
  name: string;
  timestamp: Date;
  size: number;
  metadata: BackupData['metadata'];
}

const BACKUP_STORAGE_KEY = '@RiseUp:backups';

// 백업 데이터 생성
export const createBackup = async (
  alarms: Alarm[],
  alarmGroups: AlarmGroup[],
  alarmHistory: AlarmHistory[]
): Promise<BackupData> => {
  const backupData: BackupData = {
    version: '1.0.0',
    timestamp: new Date(),
    alarms,
    alarmGroups,
    alarmHistory,
    metadata: {
      totalAlarms: alarms.length,
      totalGroups: alarmGroups.length,
      totalHistory: alarmHistory.length,
      appVersion: '1.0.0', // 실제 앱 버전으로 교체
    }
  };

  return backupData;
};

// 백업 저장
export const saveBackup = async (backupData: BackupData, name?: string): Promise<string> => {
  try {
    const backupId = `backup_${Date.now()}`;
    const backupInfo: BackupInfo = {
      id: backupId,
      name: name || `백업_${backupData.timestamp.toLocaleDateString('ko-KR')}`,
      timestamp: backupData.timestamp,
      size: JSON.stringify(backupData).length,
      metadata: backupData.metadata,
    };

    // 백업 데이터 저장
    await AsyncStorage.setItem(`${BACKUP_STORAGE_KEY}_${backupId}`, JSON.stringify(backupData));
    
    // 백업 목록에 추가
    const existingBackups = await getBackupList();
    existingBackups.unshift(backupInfo);
    await AsyncStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(existingBackups));

    console.log('�� 백업 저장 완료:', backupId);
    return backupId;
  } catch (error) {
    console.error('❌ 백업 저장 실패:', error);
    throw error;
  }
};

// 백업 목록 조회
export const getBackupList = async (): Promise<BackupInfo[]> => {
  try {
    const backupsData = await AsyncStorage.getItem(BACKUP_STORAGE_KEY);
    if (backupsData) {
      const backups = JSON.parse(backupsData);
      return backups.map((backup: any) => ({
        ...backup,
        timestamp: new Date(backup.timestamp),
      }));
    }
    return [];
  } catch (error) {
    console.error('❌ 백업 목록 조회 실패:', error);
    return [];
  }
};

// 백업 데이터 로드
export const loadBackup = async (backupId: string): Promise<BackupData> => {
  try {
    const backupData = await AsyncStorage.getItem(`${BACKUP_STORAGE_KEY}_${backupId}`);
    if (!backupData) {
      throw new Error('백업을 찾을 수 없습니다');
    }

    const parsed = JSON.parse(backupData);
    return {
      ...parsed,
      timestamp: new Date(parsed.timestamp),
      alarms: parsed.alarms.map((alarm: any) => ({
        ...alarm,
        time: new Date(alarm.time),
        createdAt: new Date(alarm.createdAt),
        lastTriggered: alarm.lastTriggered ? new Date(alarm.lastTriggered) : undefined,
      })),
      alarmGroups: parsed.alarmGroups.map((group: any) => ({
        ...group,
        createdAt: new Date(group.createdAt),
      })),
      alarmHistory: parsed.alarmHistory.map((history: any) => ({
        ...history,
        triggeredAt: new Date(history.triggeredAt),
        snoozedAt: history.snoozedAt ? new Date(history.snoozedAt) : undefined,
        dismissedAt: history.dismissedAt ? new Date(history.dismissedAt) : undefined,
      })),
    };
  } catch (error) {
    console.error('❌ 백업 로드 실패:', error);
    throw error;
  }
};

// 백업 삭제
export const deleteBackup = async (backupId: string): Promise<void> => {
  try {
    // 백업 데이터 삭제
    await AsyncStorage.removeItem(`${BACKUP_STORAGE_KEY}_${backupId}`);
    
    // 백업 목록에서 제거
    const existingBackups = await getBackupList();
    const updatedBackups = existingBackups.filter(backup => backup.id !== backupId);
    await AsyncStorage.setItem(BACKUP_STORAGE_KEY, JSON.stringify(updatedBackups));

    console.log('🗑️ 백업 삭제 완료:', backupId);
  } catch (error) {
    console.error('❌ 백업 삭제 실패:', error);
    throw error;
  }
};

// 백업 데이터 검증
export const validateBackup = (backupData: any): backupData is BackupData => {
  return (
    backupData &&
    typeof backupData === 'object' &&
    typeof backupData.version === 'string' &&
    backupData.timestamp instanceof Date &&
    Array.isArray(backupData.alarms) &&
    Array.isArray(backupData.alarmGroups) &&
    Array.isArray(backupData.alarmHistory) &&
    typeof backupData.metadata === 'object'
  );
};

// 백업 크기 포맷팅
export const formatBackupSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}; 