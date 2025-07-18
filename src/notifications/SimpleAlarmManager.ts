import { NativeModules, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GlobalAlert from '../utils/GlobalAlert';

const { AlarmModule } = NativeModules;

interface AlarmInfo {
  id: string;
  time: Date;
  title: string;
  message: string;
  repeatDays?: number[];
}

export class SimpleAlarmManager {
  private static instance: SimpleAlarmManager;
  private hasRequestedPermission = false;

  static getInstance(): SimpleAlarmManager {
    if (!SimpleAlarmManager.instance) {
      SimpleAlarmManager.instance = new SimpleAlarmManager();
    }
    return SimpleAlarmManager.instance;
  }

  // 한 번만 권한 요청
  private async requestPermissionOnce(): Promise<boolean> {
    if (this.hasRequestedPermission) {
      return true; // 이미 요청했으면 true 반환
    }

    return new Promise((resolve) => {
      const globalAlert = GlobalAlert.getInstance();
      globalAlert.alert(
        '🔔 RiseUp 알림 권한',
        '알람이 정시에 울리려면 알림 권한이 필요합니다.',
        [
          { text: '취소', style: 'cancel', onPress: () => resolve(false) },
          { text: '허용', style: 'default', onPress: () => resolve(true) },
        ],
        { cancelable: false }
      );
      this.hasRequestedPermission = true;
    });
  }

  // 단일 알람 설정
  async setAlarm(alarmInfo: AlarmInfo): Promise<boolean> {
    try {
      // 권한 확인 (한 번만)
      const hasPermission = await this.requestPermissionOnce();
      if (!hasPermission) {
        console.log('알림 권한 거부됨');
        return false;
      }

      if (Platform.OS === 'android' && AlarmModule) {
        const timeInMillis = alarmInfo.time.getTime();
        await AlarmModule.setAlarm(
          alarmInfo.id,
          timeInMillis,
          alarmInfo.title,
          alarmInfo.message
        );
        console.log('✅ 알람 설정 완료:', alarmInfo.id);
        return true;
      }
      return false;
    } catch (error) {
      console.error('알람 설정 실패:', error);
      return false;
    }
  }

  // 알람 취소
  async cancelAlarm(alarmId: string): Promise<boolean> {
    try {
      if (Platform.OS === 'android' && AlarmModule) {
        await AlarmModule.cancelAlarm(alarmId);
        console.log('✅ 알람 취소 완료:', alarmId);
        return true;
      }
      return false;
    } catch (error) {
      console.error('알람 취소 실패:', error);
      return false;
    }
  }

  // 반복 알람 설정
  async setRepeatingAlarm(alarmInfo: AlarmInfo): Promise<boolean> {
    if (!alarmInfo.repeatDays || alarmInfo.repeatDays.length === 0) {
      return await this.setAlarm(alarmInfo);
    }

    try {
      let allSuccess = true;
      const now = new Date();

      for (const day of alarmInfo.repeatDays) {
        const alarmTime = new Date(alarmInfo.time);
        const currentDay = now.getDay();
        let daysUntilAlarm = (day - currentDay + 7) % 7;

        // 오늘이면서 시간이 지났다면 다음 주로
        if (daysUntilAlarm === 0) {
          const todayAlarmTime = new Date(now);
          todayAlarmTime.setHours(alarmTime.getHours(), alarmTime.getMinutes(), 0, 0);
          if (todayAlarmTime.getTime() <= now.getTime()) {
            daysUntilAlarm = 7;
          }
        }

        const nextAlarmTime = new Date(now);
        nextAlarmTime.setDate(now.getDate() + daysUntilAlarm);
        nextAlarmTime.setHours(alarmTime.getHours(), alarmTime.getMinutes(), 0, 0);

        const dayAlarmInfo: AlarmInfo = {
          ...alarmInfo,
          id: `${alarmInfo.id}_day_${day}`,
          time: nextAlarmTime,
        };

        const success = await this.setAlarm(dayAlarmInfo);
        if (!success) allSuccess = false;

        console.log(`요일 ${day} 알람:`, {
          id: dayAlarmInfo.id,
          time: nextAlarmTime.toLocaleString(),
          success
        });
      }

      return allSuccess;
    } catch (error) {
      console.error('반복 알람 설정 실패:', error);
      return false;
    }
  }

  // 반복 알람 취소
  async cancelRepeatingAlarm(alarmId: string, repeatDays: number[]): Promise<boolean> {
    try {
      let allSuccess = true;

      for (const day of repeatDays) {
        const dayAlarmId = `${alarmId}_day_${day}`;
        const success = await this.cancelAlarm(dayAlarmId);
        if (!success) allSuccess = false;
      }

      return allSuccess;
    } catch (error) {
      console.error('반복 알람 취소 실패:', error);
      return false;
    }
  }
}

export default SimpleAlarmManager; 