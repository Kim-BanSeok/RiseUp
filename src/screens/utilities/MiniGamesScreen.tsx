import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGameScore } from '../../context/GameScoreContext';
import NumberGuessGame from '../../components/games/NumberGuessGame';
import BingoGame from '../../components/games/BingoGame';
import ReactionGame from '../../components/games/ReactionGame';
import MemoryGame from '../../components/games/MemoryGame';
import MathGame from '../../components/games/MathGame';
import RPSGame from '../../components/games/RPSGame';
import MukjjippaGame from '../../components/games/MukjjippaGame';
import ReactionSpeedGame from '../games/ReactionSpeedGame';

const MiniGamesScreen = () => {
  const insets = useSafeAreaInsets();
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [selectedScoreFilter, setSelectedScoreFilter] = useState<string>('all');
  const { gameScores, addScore } = useGameScore();

  const games = [
    {
      id: 'number',
      title: '숫자 맞추기',
      description: '1~100 사이의 숫자를 맞춰보세요',
      icon: '🔢',
      color: '#FF6B6B',
      component: NumberGuessGame
    },
    {
      id: 'reaction',
      title: '반응속도 테스트',
      description: '초록색이 나타나면 빠르게 터치하세요',
      icon: '⚡',
      color: '#4ECDC4',
      component: ReactionGame
    },
    {
      id: 'reaction-speed',
      title: '반응속도 테스트 (새로운)',
      description: '빨간색이 되면 빠르게 클릭하세요',
      icon: '⚡',
      color: '#FF5722',
      component: ReactionSpeedGame
    },
    {
      id: 'memory',
      title: '기억력 게임',
      description: '순서를 기억하고 따라해보세요',
      icon: '🧠',
      color: '#45B7D1',
      component: MemoryGame
    },
    {
      id: 'math',
      title: '암산 게임',
      description: '빠른 계산으로 점수를 얻어보세요',
      icon: '➕',
      color: '#96CEB4',
      component: MathGame
    },
    {
      id: 'bingo',
      title: '빙고 게임',
      description: '5줄을 완성해서 빙고를 외쳐보세요',
      icon: '🎯',
      color: '#F39C12',
      component: BingoGame
    },
    {
      id: 'rps',
      title: '가위바위보',
      description: '컴퓨터와 가위바위보 대결하세요',
      icon: '✂️',
      color: '#9B59B6',
      component: RPSGame
    },
    {
      id: 'mukjjippa',
      title: '묵찌빠',
      description: '한국 전통 게임으로 승부하세요',
      icon: '👊',
      color: '#E74C3C',
      component: MukjjippaGame
    }
  ];

  // 게임 시작
  const startGame = (gameId: string) => {
    console.log('🎮 [메인] 게임 시작:', gameId);
    const game = games.find(g => g.id === gameId);
    
    if (!game?.component) {
      console.log('🚧 [메인] 게임 컴포넌트가 아직 분리되지 않음:', gameId);
      // TODO: CustomAlert으로 변경 예정
      Alert.alert('준비 중', '이 게임은 아직 분리 작업 중입니다.');
      return;
    }
    
    setSelectedGame(gameId);
  };

  // 게임 종료
  const exitGame = () => {
    console.log('🚪 [메인] 게임 종료');
    setSelectedGame(null);
  };

  // 점수 필터링
  const getFilteredScores = () => {
    if (selectedScoreFilter === 'all') {
      return gameScores;
    }
    return gameScores.filter(score => score.game === selectedScoreFilter);
  };

  // 게임별 고유 목록 가져오기
  const getUniqueGames = () => {
    const uniqueGames = [...new Set(gameScores.map(score => score.game))];
    return uniqueGames.sort();
  };

  // 선택된 게임 렌더링
  const renderSelectedGame = () => {
    if (!selectedGame) return null;

    const game = games.find(g => g.id === selectedGame);
    if (!game?.component) return null;

    const GameComponent = game.component;
    return (
      <GameComponent
        onExit={exitGame}
        onScore={addScore}
      />
    );
  };

  // 게임이 선택된 경우 해당 게임 렌더링
  if (selectedGame) {
    return renderSelectedGame();
  }

  // 메인 게임 선택 화면
  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 100 }]}>
      <View style={styles.header}>
        <Text style={styles.title}>🎮 미니 게임</Text>
        <Text style={styles.subtitle}>재미있는 두뇌 게임들</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* 게임 목록 */}
        <View style={styles.gamesGrid}>
          {games.map((game) => (
            <TouchableOpacity
              key={game.id}
              style={[styles.gameCard, { backgroundColor: game.color }]}
              onPress={() => startGame(game.id)}
            >
              <Text style={styles.gameIcon}>{game.icon}</Text>
              <Text style={styles.gameCardTitle}>{game.title}</Text>
              <Text style={styles.gameCardDescription}>{game.description}</Text>
              {!game.component && (
                <Text style={styles.comingSoonBadge}>준비중</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* 최고 점수 */}
        {gameScores.length > 0 && (
          <View style={styles.scoresSection}>
            <View style={styles.scoresSectionHeader}>
              <Text style={styles.scoresTitle}>🏆 최근 점수</Text>
              <Text style={styles.scoresTotalCount}>
                총 {getFilteredScores().length}개
              </Text>
            </View>

            {/* 점수 필터 버튼들 */}
            <View style={styles.filterContainer}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.filterScrollView}
              >
                <TouchableOpacity
                  style={[
                    styles.filterButton, 
                    selectedScoreFilter === 'all' && styles.filterButtonActive
                  ]}
                  onPress={() => setSelectedScoreFilter('all')}
                >
                  <Text style={[
                    styles.filterButtonText,
                    selectedScoreFilter === 'all' && styles.filterButtonTextActive
                  ]}>
                    전체
                  </Text>
                </TouchableOpacity>
                
                {getUniqueGames().map((gameName) => (
                  <TouchableOpacity
                    key={gameName}
                    style={[
                      styles.filterButton,
                      selectedScoreFilter === gameName && styles.filterButtonActive
                    ]}
                    onPress={() => setSelectedScoreFilter(gameName)}
                  >
                    <Text style={[
                      styles.filterButtonText,
                      selectedScoreFilter === gameName && styles.filterButtonTextActive
                    ]}>
                      {gameName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            <ScrollView 
              style={styles.scoresScrollView}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
            >
              {getFilteredScores().map((score, index) => (
                <View key={`${score.date}-${index}`} style={styles.scoreItem}>
                  <View style={styles.scoreMainInfo}>
                    <Text style={styles.scoreName}>{score.game}</Text>
                    <Text style={styles.scoreValue}>{score.score}점</Text>
                  </View>
                  <Text style={styles.scoreDate}>
                    {new Date(score.date).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Text>
                  <Text style={styles.scoreRank}>#{index + 1}</Text>
                </View>
              ))}
              
              <View style={styles.scoresEndPadding} />
            </ScrollView>
            
            {gameScores.length > 10 && (
              <View style={styles.scoresHint}>
                <Text style={styles.scoresHintText}>
                  ↑ 위로 스크롤하여 더 많은 점수를 확인하세요
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
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
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  gamesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  gameCard: {
    width: 150, // 고정 너비 값
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    position: 'relative',
  },
  gameIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  gameCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  gameCardDescription: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 16,
  },
  comingSoonBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: '#FFD700',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  scoresSection: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    marginTop: 20,
    marginHorizontal: 20,
    marginBottom: 30,
    maxHeight: 400,
  },
  scoresSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  scoresTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  scoresTotalCount: {
    fontSize: 14,
    color: '#a0a0a0',
    fontWeight: '500',
  },
  scoresScrollView: {
    maxHeight: 300,
  },
  scoreItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 8,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FFD700',
  },
  scoreMainInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e0e0e0',
    flex: 1,
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    marginRight: 15,
  },
  scoreDate: {
    fontSize: 12,
    color: '#a0a0a0',
    marginRight: 10,
    minWidth: 80,
    textAlign: 'right',
  },
  scoreRank: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
    minWidth: 30,
    textAlign: 'center',
  },
  scoresEndPadding: {
    height: 20,
  },
  scoresHint: {
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  scoresHintText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  filterContainer: {
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  filterScrollView: {
    flexGrow: 0,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    backgroundColor: '#333',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#555',
  },
  filterButtonActive: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#e0e0e0',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#000',
    fontWeight: 'bold',
  },
});

export default MiniGamesScreen; 