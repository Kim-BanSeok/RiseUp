import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Exercise {
  id: string;
  name: string;
  category: string;
  icon: string;
  unit: 'reps' | 'duration' | 'distance';
}

interface WorkoutRecord {
  id: string;
  exerciseId: string;
  exerciseName: string;
  sets: ExerciseSet[];
  date: string;
  notes?: string;
}

interface ExerciseSet {
  id: string;
  weight?: number;
  reps?: number;
  duration?: number; // 초 단위
  distance?: number; // km 단위
}

const EXERCISE_CATEGORIES = [
  { id: 'strength', name: '근력', icon: '💪' },
  { id: 'cardio', name: '유산소', icon: '🏃‍♂️' },
  { id: 'flexibility', name: '유연성', icon: '🤸‍♀️' },
  { id: 'sports', name: '스포츠', icon: '⚽' },
];

const DEFAULT_EXERCISES: Exercise[] = [
  // 근력 운동
  { id: 'pushup', name: '팔굽혀펴기', category: 'strength', icon: '🤲', unit: 'reps' },
  { id: 'pullup', name: '턱걸이', category: 'strength', icon: '🔗', unit: 'reps' },
  { id: 'squat', name: '스쿼트', category: 'strength', icon: '🦵', unit: 'reps' },
  { id: 'deadlift', name: '데드리프트', category: 'strength', icon: '🏋️‍♂️', unit: 'reps' },
  { id: 'benchpress', name: '벤치프레스', category: 'strength', icon: '🏋️‍♀️', unit: 'reps' },
  
  // 유산소 운동
  { id: 'running', name: '러닝', category: 'cardio', icon: '🏃‍♂️', unit: 'distance' },
  { id: 'cycling', name: '사이클링', category: 'cardio', icon: '🚴‍♂️', unit: 'distance' },
  { id: 'swimming', name: '수영', category: 'cardio', icon: '🏊‍♂️', unit: 'duration' },
  { id: 'jumpingjacks', name: '점핑잭', category: 'cardio', icon: '🤸‍♂️', unit: 'reps' },
  
  // 유연성 운동
  { id: 'yoga', name: '요가', category: 'flexibility', icon: '🧘‍♀️', unit: 'duration' },
  { id: 'stretching', name: '스트레칭', category: 'flexibility', icon: '🤸‍♀️', unit: 'duration' },
  
  // 스포츠
  { id: 'basketball', name: '농구', category: 'sports', icon: '🏀', unit: 'duration' },
  { id: 'soccer', name: '축구', category: 'sports', icon: '⚽', unit: 'duration' },
  { id: 'tennis', name: '테니스', category: 'sports', icon: '🎾', unit: 'duration' },
];

const STORAGE_KEY = '@RiseUp:workouts';

const ExerciseTrackerScreen = () => {
  const insets = useSafeAreaInsets();
  const [workouts, setWorkouts] = useState<WorkoutRecord[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [currentSets, setCurrentSets] = useState<ExerciseSet[]>([]);
  const [workoutNotes, setWorkoutNotes] = useState('');

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        setWorkouts(JSON.parse(saved));
      }
    } catch (error) {
      console.error('운동 기록 로드 실패:', error);
    }
  };

  const saveWorkouts = async (newWorkouts: WorkoutRecord[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newWorkouts));
      setWorkouts(newWorkouts);
    } catch (error) {
      console.error('운동 기록 저장 실패:', error);
    }
  };

  const addSet = () => {
    const newSet: ExerciseSet = {
      id: Date.now().toString(),
      weight: selectedExercise?.unit === 'reps' ? 0 : undefined,
      reps: selectedExercise?.unit === 'reps' ? 0 : undefined,
      duration: selectedExercise?.unit === 'duration' ? 0 : undefined,
      distance: selectedExercise?.unit === 'distance' ? 0 : undefined,
    };
    setCurrentSets([...currentSets, newSet]);
  };

  const updateSet = (setId: string, field: keyof ExerciseSet, value: number) => {
    setCurrentSets(prev => 
      prev.map(set => 
        set.id === setId ? { ...set, [field]: value } : set
      )
    );
  };

  const removeSet = (setId: string) => {
    setCurrentSets(prev => prev.filter(set => set.id !== setId));
  };

  const saveWorkout = () => {
    if (!selectedExercise || currentSets.length === 0) {
      Alert.alert('오류', '운동과 세트를 추가해주세요.');
      return;
    }

    const newWorkout: WorkoutRecord = {
      id: Date.now().toString(),
      exerciseId: selectedExercise.id,
      exerciseName: selectedExercise.name,
      sets: currentSets,
      date: new Date().toISOString(),
      notes: workoutNotes,
    };

    const updatedWorkouts = [newWorkout, ...workouts];
    saveWorkouts(updatedWorkouts);
    
    // 초기화
    setSelectedExercise(null);
    setCurrentSets([]);
    setWorkoutNotes('');
    setShowAddModal(false);
  };

  const getFilteredExercises = () => {
    if (selectedCategory === 'all') {
      return DEFAULT_EXERCISES;
    }
    return DEFAULT_EXERCISES.filter(ex => ex.category === selectedCategory);
  };

  const getTodayWorkouts = () => {
    const today = new Date().toDateString();
    return workouts.filter(workout => 
      new Date(workout.date).toDateString() === today
    );
  };

  const getWeekStats = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const weekWorkouts = workouts.filter(workout => 
      new Date(workout.date) >= oneWeekAgo
    );
    
    return {
      totalWorkouts: weekWorkouts.length,
      totalSets: weekWorkouts.reduce((total, workout) => total + workout.sets.length, 0),
      categories: [...new Set(weekWorkouts.map(w => 
        DEFAULT_EXERCISES.find(e => e.id === w.exerciseId)?.category
      ))].filter(Boolean).length,
    };
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}시간 ${minutes}분`;
    } else if (minutes > 0) {
      return `${minutes}분 ${secs}초`;
    } else {
      return `${secs}초`;
    }
  };

  const renderSetInput = (set: ExerciseSet, index: number) => {
    if (!selectedExercise) return null;

    return (
      <View key={set.id} style={styles.setRow}>
        <Text style={styles.setNumber}>{index + 1}</Text>
        
        {selectedExercise.unit === 'reps' && (
          <>
            <TextInput
              style={styles.setInput}
              placeholder="무게(kg)"
              placeholderTextColor="#666"
              value={set.weight?.toString() || ''}
              onChangeText={(text) => updateSet(set.id, 'weight', parseFloat(text) || 0)}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.setInput}
              placeholder="횟수"
              placeholderTextColor="#666"
              value={set.reps?.toString() || ''}
              onChangeText={(text) => updateSet(set.id, 'reps', parseInt(text) || 0)}
              keyboardType="numeric"
            />
          </>
        )}
        
        {selectedExercise.unit === 'duration' && (
          <TextInput
            style={[styles.setInput, { flex: 2 }]}
            placeholder="시간(초)"
            placeholderTextColor="#666"
            value={set.duration?.toString() || ''}
            onChangeText={(text) => updateSet(set.id, 'duration', parseInt(text) || 0)}
            keyboardType="numeric"
          />
        )}
        
        {selectedExercise.unit === 'distance' && (
          <TextInput
            style={[styles.setInput, { flex: 2 }]}
            placeholder="거리(km)"
            placeholderTextColor="#666"
            value={set.distance?.toString() || ''}
            onChangeText={(text) => updateSet(set.id, 'distance', parseFloat(text) || 0)}
            keyboardType="numeric"
          />
        )}
        
        <TouchableOpacity onPress={() => removeSet(set.id)}>
          <Text style={styles.removeSetButton}>❌</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const weekStats = getWeekStats();
  const todayWorkouts = getTodayWorkouts();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>💪 운동 기록</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={styles.addButtonText}>+ 추가</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* 주간 통계 */}
        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>이번 주 통계</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{weekStats.totalWorkouts}</Text>
              <Text style={styles.statLabel}>운동 횟수</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{weekStats.totalSets}</Text>
              <Text style={styles.statLabel}>총 세트</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{weekStats.categories}</Text>
              <Text style={styles.statLabel}>운동 종류</Text>
            </View>
          </View>
        </View>

        {/* 오늘의 운동 */}
        <View style={styles.todaySection}>
          <Text style={styles.sectionTitle}>오늘의 운동</Text>
          {todayWorkouts.length === 0 ? (
            <Text style={styles.emptyText}>오늘 운동 기록이 없습니다.</Text>
          ) : (
            todayWorkouts.map((workout) => (
              <View key={workout.id} style={styles.workoutCard}>
                <Text style={styles.workoutName}>
                  {DEFAULT_EXERCISES.find(e => e.id === workout.exerciseId)?.icon} {workout.exerciseName}
                </Text>
                <Text style={styles.workoutSets}>{workout.sets.length} 세트</Text>
                {workout.notes && (
                  <Text style={styles.workoutNotes}>{workout.notes}</Text>
                )}
              </View>
            ))
          )}
        </View>

        {/* 최근 운동 기록 */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>최근 기록</Text>
          {workouts.slice(0, 10).map((workout) => (
            <View key={workout.id} style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyExercise}>
                  {DEFAULT_EXERCISES.find(e => e.id === workout.exerciseId)?.icon} {workout.exerciseName}
                </Text>
                <Text style={styles.historyDate}>
                  {new Date(workout.date).toLocaleDateString('ko-KR')}
                </Text>
              </View>
              <Text style={styles.historySets}>
                {workout.sets.length} 세트 완료
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* 운동 추가 모달 */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.modalCancel}>취소</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>운동 추가</Text>
            <TouchableOpacity onPress={saveWorkout}>
              <Text style={styles.modalSave}>저장</Text>
            </TouchableOpacity>
          </View>

          {!selectedExercise ? (
            <ScrollView style={styles.modalContent}>
              {/* 카테고리 필터 */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilter}>
                <TouchableOpacity
                  style={[styles.categoryButton, selectedCategory === 'all' && styles.categoryButtonActive]}
                  onPress={() => setSelectedCategory('all')}
                >
                  <Text style={[styles.categoryButtonText, selectedCategory === 'all' && styles.categoryButtonTextActive]}>
                    전체
                  </Text>
                </TouchableOpacity>
                {EXERCISE_CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[styles.categoryButton, selectedCategory === category.id && styles.categoryButtonActive]}
                    onPress={() => setSelectedCategory(category.id)}
                  >
                    <Text style={[styles.categoryButtonText, selectedCategory === category.id && styles.categoryButtonTextActive]}>
                      {category.icon} {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* 운동 목록 */}
              <View style={styles.exerciseList}>
                {getFilteredExercises().map((exercise) => (
                  <TouchableOpacity
                    key={exercise.id}
                    style={styles.exerciseItem}
                    onPress={() => setSelectedExercise(exercise)}
                  >
                    <Text style={styles.exerciseIcon}>{exercise.icon}</Text>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <Text style={styles.exerciseUnit}>
                      {exercise.unit === 'reps' ? '무게 × 횟수' : 
                       exercise.unit === 'duration' ? '시간' : '거리'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          ) : (
            <ScrollView style={styles.modalContent}>
              <Text style={styles.selectedExercise}>
                {selectedExercise.icon} {selectedExercise.name}
              </Text>

              {/* 세트 입력 */}
              <View style={styles.setsContainer}>
                <View style={styles.setsHeader}>
                  <Text style={styles.setsTitle}>세트</Text>
                  <TouchableOpacity style={styles.addSetButton} onPress={addSet}>
                    <Text style={styles.addSetButtonText}>+ 세트 추가</Text>
                  </TouchableOpacity>
                </View>

                {currentSets.map((set, index) => renderSetInput(set, index))}
              </View>

              {/* 메모 */}
              <View style={styles.notesContainer}>
                <Text style={styles.notesTitle}>메모</Text>
                <TextInput
                  style={styles.notesInput}
                  placeholder="운동에 대한 메모를 입력하세요..."
                  placeholderTextColor="#666"
                  value={workoutNotes}
                  onChangeText={setWorkoutNotes}
                  multiline
                />
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e0e0e0',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsContainer: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e0e0e0',
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingVertical: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  statLabel: {
    fontSize: 12,
    color: '#a0a0a0',
    marginTop: 4,
  },
  todaySection: {
    marginBottom: 25,
  },
  emptyText: {
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  workoutCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e0e0e0',
  },
  workoutSets: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 4,
  },
  workoutNotes: {
    fontSize: 12,
    color: '#a0a0a0',
    marginTop: 6,
  },
  historySection: {
    marginBottom: 20,
  },
  historyCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyExercise: {
    fontSize: 14,
    fontWeight: '500',
    color: '#e0e0e0',
  },
  historyDate: {
    fontSize: 12,
    color: '#a0a0a0',
  },
  historySets: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalCancel: {
    color: '#666',
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e0e0e0',
  },
  modalSave: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  categoryFilter: {
    paddingVertical: 15,
  },
  categoryButton: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryButtonActive: {
    backgroundColor: '#4CAF50',
  },
  categoryButtonText: {
    color: '#a0a0a0',
    fontSize: 14,
  },
  categoryButtonTextActive: {
    color: 'white',
  },
  exerciseList: {
    paddingBottom: 20,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 15,
    marginBottom: 8,
  },
  exerciseIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  exerciseName: {
    flex: 1,
    fontSize: 16,
    color: '#e0e0e0',
  },
  exerciseUnit: {
    fontSize: 12,
    color: '#a0a0a0',
  },
  selectedExercise: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e0e0e0',
    textAlign: 'center',
    paddingVertical: 20,
  },
  setsContainer: {
    marginBottom: 20,
  },
  setsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  setsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e0e0e0',
  },
  addSetButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addSetButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  setNumber: {
    color: '#4CAF50',
    fontWeight: 'bold',
    marginRight: 10,
    width: 20,
  },
  setInput: {
    flex: 1,
    backgroundColor: '#333',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#e0e0e0',
    marginRight: 8,
    textAlign: 'center',
  },
  removeSetButton: {
    fontSize: 16,
    marginLeft: 10,
  },
  notesContainer: {
    marginBottom: 20,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e0e0e0',
    marginBottom: 10,
  },
  notesInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    color: '#e0e0e0',
    minHeight: 80,
    textAlignVertical: 'top',
  },
});

export default ExerciseTrackerScreen; 