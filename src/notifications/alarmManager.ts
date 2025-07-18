import PushNotification from 'react-native-push-notification';

export const scheduleAlarm = (id: string, date: Date, message: string) => {
  PushNotification.localNotificationSchedule({
    id,
    message,
    date,
    allowWhileIdle: true,
    repeatType: 'day',
  });
};

export const cancelAlarm = (id: string) => {
  PushNotification.cancelLocalNotifications({ id });
};