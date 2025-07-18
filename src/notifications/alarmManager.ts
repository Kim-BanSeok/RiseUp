import SimpleAlarmManager from './SimpleAlarmManager';

const simpleAlarmManager = SimpleAlarmManager.getInstance();

export const scheduleAlarm = async (
  id: string, 
  time: Date, 
  message: string, 
  repeatDays?: number[]
): Promise<boolean> => {
  try {
    const alarmInfo = {
    id,
      time,
      title: 'RiseUp 알람',
    message,
      repeatDays,
    };

    if (repeatDays && repeatDays.length > 0) {
      return await simpleAlarmManager.setRepeatingAlarm(alarmInfo);
    } else {
      return await simpleAlarmManager.setAlarm(alarmInfo);
    }
  } catch (error) {
    console.error('알람 예약 실패:', error);
    return false;
  }
};

export const cancelAlarm = async (id: string, repeatDays?: number[]): Promise<boolean> => {
  try {
    if (repeatDays && repeatDays.length > 0) {
      return await simpleAlarmManager.cancelRepeatingAlarm(id, repeatDays);
    } else {
      return await simpleAlarmManager.cancelAlarm(id);
    }
  } catch (error) {
    console.error('알람 취소 실패:', error);
    return false;
  }
};

export const cancelAllAlarms = async (): Promise<void> => {
  console.log('모든 알람 취소');
};