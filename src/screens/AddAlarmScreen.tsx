// src/screens/AddAlarmScreen.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  Button, 
  Platform, 
  TextInput, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAlarm } from '../context/AlarmContext';
import DaySelector from '../components/DaySelector';
import SoundSelector from '../components/SoundSelector';
import { getSoundById } from '../utils/sounds';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomAlert from '../components/CustomAlert';

export default function AddAlarmScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [time, setTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [label, setLabel] = useState('알람');
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [selectedSoundId, setSelectedSoundId] = useState('default');
  const [isSaving, setIsSaving] = useState(false);
  const { addAlarm } = useAlarm();

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

  const onChange = (_event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setTime(selectedDate);
    }
    setShowPicker(false);
  };

  const showTimePicker = () => {
    setShowPicker(true);
  };

  // 안전한 사운드 가져오기 함수
  const getSafeSoundName = (soundId: string) => {
    try {
      const sound = getSoundById(soundId);
      return sound ? sound.name : '기본 알람';
    } catch (error) {
      console.error('사운드 가져오기 오류:', error);
      return '기본 알람';
    }
  };

  // 안전한 요일 표시 함수
  const getSafeDaysText = (days: number[] | undefined) => {
    try {
      if (!days || days.length === 0) {
        return '한번만 울림';
      }
      
      if (days.length === 7) {
        return '매일 반복';
      }
      
      const dayNames = ['일','월','화','수','목','금','토'];
      const selectedDayNames = dayNames.filter((_, i) => days.includes(i));
      return `${selectedDayNames.join(', ')} 반복`;
    } catch (error) {
      console.error('요일 표시 오류:', error);
      return '한번만 울림';
    }
  };

  const saveAlarm = async () => {
    if (!label.trim()) {
      showCustomAlert('⚠️ 입력 오류', '알람 이름을 입력해주세요.', [
        { text: '확인', style: 'default' }
      ]);
      return;
    }

    if (isSaving) {
      return;
    }

    setIsSaving(true);

    try {
      const success = await addAlarm(time, label.trim(), selectedDays || [], selectedSoundId);
      
      if (success) {
        const soundName = getSafeSoundName(selectedSoundId);
        showCustomAlert(
          '✅ 알람 추가 완료',
          `${time.toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          })} 알람이 추가되었습니다.\n알람음: ${soundName}`,
          [{ text: '확인', style: 'default', onPress: () => navigation.goBack() }]
        );
      } else {
        showCustomAlert(
          '❌ 알람 추가 실패',
          '알람을 추가하는 중 오류가 발생했습니다. 알림 권한을 확인해주세요.',
          [
            { text: '확인', style: 'default' },
            { 
              text: '권한 설정', 
              style: 'default',
              onPress: () => {
                console.log('권한 설정 페이지로 이동');
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('알람 저장 중 오류:', error);
      showCustomAlert(
        '⚠️ 오류',
        '알람 저장 중 오류가 발생했습니다. 다시 시도해주세요.',
        [{ text: '확인', style: 'default' }]
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 120 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.title}>⏰ 알람 추가</Text>

          {/* 알람 이름 입력 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>알람 이름</Text>
            <TextInput
              style={styles.textInput}
              value={label}
              onChangeText={setLabel}
              placeholder="알람 이름을 입력하세요"
              placeholderTextColor="#A67C61"
              maxLength={30}
            />
          </View>

          {/* 시간 선택 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>알람 시간</Text>
            <View style={styles.timeContainer}>
              <Text style={styles.timeDisplay}>
                {time.toLocaleTimeString('ko-KR', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: false 
                })}
              </Text>
              <TouchableOpacity style={styles.timeButton} onPress={showTimePicker}>
                <Text style={styles.timeButtonText}>시간 변경</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 요일 선택 */}
          <View style={styles.section}>
            <DaySelector
              selectedDays={selectedDays || []}
              onDaysChange={setSelectedDays}
            />
          </View>

          {/* 사운드 선택 */}
          <View style={styles.section}>
            <SoundSelector
              selectedSoundId={selectedSoundId}
              onSoundChange={setSelectedSoundId}
            />
          </View>

          {/* 알람 미리보기 */}
          <View style={styles.previewContainer}>
            <Text style={styles.previewTitle}>알람 미리보기</Text>
            <View style={styles.previewCard}>
              <Text style={styles.previewTime}>
                {time.toLocaleTimeString('ko-KR', { 
                  hour: '2-digit', 
                  minute: '2-digit',
                  hour12: false 
                })}
              </Text>
              <Text style={styles.previewLabel}>{label}</Text>
              <Text style={styles.previewDays}>
                {getSafeDaysText(selectedDays)}
              </Text>
              <Text style={styles.previewSound}>
                🔊 {getSafeSoundName(selectedSoundId)}
              </Text>
            </View>
          </View>

          {/* 저장/취소 버튼 */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.saveButton} onPress={saveAlarm}>
              <Text style={styles.saveButtonText}>✅ 알람 저장</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.cancelButtonText}>❌ 취소</Text>
            </TouchableOpacity>
          </View>

          {/* DateTimePicker */}
          {showPicker && (
            <DateTimePicker
              value={time}
              mode="time"
              is24Hour={true}
              display={Platform.OS === 'android' ? 'default' : 'spinner'}
              onChange={onChange}
            />
          )}
        </View>
      </ScrollView>

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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2D1B14', // 어두운 브라운 배경
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#FFD4B3', // 밝은 피치
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#FFAB7A', // 따뜻한 오렌지
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#8B6341',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#4A2C1A', // 중간 톤 브라운
    color: '#FFD4B3',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#4A2C1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8B6341',
  },
  timeDisplay: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD4B3',
  },
  timeButton: {
    backgroundColor: '#FF7F50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  timeButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  previewContainer: {
    marginBottom: 30,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#FFAB7A',
  },
  previewCard: {
    backgroundColor: '#4A2C1A',
    padding: 20,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#FF7F50', // 코랄 오렌지
    alignItems: 'center',
  },
  previewTime: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF7F50',
    marginBottom: 8,
  },
  previewLabel: {
    fontSize: 16,
    color: '#FFD4B3',
    marginBottom: 5,
  },
  previewDays: {
    fontSize: 14,
    color: '#FFAB7A',
    marginBottom: 5,
  },
  previewSound: {
    fontSize: 14,
    color: '#FFAB7A',
    fontWeight: '500',
  },
  buttonContainer: {
    marginTop: 20,
    gap: 15,
  },
  saveButton: {
    backgroundColor: '#228B22',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#32CD32',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#8B4513',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#A0522D',
  },
  cancelButtonText: {
    color: '#FFD4B3',
    fontSize: 18,
    fontWeight: 'bold',
  },
});