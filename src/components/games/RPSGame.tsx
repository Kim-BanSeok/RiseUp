import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { BaseGameProps } from '../../types/gameTypes';
import { gameStyles, gameColors } from '../../styles/gameStyles';
import { useGameState } from '../../hooks/useGameState';
import GameContainer from '../common/GameContainer';
import GameStats from '../common/GameStats';
import GameInstruction from '../common/GameInstruction';
import GameButtons from '../common/GameButtons';
import GameResultComponent from '../common/GameResult';

interface RPSGameState {
  playerChoice: string | null;
  computerChoice: string | null;
  result: string | null;
  playerScore: number;
  computerScore: number;
  round: number;
  gameOver: boolean;
  isPlaying: boolean;
  attempts: number;
  wins: number;
  losses: number;
  draws: number;
}

const RPSGame: React.FC<BaseGameProps> = ({ onExit, onScore }) => {
  const initialState: RPSGameState = {
    playerChoice: null,
    computerChoice: null,
    result: null,
    playerScore: 0,
    computerScore: 0,
    round: 0,
    gameOver: false,
    isPlaying: true,
    attempts: 0,
    wins: 0,
    losses: 0,
    draws: 0
  };

  const { gameState, updateGameState, resetGame } = useGameState({
    initialState,
    onGameEnd: (finalState) => {
      const finalScore = finalState.playerScore >= 5 ? 100 : 20;
      onScore('가위바위보', finalScore);
    }
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
      isPlaying: gameState.isPlaying,
      gameOver: gameState.gameOver,
      round: gameState.round
    });
    
    if (!gameState.isPlaying || gameState.gameOver) {
      console.log('✂️ [가위바위보] 플레이 불가능');
      return;
    }
    
    const choices = ['가위', '바위', '보'];
    const computerChoice = choices[Math.floor(Math.random() * 3)];
    const result = getRpsResult(playerChoice, computerChoice);
    
    console.log('✂️ [가위바위보] 컴퓨터 선택:', computerChoice);
    console.log('✂️ [가위바위보] 결과:', result);
    
    let newPlayerScore = gameState.playerScore;
    let newComputerScore = gameState.computerScore;
    let newWins = gameState.wins;
    let newLosses = gameState.losses;
    let newDraws = gameState.draws;
    let gameOver = false;
    
    if (result === '승') {
      newPlayerScore++;
      newWins++;
      onScore('가위바위보', 10);
      console.log('✂️ [가위바위보] 플레이어 승리! 10점 획득');
    } else if (result === '패') {
      newComputerScore++;
      newLosses++;
      console.log('✂️ [가위바위보] 컴퓨터 승리');
    } else {
      newDraws++;
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
    
    updateGameState({
      playerChoice,
      computerChoice,
      result,
      playerScore: newPlayerScore,
      computerScore: newComputerScore,
      round: gameState.round + 1,
      gameOver,
      isPlaying: !gameOver,
      wins: newWins,
      losses: newLosses,
      draws: newDraws
    });
    
    // 다음 라운드를 위해 잠시 대기
    if (!gameOver) {
      console.log('✂️ [가위바위보] 2초 후 다음 라운드');
      setTimeout(() => {
        updateGameState({
          playerChoice: null,
          computerChoice: null,
          result: null
        });
      }, 2000);
    }
  };

  // 게임 시작
  const startGame = () => {
    console.log('✂️ [가위바위보] 게임 시작');
    updateGameState({
      ...initialState,
      attempts: gameState.attempts + 1,
      isPlaying: true
    });
  };

  // 게임 재시작
  const restartGame = () => {
    console.log('✂️ [가위바위보] 게임 재시작');
    resetGame({
      attempts: gameState.attempts
    });
  };

  // 새 게임 시작
  const startNewGame = () => {
    startGame();
  };

  // 게임 통계 데이터
  const getGameStats = () => {
    const totalGames = gameState.wins + gameState.losses + gameState.draws;
    const winRate = totalGames > 0 ? Math.round((gameState.wins / totalGames) * 100) : 0;
    
    return [
      { label: '플레이어', value: gameState.playerScore },
      { label: '컴퓨터', value: gameState.computerScore },
      { label: '라운드', value: gameState.round },
      { label: '승률', value: `${winRate}%` },
      { label: '상태', value: gameState.gameOver ? '종료' : gameState.isPlaying ? '진행중' : '대기' }
    ];
  };

  // 게임 인스트럭션 텍스트
  const getInstructionText = () => {
    if (gameState.gameOver) {
      const winner = gameState.playerScore >= 5 ? '플레이어' : '컴퓨터';
      return `🎯 게임 종료! ${winner} 승리! (${gameState.playerScore}:${gameState.computerScore})`;
    } else if (gameState.result && gameState.playerChoice && gameState.computerChoice) {
      const resultText = gameState.result === '승' ? '승리!' : gameState.result === '패' ? '패배!' : '무승부!';
      return `${gameState.playerChoice} vs ${gameState.computerChoice} - ${resultText}`;
    } else if (gameState.isPlaying) {
      return '✂️ 가위, 바위, 보 중 하나를 선택하세요!';
    } else {
      return '🎮 가위바위보 게임을 시작하세요!';
    }
  };

  // 게임 버튼 설정
  const getGameButtons = () => {
    const buttons = [];
    
    if (gameState.gameOver) {
      buttons.push({
        text: '다시 시작',
        onPress: startNewGame,
        style: 'primary' as const
      });
      buttons.push({
        text: '전체 재시작',
        onPress: restartGame,
        style: 'secondary' as const
      });
    } else if (!gameState.isPlaying && gameState.round === 0) {
      buttons.push({
        text: '시작하기',
        onPress: startNewGame,
        style: 'primary' as const
      });
    }
    
    buttons.push({
      text: '나가기',
      onPress: onExit,
      style: 'secondary' as const
    });
    
    return buttons;
  };

  // 선택지 이모지 매핑
  const getChoiceEmoji = (choice: string) => {
    switch (choice) {
      case '가위': return '✂️';
      case '바위': return '✊';
      case '보': return '🖐️';
      default: return '❓';
    }
  };

  // 선택지 버튼 스타일
  const getChoiceButtonStyle = (choice: string) => {
    const baseStyle: any[] = [{
      width: 80,
      height: 100,
      backgroundColor: '#333',
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: '#555',
      margin: 5
    }];
    
    if (gameState.playerChoice === choice) {
      baseStyle.push({ 
        backgroundColor: gameColors.rps,
        borderColor: gameColors.rps,
        borderWidth: 3
      });
    }
    
    return baseStyle;
  };

  return (
    <GameContainer title="✂️ 가위바위보">
      <GameStats stats={getGameStats()} />
      
      <GameInstruction 
        text={getInstructionText()} 
        gameColor={gameColors.rps} 
      />

      {/* 선택 결과 표시 */}
      {gameState.playerChoice && gameState.computerChoice && (
        <View style={gameStyles.gridContainer}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginBottom: 20 }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={[gameStyles.buttonText, { marginBottom: 10 }]}>플레이어</Text>
              <View style={[gameStyles.gameChoiceButtons, { backgroundColor: gameColors.rps }]}>
                <Text style={{ fontSize: 40 }}>{getChoiceEmoji(gameState.playerChoice)}</Text>
              </View>
            </View>
            
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Text style={[gameStyles.buttonText, { fontSize: 20 }]}>VS</Text>
            </View>
            
            <View style={{ alignItems: 'center' }}>
              <Text style={[gameStyles.buttonText, { marginBottom: 10 }]}>컴퓨터</Text>
              <View style={[gameStyles.gameChoiceButtons, { backgroundColor: '#666' }]}>
                <Text style={{ fontSize: 40 }}>{getChoiceEmoji(gameState.computerChoice)}</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* 가위바위보 선택 버튼 */}
      {gameState.isPlaying && !gameState.gameOver && !gameState.result && (
        <View style={gameStyles.gridContainer}>
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-evenly', 
            alignItems: 'center',
            width: '100%',
            paddingHorizontal: 20,
            maxWidth: 350
          }}>
            {['가위', '바위', '보'].map(choice => (
              <TouchableOpacity
                key={choice}
                style={getChoiceButtonStyle(choice)}
                onPress={() => playRps(choice)}
                disabled={!gameState.isPlaying || gameState.gameOver}
              >
                <Text style={{ fontSize: 40, marginBottom: 8 }}>
                  {getChoiceEmoji(choice)}
                </Text>
                <Text style={gameStyles.buttonText}>{choice}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {gameState.gameOver && (
        <GameResultComponent
          result={{
            score: gameState.playerScore >= 5 ? 100 : 20,
            message: gameState.playerScore >= 5 ? '5승 달성!' : '아쉽게 패배!',
            isWin: gameState.playerScore >= 5
          }}
          gameColor={gameColors.rps}
          additionalInfo={[
            { label: '최종 점수', value: `${gameState.playerScore} : ${gameState.computerScore}` },
            { label: '승-무-패', value: `${gameState.wins}-${gameState.draws}-${gameState.losses}` },
            { label: '총 라운드', value: gameState.round.toString() }
          ]}
        />
      )}

      <GameButtons buttons={getGameButtons()} />
    </GameContainer>
  );
};

export default RPSGame; 