import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Vibration,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface LapTime {
  id: string;
  time: number;
  lapNumber: number;
  difference?: number;
}

const StopwatchScreen = React.memo(() => {
  const insets = useSafeAreaInsets();
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<LapTime[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(prevTime => prevTime + 10);
      }, 10);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const formatTime = useCallback((timeMs: number) => {
    const minutes = Math.floor(timeMs / 60000);
    const seconds = Math.floor((timeMs % 60000) / 1000);
    const milliseconds = Math.floor((timeMs % 1000) / 10);

    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  }, []);

  const handleStartStop = useCallback(() => {
    if (isRunning) {
      // 진동 피드백
      Vibration.vibrate(50);
    }
    setIsRunning(!isRunning);
  }, [isRunning]);

  const handleLapReset = useCallback(() => {
    Vibration.vibrate(50);
    
    if (isRunning) {
      // 랩 타임 기록
      const lapTime: LapTime = {
        id: Date.now().toString(),
        time: time,
        lapNumber: laps.length + 1,
        difference: laps.length > 0 ? time - laps[laps.length - 1].time : undefined,
      };
      setLaps(prev => [...prev, lapTime]);
    } else {
      // 리셋
      setTime(0);
      setLaps([]);
    }
  }, [isRunning, time, laps]);

  const getFastestAndSlowest = useCallback(() => {
    if (laps.length < 2) return { fastest: null, slowest: null };
    
    const lapTimes = laps.map(lap => lap.difference || 0).filter(diff => diff > 0);
    const fastest = Math.min(...lapTimes);
    const slowest = Math.max(...lapTimes);
    
    return { fastest, slowest };
  }, [laps]);

  // 랩 항목 렌더링 함수 (메모이제이션)
  const renderLapItem = useCallback(({ item, index }: { item: LapTime; index: number }) => {
    const { fastest, slowest } = getFastestAndSlowest();
    const isCurrentFastest = item.difference && item.difference === fastest;
    const isCurrentSlowest = item.difference && item.difference === slowest;

    return (
      <View style={[
        styles.lapItem,
        isCurrentFastest && styles.fastestLap,
        isCurrentSlowest && styles.slowestLap
      ]}>
        <Text style={styles.lapNumber}>랩 {item.lapNumber}</Text>
        <Text style={styles.lapDifference}>
          {item.difference ? `+${formatTime(item.difference)}` : '-'}
        </Text>
        <Text style={styles.lapTime}>{formatTime(item.time)}</Text>
      </View>
    );
  }, [getFastestAndSlowest, formatTime]);

  // 키 추출 함수 (메모이제이션)
  const keyExtractor = useCallback((item: LapTime) => item.id, []);

  // 메인 시간 표시 (메모이제이션)
  const formattedTime = React.useMemo(() => formatTime(time), [time, formatTime]);

  // 버튼 텍스트들 (메모이제이션)
  const buttonTexts = React.useMemo(() => ({
    startStop: isRunning ? '일시정지' : '시작',
    lapReset: isRunning ? '랩' : '리셋'
  }), [isRunning]);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 80 }]}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>⏱️ 스톱워치</Text>
      </View>

      {/* 메인 타이머 디스플레이 */}
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formattedTime}</Text>
      </View>

      {/* 컨트롤 버튼들 */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[styles.controlButton, styles.lapResetButton]}
          onPress={handleLapReset}
          disabled={time === 0 && laps.length === 0}
        >
          <Text style={styles.controlButtonText}>{buttonTexts.lapReset}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.controlButton,
            styles.startStopButton,
            isRunning && styles.stopButton
          ]}
          onPress={handleStartStop}
        >
          <Text style={[
            styles.controlButtonText,
            isRunning && styles.stopButtonText
          ]}>
            {buttonTexts.startStop}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 랩 타임 목록 */}
      {laps.length > 0 && (
        <View style={styles.lapsContainer}>
          <View style={styles.lapsHeader}>
            <Text style={styles.lapsTitle}>랩 타임</Text>
            <Text style={styles.lapsCount}>{laps.length}개</Text>
          </View>
          
          <FlatList
            data={[...laps].reverse()}
            renderItem={renderLapItem}
            keyExtractor={keyExtractor}
            style={styles.lapsList}
            showsVerticalScrollIndicator={false}
            maxToRenderPerBatch={10}
            windowSize={10}
            removeClippedSubviews={true}
          />
        </View>
      )}
    </View>
  );
});

StopwatchScreen.displayName = 'StopwatchScreen';

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2D1B14', // 어두운 브라운 배경
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD4B3', // 밝은 피치
    textAlign: 'center',
    marginTop: 10,
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    position: 'relative',
    marginTop: 100,
  },
  timerCircle: {
    position: 'absolute',
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: (width * 0.7) / 2,
    borderWidth: 4,
    borderColor: '#4A2C1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: (width * 0.6) / 2,
    backgroundColor: '#3A241A',
    opacity: 0.3,
  },
  mainTime: {
    fontSize: 48,
    fontWeight: '200',
    color: '#FFD4B3',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    zIndex: 1,
  },
  lapsContainer: {
    flex: 1,
    marginTop: 20,
  },
  lapsList: {
    flex: 1,
  },
  lapItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginVertical: 2,
    backgroundColor: '#4A2C1A',
    borderRadius: 10,
  },
  currentLap: {
    backgroundColor: '#5D4037',
    borderWidth: 1,
    borderColor: '#FF7F50',
  },
  fastestLap: {
    backgroundColor: '#2E5266',
    borderWidth: 1,
    borderColor: '#4FC3F7',
  },
  slowestLap: {
    backgroundColor: '#5D2E2E',
    borderWidth: 1,
    borderColor: '#F06292',
  },
  lapText: {
    fontSize: 16,
    color: '#FFAB7A',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  currentText: {
    color: '#FF7F50',
    fontWeight: '600',
  },
  fastestText: {
    color: '#4FC3F7',
    fontWeight: '600',
  },
  slowestText: {
    color: '#F06292',
    fontWeight: '600',
  },
  lapTimes: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lapDifference: {
    fontSize: 14,
    marginRight: 15,
    opacity: 0.7,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  controlButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  primaryButton: {
    backgroundColor: '#228B22',
    borderColor: '#32CD32',
  },
  stopButton: {
    backgroundColor: '#DC143C',
    borderColor: '#FF6B6B',
  },
  secondaryButton: {
    backgroundColor: '#4A2C1A',
    borderColor: '#8B6341',
  },
  resetButton: {
    backgroundColor: '#A0522D',
    borderColor: '#D2691E',
  },
  controlButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: '#FFF',
  },
  stopButtonText: {
    color: '#FFF',
  },
  secondaryButtonText: {
    color: '#FFAB7A',
  },
  resetButtonText: {
    color: '#FFF',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    backgroundColor: '#3A241A',
    borderRadius: 15,
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#A67C61',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFD4B3',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});

export default StopwatchScreen; 