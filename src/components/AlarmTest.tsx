import React, { useState } from 'react';
import { View, Button, StyleSheet } from 'react-native';
import NotificationManager from '../notifications/NotificationManager';
import CustomAlert from './CustomAlert';

const AlarmTest: React.FC = () => {
  const notificationManager = NotificationManager.getInstance();

  // CustomAlert 상태
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    buttons: Array<{
      text: string;
      style?: 'default' | 'cancel' | 'destructive';
      onPress?: () => void;
    }>;
  }>({
    visible: false,
    title: '',
    message: '',
    buttons: []
  });

  const showCustomAlert = (
    title: string,
    message: string,
    buttons: Array<{
      text: string;
      style?: 'default' | 'cancel' | 'destructive';
      onPress?: () => void;
    }>
  ) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      buttons: buttons.map(button => ({
        ...button,
        onPress: () => {
          setAlertConfig(prev => ({ ...prev, visible: false }));
          if (button.onPress) {
            button.onPress();
          }
        }
      }))
    });
  };

  const testAlarm = async () => {
    const testTime = new Date();
    testTime.setSeconds(testTime.getSeconds() + 10); // 10초 후

    await notificationManager.scheduleNotification({
      id: 'test-alarm',
      time: testTime,
      title: '테스트 알람',
      message: '10초 후 알람 테스트입니다!',
    });

    showCustomAlert('⏰ 테스트 알람', '10초 후에 알람이 울립니다!', [
      { text: '확인', style: 'default' }
    ]);
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.buttonContainer}>
          <Button title="10초 후 알람 테스트" onPress={testAlarm} />
        </View>
      </View>

      {/* CustomAlert */}
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onRequestClose={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20, // 원래 패딩 복원
  },
  buttonContainer: {
    alignSelf: 'center', // 버튼을 중앙에 배치하되 크기는 내용에 맞춤
    minWidth: 200, // 최소 너비 설정
    maxWidth: 300, // 최대 너비 제한
  },
});

export default AlarmTest;
