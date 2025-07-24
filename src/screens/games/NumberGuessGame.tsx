import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCustomAlert } from '../../hooks/useCustomAlert';
import CustomAlert from '../../components/CustomAlert';

const { width: screenWidth } = Dimensions.get('window');

interface GameRecord {
  id: string;
  score: number;
  attempts: number;
  targetNumber: number;
  date: string;
}

const NumberGuessGame = () => {
  const insets = useSafeAreaInsets();
  const [targetNumber, setTargetNumber] = useState(0);
  const [userGuess, setUserGuess] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [hint, setHint] = useState('');
  const [records, setRecords] = useState<GameRecord[]>([]);
  const [showRecords, setShowRecords] = useState(false);
  const { alertConfig, showCustomAlert, hideAlert } = useCustomAlert();

  const GAME_RECORDS_KEY = '@RiseUp:number_guess_records';

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      const savedRecords = await AsyncStorage.getItem(GAME_RECORDS_KEY);
      if (savedRecords) {
        setRecords(JSON.parse(savedRecords));
      }
    } catch (error) {
      console.error('게임 기록 로드 실패:', error);
    }
  };

  const saveRecord = async (newRecord: GameRecord) => {
    try {
      const updatedRecords = [newRecord, ...records].slice(0, 10); // 최대 10개 기록
      await AsyncStorage.setItem(GAME_RECORDS_KEY, JSON.stringify(updatedRecords));
      setRecords(updatedRecords);
    } catch (error) {
      console.error('게임 기록 저장 실패:', error);
    }
  };

  const startNewGame = useCallback(() => {
    const newTarget = Math.floor(Math.random() * 100) + 1;
    setTargetNumber(newTarget);
    setUserGuess('');
    setAttempts(0);
    setGameStarted(true);
    setGameWon(false);
    setHint('');
    console.log('새 게임 시작, 목표 숫자:', newTarget);
  }, []);

  const checkGuess = useCallback(() => {
    const guess = parseInt(userGuess);
    
    if (isNaN(guess) || guess < 1 || guess > 100) {
      showCustomAlert('오류', '1부터 100 사이의 숫자를 입력해주세요.');
      return;
    }

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (guess === targetNumber) {
      setGameWon(true);
      const score = Math.max(100 - newAttempts * 10, 10); // 최소 10점
      
      const newRecord: GameRecord = {
        id: Date.now().toString(),
        score,
        attempts: newAttempts,
        targetNumber,
        date: new Date().toISOString()
      };
      
      saveRecord(newRecord);
      
      showCustomAlert(
        '🎉 정답입니다!',
        `축하합니다! ${newAttempts}번 만에 맞추셨습니다!\n점수: ${score}점`,
        [
          { text: '새 게임', onPress: () => {
            hideAlert();
            startNewGame();
          }},
          { text: '기록 보기', onPress: () => {
            hideAlert();
            setShowRecords(true);
          }}
        ]
      );
    } else {
      const newHint = guess > targetNumber ? '더 작은 숫자입니다!' : '더 큰 숫자입니다!';
      setHint(newHint);
      setUserGuess('');
    }
  }, [userGuess, targetNumber, attempts, showCustomAlert, hideAlert]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FF9800';
    return '#F44336';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderRecord = (record: GameRecord, index: number) => (
    <View key={record.id} style={styles.recordItem}>
      <View style={styles.recordHeader}>
        <Text style={styles.recordRank}>#{index + 1}</Text>
        <Text style={[styles.recordScore, { color: getScoreColor(record.score) }]}>
          {record.score}점
        </Text>
      </View>
      <View style={styles.recordDetails}>
        <Text style={styles.recordText}>
          {record.attempts}번 시도 • 목표: {record.targetNumber}
        </Text>
        <Text style={styles.recordDate}>{formatDate(record.date)}</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>🎯 숫자 맞추기</Text>
        <Text style={styles.subtitle}>1부터 100 사이의 숫자를 맞춰보세요!</Text>
      </View>

      {!showRecords ? (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* 게임 영역 */}
          <View style={styles.gameSection}>
            {!gameStarted ? (
              <View style={styles.startSection}>
                <Text style={styles.startText}>게임을 시작하시겠습니까?</Text>
                <Text style={styles.startSubText}>
                  • 1부터 100 사이의 숫자를 맞춰주세요{'\n'}
                  • 시도 횟수가 적을수록 높은 점수를 얻습니다{'\n'}
                  • 힌트를 참고해서 정답을 찾아보세요!
                </Text>
                <TouchableOpacity style={styles.startButton} onPress={startNewGame}>
                  <Text style={styles.startButtonText}>🎮 게임 시작</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.gameArea}>
                <View style={styles.gameInfo}>
                  <Text style={styles.attemptsText}>시도 횟수: {attempts}</Text>
                  {gameWon && <Text style={styles.wonText}>🎉 정답!</Text>}
                </View>

                <View style={styles.inputSection}>
                  <Text style={styles.inputLabel}>숫자를 입력하세요 (1-100):</Text>
                  <TextInput
                    style={styles.numberInput}
                    value={userGuess}
                    onChangeText={setUserGuess}
                    placeholder="숫자 입력..."
                    placeholderTextColor="#666"
                    keyboardType="numeric"
                    maxLength={3}
                    editable={!gameWon}
                  />
                  <TouchableOpacity
                    style={[styles.guessButton, gameWon && styles.disabledButton]}
                    onPress={checkGuess}
                    disabled={gameWon}
                  >
                    <Text style={styles.guessButtonText}>확인</Text>
                  </TouchableOpacity>
                </View>

                {hint && (
                  <View style={styles.hintSection}>
                    <Text style={styles.hintText}>💡 {hint}</Text>
                  </View>
                )}

                <View style={styles.actionButtons}>
                  <TouchableOpacity style={styles.actionButton} onPress={startNewGame}>
                    <Text style={styles.actionButtonText}>🔄 새 게임</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton} 
                    onPress={() => setShowRecords(true)}
                  >
                    <Text style={styles.actionButtonText}>📊 기록 보기</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* 게임 규칙 */}
          <View style={styles.rulesSection}>
            <Text style={styles.rulesTitle}>📋 게임 규칙</Text>
            <Text style={styles.rulesText}>
              • 1부터 100 사이의 숫자를 맞춰주세요{'\n'}
              • 시도 횟수가 적을수록 높은 점수를 얻습니다{'\n'}
              • 1번 시도: 100점, 2번 시도: 90점, ...{'\n'}
              • 최소 점수는 10점입니다{'\n'}
              • 힌트를 참고해서 정답을 찾아보세요!
            </Text>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.recordsContainer}>
          <View style={styles.recordsHeader}>
            <Text style={styles.recordsTitle}>🏆 최고 기록</Text>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => setShowRecords(false)}
            >
              <Text style={styles.backButtonText}>← 돌아가기</Text>
            </TouchableOpacity>
          </View>
          
          {records.length === 0 ? (
            <View style={styles.emptyRecords}>
              <Text style={styles.emptyRecordsText}>아직 기록이 없습니다.</Text>
              <Text style={styles.emptyRecordsSubText}>게임을 플레이해서 기록을 만들어보세요!</Text>
            </View>
          ) : (
            <ScrollView style={styles.recordsList} showsVerticalScrollIndicator={false}>
              {records.map((record, index) => renderRecord(record, index))}
            </ScrollView>
          )}
        </View>
      )}

      <CustomAlert {...alertConfig} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e0e0e0',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#a0a0a0',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  gameSection: {
    marginBottom: 30,
  },
  startSection: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  startText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e0e0e0',
    marginBottom: 20,
  },
  startSubText: {
    fontSize: 14,
    color: '#a0a0a0',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 30,
  },
  startButton: {
    backgroundColor: '#1a73e8',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  gameArea: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
  },
  gameInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  attemptsText: {
    fontSize: 16,
    color: '#e0e0e0',
  },
  wonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: '#e0e0e0',
    marginBottom: 10,
  },
  numberInput: {
    backgroundColor: '#333',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 18,
    color: '#e0e0e0',
    textAlign: 'center',
    marginBottom: 15,
  },
  guessButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  guessButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#666',
  },
  hintSection: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  hintText: {
    fontSize: 16,
    color: '#FFD700',
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    backgroundColor: '#1a73e8',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  rulesSection: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  rulesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e0e0e0',
    marginBottom: 15,
  },
  rulesText: {
    fontSize: 14,
    color: '#a0a0a0',
    lineHeight: 20,
  },
  recordsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  recordsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  recordsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e0e0e0',
  },
  backButton: {
    backgroundColor: '#333',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backButtonText: {
    color: '#e0e0e0',
    fontSize: 14,
  },
  emptyRecords: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyRecordsText: {
    fontSize: 18,
    color: '#a0a0a0',
    marginBottom: 10,
  },
  emptyRecordsSubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  recordsList: {
    flex: 1,
  },
  recordItem: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recordRank: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e0e0e0',
  },
  recordScore: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  recordDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordText: {
    fontSize: 14,
    color: '#a0a0a0',
  },
  recordDate: {
    fontSize: 12,
    color: '#666',
  },
});

export default NumberGuessGame; 