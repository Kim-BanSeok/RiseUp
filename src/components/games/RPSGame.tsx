import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

interface RPSGameProps {
  onExit: () => void;
  onScore: (game: string, score: number) => void;
}

interface RPSGameState {
  playerChoice: string | null;
  computerChoice: string | null;
  result: string | null;
  playerScore: number;
  computerScore: number;
  round: number;
  gameOver: boolean;
  isPlaying: boolean;
}

const RPSGame: React.FC<RPSGameProps> = ({ onExit, onScore }) => {
  const [rpsGame, setRpsGame] = useState<RPSGameState>({
    playerChoice: null,
    computerChoice: null,
    result: null,
    playerScore: 0,
    computerScore: 0,
    round: 0,
    gameOver: false,
    isPlaying: true
  });

  // 가위바위보 결과 계산
  const getRpsResult = (player: string, computer: string): string => {
    console.log('✂️ [가위바위보] 결과 계산:', { player, computer });
    if (player === computer) return '무';
    if (
      (player === '가위' && computer === '보') ||
      (player === '바위' && computer === '가위') ||
      (player === '보' && computer === '바위')
    ) return '승';
    return '패';
  };

  // 가위바위보 플레이 함수
  const playRps = (playerChoice: string) => {
    console.log('✂️ [가위바위보] 플레이어 선택:', playerChoice);
    console.log('✂️ [가위바위보] 현재 상태:', {
      isPlaying: rpsGame.isPlaying,
      gameOver: rpsGame.gameOver,
      round: rpsGame.round
    });
    
    if (!rpsGame.isPlaying || rpsGame.gameOver) {
      console.log('✂️ [가위바위보] 플레이 불가능');
      return;
    }
    
    const choices = ['가위', '바위', '보'];
    const computerChoice = choices[Math.floor(Math.random() * 3)];
    const result = getRpsResult(playerChoice, computerChoice);
    
    console.log('✂️ [가위바위보] 컴퓨터 선택:', computerChoice);
    console.log('✂️ [가위바위보] 결과:', result);
    
    let newPlayerScore = rpsGame.playerScore;
    let newComputerScore = rpsGame.computerScore;
    let gameOver = false;
    
    if (result === '승') {
      newPlayerScore++;
      onScore('가위바위보', 10);
      console.log('✂️ [가위바위보] 플레이어 승리! 10점 획득');
    } else if (result === '패') {
      newComputerScore++;
      console.log('✂️ [가위바위보] 컴퓨터 승리');
    } else {
      console.log('✂️ [가위바위보] 무승부');
    }
    
    // 5점 먼저 도달하면 게임 종료
    if (newPlayerScore >= 5 || newComputerScore >= 5) {
      gameOver = true;
      const finalScore = newPlayerScore >= 5 ? 100 : 20; // 승리 시 100점, 패배 시 20점
      console.log('✂️ [가위바위보] 게임 종료!', {
        playerScore: newPlayerScore,
        computerScore: newComputerScore,
        finalScore
      });
      onScore('가위바위보', finalScore);
    }
    
    setRpsGame(prev => ({
      ...prev,
      playerChoice,
      computerChoice,
      result,
      playerScore: newPlayerScore,
      computerScore: newComputerScore,
      round: prev.round + 1,
      gameOver,
      isPlaying: !gameOver // 게임이 끝나지 않으면 계속 플레이 가능
    }));
    
    // 다음 라운드를 위해 잠시 대기
    if (!gameOver) {
      console.log('✂️ [가위바위보] 2초 후 다음 라운드');
      setTimeout(() => {
        setRpsGame(prev => ({
          ...prev,
          playerChoice: null,
          computerChoice: null,
          result: null
        }));
      }, 2000);
    }
  };

  // 게임 재시작
  const restartGame = () => {
    console.log('✂️ [가위바위보] 게임 재시작');
    setRpsGame({
      playerChoice: null,
      computerChoice: null,
      result: null,
      playerScore: 0,
      computerScore: 0,
      round: 0,
      gameOver: false,
      isPlaying: true
    });
  };

  return (
    <ScrollView 
      style={styles.gameContainer}
      contentContainerStyle={styles.gameScrollContent}
      showsVerticalScrollIndicator={true}
    >
      <Text style={styles.gameTitle}>✂️ 가위바위보</Text>
      
      {/* 게임 상태 표시 */}
      <View style={styles.rpsGameStatus}>
        <View style={styles.rpsStatItem}>
          <Text style={styles.rpsStatLabel}>플레이어 점수</Text>
          <Text style={styles.rpsStatValue}>{rpsGame.playerScore}</Text>
        </View>
        <View style={styles.rpsStatItem}>
          <Text style={styles.rpsStatLabel}>컴퓨터 점수</Text>
          <Text style={styles.rpsStatValue}>{rpsGame.computerScore}</Text>
        </View>
        <View style={styles.rpsStatItem}>
          <Text style={styles.rpsStatLabel}>라운드</Text>
          <Text style={styles.rpsStatValue}>{rpsGame.round}</Text>
        </View>
      </View>

      {/* 게임 안내 */}
      <View style={styles.rpsInstruction}>
        <Text style={styles.instructionText}>
          {rpsGame.isPlaying ? 
            '가위, 바위, 보 중 하나를 선택하세요!' : 
            rpsGame.gameOver ? 
              `🎯 게임 오버! 플레이어 점수: ${rpsGame.playerScore}, 컴퓨터 점수: ${rpsGame.computerScore}` :
              '🎮 가위바위보 게임을 시작하세요'
          }
        </Text>
      </View>

      {/* 가위바위보 선택 버튼 */}
      <View style={styles.rpsButtons}>
        <TouchableOpacity
          style={[styles.rpsButton, rpsGame.isPlaying && styles.rpsButtonActive]}
          onPress={() => playRps('가위')}
          disabled={!rpsGame.isPlaying || rpsGame.gameOver}
        >
          <Text style={styles.rpsButtonText}>✂️</Text>
          <Text style={styles.rpsButtonLabel}>가위</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.rpsButton, rpsGame.isPlaying && styles.rpsButtonActive]}
          onPress={() => playRps('바위')}
          disabled={!rpsGame.isPlaying || rpsGame.gameOver}
        >
          <Text style={styles.rpsButtonText}>🪨</Text>
          <Text style={styles.rpsButtonLabel}>바위</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.rpsButton, rpsGame.isPlaying && styles.rpsButtonActive]}
          onPress={() => playRps('보')}
          disabled={!rpsGame.isPlaying || rpsGame.gameOver}
        >
          <Text style={styles.rpsButtonText}>📄</Text>
          <Text style={styles.rpsButtonLabel}>보</Text>
        </TouchableOpacity>
      </View>

      {/* 결과 표시 */}
      {rpsGame.result && (
        <View style={styles.rpsResult}>
          <Text style={styles.resultText}>
            플레이어: {rpsGame.playerChoice}
          </Text>
          <Text style={styles.resultText}>
            컴퓨터: {rpsGame.computerChoice}
          </Text>
          <Text style={styles.resultGrade}>
            {rpsGame.result === '승' ? '🎉 승리!' : rpsGame.result === '패' ? '😢 패배...' : '👔 무승부'}
          </Text>
        </View>
      )}

      {/* 게임 종료 시 결과 */}
      {rpsGame.gameOver && (
        <View style={styles.rpsGameOver}>
          <Text style={styles.gameOverTitle}>🎮 게임 종료!</Text>
          <Text style={styles.finalScore}>
            {rpsGame.playerScore >= 5 ? '🎉 승리!' : '😢 패배...'}
          </Text>
          <Text style={styles.accuracy}>
            최종 점수: {rpsGame.playerScore} : {rpsGame.computerScore}
          </Text>
          <Text style={styles.problemsSolved}>
            총 {rpsGame.round}라운드 진행
          </Text>
        </View>
      )}

      <View style={styles.gameButtons}>
        <TouchableOpacity style={styles.restartButton} onPress={restartGame}>
          <Text style={styles.buttonText}>다시 시작</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.exitButton} onPress={onExit}>
          <Text style={styles.buttonText}>나가기</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  gameContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    padding: 20,
  },
  gameScrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 150,
  },
  gameTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e0e0e0',
    marginBottom: 20,
  },
  rpsGameStatus: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  rpsStatItem: {
    alignItems: 'center',
  },
  rpsStatLabel: {
    fontSize: 14,
    color: '#a0a0a0',
    marginBottom: 4,
  },
  rpsStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  rpsInstruction: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#9B59B6',
  },
  instructionText: {
    fontSize: 16,
    color: '#9B59B6',
    textAlign: 'center',
    fontWeight: '600',
  },
  rpsButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    width: '100%',
  },
  rpsButton: {
    width: 80,
    height: 100,
    backgroundColor: '#333',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#555',
  },
  rpsButtonActive: {
    borderColor: '#9B59B6',
    borderWidth: 3,
  },
  rpsButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  rpsButtonLabel: {
    fontSize: 12,
    color: '#a0a0a0',
    fontWeight: '600',
  },
  rpsResult: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    borderWidth: 2,
    borderColor: '#9B59B6',
  },
  resultText: {
    fontSize: 18,
    color: '#e0e0e0',
    marginBottom: 5,
  },
  resultGrade: {
    fontSize: 16,
    color: '#9B59B6',
    fontWeight: 'bold',
    marginTop: 5,
  },
  rpsGameOver: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#9B59B6',
  },
  gameOverTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 20,
  },
  finalScore: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#96CEB4',
    marginBottom: 10,
  },
  accuracy: {
    fontSize: 18,
    color: '#e0e0e0',
    marginBottom: 8,
  },
  problemsSolved: {
    fontSize: 16,
    color: '#a0a0a0',
    marginBottom: 20,
  },
  gameButtons: {
    flexDirection: 'row',
    gap: 15,
    marginTop: 20,
  },
  restartButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exitButton: {
    backgroundColor: '#666',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RPSGame; 