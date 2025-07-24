import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomAlert from '../../components/CustomAlert';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CustomPeriod {
  id: string;
  name: string;
  duration: number;
  isBreak: boolean;
}

const AddCustomSportScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const [sportName, setSportName] = useState('');
  const [periods, setPeriods] = useState<CustomPeriod[]>([
    { id: '1', name: '1기간', duration: 10, isBreak: false }
  ]);
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    buttons: [] as any[]
  });

  const showCustomAlert = (title: string, message: string, buttons: any[]) => {
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

  const addPeriod = () => {
    const newId = (periods.length + 1).toString();
    const newPeriod: CustomPeriod = {
      id: newId,
      name: `${newId}기간`,
      duration: 10,
      isBreak: false
    };
    setPeriods([...periods, newPeriod]);
  };

  const removePeriod = (id: string) => {
    if (periods.length <= 1) {
      showCustomAlert(
        '⚠️ 최소 1개 기간 필요',
        '최소 1개의 기간이 필요합니다.',
        [{ text: '확인' }]
      );
      return;
    }
    setPeriods(periods.filter(p => p.id !== id));
  };

  const updatePeriod = (id: string, field: keyof CustomPeriod, value: any) => {
    setPeriods(periods.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const saveCustomSport = async () => {
    if (!sportName.trim()) {
      showCustomAlert(
        '⚠️ 스포츠 이름 필요',
        '스포츠 이름을 입력해주세요.',
        [{ text: '확인' }]
      );
      return;
    }

    if (periods.some(p => !p.name.trim())) {
      showCustomAlert(
        '⚠️ 기간 이름 필요',
        '모든 기간의 이름을 입력해주세요.',
        [{ text: '확인' }]
      );
      return;
    }

    // 커스텀 스포츠 생성
    const customSport = {
      id: `custom_${Date.now()}`,
      name: sportName,
      icon: '⚽',
      periods: periods
    };

    try {
      // 기존 커스텀 스포츠 불러오기
      const existingCustomSports = await AsyncStorage.getItem('customSports');
      const customSportsArray = existingCustomSports ? JSON.parse(existingCustomSports) : [];
      
      // 새로운 스포츠 추가
      const updatedCustomSports = [...customSportsArray, customSport];
      
      // 저장
      await AsyncStorage.setItem('customSports', JSON.stringify(updatedCustomSports));
      
      // 성공 메시지
      showCustomAlert(
        '✅ 커스텀 스포츠 추가됨',
        `${sportName} 스포츠가 추가되었습니다!`,
        [
          {
            text: '확인',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      showCustomAlert(
        '❌ 저장 실패',
        '커스텀 스포츠 저장에 실패했습니다.',
        [{ text: '확인' }]
      );
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 20 }]}>
      {/* 헤더 */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.title}>커스텀 스포츠 추가</Text>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={saveCustomSport}
        >
          <Text style={styles.saveButtonText}>저장</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* 스포츠 이름 입력 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>스포츠 이름</Text>
          <TextInput
            style={styles.nameInput}
            value={sportName}
            onChangeText={setSportName}
            placeholder="예: 축구, 농구, 테니스..."
            placeholderTextColor="#A67C61"
          />
        </View>

        {/* 기간 설정 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>경기 기간 설정</Text>
            <TouchableOpacity style={styles.addButton} onPress={addPeriod}>
              <Text style={styles.addButtonText}>+ 기간 추가</Text>
            </TouchableOpacity>
          </View>

          {periods.map((period, index) => (
            <View key={period.id} style={styles.periodCard}>
              <View style={styles.periodHeader}>
                <Text style={styles.periodNumber}>{index + 1}</Text>
                <TouchableOpacity 
                  style={styles.removeButton}
                  onPress={() => removePeriod(period.id)}
                >
                  <Text style={styles.removeButtonText}>×</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.periodInputs}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>기간 이름</Text>
                  <TextInput
                    style={styles.textInput}
                    value={period.name}
                    onChangeText={(text) => updatePeriod(period.id, 'name', text)}
                    placeholder="예: 전반전, 1쿼터..."
                    placeholderTextColor="#A67C61"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>시간 (분)</Text>
                  <TextInput
                    style={styles.numberInput}
                    value={period.duration.toString()}
                    onChangeText={(text) => {
                      const num = parseInt(text) || 0;
                      updatePeriod(period.id, 'duration', num);
                    }}
                    keyboardType="numeric"
                    placeholder="10"
                    placeholderTextColor="#A67C61"
                  />
                </View>

                <TouchableOpacity 
                  style={[
                    styles.breakToggle,
                    period.isBreak && styles.breakToggleActive
                  ]}
                  onPress={() => updatePeriod(period.id, 'isBreak', !period.isBreak)}
                >
                  <Text style={[
                    styles.breakToggleText,
                    period.isBreak && styles.breakToggleTextActive
                  ]}>
                    {period.isBreak ? '휴식 시간' : '경기 시간'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* 미리보기 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>미리보기</Text>
          <View style={styles.previewCard}>
            <Text style={styles.previewTitle}>{sportName || '스포츠 이름'}</Text>
            {periods.map((period, index) => (
              <Text key={period.id} style={styles.previewPeriod}>
                {index + 1}. {period.name} ({period.duration}분)
                {period.isBreak && ' - 휴식'}
              </Text>
            ))}
          </View>
        </View>
      </ScrollView>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onRequestClose={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2D1B14',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    backgroundColor: '#2D1B14',
  },
  backButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  backButtonText: {
    color: '#FFD4B3',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    color: '#FFD4B3',
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#FF7F50',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD4B3',
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: '#FF7F50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  nameInput: {
    backgroundColor: '#4A2C1A',
    borderRadius: 8,
    padding: 12,
    color: '#FFD4B3',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#8B6341',
  },
  periodCard: {
    backgroundColor: '#4A2C1A',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#8B6341',
  },
  periodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  periodNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF7F50',
  },
  removeButton: {
    backgroundColor: '#CD5C5C',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  periodInputs: {
    gap: 10,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputLabel: {
    fontSize: 14,
    color: '#FFAB7A',
    fontWeight: '600',
    width: 80,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#3A241A',
    borderRadius: 6,
    padding: 8,
    color: '#FFD4B3',
    fontSize: 14,
    marginLeft: 10,
  },
  numberInput: {
    width: 80,
    backgroundColor: '#3A241A',
    borderRadius: 6,
    padding: 8,
    color: '#FFD4B3',
    fontSize: 14,
    textAlign: 'center',
    marginLeft: 10,
  },
  breakToggle: {
    backgroundColor: '#3A241A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#8B6341',
  },
  breakToggleActive: {
    backgroundColor: '#32CD32',
    borderColor: '#32CD32',
  },
  breakToggleText: {
    color: '#FFAB7A',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  breakToggleTextActive: {
    color: 'white',
  },
  previewCard: {
    backgroundColor: '#4A2C1A',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#8B6341',
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD4B3',
    marginBottom: 10,
  },
  previewPeriod: {
    fontSize: 14,
    color: '#FFAB7A',
    marginBottom: 5,
  },
});

export default AddCustomSportScreen; 