// src/screens/AddAlarmScreen.tsx
import React, { useState } from 'react';
import { View, Text, Button, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function AddAlarmScreen({ navigation }: any) {
  const [time, setTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const onChange = (_event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setTime(selectedDate);
    }
    setShowPicker(false);
  };

  const showTimePicker = () => {
    setShowPicker(true);
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, textAlign: 'center', marginBottom: 20 }}>⏰ 알람 시간 설정</Text>

      <Button title="시간 선택하기" onPress={showTimePicker} />

      <Text style={{ fontSize: 18, marginTop: 20, textAlign: 'center' }}>
        선택된 시간: {time.toLocaleTimeString()}
      </Text>

      {showPicker && (
        <DateTimePicker
          value={time}
          mode="time"
          is24Hour={true}
          display={Platform.OS === 'android' ? 'default' : 'spinner'}
          onChange={onChange}
        />
      )}

      <Button title="알람 저장" onPress={() => {
        // TODO: 저장 기능 추가 예정
        navigation.goBack();
      }} />
    </View>
  );
}