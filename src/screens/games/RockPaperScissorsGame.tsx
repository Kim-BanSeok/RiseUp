import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
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
  playerChoice: string;
  computerChoice: string;
  result: 'win' | 'lose' | 'draw';
  date: string;
}

type Choice = 'rock' | 'paper' | 'scissors';

const RockPaperScissorsGame = () => {
  const insets = useSafeAreaInsets();
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
  const [computerChoice, setComputerChoice] = useState<Choice | null>(null);
  const [result, setResult] = useState<'win' | 'lose' | 'draw' | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [records, setRecords] = useState<GameRecord[]>([]);
  const [showRecords, setShowRecords] = useState(false);
  const [stats, setStats] = useState({ wins: 0, loses: 0, draws: 0 });
  const { alertConfig, showCustomAlert, hideAlert } = useCustomAlert();

  const GAME_RECORDS_KEY = '@RiseUp:rps_records';
  const GAME_STATS_KEY = '@RiseUp:rps_stats';

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
      console.error('게임 기록 로드 실패:', error);
    }
  };

  const loadStats = async () => {
    try {
      const savedStats = await AsyncStorage.getItem(GAME_STATS_KEY);
      if (savedStats) {
        setStats(JSON.parse(savedStats));
      }
    } catch (error) {
      console.error('게임 통계 로드 실패:', error);
    }
  };

  const saveRecord = async (newRecord: GameRecord) => {
    try {
      const updatedRecords = [newRecord, ...records].slice(0, 20); // 최대 20개 기록
      await AsyncStorage.setItem(GAME_RECORDS_KEY, JSON.stringify(updatedRecords));
      setRecords(updatedRecords);
    } catch (error) {
      console.error('게임 기록 저장 실패:', error);
    }
  };

  const saveStats = async (newStats: typeof stats) => {
    try {
      await AsyncStorage.setItem(GAME_STATS_KEY, JSON.stringify(newStats));
      setStats(newStats);
    } catch (error) {
      console.error('게임 통계 저장 실패:', error);
    }
  };

  const getComputerChoice = (): Choice => {
    const choices: Choice[] = ['rock', 'paper', 'scissors'];
    return choices[Math.floor(Math.random() * choices.length)];
  };

  const determineWinner = (player: Choice, computer: Choice): 'win' | 'lose' | 'draw' => {
    if (player === computer) return 'draw';
    
    if (
      (player === 'rock' && computer === 'scissors') ||
      (player === 'paper' && computer === 'rock') ||
      (player === 'scissors' && computer === 'paper')
    ) {
      return 'win';
    }
    
    return 'lose';
  };

  const playGame = useCallback((choice: Choice) => {
    const computer = getComputerChoice();
    const gameResult = determineWinner(choice, computer);
    
    setPlayerChoice(choice);
    setComputerChoice(computer);
    setResult(gameResult);
    setGameStarted(true);
    
    // 통계 업데이트
    const newStats = { ...stats };
    if (gameResult === 'win') newStats.wins++;
    else if (gameResult === 'lose') newStats.loses++;
    else newStats.draws++;
    saveStats(newStats);
    
    // 기록 저장
    const newRecord: GameRecord = {
      id: Date.now().toString(),
      playerChoice: choice,
      computerChoice: computer,
      result: gameResult,
      date: new Date().toISOString()
    };
    saveRecord(newRecord);
    
    // 결과 알림
    const resultMessages = {
      win: '🎉 승리!',
      lose: '😢 패배...',
      draw: '🤝 무승부!'
    };
    
    const choiceEmojis = {
      rock: '✊',
      paper: '✋',
      scissors: '✌️'
    };
    
    showCustomAlert(
      resultMessages[gameResult],
      `당신: ${choiceEmojis[choice]} ${choice}\n컴퓨터: ${choiceEmojis[computer]} ${computer}`,
      [
        { text: '다시 하기', onPress: () => {
          hideAlert();
          resetGame();
        }},
        { text: '기록 보기', onPress: () => {
          hideAlert();
          setShowRecords(true);
        }}
      ]
    );
  }, [stats, showCustomAlert, hideAlert]);

  const resetGame = () => {
    setPlayerChoice(null);
    setComputerChoice(null);
    setResult(null);
    setGameStarted(false);
  };

  const getChoiceEmoji = (choice: Choice) => {
    switch (choice) {
      case 'rock': return '✊';
      case 'paper': return '✋';
      case 'scissors': return '✌️';
    }
  };

  const getChoiceName = (choice: Choice) => {
    switch (choice) {
      case 'rock': return '바위';
      case 'paper': return '보';
      case 'scissors': return '가위';
    }
  };

  const getResultColor = (result: 'win' | 'lose' | 'draw') => {
    switch (result) {
      case 'win': return '#4CAF50';
      case 'lose': return '#F44336';
      case 'draw': return '#FF9800';
    }
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
        <Text style={[styles.recordResult, { color: getResultColor(record.result) }]}>
          {record.result === 'win' ? '승' : record.result === 'lose' ? '패' : '무'}
        </Text>
      </View>
      <View style={styles.recordDetails}>
        <Text style={styles.recordText}>
          {getChoiceEmoji(record.playerChoice as Choice)} vs {getChoiceEmoji(record.computerChoice as Choice)}
        </Text>
        <Text style={styles.recordDate}>{formatDate(record.date)}</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>✊ 가위바위보</Text>
        <Text style={styles.subtitle}>컴퓨터와 대결해보세요!</Text>
      </View>

      {!showRecords ? (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* 게임 영역 */}
          <View style={styles.gameSection}>
            {!gameStarted ? (
              <View style={styles.startSection}>
                <Text style={styles.startText}>게임을 시작하시겠습니까?</Text>
                <Text style={styles.startSubText}>
                  • 가위, 바위, 보 중 하나를 선택하세요{'\n'}
                  • 컴퓨터와 대결하여 승패를 가려보세요{'\n'}
                  • 승률과 기록을 확인할 수 있습니다!
                </Text>
                <TouchableOpacity style={styles.startButton} onPress={() => setGameStarted(true)}>
                  <Text style={styles.startButtonText}>🎮 게임 시작</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.gameArea}>
                {/* 선택 버튼들 */}
                <View style={styles.choiceButtons}>
                  <TouchableOpacity 
                    style={styles.choiceButton} 
                    onPress={() => playGame('rock')}
                  >
                    <Text style={styles.choiceEmoji}>✊</Text>
                    <Text style={styles.choiceText}>바위</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.choiceButton} 
                    onPress={() => playGame('paper')}
                  >
                    <Text style={styles.choiceEmoji}>✋</Text>
                    <Text style={styles.choiceText}>보</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.choiceButton} 
                    onPress={() => playGame('scissors')}
                  >
                    <Text style={styles.choiceEmoji}>✌️</Text>
                    <Text style={styles.choiceText}>가위</Text>
                  </TouchableOpacity>
                </View>

                {/* 결과 표시 */}
                {result && (
                  <View style={styles.resultSection}>
                    <View style={styles.resultRow}>
                      <Text style={styles.resultLabel}>당신:</Text>
                      <Text style={styles.resultChoice}>
                        {getChoiceEmoji(playerChoice!)} {getChoiceName(playerChoice!)}
                      </Text>
                    </View>
                    <View style={styles.resultRow}>
                      <Text style={styles.resultLabel}>컴퓨터:</Text>
                      <Text style={styles.resultChoice}>
                        {getChoiceEmoji(computerChoice!)} {getChoiceName(computerChoice!)}
                      </Text>
                    </View>
                    <Text style={[styles.resultText, { color: getResultColor(result) }]}>
                      {result === 'win' ? '🎉 승리!' : result === 'lose' ? '😢 패배...' : '🤝 무승부!'}
                    </Text>
                  </View>
                )}

                <View style={styles.actionButtons}>
                  <TouchableOpacity style={styles.actionButton} onPress={resetGame}>
                    <Text style={styles.actionButtonText}>🔄 다시 하기</Text>
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

          {/* 통계 */}
          <View style={styles.statsSection}>
            <Text style={styles.statsTitle}>📊 통계</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.wins}</Text>
                <Text style={styles.statLabel}>승리</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.loses}</Text>
                <Text style={styles.statLabel}>패배</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats.draws}</Text>
                <Text style={styles.statLabel}>무승부</Text>
              </View>
            </View>
            {stats.wins + stats.loses + stats.draws > 0 && (
              <Text style={styles.winRate}>
                승률: {Math.round((stats.wins / (stats.wins + stats.loses + stats.draws)) * 100)}%
              </Text>
            )}
          </View>

          {/* 게임 규칙 */}
          <View style={styles.rulesSection}>
            <Text style={styles.rulesTitle}>📋 게임 규칙</Text>
            <Text style={styles.rulesText}>
              • 가위(✌️)는 보(✋)를 이깁니다{'\n'}
              • 바위(✊)는 가위(✌️)를 이깁니다{'\n'}
              • 보(✋)는 바위(✊)를 이깁니다{'\n'}
              • 같은 것을 내면 무승부입니다{'\n'}
              • 승률과 기록을 확인할 수 있습니다!
            </Text>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.recordsContainer}>
          <View style={styles.recordsHeader}>
            <Text style={styles.recordsTitle}>🏆 게임 기록</Text>
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
  choiceButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  choiceButton: {
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 15,
    padding: 20,
    minWidth: 80,
  },
  choiceEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  choiceText: {
    fontSize: 14,
    color: '#e0e0e0',
    fontWeight: '600',
  },
  resultSection: {
    backgroundColor: '#333',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  resultLabel: {
    fontSize: 16,
    color: '#a0a0a0',
  },
  resultChoice: {
    fontSize: 18,
    color: '#e0e0e0',
    fontWeight: '600',
  },
  resultText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
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
  statsSection: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e0e0e0',
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e0e0e0',
  },
  statLabel: {
    fontSize: 14,
    color: '#a0a0a0',
    marginTop: 5,
  },
  winRate: {
    fontSize: 16,
    color: '#4CAF50',
    textAlign: 'center',
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
  recordResult: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  recordDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordText: {
    fontSize: 16,
    color: '#a0a0a0',
  },
  recordDate: {
    fontSize: 12,
    color: '#666',
  },
});

export default RockPaperScissorsGame; 