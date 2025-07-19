import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useInterval, IntervalPhase } from '../context/IntervalContext';
import { useCustomAlert } from '../hooks/useCustomAlert';
import CustomAlert from '../components/CustomAlert';

const AddIntervalTemplateScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { addTemplate } = useInterval();
  const { alertConfig, showCustomAlert, hideAlert } = useCustomAlert();

  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templateIcon, setTemplateIcon] = useState('⏱️');
  const [totalCycles, setTotalCycles] = useState('4');
  const [selectedCategory, setSelectedCategory] = useState<'workout' | 'study' | 'meditation' | 'custom'>('custom');
  const [phases, setPhases] = useState<IntervalPhase[]>([
    {
      id: 'phase1',
      name: '작업',
      duration: 300, // 5분
      color: '#FF6B6B',
      soundId: 'default'
    },
    {
      id: 'phase2',
      name: '휴식',
      duration: 60, // 1분
      color: '#4ECDC4',
      soundId: 'default'
    }
  ]);

  const categories = [
    { id: 'workout', name: '운동', icon: '💪' },
    { id: 'study', name: '공부', icon: '📚' },
    { id: 'meditation', name: '명상', icon: '🧘‍♂️' },
    { id: 'custom', name: '커스텀', icon: '⚙️' },
  ];

  const phaseColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', 
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];

  // 시간을 분:초 형식으로 변환
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 분:초를 초로 변환
  const parseDuration = (timeString: string): number => {
    const parts = timeString.split(':');
    if (parts.length !== 2) return 60;
    const minutes = parseInt(parts[0]) || 0;
    const seconds = parseInt(parts[1]) || 0;
    return minutes * 60 + seconds;
  };

  const updatePhaseDuration = (index: number, timeString: string) => {
    const duration = parseDuration(timeString);
    setPhases(prev => prev.map((phase, i) => 
      i === index ? { ...phase, duration } : phase
    ));
  };

  const updatePhaseName = (index: number, name: string) => {
    setPhases(prev => prev.map((phase, i) => 
      i === index ? { ...phase, name } : phase
    ));
  };

  const updatePhaseColor = (index: number, color: string) => {
    setPhases(prev => prev.map((phase, i) => 
      i === index ? { ...phase, color } : phase
    ));
  };

  const addPhase = () => {
    const newPhase: IntervalPhase = {
      id: `phase${phases.length + 1}`,
      name: `단계 ${phases.length + 1}`,
      duration: 60,
      color: phaseColors[phases.length % phaseColors.length],
      soundId: 'default'
    };
    setPhases(prev => [...prev, newPhase]);
  };

  const removePhase = (index: number) => {
    if (phases.length <= 1) {
      showCustomAlert(
        '오류',
        '최소 1개의 단계가 필요합니다.',
        [{ text: '확인' }]
      );
      return;
    }
    setPhases(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!templateName.trim()) {
      showCustomAlert(
        '오류',
        '템플릿 이름을 입력해주세요.',
        [{ text: '확인' }]
      );
      return;
    }

    if (phases.length === 0) {
      showCustomAlert(
        '오류',
        '최소 1개의 단계가 필요합니다.',
        [{ text: '확인' }]
      );
      return;
    }

    const cycles = parseInt(totalCycles) || 1;
    if (cycles < 1 || cycles > 100) {
      showCustomAlert(
        '오류',
        '사이클 수는 1-100 사이여야 합니다.',
        [{ text: '확인' }]
      );
      return;
    }

    addTemplate({
      name: templateName.trim(),
      description: templateDescription.trim() || `${phases.length}단계 인터벌`,
      icon: templateIcon,
      phases,
      totalCycles: cycles,
      category: selectedCategory
    });

    showCustomAlert(
      '성공',
      '새 템플릿이 추가되었습니다!',
      [{ 
        text: '확인',
        onPress: () => navigation.goBack()
      }]
    );
  };

  const renderPhaseItem = ({ item, index }: { item: IntervalPhase; index: number }) => (
    <View style={styles.phaseItem}>
      <View style={styles.phaseHeader}>
        <Text style={styles.phaseNumber}>{index + 1}</Text>
        <TextInput
          style={styles.phaseNameInput}
          value={item.name}
          onChangeText={(text) => updatePhaseName(index, text)}
          placeholder="단계 이름"
          placeholderTextColor="#A67C61"
        />
        <TouchableOpacity
          style={styles.removePhaseButton}
          onPress={() => removePhase(index)}
        >
          <Text style={styles.removePhaseText}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.phaseContent}>
        <View style={styles.durationContainer}>
          <Text style={styles.label}>시간 (분:초)</Text>
          <TextInput
            style={styles.durationInput}
            value={formatDuration(item.duration)}
            onChangeText={(text) => updatePhaseDuration(index, text)}
            keyboardType="numeric"
            placeholder="5:00"
            placeholderTextColor="#A67C61"
          />
        </View>

        <View style={styles.colorContainer}>
          <Text style={styles.label}>색상</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.colorPicker}>
              {phaseColors.map((color, colorIndex) => (
                <TouchableOpacity
                  key={colorIndex}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    item.color === color && styles.selectedColor
                  ]}
                  onPress={() => updatePhaseColor(index, color)}
                />
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );

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
          <Text style={styles.title}>⏳ 템플릿 추가</Text>

          {/* 기본 정보 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>기본 정보</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>템플릿 이름</Text>
              <TextInput
                style={styles.textInput}
                value={templateName}
                onChangeText={setTemplateName}
                placeholder="예: 나만의 운동 루틴"
                placeholderTextColor="#A67C61"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>설명</Text>
              <TextInput
                style={styles.textInput}
                value={templateDescription}
                onChangeText={setTemplateDescription}
                placeholder="간단한 설명 (선택사항)"
                placeholderTextColor="#A67C61"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>아이콘</Text>
              <TextInput
                style={styles.textInput}
                value={templateIcon}
                onChangeText={setTemplateIcon}
                placeholder="⏱️"
                placeholderTextColor="#A67C61"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>총 사이클 수</Text>
              <TextInput
                style={styles.textInput}
                value={totalCycles}
                onChangeText={setTotalCycles}
                placeholder="4"
                keyboardType="numeric"
                placeholderTextColor="#A67C61"
              />
            </View>
          </View>

          {/* 카테고리 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>카테고리</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.categoryContainer}>
                {categories.map(category => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryButton,
                      selectedCategory === category.id && styles.categoryButtonActive
                    ]}
                    onPress={() => setSelectedCategory(category.id as any)}
                  >
                    <Text style={styles.categoryIcon}>{category.icon}</Text>
                    <Text style={[
                      styles.categoryText,
                      selectedCategory === category.id && styles.categoryTextActive
                    ]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* 단계 설정 */}
          <View style={styles.section}>
            <View style={styles.phasesHeader}>
              <Text style={styles.sectionTitle}>단계 설정 ({phases.length}개)</Text>
              <TouchableOpacity style={styles.addPhaseButton} onPress={addPhase}>
                <Text style={styles.addPhaseText}>+ 단계 추가</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={phases}
              renderItem={renderPhaseItem}
              keyExtractor={(item, index) => `${item.id}_${index}`}
              scrollEnabled={false}
            />
          </View>

          {/* 미리보기 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>미리보기</Text>
            <View style={styles.previewCard}>
              <Text style={styles.previewTitle}>
                {templateIcon} {templateName || '새 템플릿'}
              </Text>
              <Text style={styles.previewDescription}>
                {phases.length}단계 × {totalCycles}사이클
              </Text>
              <View style={styles.previewPhases}>
                {phases.map((phase, index) => (
                  <View
                    key={index}
                    style={[
                      styles.previewPhase,
                      { backgroundColor: phase.color }
                    ]}
                  />
                ))}
              </View>
            </View>
          </View>

          {/* 저장/취소 버튼 */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>✅ 템플릿 저장</Text>
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

      {/* CustomAlert */}
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onRequestClose={hideAlert}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2D1B14', // AddAlarmScreen과 동일한 배경색
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
    color: '#FFD4B3', // AddAlarmScreen과 동일한 색상
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#FFAB7A', // AddAlarmScreen과 동일한 색상
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#FFAB7A', // AddAlarmScreen과 동일한 색상
    fontSize: 14,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#8B6341',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#4A2C1A', // AddAlarmScreen과 동일한 색상
    color: '#FFD4B3', // AddAlarmScreen과 동일한 색상
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#4A2C1A', // AddAlarmScreen과 동일한 색상
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#8B6341', // AddAlarmScreen과 동일한 색상
  },
  categoryButtonActive: {
    backgroundColor: '#FF7F50',
    borderColor: '#FFD4B3',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryText: {
    color: '#A67C61',
    fontSize: 14,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  phasesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addPhaseButton: {
    backgroundColor: '#4A2C1A', // AddAlarmScreen과 동일한 색상
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#8B6341', // AddAlarmScreen과 동일한 색상
  },
  addPhaseText: {
    color: '#FF7F50',
    fontSize: 14,
    fontWeight: '600',
  },
  phaseItem: {
    backgroundColor: '#4A2C1A', // AddAlarmScreen과 동일한 색상
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#8B6341', // AddAlarmScreen과 동일한 색상
  },
  phaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  phaseNumber: {
    color: '#FFD4B3', // AddAlarmScreen과 동일한 색상
    fontSize: 18,
    fontWeight: 'bold',
    width: 30,
  },
  phaseNameInput: {
    flex: 1,
    backgroundColor: '#2D1B14', // 더 어두운 배경
    color: '#FFD4B3', // AddAlarmScreen과 동일한 색상
    padding: 8,
    borderRadius: 6,
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: '#8B6341', // AddAlarmScreen과 동일한 색상
  },
  removePhaseButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#CD5C5C', // AddAlarmScreen과 동일한 색상
    justifyContent: 'center',
    alignItems: 'center',
  },
  removePhaseText: {
    color: '#FFF8DC', // AddAlarmScreen과 동일한 색상
    fontSize: 14,
    fontWeight: 'bold',
  },
  phaseContent: {
    flexDirection: 'row',
    gap: 16,
  },
  durationContainer: {
    flex: 1,
  },
  durationInput: {
    backgroundColor: '#2D1B14', // 더 어두운 배경
    color: '#FFD4B3', // AddAlarmScreen과 동일한 색상
    padding: 8,
    borderRadius: 6,
    textAlign: 'center',
    fontFamily: 'monospace',
    borderWidth: 1,
    borderColor: '#8B6341', // AddAlarmScreen과 동일한 색상
  },
  colorContainer: {
    flex: 1,
  },
  colorPicker: {
    flexDirection: 'row',
    gap: 8,
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: 'white',
  },
  previewCard: {
    backgroundColor: '#4A2C1A', // AddAlarmScreen과 동일한 색상
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF7F50', // AddAlarmScreen과 동일한 색상
  },
  previewTitle: {
    color: '#FFD4B3', // AddAlarmScreen과 동일한 색상
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  previewDescription: {
    color: '#FFAB7A', // AddAlarmScreen과 동일한 색상
    fontSize: 14,
    marginBottom: 12,
  },
  previewPhases: {
    flexDirection: 'row',
    height: 8,
    width: '100%',
    borderRadius: 4,
    overflow: 'hidden',
  },
  previewPhase: {
    flex: 1,
    marginRight: 1,
  },
  buttonContainer: {
    marginTop: 20,
    gap: 15,
  },
  saveButton: {
    backgroundColor: '#228B22', // AddAlarmScreen과 동일한 색상
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#32CD32', // AddAlarmScreen과 동일한 색상
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#8B4513', // AddAlarmScreen과 동일한 색상
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#A0522D', // AddAlarmScreen과 동일한 색상
  },
  cancelButtonText: {
    color: '#FFD4B3', // AddAlarmScreen과 동일한 색상
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default AddIntervalTemplateScreen; 