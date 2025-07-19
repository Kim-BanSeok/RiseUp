import AsyncStorage from '@react-native-async-storage/async-storage';
import { IntervalTemplate, IntervalHistory } from '../context/IntervalContext';

export interface IntervalBackupData {
  version: string;
  timestamp: Date;
  templates: IntervalTemplate[];
  history: IntervalHistory[];
  metadata: {
    totalTemplates: number;
    totalHistory: number;
    appVersion: string;
  };
}

export interface IntervalBackupInfo {
  id: string;
  name: string;
  timestamp: Date;
  size: number;
  metadata: IntervalBackupData['metadata'];
}

const INTERVAL_BACKUP_STORAGE_KEY = '@RiseUp:intervalBackups';

// 백업 생성
export const createIntervalBackup = async (
  templates: IntervalTemplate[],
  history: IntervalHistory[]
): Promise<string> => {
  try {
    const backupData: IntervalBackupData = {
      version: '1.0',
      timestamp: new Date(),
      templates,
      history,
      metadata: {
        totalTemplates: templates.length,
        totalHistory: history.length,
        appVersion: '1.0.0',
      },
    };

    const backupId = `interval_backup_${Date.now()}`;
    const backupKey = `${INTERVAL_BACKUP_STORAGE_KEY}_${backupId}`;
    
    await AsyncStorage.setItem(backupKey, JSON.stringify(backupData));
    
    // 백업 목록에 추가
    const backupList = await getIntervalBackupList();
    const backupInfo: IntervalBackupInfo = {
      id: backupId,
      name: `인터벌 백업 ${new Date().toLocaleString('ko-KR')}`,
      timestamp: new Date(),
      size: JSON.stringify(backupData).length,
      metadata: backupData.metadata,
    };
    
    backupList.unshift(backupInfo);
    await AsyncStorage.setItem(INTERVAL_BACKUP_STORAGE_KEY, JSON.stringify(backupList));
    
    console.log('✅ 인터벌 백업 생성 완료:', backupId);
    return backupId;
  } catch (error) {
    console.error('❌ 인터벌 백업 생성 실패:', error);
    throw error;
  }
};

// 백업 목록 조회
export const getIntervalBackupList = async (): Promise<IntervalBackupInfo[]> => {
  try {
    const backupListJson = await AsyncStorage.getItem(INTERVAL_BACKUP_STORAGE_KEY);
    return backupListJson ? JSON.parse(backupListJson) : [];
  } catch (error) {
    console.error('❌ 백업 목록 조회 실패:', error);
    return [];
  }
};

// 백업 복원
export const restoreIntervalBackup = async (backupId: string): Promise<IntervalBackupData> => {
  try {
    const backupKey = `${INTERVAL_BACKUP_STORAGE_KEY}_${backupId}`;
    const backupJson = await AsyncStorage.getItem(backupKey);
    
    if (!backupJson) {
      throw new Error('백업을 찾을 수 없습니다.');
    }
    
    const backupData: IntervalBackupData = JSON.parse(backupJson);
    console.log('✅ 인터벌 백업 복원 완료:', backupId);
    return backupData;
  } catch (error) {
    console.error('❌ 인터벌 백업 복원 실패:', error);
    throw error;
  }
};

// 백업 삭제
export const deleteIntervalBackup = async (backupId: string): Promise<void> => {
  try {
    const backupKey = `${INTERVAL_BACKUP_STORAGE_KEY}_${backupId}`;
    await AsyncStorage.removeItem(backupKey);
    
    // 백업 목록에서 제거
    const backupList = await getIntervalBackupList();
    const updatedList = backupList.filter(backup => backup.id !== backupId);
    await AsyncStorage.setItem(INTERVAL_BACKUP_STORAGE_KEY, JSON.stringify(updatedList));
    
    console.log('✅ 인터벌 백업 삭제 완료:', backupId);
  } catch (error) {
    console.error('❌ 인터벌 백업 삭제 실패:', error);
    throw error;
  }
};

// 모든 백업 삭제
export const clearAllIntervalBackups = async (): Promise<void> => {
  try {
    const backupList = await getIntervalBackupList();
    
    for (const backup of backupList) {
      const backupKey = `${INTERVAL_BACKUP_STORAGE_KEY}_${backup.id}`;
      await AsyncStorage.removeItem(backupKey);
    }
    
    await AsyncStorage.removeItem(INTERVAL_BACKUP_STORAGE_KEY);
    console.log('✅ 모든 인터벌 백업 삭제 완료');
  } catch (error) {
    console.error('❌ 모든 인터벌 백업 삭제 실패:', error);
    throw error;
  }
};