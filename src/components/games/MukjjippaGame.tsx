import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

interface MukjjippaGameProps {
  onExit: () => void;
  onScore: (game: string, score: number) => void;
}

interface MukjjippaGameState {
  playerChoice: string | null;
  computerChoice: string | null;
  attacker: string | null;
  result: string | null;
  gameOver: boolean;
  winner: string | null;
  round: number;
  isPlaying: boolean;
  playerScore: number;
  computerScore: number;
}

const MukjjippaGame: React.FC<MukjjippaGameProps> = ({ onExit, onScore }) => {
  const [mukjjippaGame, setMukjjippaGame] = useState<MukjjippaGameState>({
    playerChoice: null,
    computerChoice: null,
    attacker: null,
    result: null,
    gameOver: false,
    winner: null,
    round: 0,
    isPlaying: true,
    playerScore: 0,
    computerScore: 0
  });

  // 묵찌빠 결과 계산
  const getMukjjippaResult = (player: string, computer: string): string => {
    console.log('👊 [묵찌빠] 결과 계산:', { player, computer });
    if (player === computer) return '무';
    if (
      (player === '묵' && computer === '찌') ||
      (player === '찌' && computer === '빠') ||
      (player === '빠' && computer === '묵')
    ) return '승';
    return '패';
  };

  // 묵찌빠 플레이 함수
  const playMukjjippa = (playerChoice: string) => {
    console.log('👊 [묵찌빠] 플레이어 선택:', playerChoice);
    console.log('👊 [묵찌빠] 현재 상태:', {
      isPlaying: mukjjippaGame.isPlaying,
      gameOver: mukjjippaGame.gameOver,
      attacker: mukjjippaGame.attacker,
      round: mukjjippaGame.round
    });
    
    if (!mukjjippaGame.isPlaying || mukjjippaGame.gameOver) {
      console.log('👊 [묵찌빠] 플레이 불가능');
      return;
    }
    
    const choices = ['묵', '찌', '빠'];
    const computerChoice = choices[Math.floor(Math.random() * 3)];
    
    let newAttacker = mukjjippaGame.attacker;
    let gameOver = false;
    let winner = null;
    let result = '무';
    
    console.log('👊 [묵찌빠] 컴퓨터 선택:', computerChoice);
    
    // 같은 것을 냈을 때
    if (playerChoice === computerChoice) {
      console.log('👊 [묵찌빠] 같은 선택!');
      if (mukjjippaGame.attacker === 'player') {
        // 플레이어가 공격자인 상태에서 같은 것을 내면 플레이어 승리
        gameOver = true;
        winner = 'player';
        result = '승';
        console.log('👊 [묵찌빠] 플레이어 승리! 100점 획득');
        onScore('묵찌빠', 100);
      } else if (mukjjippaGame.attacker === 'computer') {
        // 컴퓨터가 공격자인 상태에서 같은 것을 내면 컴퓨터 승리
        gameOver = true;
        winner = 'computer';
        result = '패';
        console.log('👊 [묵찌빠] 컴퓨터 승리! 20점 참가상');
        onScore('묵찌빠', 20);
      } else {
        // 첫 판에서 같은 것을 내면 다시
        result = '무';
        console.log('👊 [묵찌빠] 첫 판 무승부, 다시');
      }
    } else {
      // 다른 것을 냈을 때 - 가위바위보 승부로 공격권 결정
      const rpsResult = getMukjjippaResult(playerChoice, computerChoice);
      if (rpsResult === '승') {
        newAttacker = 'player';
        result = '공격권 획득';
        console.log('👊 [묵찌빠] 플레이어 공격권 획득');
      } else if (rpsResult === '패') {
        newAttacker = 'computer';
        result = '공격권 상실';
        console.log('👊 [묵찌빠] 컴퓨터 공격권 획득');
      } else {
        result = '무승부';
        console.log('👊 [묵찌빠] 무승부');
      }
    }
    
    setMukjjippaGame(prev => ({
      ...prev,
      playerChoice,
      computerChoice,
      attacker: newAttacker,
      result,
      gameOver,
      winner,
      round: prev.round + 1,
      isPlaying: !gameOver
    }));
    
    // 게임이 끝나지 않았으면 다음 라운드를 위해 잠시 대기
    if (!gameOver) {
      console.log('👊 [묵찌빠] 2.5초 후 다음 라운드');
      setTimeout(() => {
        setMukjjippaGame(prev => ({
          ...prev,
          playerChoice: null,
          computerChoice: null,
          result: null
        }));
      }, 2500);
    }
  };

  // 게임 재시작
  const restartGame = () => {
    console.log('👊 [묵찌빠] 게임 재시작');
    setMukjjippaGame({
      playerChoice: null,
      computerChoice: null,
      attacker: null,
      result: null,
      gameOver: false,
      winner: null,
      round: 0,
      isPlaying: true,
      playerScore: 0,
      computerScore: 0
    });
  };

  return (
    <ScrollView 
      style={styles.gameContainer}
      contentContainerStyle={styles.gameScrollContent}
      showsVerticalScrollIndicator={true}
    >
      <Text style={styles.gameTitle}>👊 묵찌빠</Text>
      
      {/* 게임 상태 표시 */}
      <View style={styles.mukjjippaGameStatus}>
        <View style={styles.mukjjippaStatItem}>
          <Text style={styles.mukjjippaStatLabel}>공격자</Text>
          <Text style={styles.mukjjippaStatValue}>
            {mukjjippaGame.attacker === 'player' ? '플레이어' : 
             mukjjippaGame.attacker === 'computer' ? '컴퓨터' : '미정'}
          </Text>
        </View>
        <View style={styles.mukjjippaStatItem}>
          <Text style={styles.mukjjippaStatLabel}>라운드</Text>
          <Text style={styles.mukjjippaStatValue}>{mukjjippaGame.round}</Text>
        </View>
        <View style={styles.mukjjippaStatItem}>
          <Text style={styles.mukjjippaStatLabel}>상태</Text>
          <Text style={styles.mukjjippaStatValue}>
            {mukjjippaGame.gameOver ? '종료' : mukjjippaGame.isPlaying ? '진행중' : '대기'}
          </Text>
        </View>
      </View>

      {/* 게임 안내 */}
      <View style={styles.mukjjippaInstruction}>
        <Text style={styles.instructionText}>
          {mukjjippaGame.isPlaying ? 
            mukjjippaGame.attacker ? 
              `현재 ${mukjjippaGame.attacker === 'player' ? '플레이어' : '컴퓨터'}가 공격자입니다!` :
              '첫 판! 가위바위보로 공격권을 정하세요!' :
            mukjjippaGame.gameOver ? 
              `🎯 게임 오버! ${mukjjippaGame.winner === 'player' ? '플레이어 승리!' : '컴퓨터 승리!'}` :
              '🎮 묵찌빠 게임을 시작하세요'
          }
        </Text>
      </View>

      {/* 묵찌빠 선택 버튼 */}
      <View style={styles.mukjjippaButtons}>
        <TouchableOpacity
          style={[styles.mukjjippaButton, mukjjippaGame.isPlaying && styles.mukjjippaButtonActive]}
          onPress={() => playMukjjippa('묵')}
          disabled={!mukjjippaGame.isPlaying || mukjjippaGame.gameOver}
        >
          <Text style={styles.mukjjippaButtonText}>✊</Text>
          <Text style={styles.mukjjippaButtonLabel}>묵</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.mukjjippaButton, mukjjippaGame.isPlaying && styles.mukjjippaButtonActive]}
          onPress={() => playMukjjippa('찌')}
          disabled={!mukjjippaGame.isPlaying || mukjjippaGame.gameOver}
        >
          <Text style={styles.mukjjippaButtonText}>✌️</Text>
          <Text style={styles.mukjjippaButtonLabel}>찌</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.mukjjippaButton, mukjjippaGame.isPlaying && styles.mukjjippaButtonActive]}
          onPress={() => playMukjjippa('빠')}
          disabled={!mukjjippaGame.isPlaying || mukjjippaGame.gameOver}
        >
          <Text style={styles.mukjjippaButtonText}>🖐️</Text>
          <Text style={styles.mukjjippaButtonLabel}>빠</Text>
        </TouchableOpacity>
      </View>

      {/* 결과 표시 */}
      {mukjjippaGame.result && (
        <View style={styles.mukjjippaResult}>
          <Text style={styles.resultText}>
            플레이어: {mukjjippaGame.playerChoice}
          </Text>
          <Text style={styles.resultText}>
            컴퓨터: {mukjjippaGame.computerChoice}
          </Text>
          <Text style={styles.resultGrade}>
            {mukjjippaGame.result === '승' ? '🎉 승리!' : 
             mukjjippaGame.result === '패' ? '😢 패배...' : 
             mukjjippaGame.result === '공격권 획득' ? '⚔️ 공격권 획득!' :
             mukjjippaGame.result === '공격권 상실' ? '🛡️ 공격권 상실' : '👔 무승부'}
          </Text>
        </View>
      )}

      {/* 게임 종료 시 결과 */}
      {mukjjippaGame.gameOver && (
        <View style={styles.mukjjippaGameOver}>
          <Text style={styles.gameOverTitle}>🏆 게임 종료!</Text>
          <Text style={styles.finalScore}>
            {mukjjippaGame.winner === 'player' ? '🎉 플레이어 승리!' : '😤 컴퓨터 승리!'}
          </Text>
          <Text style={styles.accuracy}>
            총 {mukjjippaGame.round}라운드 진행
          </Text>
          <Text style={styles.problemsSolved}>
            최종 공격자: {mukjjippaGame.attacker === 'player' ? '플레이어' : '컴퓨터'}
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
  mukjjippaGameStatus: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  mukjjippaStatItem: {
    alignItems: 'center',
  },
  mukjjippaStatLabel: {
    fontSize: 14,
    color: '#a0a0a0',
    marginBottom: 4,
  },
  mukjjippaStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
  },
  mukjjippaInstruction: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E74C3C',
  },
  instructionText: {
    fontSize: 16,
    color: '#E74C3C',
    textAlign: 'center',
    fontWeight: '600',
  },
  mukjjippaButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    width: '100%',
  },
  mukjjippaButton: {
    width: 80,
    height: 100,
    backgroundColor: '#333',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#555',
  },
  mukjjippaButtonActive: {
    borderColor: '#E74C3C',
    borderWidth: 3,
  },
  mukjjippaButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  mukjjippaButtonLabel: {
    fontSize: 12,
    color: '#a0a0a0',
    fontWeight: '600',
  },
  mukjjippaResult: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    borderWidth: 2,
    borderColor: '#E74C3C',
  },
  resultText: {
    fontSize: 18,
    color: '#e0e0e0',
    marginBottom: 5,
  },
  resultGrade: {
    fontSize: 16,
    color: '#E74C3C',
    fontWeight: 'bold',
    marginTop: 5,
    textAlign: 'center',
  },
  mukjjippaGameOver: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#E74C3C',
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

export default MukjjippaGame; 