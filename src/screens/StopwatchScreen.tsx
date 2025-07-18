import React, { useState, useEffect, useRef } from 'react';
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

interface LapTime {
  id: string;
  time: number;
  lapNumber: number;
  difference?: number;
}

const StopwatchScreen = () => {
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

  const formatTime = (timeMs: number) => {
    const minutes = Math.floor(timeMs / 60000);
    const seconds = Math.floor((timeMs % 60000) / 1000);
    const milliseconds = Math.floor((timeMs % 1000) / 10);

    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  const handleStartStop = () => {
    if (isRunning) {
      // 진동 피드백
      Vibration.vibrate(50);
    }
    setIsRunning(!isRunning);
  };

  const handleLapReset = () => {
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
  };

  const getFastestAndSlowest = () => {
    if (laps.length < 2) return { fastest: null, slowest: null };
    
    const lapTimes = laps.map(lap => lap.difference || 0).filter(diff => diff > 0);
    const fastest = Math.min(...lapTimes);
    const slowest = Math.max(...lapTimes);
    
    return { fastest, slowest };
  };

  const renderLapItem = ({ item, index }: { item: LapTime; index: number }) => {
    const { fastest, slowest } = getFastestAndSlowest();
    const isFirst = index === laps.length - 1;
    const isFastest = item.difference === fastest && fastest !== null;
    const isSlowest = item.difference === slowest && slowest !== null;
    
    let lapStyle = styles.lapItem;
    let lapTextStyle = styles.lapText;
    
    if (isFastest && laps.length > 2) {
      lapStyle = [styles.lapItem, styles.fastestLap];
      lapTextStyle = [styles.lapText, styles.fastestText];
    } else if (isSlowest && laps.length > 2) {
      lapStyle = [styles.lapItem, styles.slowestLap];
      lapTextStyle = [styles.lapText, styles.slowestText];
    } else if (isFirst) {
      lapStyle = [styles.lapItem, styles.currentLap];
      lapTextStyle = [styles.lapText, styles.currentText];
    }

    return (
      <View style={lapStyle}>
        <Text style={lapTextStyle}>랩 {item.lapNumber}</Text>
        <View style={styles.lapTimes}>
          {item.difference && (
            <Text style={[lapTextStyle, styles.lapDifference]}>
              +{formatTime(item.difference)}
            </Text>
          )}
          <Text style={lapTextStyle}>{formatTime(item.time)}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 80 }]}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>⏱️ 스톱워치</Text>
      </View>

      {/* 메인 타이머 */}
      <View style={styles.timerContainer}>
        {/* <Text style={styles.title}>⏱️ 스톱워치</Text> */}
        <Text style={styles.mainTime}>{formatTime(time)}</Text>
        <View style={styles.timerCircle}>
          <View style={styles.innerCircle} />
        </View>
      </View>

      {/* 랩 타임 리스트 */}
      <View style={styles.lapsContainer}>
        {laps.length > 0 && (
          <FlatList
            data={[...laps].reverse()}
            renderItem={renderLapItem}
            keyExtractor={(item) => item.id}
            style={styles.lapsList}
            showsVerticalScrollIndicator={false}
            inverted
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>

      {/* 컨트롤 버튼 */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[
            styles.controlButton,
            styles.secondaryButton,
            !isRunning && time > 0 && styles.resetButton,
          ]}
          onPress={handleLapReset}
        >
          <Text style={[
            styles.controlButtonText,
            styles.secondaryButtonText,
            !isRunning && time > 0 && styles.resetButtonText,
          ]}>
            {isRunning ? '랩' : time > 0 ? '리셋' : '랩'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.controlButton,
            styles.primaryButton,
            isRunning && styles.stopButton,
          ]}
          onPress={handleStartStop}
        >
          <Text style={[
            styles.controlButtonText,
            styles.primaryButtonText,
            isRunning && styles.stopButtonText,
          ]}>
            {isRunning ? '정지' : '시작'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 통계 정보 */}
      {laps.length > 1 && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>총 랩</Text>
            <Text style={styles.statValue}>{laps.length}</Text>
          </View>
          {getFastestAndSlowest().fastest && (
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>최고 기록</Text>
              <Text style={[styles.statValue, styles.fastestText]}>
                {formatTime(getFastestAndSlowest().fastest!)}
              </Text>
            </View>
          )}
          {getFastestAndSlowest().slowest && (
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>최저 기록</Text>
              <Text style={[styles.statValue, styles.slowestText]}>
                {formatTime(getFastestAndSlowest().slowest!)}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

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