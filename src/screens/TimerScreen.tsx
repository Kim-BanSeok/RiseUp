import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Vibration,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTimer, Timer } from '../context/TimerContext';
import CustomAlert from '../components/CustomAlert';

const TimerScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { timers, deleteTimer, startTimer, pauseTimer, resetTimer, isLoading, timerCategories } = useTimer();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // 필터링된 타이머 목록 - 성능 최적화
  const filteredTimers = useMemo(() => {
    if (selectedCategory === 'all') {
      return timers;
    }
    
    // 카테고리별 필터링
    return timers.filter(timer => {
      const timerCategory = timer.category || 'uncategorized';
      return timerCategory === selectedCategory;
    });
  }, [timers, selectedCategory]);

  // 현재 선택된 카테고리 정보
  const currentCategory = useMemo(() => {
    if (selectedCategory === 'all') {
      return { name: '전체', icon: '📋' };
    }
    if (selectedCategory === 'uncategorized') {
      return { name: '미분류', icon: '❓' };
    }
    const category = timerCategories.find(c => c.id === selectedCategory);
    return category ? { name: category.name, icon: category.icon } : { name: '전체', icon: '📋' };
  }, [selectedCategory, timerCategories]);

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

  const formatTime = (timeMs: number) => {
    const totalSeconds = Math.floor(timeMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  };

  const getProgress = (timer: Timer) => {
    if (timer.duration === 0) return 0;
    return ((timer.duration - timer.remainingTime) / timer.duration) * 100;
  };

  const handleDeleteTimer = (timer: Timer) => {
    showCustomAlert(
      '🗑️ 타이머 삭제',
      `"${timer.name}" 타이머를 삭제하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            deleteTimer(timer.id);
            Vibration.vibrate(50);
          }
        }
      ]
    );
  };

  const renderTimerItem = ({ item: timer }: { item: Timer }) => {
    const progress = getProgress(timer);
    const category = timerCategories.find(c => c.id === timer.category);
    
    return (
      <View style={[
        styles.timerCard,
        timer.isCompleted && styles.completedCard,
        timer.isRunning && styles.runningCard
      ]}>
        {/* 첫 번째 줄: 진행률 바와 삭제 버튼 */}
        <View style={styles.firstRow}>
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBackground}>
              <View 
                style={[
                  styles.progressBar,
                  { width: `${progress}%` },
                  timer.isCompleted && styles.completedProgress
                ]} 
              />
            </View>
            <Text style={styles.progressText}>{Math.round(progress)}%</Text>
          </View>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteTimer(timer)}
          >
            <Text style={styles.deleteButtonText}>×</Text>
          </TouchableOpacity>
        </View>

        {/* 두 번째 줄: 시간, 상태, 컨트롤 */}
        <View style={styles.secondRow}>
          <View style={styles.timeSection}>
            <Text style={[
              styles.timerTime,
              timer.isCompleted && styles.completedTime,
              timer.isRunning && styles.runningTime
            ]}>
              {formatTime(timer.remainingTime)}
            </Text>
            <Text style={[
              styles.timerStatus,
              timer.isCompleted && styles.completedStatus,
              timer.isRunning && styles.runningStatus
            ]}>
              {timer.isCompleted ? '✅ 완료' : 
               timer.isRunning ? '🔄 실행 중' : '⏸️ 일시정지'}
            </Text>
            <Text style={styles.timerName}>{timer.name}</Text>
            {category && (
              <View style={[styles.categoryTag, { backgroundColor: category.color }]}>
                <Text style={styles.categoryText}>{category.icon} {category.name}</Text>
              </View>
            )}
          </View>

          <View style={styles.timerControls}>
            <TouchableOpacity
              style={[styles.controlBtn, styles.resetBtn]}
              onPress={() => {
                resetTimer(timer.id);
                Vibration.vibrate(50);
              }}
            >
              <Text style={styles.resetBtnText}>🔄</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.controlBtn,
                styles.playPauseBtn,
                timer.isRunning && styles.pauseBtn,
                timer.isCompleted && styles.disabledBtn
              ]}
              onPress={() => {
                if (timer.isCompleted) return;
                
                if (timer.isRunning) {
                  pauseTimer(timer.id);
                } else {
                  startTimer(timer.id);
                }
                Vibration.vibrate(50);
              }}
              disabled={timer.isCompleted}
            >
              <Text style={[
                styles.playPauseBtnText,
                timer.isRunning && styles.pauseBtnText
              ]}>
                {timer.isRunning ? '⏸️' : '▶️'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // 필터 옵션 렌더링
  const renderFilterOption = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.filterOption,
        selectedCategory === item.key && styles.filterOptionSelected
      ]}
      onPress={() => {
        setSelectedCategory(item.key);
        setShowFilters(false);
      }}
    >
      <Text style={[
        styles.filterOptionText,
        selectedCategory === item.key && styles.filterOptionTextSelected
      ]}>
        {item.icon} {item.label}
      </Text>
    </TouchableOpacity>
  );

  // 빈 상태 렌더링
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>⏲️</Text>
      <Text style={styles.emptyText}>
        {selectedCategory === 'all' 
          ? '설정된 타이머가 없습니다' 
          : selectedCategory === 'uncategorized'
          ? '미분류 타이머가 없습니다'
          : '해당 카테고리의 타이머가 없습니다'
        }
      </Text>
      <Text style={styles.emptySubText}>첫 타이머를 추가해보세요!</Text>
    </View>
  );

  // 필터 데이터
  const filterData = [
    { key: 'all', label: '전체', icon: '📋' },
    { key: 'uncategorized', label: '미분류', icon: '❓' },
    ...timerCategories.map(cat => ({
      key: cat.id,
      label: cat.name,
      icon: cat.icon
    }))
  ];

  return (
    <>
      <View style={[styles.container, { paddingBottom: insets.bottom + 20 }]}>
        {/* 헤더 - 인터벌 화면과 동일한 구조 */}
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <Text style={styles.title}>⏲️ 타이머</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('AddTimer')}
          >
            <Text style={styles.addButtonText}>+ 추가</Text>
          </TouchableOpacity>
        </View>
        
        {/* 고급 기능 버튼들을 한 줄로 배치 */}
        <View style={styles.advancedButtonsContainer}>
          <TouchableOpacity 
            style={styles.advancedButton} 
            onPress={() => navigation.navigate('TimerTemplates')}
          >
            <Text style={styles.advancedButtonText}>📋 템플릿</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.advancedButton} 
            onPress={() => navigation.navigate('TimerHistory')}
          >
            <Text style={styles.advancedButtonText}>📊 히스토리</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.advancedButton} 
            onPress={() => navigation.navigate('TimerCategories')}
          >
            <Text style={styles.advancedButtonText}>🏷️ 카테고리</Text>
          </TouchableOpacity>
        </View>

        {/* 카테고리 필터 섹션 */}
        <View style={styles.filterSection}>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Text style={styles.filterButtonText}>
              {currentCategory.icon} {currentCategory.name} ({filteredTimers.length})
            </Text>
            <Text style={styles.filterArrow}>{showFilters ? '▲' : '▼'}</Text>
          </TouchableOpacity>
        </View>

        {/* 필터 옵션들 */}
        {showFilters && (
          <View style={styles.filterOptionsContainer}>
            <FlatList
              data={filterData}
              renderItem={renderFilterOption}
              keyExtractor={(item) => item.key}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterOptionsList}
            />
          </View>
        )}

        {/* 타이머 목록 - FlatList를 직접 사용 */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>타이머를 불러오는 중...</Text>
          </View>
        ) : filteredTimers.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={filteredTimers}
            renderItem={renderTimerItem}
            keyExtractor={(item) => item.id}
            style={styles.timerList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
          />
        )}
      </View>

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
  title: {
    color: '#FFD4B3',
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#FF7F50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  advancedButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginHorizontal: 20,
    marginVertical: 15,
    paddingVertical: 10,
    backgroundColor: '#4A2C1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8B6341',
  },
  advancedButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FF7F50',
  },
  advancedButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  filterSection: {
    marginHorizontal: 20,
    marginBottom: 15,
  },
  filterButton: {
    backgroundColor: '#4A2C1A',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#8B6341',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterButtonText: {
    color: '#FFD4B3',
    fontWeight: '600',
    fontSize: 14,
  },
  filterArrow: {
    color: '#FFAB7A',
    fontSize: 12,
  },
  filterOptionsContainer: {
    marginHorizontal: 20,
    marginBottom: 15,
  },
  filterOptionsList: {
    paddingHorizontal: 10,
  },
  filterOption: {
    backgroundColor: '#4A2C1A',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#8B6341',
    marginHorizontal: 5,
  },
  filterOptionSelected: {
    backgroundColor: '#FF7F50',
    borderColor: '#FF7F50',
  },
  filterOptionText: {
    color: '#FFD4B3',
    fontWeight: '500',
    fontSize: 12,
  },
  filterOptionTextSelected: {
    color: '#FFF',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#FFAB7A',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 18,
    color: '#FFAB7A',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#A67C61',
    marginBottom: 30,
  },
  timerList: {
    flex: 1,
  },
  timerCard: {
    backgroundColor: '#4A2C1A',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#8B6341',
  },
  completedCard: {
    backgroundColor: '#3A241A',
    borderColor: '#666',
  },
  runningCard: {
    borderColor: '#FF7F50',
    borderWidth: 2,
  },
  firstRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#8B6341',
    borderRadius: 4,
    marginRight: 10,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FF7F50',
    borderRadius: 4,
  },
  completedProgress: {
    backgroundColor: '#32CD32',
  },
  progressText: {
    fontSize: 12,
    color: '#FFAB7A',
    minWidth: 30,
    textAlign: 'right',
  },
  deleteButton: {
    backgroundColor: '#E74C3C',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeSection: {
    flex: 1,
  },
  timerTime: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD4B3',
    marginBottom: 5,
  },
  completedTime: {
    color: '#32CD32',
  },
  runningTime: {
    color: '#FF7F50',
  },
  timerStatus: {
    fontSize: 14,
    color: '#FFAB7A',
    marginBottom: 5,
  },
  completedStatus: {
    color: '#32CD32',
  },
  runningStatus: {
    color: '#FF7F50',
  },
  timerName: {
    fontSize: 16,
    color: '#FFD4B3',
    marginBottom: 5,
  },
  categoryTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: '600',
  },
  timerControls: {
    flexDirection: 'row',
    gap: 10,
  },
  controlBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetBtn: {
    backgroundColor: '#8B4513',
  },
  resetBtnText: {
    fontSize: 18,
    color: '#FFD4B3',
  },
  playPauseBtn: {
    backgroundColor: '#228B22',
  },
  pauseBtn: {
    backgroundColor: '#FFA500',
  },
  disabledBtn: {
    backgroundColor: '#666',
  },
  playPauseBtnText: {
    fontSize: 18,
    color: '#FFF',
  },
  pauseBtnText: {
    color: '#FFF',
  },
});

export default TimerScreen;
