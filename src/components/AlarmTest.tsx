import React from 'react';
import { View, Button, Alert, StyleSheet } from 'react-native';
import NotificationManager from '../notifications/NotificationManager';

const AlarmTest: React.FC = () => {
  const notificationManager = NotificationManager.getInstance();

  const testAlarm = async () => {
    const testTime = new Date();
    testTime.setSeconds(testTime.getSeconds() + 10); // 10초 후

    await notificationManager.scheduleNotification({
      id: 'test-alarm',
      time: testTime,
      title: '테스트 알람',
      message: '10초 후 알람 테스트입니다!',
    });

    Alert.alert('테스트 알람', '10초 후에 알람이 울립니다!');
  };

  return (
    <View style={styles.container}>
      <Button title="10초 후 알람 테스트" onPress={testAlarm} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
});

export default AlarmTest;
