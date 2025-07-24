import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from '../../components/CustomAlert'; // Alert 대신 CustomAlert 사용

interface Habit {
  id: string;
  title: string;
  description: string;
  category: 'health' | 'productivity' | 'learning' | 'lifestyle' | 'other';
  goal: number; // 목표 일수
  streak: number; // 연속 달성 일수
  completedDates: string[]; // 완료한 날짜들
  createdAt: string;
  color: string;
}

interface HabitProgress {
  habitId: string;
  date: string;
  completed: boolean;
}

const HabitTrackerScreen = () => {
  const insets = useSafeAreaInsets();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // 습관 추가 폼 상태
  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [newHabitDescription, setNewHabitDescription] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState<Habit['category']>('health');
  const [newHabitGoal, setNewHabitGoal] = useState('30');

  // CustomAlert 상태
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    buttons: [] as Array<{
      text: string;
      style?: 'default' | 'cancel' | 'destructive';
      onPress?: () => void;
    }>
  });

  const categoryInfo = {
    health: { name: '건강', icon: '💪', color: '#4CAF50' },
    productivity: { name: '생산성', icon: '📈', color: '#2196F3' },
    learning: { name: '학습', icon: '📚', color: '#FF9800' },
    lifestyle: { name: '라이프스타일', icon: '🌟', color: '#9C27B0' },
    other: { name: '기타', icon: '🎯', color: '#607D8B' }
  };

  const predefinedHabits = [
    { title: '물 8잔 마시기', category: 'health' as const, description: '하루 8잔의 물 마시기' },
    { title: '30분 운동하기', category: 'health' as const, description: '매일 30분간 운동하기' },
    { title: '책 읽기', category: 'learning' as const, description: '하루 30분 이상 책 읽기' },
    { title: '명상하기', category: 'lifestyle' as const, description: '10분간 명상 또는 마음챙김' },
    { title: '일기 쓰기', category: 'productivity' as const, description: '하루 일과 정리하기' },
    { title: '스마트폰 사용 줄이기', category: 'lifestyle' as const, description: '불필요한 스마트폰 사용 줄이기' }
  ];

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    try {
      const savedHabits = await AsyncStorage.getItem('habit_tracker');
      if (savedHabits) {
        setHabits(JSON.parse(savedHabits));
      }
    } catch (error) {
      console.error('습관 로딩 실패:', error);
    }
  };

  const saveHabits = async (newHabits: Habit[]) => {
    try {
      await AsyncStorage.setItem('habit_tracker', JSON.stringify(newHabits));
      setHabits(newHabits);
    } catch (error) {
      console.error('습관 저장 실패:', error);
    }
  };

  const showCustomAlert = (title: string, message: string, buttons: Array<{
    text: string;
    style?: 'default' | 'cancel' | 'destructive';
    onPress?: () => void;
  }>) => {
    setAlertConfig({ title, message, buttons });
    setAlertVisible(true);
  };

  const addHabit = () => {
    if (!newHabitTitle.trim()) {
      showCustomAlert('오류', '습관 제목을 입력하세요.', [
        {
          text: '확인',
          onPress: () => setAlertVisible(false)
        }
      ]);
      return;
    }

    const categoryColors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#607D8B'];
    const newHabit: Habit = {
      id: Date.now().toString(),
      title: newHabitTitle,
      description: newHabitDescription,
      category: newHabitCategory,
      goal: parseInt(newHabitGoal) || 30,
      streak: 0,
      completedDates: [],
      createdAt: new Date().toISOString(),
      color: categoryInfo[newHabitCategory].color
    };

    const newHabits = [...habits, newHabit];
    saveHabits(newHabits);
    
    showCustomAlert('완료', '새 습관이 추가되었습니다.', [
      {
        text: '확인',
        onPress: () => setAlertVisible(false)
      }
    ]);
    
    resetForm();
  };

  const resetForm = () => {
    setNewHabitTitle('');
    setNewHabitDescription('');
    setNewHabitCategory('health');
    setNewHabitGoal('30');
    setShowAddHabit(false);
  };

  const toggleHabitCompletion = (habitId: string) => {
    const today = new Date().toISOString().split('T')[0];
    
    const updatedHabits = habits.map(habit => {
      if (habit.id === habitId) {
        const isCompleted = habit.completedDates.includes(today);
        
        if (isCompleted) {
          // 완료 취소
          return {
            ...habit,
            completedDates: habit.completedDates.filter(date => date !== today),
            streak: calculateStreak(habit.completedDates.filter(date => date !== today))
          };
        } else {
          // 완료 표시
          const newCompletedDates = [...habit.completedDates, today].sort();
          return {
            ...habit,
            completedDates: newCompletedDates,
            streak: calculateStreak(newCompletedDates)
          };
        }
      }
      return habit;
    });
    
    saveHabits(updatedHabits);
  };

  const calculateStreak = (completedDates: string[]): number => {
    if (completedDates.length === 0) return 0;
    
    const today = new Date();
    let streak = 0;
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateString = checkDate.toISOString().split('T')[0];
      
      if (completedDates.includes(dateString)) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const deleteHabit = (habitId: string) => {
    showCustomAlert(
      '습관 삭제',
      '이 습관을 삭제하시겠습니까?',
      [
        { 
          text: '취소', 
          style: 'cancel',
          onPress: () => setAlertVisible(false)
        },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            const newHabits = habits.filter(habit => habit.id !== habitId);
            saveHabits(newHabits);
            setAlertVisible(false);
          }
        }
      ]
    );
  };

  const addPredefinedHabit = (predefined: typeof predefinedHabits[0]) => {
    const newHabit: Habit = {
      id: Date.now().toString(),
      title: predefined.title,
      description: predefined.description,
      category: predefined.category,
      goal: 30,
      streak: 0,
      completedDates: [],
      createdAt: new Date().toISOString(),
      color: categoryInfo[predefined.category].color
    };

    const newHabits = [...habits, newHabit];
    saveHabits(newHabits);
  };

  const getTodayProgress = () => {
    const today = new Date().toISOString().split('T')[0];
    const completed = habits.filter(habit => habit.completedDates.includes(today)).length;
    return { completed, total: habits.length };
  };

  const renderHabitItem = ({ item }: { item: Habit }) => {
    const today = new Date().toISOString().split('T')[0];
    const isCompleted = item.completedDates.includes(today);
    const completionRate = item.completedDates.length / item.goal * 100;
    
    return (
      <View style={[styles.habitItem, { borderLeftColor: item.color }]}>
        <TouchableOpacity
          style={styles.habitContent}
          onPress={() => toggleHabitCompletion(item.id)}
          onLongPress={() => deleteHabit(item.id)}
        >
          <View style={styles.habitHeader}>
            <View style={styles.habitInfo}>
              <Text style={styles.categoryIcon}>
                {categoryInfo[item.category].icon}
              </Text>
              <View style={styles.habitDetails}>
                <Text style={styles.habitTitle}>{item.title}</Text>
                <Text style={styles.habitDescription}>{item.description}</Text>
              </View>
            </View>
            
            <TouchableOpacity
              style={[
                styles.checkButton,
                isCompleted && styles.completedButton
              ]}
              onPress={() => toggleHabitCompletion(item.id)}
            >
              <Text style={styles.checkButtonText}>
                {isCompleted ? '✓' : '○'}
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.habitStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{item.streak}</Text>
              <Text style={styles.statLabel}>연속</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{item.completedDates.length}</Text>
              <Text style={styles.statLabel}>완료</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{completionRate.toFixed(0)}%</Text>
              <Text style={styles.statLabel}>달성률</Text>
            </View>
          </View>
          
          {/* 진행률 바 */}
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${Math.min(completionRate, 100)}%`,
                  backgroundColor: item.color 
                }
              ]} 
            />
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const progress = getTodayProgress();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>📈 습관 트래커</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddHabit(true)}
        >
          <Text style={styles.addButtonText}>+ 습관 추가</Text>
        </TouchableOpacity>
      </View>

      {/* 오늘의 진행률 */}
      <View style={styles.todayProgress}>
        <Text style={styles.todayTitle}>오늘의 진행률</Text>
        <View style={styles.progressCircle}>
          <Text style={styles.progressText}>
            {progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0}%
          </Text>
          <Text style={styles.progressSubtext}>
            {progress.completed}/{progress.total} 완료
          </Text>
        </View>
      </View>

      {/* 습관 목록 */}
      <View style={styles.habitsList}>
        {habits.length > 0 ? (
          <FlatList
            data={habits}
            renderItem={renderHabitItem}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.habitListContent}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>아직 습관이 없습니다</Text>
            <Text style={styles.emptySubtext}>새로운 습관을 추가해보세요!</Text>
          </View>
        )}
      </View>

      {/* 습관 추가 모달 */}
      <Modal
        visible={showAddHabit}
        animationType="slide"
        transparent={true}
        onRequestClose={resetForm}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>새 습관 추가</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={resetForm}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              {/* 추천 습관 */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>💡 추천 습관</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.predefinedHabits}>
                    {predefinedHabits.map((habit, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.predefinedHabit}
                        onPress={() => addPredefinedHabit(habit)}
                      >
                        <Text style={styles.predefinedIcon}>
                          {categoryInfo[habit.category].icon}
                        </Text>
                        <Text style={styles.predefinedTitle}>{habit.title}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* 커스텀 습관 */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>습관 제목</Text>
                <TextInput
                  style={styles.textInput}
                  value={newHabitTitle}
                  onChangeText={setNewHabitTitle}
                  placeholder="예: 매일 30분 운동하기"
                  placeholderTextColor="#666"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>설명</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={newHabitDescription}
                  onChangeText={setNewHabitDescription}
                  placeholder="습관에 대한 설명을 입력하세요"
                  placeholderTextColor="#666"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>카테고리</Text>
                <View style={styles.categoryContainer}>
                  {Object.entries(categoryInfo).map(([key, info]) => (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.categoryButton,
                        { backgroundColor: info.color },
                        newHabitCategory === key && styles.selectedCategory
                      ]}
                      onPress={() => setNewHabitCategory(key as Habit['category'])}
                    >
                      <Text style={styles.categoryIcon}>{info.icon}</Text>
                      <Text style={styles.categoryText}>{info.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>목표 (일)</Text>
                <TextInput
                  style={styles.textInput}
                  value={newHabitGoal}
                  onChangeText={setNewHabitGoal}
                  placeholder="30"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                />
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={addHabit}>
                <Text style={styles.saveButtonText}>습관 추가</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* CustomAlert */}
      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onRequestClose={() => setAlertVisible(false)}
      />
    </View>
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
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  todayProgress: {
    backgroundColor: '#2A2A2A',
    margin: 20,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  todayTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  progressCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#3A3A3A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#4CAF50',
  },
  progressText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  progressSubtext: {
    color: '#A67C61',
    fontSize: 12,
  },
  habitsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  habitListContent: {
    paddingBottom: 100,
  },
  habitItem: {
    backgroundColor: '#2A2A2A',
    borderRadius: 15,
    marginBottom: 15,
    borderLeftWidth: 5,
  },
  habitContent: {
    padding: 20,
  },
  habitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  habitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  habitDetails: {
    flex: 1,
  },
  habitTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  habitDescription: {
    color: '#A67C61',
    fontSize: 14,
  },
  checkButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3A3A3A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  completedButton: {
    backgroundColor: '#4CAF50',
  },
  checkButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  habitStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#A67C61',
    fontSize: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#3A3A3A',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 18,
    marginBottom: 10,
  },
  emptySubtext: {
    color: '#666',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#2A2A2A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#A67C61',
    fontSize: 20,
  },
  modalForm: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
  },
  predefinedHabits: {
    flexDirection: 'row',
    gap: 10,
  },
  predefinedHabit: {
    backgroundColor: '#3A3A3A',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 100,
  },
  predefinedIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  predefinedTitle: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
  },
  textInput: {
    backgroundColor: '#3A3A3A',
    color: 'white',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#4A4A4A',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    opacity: 0.7,
  },
  selectedCategory: {
    opacity: 1,
  },
  categoryText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HabitTrackerScreen; 