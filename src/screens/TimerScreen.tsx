import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Vibration,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTimer, Timer } from '../context/TimerContext';
import CustomAlert from '../components/CustomAlert';

const TimerScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { timers, deleteTimer, startTimer, pauseTimer, resetTimer } = useTimer();

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

  return (
    <>
      <View style={[styles.container, { paddingBottom: insets.bottom + 80 }]}>
        {/* 헤더 */}
        <View style={styles.header}>
          <Text style={styles.title}>⏲️ 타이머</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddTimer')}
          >
            <Text style={styles.addButtonText}>+ 추가</Text>
          </TouchableOpacity>
        </View>

        {/* 타이머 목록 */}
        {timers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>등록된 타이머가 없습니다</Text>
            <Text style={styles.emptySubText}>
              '+ 추가' 버튼을 눌러 타이머를 만들어보세요
            </Text>
            <TouchableOpacity
              style={styles.emptyAddButton}
              onPress={() => navigation.navigate('AddTimer')}
            >
              <Text style={styles.emptyAddButtonText}>⏲️ 첫 타이머 만들기</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={timers}
            renderItem={renderTimerItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.timersList}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

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
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD4B3',
  },
  addButton: {
    backgroundColor: '#FF7F50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFD4B3',
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#FFAB7A',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubText: {
    fontSize: 14,
    color: '#A67C61',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 30,
  },
  emptyAddButton: {
    backgroundColor: '#5D4037',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#8B6341',
  },
  emptyAddButtonText: {
    color: '#FFD4B3',
    fontSize: 16,
    fontWeight: '600',
  },
  timersList: {
    paddingBottom: 20,
  },
  timerCard: {
    backgroundColor: '#4A2C1A',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#8B6341',
  },
  runningCard: {
    borderColor: '#4FC3F7',
    backgroundColor: '#2E3A4A',
  },
  completedCard: {
    borderColor: '#32CD32',
    backgroundColor: '#2A4A2A',
  },
  firstRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  progressContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 10,
  },
  progressBarBackground: {
    flex: 1,
    height: 6,
    backgroundColor: '#3A241A',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FF7F50',
    borderRadius: 3,
  },
  completedProgress: {
    backgroundColor: '#32CD32',
  },
  progressText: {
    color: '#FFAB7A',
    fontSize: 11,
    fontWeight: '600',
    minWidth: 30,
    textAlign: 'right',
  },
  deleteButton: {
    width: 25,
    height: 25,
    borderRadius: 12,
    backgroundColor: '#8B4513',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#FFD4B3',
    fontSize: 14,
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
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 2,
  },
  runningTime: {
    color: '#4FC3F7',
  },
  completedTime: {
    color: '#32CD32',
  },
  timerStatus: {
    fontSize: 12,
    color: '#FFAB7A',
  },
  runningStatus: {
    color: '#4FC3F7',
  },
  completedStatus: {
    color: '#32CD32',
  },
  timerControls: {
    flexDirection: 'row',
    gap: 10,
  },
  controlBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  resetBtn: {
    backgroundColor: '#8B4513',
    borderColor: '#A0522D',
  },
  resetBtnText: {
    fontSize: 14,
  },
  playPauseBtn: {
    backgroundColor: '#228B22',
    borderColor: '#32CD32',
  },
  pauseBtn: {
    backgroundColor: '#DAA520',
    borderColor: '#FFD700',
  },
  disabledBtn: {
    backgroundColor: '#555',
    borderColor: '#777',
    opacity: 0.5,
  },
  playPauseBtnText: {
    fontSize: 14,
    color: '#FFF',
  },
  pauseBtnText: {
    color: '#FFF',
  },
});

export default TimerScreen;
