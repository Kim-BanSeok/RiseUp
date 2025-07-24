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
import { SCREEN_WIDTH, COLORS, SIZES, commonStyles } from '../../styles/commonStyles';

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
  const flatListRef = useRef<FlatList>(null);

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
        difference: laps.length > 0 ? time - laps[laps.length - 1].time : time,
      };
      setLaps(prev => {
        const newLaps = [...prev, lapTime];
        // 새 랩이 추가되면 맨 위로 스크롤
        setTimeout(() => {
          flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
        }, 100);
        return newLaps;
      });
      console.log('랩 타임 추가:', lapTime); // 디버깅용
    } else {
      // 리셋
      setTime(0);
      setLaps([]);
      console.log('스톱워치 리셋'); // 디버깅용
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
    const isCurrentFastest = item.difference && item.difference === fastest && laps.length > 1;
    const isCurrentSlowest = item.difference && item.difference === slowest && laps.length > 1;

    return (
      <View style={[
        styles.lapItem,
        isCurrentFastest ? styles.fastestLap : null,
        isCurrentSlowest ? styles.slowestLap : null
      ]}>
        <Text style={styles.lapNumber}>랩 {item.lapNumber}</Text>
        <Text style={styles.lapDifference}>
          {item.difference ? formatTime(item.difference) : '-'}
        </Text>
        <Text style={styles.lapTime}>{formatTime(item.time)}</Text>
      </View>
    );
  }, [getFastestAndSlowest, formatTime, laps.length]);

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
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 0 }]}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>⏱️ 스톱워치</Text>
      </View>

      {/* 메인 타이머 디스플레이 */}
      <View style={styles.timerContainer}>
        <View style={styles.timerCircle}>
          <Text style={styles.timerText}>{formattedTime}</Text>
        </View>
      </View>

      {/* 컨트롤 버튼들 */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[
            styles.controlButton,
            styles.lapResetButton,
            (time === 0 && laps.length === 0) && styles.disabledButton
          ]}
          onPress={handleLapReset}
          disabled={time === 0 && laps.length === 0}
        >
          <Text style={[
            styles.controlButtonText,
            styles.lapResetButtonText
          ]}>
            {buttonTexts.lapReset}
          </Text>
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
            isRunning ? styles.stopButtonText : styles.startButtonText
          ]}>
            {buttonTexts.startStop}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 랩 타임 목록 */}
      <View style={styles.lapsContainer}>
        <View style={styles.lapsHeader}>
          <Text style={styles.lapsTitle}>🏃‍♂️ 랩 타임</Text>
          <Text style={styles.lapsCount}>{laps.length}개</Text>
        </View>
        
        {laps.length > 0 ? (
          <FlatList
            ref={flatListRef}
            data={[...laps].reverse()}
            renderItem={renderLapItem}
            keyExtractor={keyExtractor}
            style={styles.lapsList}
            contentContainerStyle={styles.lapsListContent}
            showsVerticalScrollIndicator={true}
            indicatorStyle="white"
            maxToRenderPerBatch={10}
            windowSize={10}
            removeClippedSubviews={false}
            maintainVisibleContentPosition={{
              minIndexForVisible: 0,
              autoscrollToTopThreshold: 100,
            }}
            inverted={false}
          />
        ) : (
          <View style={styles.emptyLapsContainer}>
            <Text style={styles.emptyLapsText}>
              ⏱️ 스톱워치가 실행 중일 때{'\n'}'랩' 버튼을 눌러 기록을 남겨보세요!
            </Text>
          </View>
        )}
      </View>
    </View>
  );
});

StopwatchScreen.displayName = 'StopwatchScreen';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SIZES.padding,
  },
  header: {
    paddingTop: 40,
    paddingBottom: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    marginBottom: 15,
  },
  timerCircle: {
    width: SCREEN_WIDTH * 0.5,
    height: SCREEN_WIDTH * 0.5,
    borderRadius: (SCREEN_WIDTH * 0.5) / 2,
    borderWidth: 4,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    ...commonStyles.shadow,
  },
  timerText: {
    fontSize: 38,
    fontWeight: '300',
    color: COLORS.text,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 40,
    marginBottom: 10,
  },
  controlButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    ...commonStyles.shadow,
  },
  lapResetButton: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
  },
  startStopButton: {
    backgroundColor: COLORS.success,
    borderColor: '#2E7D32',
  },
  stopButton: {
    backgroundColor: COLORS.error,
    borderColor: '#C62828',
  },
  disabledButton: {
    backgroundColor: '#3A3A3A',
    borderColor: '#666',
    opacity: 0.5,
  },
  controlButtonText: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  lapResetButtonText: {
    color: COLORS.textSecondary,
  },
  startButtonText: {
    color: 'white',
  },
  stopButtonText: {
    color: 'white',
  },
  lapsContainer: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadius,
    padding: SIZES.padding,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 150,
    marginBottom: 10,
  },
  lapsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 15,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  lapsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  lapsCount: {
    fontSize: 16,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    color: 'white',
    fontWeight: '600',
  },
  lapsList: {
    flex: 1,
  },
  lapsListContent: {
    paddingBottom: 10,
  },
  lapItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    marginVertical: 3,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.smallBorderRadius,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  fastestLap: {
    borderLeftColor: '#2196F3',
    backgroundColor: '#1A237E20',
  },
  slowestLap: {
    borderLeftColor: '#F44336',
    backgroundColor: '#B7172820',
  },
  lapNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    minWidth: 60,
  },
  lapDifference: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginRight: 15,
    minWidth: 80,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  lapTime: {
    fontSize: 16,
    color: COLORS.textSecondary,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  emptyLapsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    borderRadius: SIZES.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  emptyLapsText: {
    fontSize: 18,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 30,
    fontWeight: '600', 
  },
});

export default StopwatchScreen; 