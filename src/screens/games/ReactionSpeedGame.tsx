import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Vibration,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCustomAlert } from '../../hooks/useCustomAlert';
import CustomAlert from '../../components/CustomAlert';

interface ReactionRecord {
  id: string;
  reactionTime: number;
  date: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface ReactionSpeedGameProps {
  onExit?: () => void;
}

const ReactionSpeedGame: React.FC<ReactionSpeedGameProps> = ({ onExit }) => {
  const insets = useSafeAreaInsets();
  const [gameState, setGameState] = useState<'waiting' | 'ready' | 'active' | 'finished'>('waiting');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [records, setRecords] = useState<ReactionRecord[]>([]);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [showRecords, setShowRecords] = useState(false);
  const [stats, setStats] = useState({
    bestTime: Infinity,
    averageTime: 0,
    totalTests: 0,
  });
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { alertConfig, showCustomAlert, hideAlert } = useCustomAlert();

  const GAME_RECORDS_KEY = '@RiseUp:reaction_speed_records';
  const GAME_STATS_KEY = '@RiseUp:reaction_speed_stats';

  useEffect(() => {
    loadRecords();
    loadStats();
  }, []);

  const loadRecords = async () => {
    try {
      const savedRecords = await AsyncStorage.getItem(GAME_RECORDS_KEY);
      if (savedRecords) {
        setRecords(JSON.parse(savedRecords));
      }
    } catch (error) {
      console.error('반응 속도 기록 로드 실패:', error);
    }
  };

  const loadStats = async () => {
    try {
      const savedStats = await AsyncStorage.getItem(GAME_STATS_KEY);
      if (savedStats) {
        setStats(JSON.parse(savedStats));
      }
    } catch (error) {
      console.error('반응 속도 통계 로드 실패:', error);
    }
  };

  const saveRecord = useCallback(async (newRecord: ReactionRecord) => {
    try {
      const updatedRecords = [newRecord, ...records].slice(0, 20); // 최대 20개 기록
      await AsyncStorage.setItem(GAME_RECORDS_KEY, JSON.stringify(updatedRecords));
      setRecords(updatedRecords);
      
      // 통계 업데이트
      const newStats = calculateStats([newRecord, ...records]);
      await AsyncStorage.setItem(GAME_STATS_KEY, JSON.stringify(newStats));
      setStats(newStats);
    } catch (error) {
      console.error('반응 속도 기록 저장 실패:', error);
    }
  }, [records]);

  const calculateStats = (allRecords: ReactionRecord[]) => {
    if (allRecords.length === 0) return stats;
    
    const times = allRecords.map(r => r.reactionTime);
    const bestTime = Math.min(...times);
    const averageTime = times.reduce((sum, time) => sum + time, 0) / times.length;
    
    return {
      bestTime,
      averageTime: Math.round(averageTime),
      totalTests: allRecords.length,
    };
  };

  const getDifficultyDelay = useCallback(() => {
    switch (difficulty) {
      case 'easy': return Math.random() * 2000 + 1000; // 1-3초
      case 'medium': return Math.random() * 1500 + 500; // 0.5-2초
      case 'hard': return Math.random() * 1000 + 200; // 0.2-1.2초
      default: return Math.random() * 1500 + 500;
    }
  }, [difficulty]);

  const startGame = useCallback(() => {
    setGameState('waiting');
    setReactionTime(null);
    setStartTime(null);
    
    // 랜덤 지연 시간 설정
    const delay = getDifficultyDelay();
    
    timerRef.current = setTimeout(() => {
      setGameState('ready');
      Vibration.vibrate(100);
      
      // 짧은 지연 후 활성화
      setTimeout(() => {
        setGameState('active');
        setStartTime(Date.now());
        Vibration.vibrate(200);
      }, 100);
    }, delay);
  }, [getDifficultyDelay]);

  const handleReaction = useCallback(() => {
    if (gameState !== 'active' || !startTime) return;
    
    const endTime = Date.now();
    const time = endTime - startTime;
    
    setReactionTime(time);
    setGameState('finished');
    
    // 기록 저장
    const newRecord: ReactionRecord = {
      id: Date.now().toString(),
      reactionTime: time,
      date: new Date().toISOString(),
      difficulty,
    };
    
    saveRecord(newRecord);
    
    // 결과 표시
    let message = `반응 시간: ${time}ms\n`;
    if (time < 200) {
      message += '🎯 매우 빠름!';
    } else if (time < 300) {
      message += '⚡ 빠름!';
    } else if (time < 500) {
      message += '👍 보통';
    } else {
      message += '🐌 느림';
    }
    
    showCustomAlert('결과', message, [
      {
        text: '확인',
        style: 'default'
      }
    ]);
  }, [gameState, startTime, difficulty, saveRecord, showCustomAlert]);

  const resetGame = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setGameState('waiting');
    setReactionTime(null);
    setStartTime(null);
  }, []);

  const handleExit = useCallback(() => {
    // 게임이 진행 중이면 확인 후 나가기
    if (gameState !== 'waiting') {
      showCustomAlert('게임 종료', '게임이 진행 중입니다. 정말 나가시겠습니까?', [
        {
          text: '취소',
          style: 'cancel'
        },
        {
          text: '나가기',
          style: 'destructive',
          onPress: () => {
            if (onExit) {
              onExit();
            }
          }
        }
      ]);
    } else {
      // 게임이 대기 상태면 바로 나가기
      if (onExit) {
        onExit();
      }
    }
  }, [gameState, onExit, showCustomAlert]);

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return '#4CAF50';
      case 'medium': return '#FF9800';
      case 'hard': return '#F44336';
      default: return '#FF9800';
    }
  };

  const getDifficultyText = (diff: string) => {
    switch (diff) {
      case 'easy': return '쉬움';
      case 'medium': return '보통';
      case 'hard': return '어려움';
      default: return '보통';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderRecord = (record: ReactionRecord) => (
    <View key={record.id} style={styles.recordItem}>
      <View style={styles.recordHeader}>
        <Text style={styles.recordTime}>{record.reactionTime}ms</Text>
        <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(record.difficulty) }]}>
          <Text style={styles.difficultyText}>{getDifficultyText(record.difficulty)}</Text>
        </View>
      </View>
      <Text style={styles.recordDate}>{formatDate(record.date)}</Text>
    </View>
  );

  const getGameButtonStyle = () => {
    switch (gameState) {
      case 'waiting':
        return [styles.gameButton, styles.waitingButton];
      case 'ready':
        return [styles.gameButton, styles.readyButton];
      case 'active':
        return [styles.gameButton, styles.activeButton];
      case 'finished':
        return [styles.gameButton, styles.finishedButton];
      default:
        return [styles.gameButton, styles.waitingButton];
    }
  };

  const getGameButtonText = () => {
    switch (gameState) {
      case 'waiting':
        return '대기 중...';
      case 'ready':
        return '준비!';
      case 'active':
        return '클릭!';
      case 'finished':
        return '완료!';
      default:
        return '시작';
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* 헤더 */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={handleExit}
            >
              <Text style={styles.backButtonText}>← 나가기</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.title}>⚡ 반응 속도 테스트</Text>
          <Text style={styles.subtitle}>빨간색이 되면 빠르게 클릭하세요!</Text>
        </View>

        {/* 통계 */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>최고 기록</Text>
            <Text style={styles.statValue}>
              {stats.bestTime === Infinity ? '-' : `${stats.bestTime}ms`}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>평균</Text>
            <Text style={styles.statValue}>
              {stats.averageTime > 0 ? `${stats.averageTime}ms` : '-'}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>총 테스트</Text>
            <Text style={styles.statValue}>{stats.totalTests}회</Text>
          </View>
        </View>

        {/* 난이도 선택 */}
        <View style={styles.difficultyContainer}>
          <Text style={styles.sectionTitle}>난이도 선택</Text>
          <View style={styles.difficultyButtons}>
            {(['easy', 'medium', 'hard'] as const).map((diff) => (
              <TouchableOpacity
                key={diff}
                style={[
                  styles.difficultyButton,
                  { backgroundColor: difficulty === diff ? getDifficultyColor(diff) : '#f0f0f0' }
                ]}
                onPress={() => setDifficulty(diff)}
              >
                <Text style={[
                  styles.difficultyButtonText,
                  { color: difficulty === diff ? 'white' : '#333' }
                ]}>
                  {getDifficultyText(diff)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 게임 영역 */}
        <View style={styles.gameContainer}>
          <TouchableOpacity
            style={getGameButtonStyle()}
            onPress={gameState === 'active' ? handleReaction : undefined}
            disabled={gameState !== 'active'}
          >
            <Text style={styles.gameButtonText}>{getGameButtonText()}</Text>
            {reactionTime && (
              <Text style={styles.resultText}>{reactionTime}ms</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* 컨트롤 버튼 */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={[styles.controlButton, styles.startButton]}
            onPress={startGame}
            disabled={gameState !== 'waiting'}
          >
            <Text style={styles.controlButtonText}>시작</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.controlButton, styles.resetButton]}
            onPress={resetGame}
          >
            <Text style={styles.controlButtonText}>리셋</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.controlButton, styles.recordsButton]}
            onPress={() => setShowRecords(!showRecords)}
          >
            <Text style={styles.controlButtonText}>
              {showRecords ? '기록 숨기기' : '기록 보기'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 기록 목록 */}
        {showRecords && (
          <View style={styles.recordsContainer}>
            <Text style={styles.sectionTitle}>최근 기록</Text>
            {records.length > 0 ? (
              records.slice(0, 10).map(renderRecord)
            ) : (
              <Text style={styles.noRecordsText}>아직 기록이 없습니다.</Text>
            )}
          </View>
        )}
      </ScrollView>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onRequestClose={hideAlert}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  headerTop: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 10,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  difficultyContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  difficultyButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  difficultyButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  difficultyButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  gameContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  gameButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  waitingButton: {
    backgroundColor: '#e0e0e0',
  },
  readyButton: {
    backgroundColor: '#FFD700',
  },
  activeButton: {
    backgroundColor: '#F44336',
  },
  finishedButton: {
    backgroundColor: '#4CAF50',
  },
  gameButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  resultText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  controlButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#2196F3',
  },
  resetButton: {
    backgroundColor: '#FF9800',
  },
  recordsButton: {
    backgroundColor: '#9C27B0',
  },
  controlButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  recordsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recordItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  recordTime: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  recordDate: {
    fontSize: 12,
    color: '#666',
  },
  noRecordsText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
});

export default ReactionSpeedGame; 