import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alarm, AlarmGroup, AlarmHistory } from '../context/AlarmContext';

const ALARMS_STORAGE_KEY = '@RiseUp:alarms';
const ALARM_GROUPS_STORAGE_KEY = '@RiseUp:alarmGroups';
const ALARM_HISTORY_STORAGE_KEY = '@RiseUp:alarmHistory';

export const saveAlarmsToStorage = async (alarms: Alarm[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(alarms);
    await AsyncStorage.setItem(ALARMS_STORAGE_KEY, jsonValue);
  } catch (error) {
    console.error('Error saving alarms to storage:', error);
  }
};

export const loadAlarmsFromStorage = async (): Promise<Alarm[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(ALARMS_STORAGE_KEY);
    if (jsonValue != null) {
      const alarms = JSON.parse(jsonValue);
      // Date 객체 복원
      return alarms.map((alarm: any) => ({
        ...alarm,
        time: new Date(alarm.time),
      }));
    }
    return [];
  } catch (error) {
    console.error('Error loading alarms from storage:', error);
    return [];
  }
};

export const clearAlarmsFromStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(ALARMS_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing alarms from storage:', error);
  }
};

// 알람 그룹 저장
export const saveAlarmGroupsToStorage = async (groups: AlarmGroup[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(groups);
    await AsyncStorage.setItem(ALARM_GROUPS_STORAGE_KEY, jsonValue);
    console.log('💾 알람 그룹 저장 완료:', groups.length);
  } catch (error) {
    console.error('❌ 알람 그룹 저장 실패:', error);
  }
};

// 알람 그룹 로드
export const loadAlarmGroupsFromStorage = async (): Promise<AlarmGroup[]> => {
  try {
    const groupsData = await AsyncStorage.getItem(ALARM_GROUPS_STORAGE_KEY);
    if (groupsData) {
      const groups = JSON.parse(groupsData);
      // Date 객체 복원
      const parsedGroups = groups.map((group: any) => ({
        ...group,
        createdAt: new Date(group.createdAt),
      }));
      console.log('📂 알람 그룹 로드 완료:', parsedGroups.length);
      return parsedGroups;
    }
    return [];
  } catch (error) {
    console.error('❌ 알람 그룹 로드 실패:', error);
    return [];
  }
};

// 알람 그룹 삭제
export const clearAlarmGroupsFromStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(ALARM_GROUPS_STORAGE_KEY);
    console.log('🗑️ 알람 그룹 삭제 완료');
  } catch (error) {
    console.error('❌ 알람 그룹 삭제 실패:', error);
  }
};

// 알람 히스토리 저장
export const saveAlarmHistoryToStorage = async (history: AlarmHistory[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(history);
    await AsyncStorage.setItem(ALARM_HISTORY_STORAGE_KEY, jsonValue);
    console.log('💾 알람 히스토리 저장 완료:', history.length);
  } catch (error) {
    console.error('❌ 알람 히스토리 저장 실패:', error);
  }
};

// 알람 히스토리 로드
export const loadAlarmHistoryFromStorage = async (): Promise<AlarmHistory[]> => {
  try {
    const historyData = await AsyncStorage.getItem(ALARM_HISTORY_STORAGE_KEY);
    if (historyData) {
      const history = JSON.parse(historyData);
      // Date 객체 복원
      const parsedHistory = history.map((item: any) => ({
        ...item,
        triggeredAt: new Date(item.triggeredAt),
        snoozedAt: item.snoozedAt ? new Date(item.snoozedAt) : undefined,
        dismissedAt: item.dismissedAt ? new Date(item.dismissedAt) : undefined,
      }));
      console.log('📂 알람 히스토리 로드 완료:', parsedHistory.length);
      return parsedHistory;
    }
    return [];
  } catch (error) {
    console.error('❌ 알람 히스토리 로드 실패:', error);
    return [];
  }
};

// 알람 히스토리 삭제
export const clearAlarmHistoryFromStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(ALARM_HISTORY_STORAGE_KEY);
    console.log('🗑️ 알람 히스토리 삭제 완료');
  } catch (error) {
    console.error('❌ 알람 히스토리 삭제 실패:', error);
  }
};