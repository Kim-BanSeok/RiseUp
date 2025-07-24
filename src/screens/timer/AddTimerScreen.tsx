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
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTimer, TimerCategory } from '../../context/TimerContext';
import SoundSelector from '../../components/SoundSelector';
import CustomAlert from '../../components/CustomAlert';

interface PresetTime {
  id: string;
  name: string;
  minutes: number;
  seconds: number;
}

const AddTimerScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { addTimer, timerCategories } = useTimer();
  const [selectedMinutes, setSelectedMinutes] = useState(5);
  const [selectedSeconds, setSelectedSeconds] = useState(0);
  const [selectedSoundId, setSelectedSoundId] = useState('default');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('uncategorized');
  const [showPresets, setShowPresets] = useState(false);
  const [showCustomTime, setShowCustomTime] = useState(false);
  const [showCategorySelector, setShowCategorySelector] = useState(false);

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

  // 현재 선택된 카테고리 정보
  const currentCategory = selectedCategoryId === 'uncategorized' 
    ? { name: '미분류', icon: '❓', color: '#999' }
    : timerCategories.find(cat => cat.id === selectedCategoryId) || { name: '미분류', icon: '❓', color: '#999' };

  const saveTimer = () => {
    if (selectedMinutes === 0 && selectedSeconds === 0) {
      showCustomAlert('⚠️ 시간 설정 오류', '타이머 시간을 설정해주세요.', [
        { text: '확인', style: 'default' }
      ]);
      return;
    }

    const totalMs = (selectedMinutes * 60 + selectedSeconds) * 1000;
    const timerName = `${selectedMinutes}분 ${selectedSeconds}초`;
    
    // 카테고리 ID를 전달하여 타이머 생성
    addTimer(timerName, totalMs, selectedSoundId, undefined, selectedCategoryId);
    
    showCustomAlert(
      '✅ 타이머 추가 완료',
      `${selectedMinutes}분 ${selectedSeconds}초 타이머가 ${currentCategory.name} 카테고리에 추가되었습니다.`,
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

  const renderCategoryItem = ({ item }: { item: TimerCategory }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategoryId === item.id && styles.categoryItemSelected
      ]}
      onPress={() => {
        setSelectedCategoryId(item.id);
        setShowCategorySelector(false);
      }}
    >
      <Text style={styles.categoryIcon}>{item.icon}</Text>
      <Text style={[
        styles.categoryName,
        selectedCategoryId === item.id && styles.categoryNameSelected
      ]}>
        {item.name}
      </Text>
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

          {/* 카테고리 선택 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>카테고리 선택</Text>
            
            <TouchableOpacity
              style={styles.categorySelector}
              onPress={() => setShowCategorySelector(true)}
            >
              <View style={styles.categoryDisplay}>
                <Text style={styles.categoryIcon}>{currentCategory.icon}</Text>
                <Text style={styles.categoryText}>{currentCategory.name}</Text>
              </View>
              <Text style={styles.categoryArrow}>▼</Text>
            </TouchableOpacity>
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
              <View style={[styles.previewCategory, { backgroundColor: currentCategory.color }]}>
                <Text style={styles.previewCategoryText}>
                  {currentCategory.icon} {currentCategory.name}
                </Text>
              </View>
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
      </ScrollView>

      {/* 카테고리 선택 모달 */}
      <Modal
        visible={showCategorySelector}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCategorySelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>카테고리 선택</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowCategorySelector(false)}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={[
                { id: 'uncategorized', name: '미분류', icon: '❓', color: '#999' },
                ...timerCategories
              ]}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.categoryItem,
                    selectedCategoryId === item.id && styles.categoryItemSelected
                  ]}
                  onPress={() => {
                    setSelectedCategoryId(item.id);
                    setShowCategorySelector(false);
                  }}
                >
                  <Text style={styles.categoryIcon}>{item.icon}</Text>
                  <Text style={[
                    styles.categoryName,
                    selectedCategoryId === item.id && styles.categoryNameSelected
                  ]}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id}
              style={styles.categoryList}
            />
          </View>
        </View>
      </Modal>

      {/* CustomAlert */}
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
      />
    </>
  );
};

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
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#FFD4B3',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFD4B3',
    marginBottom: 15,
  },
  timeDisplay: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timeText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FF7F50',
    fontFamily: 'monospace',
  },
  presetButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#4A2C1A',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#8B6341',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFD4B3',
    fontSize: 16,
    fontWeight: '600',
  },
  categorySelector: {
    backgroundColor: '#4A2C1A',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#8B6341',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  categoryText: {
    color: '#FFD4B3',
    fontSize: 16,
    fontWeight: '500',
  },
  categoryArrow: {
    color: '#FFAB7A',
    fontSize: 16,
  },
  previewContainer: {
    marginTop: 20,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFD4B3',
    marginBottom: 10,
  },
  previewCard: {
    backgroundColor: '#4A2C1A',
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#8B6341',
    alignItems: 'center',
  },
  previewTime: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF7F50',
    marginBottom: 5,
  },
  previewDuration: {
    fontSize: 14,
    color: '#FFAB7A',
    marginBottom: 10,
  },
  previewCategory: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  previewCategoryText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  buttonContainer: {
    marginTop: 30,
    gap: 15,
  },
  saveButton: {
    backgroundColor: '#FF7F50',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF6347',
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
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A0522D',
  },
  cancelButtonText: {
    color: '#FFD4B3',
    fontSize: 16,
    fontWeight: '600',
  },
  // 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#2D1B14',
    borderRadius: 15,
    width: '80%',
    maxHeight: '70%',
    borderWidth: 2,
    borderColor: '#8B6341',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#8B6341',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD4B3',
  },
  modalCloseButton: {
    padding: 5,
  },
  modalCloseText: {
    fontSize: 24,
    color: '#FFAB7A',
  },
  categoryList: {
    padding: 20,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#4A2C1A',
    borderWidth: 1,
    borderColor: '#8B6341',
  },
  categoryItemSelected: {
    backgroundColor: '#FF7F50',
    borderColor: '#FF7F50',
  },
  categoryName: {
    color: '#FFD4B3',
    fontSize: 16,
    fontWeight: '500',
  },
  categoryNameSelected: {
    color: '#FFF',
    fontWeight: '600',
  },
  // 기존 스타일들...
  presetItem: {
    backgroundColor: '#4A2C1A',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#8B6341',
  },
  presetName: {
    color: '#FFD4B3',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default AddTimerScreen;
