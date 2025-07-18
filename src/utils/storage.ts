import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alarm } from '../context/AlarmContext';

const ALARMS_STORAGE_KEY = '@RiseUp:alarms';

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