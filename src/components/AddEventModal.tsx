import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  description: string;
  category: 'work' | 'personal' | 'health' | 'study' | 'other';
  reminder: boolean;
  reminderTime: number;
}

interface AddEventModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (event: Event) => void;
  selectedDate: Date;
}

const AddEventModal: React.FC<AddEventModalProps> = ({
  visible,
  onClose,
  onSave,
  selectedDate,
}) => {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('09:00');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Event['category']>('personal');
  const [reminder, setReminder] = useState(false);
  const [reminderTime, setReminderTime] = useState(15);

  const categories = [
    { key: 'work', label: '업무', color: '#FF7F50' },
    { key: 'personal', label: '개인', color: '#4CAF50' },
    { key: 'health', label: '건강', color: '#2196F3' },
    { key: 'study', label: '공부', color: '#9C27B0' },
    { key: 'other', label: '기타', color: '#FFC107' },
  ];

  const reminderOptions = [
    { label: '5분 전', value: 5 },
    { label: '15분 전', value: 15 },
    { label: '30분 전', value: 30 },
    { label: '1시간 전', value: 60 },
    { label: '1일 전', value: 1440 },
  ];

  const resetForm = () => {
    setTitle('');
    setTime('09:00');
    setDescription('');
    setCategory('personal');
    setReminder(false);
    setReminderTime(15);
  };

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('오류', '일정 제목을 입력해주세요.');
      return;
    }

    const event: Event = {
      id: Date.now().toString(),
      title: title.trim(),
      date: selectedDate.toISOString().split('T')[0],
      time,
      description: description.trim(),
      category,
      reminder,
      reminderTime,
    };

    onSave(event);
    resetForm();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose}>
            <Text style={styles.cancelButton}>취소</Text>
          </TouchableOpacity>
          
          <Text style={styles.title}>일정 추가</Text>
          
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.saveButton}>저장</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <Text style={styles.dateText}>
            {selectedDate.getFullYear()}년 {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일
          </Text>

          {/* 제목 */}
          <View style={styles.section}>
            <Text style={styles.label}>제목</Text>
            <TextInput
              style={styles.textInput}
              value={title}
              onChangeText={setTitle}
              placeholder="일정 제목을 입력하세요"
              placeholderTextColor="#666"
            />
          </View>

          {/* 시간 */}
          <View style={styles.section}>
            <Text style={styles.label}>시간</Text>
            <TextInput
              style={styles.textInput}
              value={time}
              onChangeText={setTime}
              placeholder="HH:MM"
              placeholderTextColor="#666"
            />
          </View>

          {/* 설명 */}
          <View style={styles.section}>
            <Text style={styles.label}>설명</Text>
            <TextInput
              style={[styles.textInput, styles.multilineInput]}
              value={description}
              onChangeText={setDescription}
              placeholder="설명을 입력하세요 (선택사항)"
              placeholderTextColor="#666"
              multiline
              numberOfLines={3}
            />
          </View>

          {/* 카테고리 */}
          <View style={styles.section}>
            <Text style={styles.label}>카테고리</Text>
            <View style={styles.categoryContainer}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat.key}
                  style={[
                    styles.categoryButton,
                    { backgroundColor: cat.color },
                    category === cat.key && styles.selectedCategory
                  ]}
                  onPress={() => setCategory(cat.key as Event['category'])}
                >
                  <Text style={styles.categoryText}>{cat.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 알림 */}
          <View style={styles.section}>
            <View style={styles.reminderHeader}>
              <Text style={styles.label}>알림</Text>
              <Switch
                value={reminder}
                onValueChange={setReminder}
                trackColor={{ false: '#333', true: '#FF7F5080' }}
                thumbColor={reminder ? '#FF7F50' : '#666'}
              />
            </View>

            {reminder && (
              <View style={styles.reminderOptions}>
                {reminderOptions.map(option => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.reminderOption,
                      reminderTime === option.value && styles.selectedReminderOption
                    ]}
                    onPress={() => setReminderTime(option.value)}
                  >
                    <Text style={[
                      styles.reminderOptionText,
                      reminderTime === option.value && styles.selectedReminderText
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  cancelButton: {
    color: '#A67C61',
    fontSize: 16,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  saveButton: {
    color: '#FF7F50',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  dateText: {
    color: '#FF7F50',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    marginBottom: 25,
  },
  label: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
  },
  textInput: {
    backgroundColor: '#2A2A2A',
    color: 'white',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    opacity: 0.7,
  },
  selectedCategory: {
    opacity: 1,
  },
  categoryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reminderOptions: {
    marginTop: 15,
    gap: 8,
  },
  reminderOption: {
    backgroundColor: '#2A2A2A',
    padding: 12,
    borderRadius: 8,
  },
  selectedReminderOption: {
    backgroundColor: '#FF7F50',
  },
  reminderOptionText: {
    color: '#A67C61',
    fontSize: 14,
  },
  selectedReminderText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default AddEventModal; 