// RiseUp/src/screens/AddTimerScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTimer } from '../context/TimerContext';
import SoundSelector from '../components/SoundSelector';
import CustomAlert from '../components/CustomAlert';

interface PresetTime {
  id: string;
  name: string;
  minutes: number;
  seconds: number;
}

const AddTimerScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { addTimer } = useTimer();
  const [selectedMinutes, setSelectedMinutes] = useState(5);
  const [selectedSeconds, setSelectedSeconds] = useState(0);
  const [selectedSoundId, setSelectedSoundId] = useState('default');
  const [showPresets, setShowPresets] = useState(false);
  const [showCustomTime, setShowCustomTime] = useState(false);

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

  const presetTimes: PresetTime[] = [
    { id: '1', name: '1분', minutes: 1, seconds: 0 },
    { id: '2', name: '3분', minutes: 3, seconds: 0 },
    { id: '3', name: '5분', minutes: 5, seconds: 0 },
    { id: '4', name: '10분', minutes: 10, seconds: 0 },
    { id: '5', name: '15분', minutes: 15, seconds: 0 },
    { id: '6', name: '20분', minutes: 20, seconds: 0 },
    { id: '7', name: '30분', minutes: 30, seconds: 0 },
    { id: '8', name: '1시간', minutes: 60, seconds: 0 },
  ];

  const handlePresetSelect = (preset: PresetTime) => {
    setSelectedMinutes(preset.minutes);
    setSelectedSeconds(preset.seconds);
    setShowPresets(false);
  };

  const saveTimer = () => {
    if (selectedMinutes === 0 && selectedSeconds === 0) {
      showCustomAlert('⚠️ 시간 설정 오류', '타이머 시간을 설정해주세요.', [
        { text: '확인', style: 'default' }
      ]);
      return;
    }

    const totalMs = (selectedMinutes * 60 + selectedSeconds) * 1000;
    const timerName = `${selectedMinutes}분 ${selectedSeconds}초`;
    addTimer(timerName, totalMs, selectedSoundId);
    
    showCustomAlert(
      '✅ 타이머 추가 완료',
      `${selectedMinutes}분 ${selectedSeconds}초 타이머가 추가되었습니다.`,
      [{ text: '확인', style: 'default', onPress: () => navigation.goBack() }]
    );
  };

  const renderPresetItem = (preset: PresetTime) => (
    <TouchableOpacity
      key={preset.id}
      style={styles.presetItem}
      onPress={() => handlePresetSelect(preset)}
    >
      <Text style={styles.presetName}>{preset.name}</Text>
    </TouchableOpacity>
  );

  return (
    <>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 }
        ]}
      >
        <View style={styles.content}>
          <Text style={styles.title}>⏲️ 타이머 추가</Text>

          {/* 시간 설정 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>시간 설정</Text>
            
            {/* 현재 선택된 시간 */}
            <View style={styles.timeDisplay}>
              <Text style={styles.timeText}>
                {selectedMinutes.toString().padStart(2, '0')}:
                {selectedSeconds.toString().padStart(2, '0')}
              </Text>
            </View>

            {/* 프리셋 버튼들 */}
            <View style={styles.presetButtonsContainer}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setShowPresets(true)}
              >
                <Text style={styles.actionButtonText}>⚡ 빠른 선택</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setShowCustomTime(true)}
              >
                <Text style={styles.actionButtonText}>⚙️ 직접 설정</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 사운드 선택 */}
          <View style={styles.section}>
            <SoundSelector
              selectedSoundId={selectedSoundId}
              onSoundChange={setSelectedSoundId}
            />
          </View>

          {/* 미리보기 */}
          <View style={styles.previewContainer}>
            <Text style={styles.previewTitle}>타이머 미리보기</Text>
            <View style={styles.previewCard}>
              <Text style={styles.previewTime}>
                {selectedMinutes.toString().padStart(2, '0')}:
                {selectedSeconds.toString().padStart(2, '0')}
              </Text>
              <Text style={styles.previewDuration}>
                총 {selectedMinutes}분 {selectedSeconds}초
              </Text>
            </View>
          </View>

          {/* 저장/취소 버튼 */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.saveButton} onPress={saveTimer}>
              <Text style={styles.saveButtonText}>✅ 타이머 저장</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.cancelButtonText}>❌ 취소</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 프리셋 모달 */}
        <Modal
          visible={showPresets}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowPresets(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setShowPresets(false)}
                >
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>빠른 시간 선택</Text>
                <View style={styles.placeholder} />
              </View>

              <ScrollView style={styles.presetsList}>
                <View style={styles.presetsGrid}>
                  {presetTimes.map(renderPresetItem)}
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* 직접 설정 모달 */}
        <Modal
          visible={showCustomTime}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowCustomTime(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setShowCustomTime(false)}
                >
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>시간 직접 설정</Text>
                <TouchableOpacity
                  style={styles.modalSaveButton}
                  onPress={() => setShowCustomTime(false)}
                >
                  <Text style={styles.modalSaveText}>완료</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.timePickerContainer}>
                <View style={styles.timePicker}>
                  <Text style={styles.timePickerLabel}>분</Text>
                  <TextInput
                    style={styles.timeInput}
                    value={selectedMinutes.toString()}
                    onChangeText={(text) => {
                      const num = parseInt(text) || 0;
                      setSelectedMinutes(Math.min(999, Math.max(0, num)));
                    }}
                    keyboardType="numeric"
                    maxLength={3}
                  />
                </View>
                
                <Text style={styles.timeSeparator}>:</Text>
                
                <View style={styles.timePicker}>
                  <Text style={styles.timePickerLabel}>초</Text>
                  <TextInput
                    style={styles.timeInput}
                    value={selectedSeconds.toString()}
                    onChangeText={(text) => {
                      const num = parseInt(text) || 0;
                      setSelectedSeconds(Math.min(59, Math.max(0, num)));
                    }}
                    keyboardType="numeric"
                    maxLength={2}
                  />
                </View>
              </View>
            </View>
          </View>
        </Modal>
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
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2D1B14',
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
    color: '#FFD4B3',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#FFAB7A',
  },
  timeDisplay: {
    backgroundColor: '#4A2C1A',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#8B6341',
  },
  timeText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FF7F50',
    fontFamily: 'monospace',
  },
  presetButtonsContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#5D4037',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8B6341',
  },
  actionButtonText: {
    color: '#FFD4B3',
    fontWeight: '600',
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
    borderColor: '#FF7F50',
    alignItems: 'center',
  },
  previewTime: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF7F50',
    fontFamily: 'monospace',
    marginBottom: 5,
  },
  previewDuration: {
    fontSize: 14,
    color: '#FFAB7A',
  },
  buttonContainer: {
    gap: 15,
  },
  saveButton: {
    backgroundColor: '#228B22',
    paddingVertical: 15,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#2D1B14',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: '50%',
    maxHeight: '80%',
    paddingTop: 20,
    borderWidth: 2,
    borderColor: '#4A2C1A',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#4A2C1A',
  },
  modalCloseButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4A2C1A',
    borderRadius: 15,
  },
  modalCloseText: {
    color: '#FFD4B3',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalTitle: {
    color: '#FFD4B3',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalSaveButton: {
    backgroundColor: '#FF7F50',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  modalSaveText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  placeholder: {
    width: 30,
  },
  presetsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  presetItem: {
    width: '48%',
    backgroundColor: '#4A2C1A',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#8B6341',
  },
  presetName: {
    color: '#FFD4B3',
    fontSize: 16,
    fontWeight: 'bold',
  },
  timePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 20,
  },
  timePicker: {
    alignItems: 'center',
  },
  timePickerLabel: {
    color: '#FFAB7A',
    fontSize: 16,
    marginBottom: 10,
  },
  timeInput: {
    backgroundColor: '#4A2C1A',
    color: '#FFD4B3',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#8B6341',
    minWidth: 80,
    fontFamily: 'monospace',
  },
  timeSeparator: {
    color: '#FFD4B3',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default AddTimerScreen;
