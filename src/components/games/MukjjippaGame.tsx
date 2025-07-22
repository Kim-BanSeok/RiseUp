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
  attempts: number;
  attackerWins: number;
  defenderWins: number;
}

const MukjjippaGame: React.FC<BaseGameProps> = ({ onExit, onScore }) => {
  const initialState: MukjjippaGameState = {
    playerChoice: null,
    computerChoice: null,
    attacker: null,
    result: null,
    gameOver: false,
    winner: null,
    round: 0,
    isPlaying: true,
    playerScore: 0,
    computerScore: 0,
    attempts: 0,
    attackerWins: 0,
    defenderWins: 0
  };

  const { gameState, updateGameState, resetGame } = useGameState({
    initialState,
    onGameEnd: (finalState) => {
      const finalScore = finalState.winner === 'player' ? 100 : 20;
      onScore('묵찌빠', finalScore);
    }
  });

  // 묵찌빠 결과 계산 (가위바위보 규칙)
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
      isPlaying: gameState.isPlaying,
      gameOver: gameState.gameOver,
      attacker: gameState.attacker,
      round: gameState.round
    });
    
    if (!gameState.isPlaying || gameState.gameOver) {
      console.log('👊 [묵찌빠] 플레이 불가능');
      return;
    }
    
    const choices = ['묵', '찌', '빠'];
    const computerChoice = choices[Math.floor(Math.random() * 3)];
    
    let newAttacker = gameState.attacker;
    let gameOver = false;
    let winner = null;
    let result = '무';
    
    console.log('👊 [묵찌빠] 컴퓨터 선택:', computerChoice);
    
    // 같은 것을 냈을 때
    if (playerChoice === computerChoice) {
      console.log('👊 [묵찌빠] 같은 선택!');
      if (gameState.attacker === 'player') {
        // 플레이어가 공격자인 상태에서 같은 것을 내면 플레이어 승리
        gameOver = true;
        winner = 'player';
        result = '승리! (공격 성공)';
        console.log('👊 [묵찌빠] 플레이어 승리! 100점 획득');
        onScore('묵찌빠', 100);
      } else if (gameState.attacker === 'computer') {
        // 컴퓨터가 공격자인 상태에서 같은 것을 내면 컴퓨터 승리
        gameOver = true;
        winner = 'computer';
        result = '패배! (공격 당함)';
        console.log('👊 [묵찌빠] 컴퓨터 승리! 20점 참가상');
        onScore('묵찌빠', 20);
      } else {
        // 첫 판에서 같은 것을 내면 다시
        result = '무승부 (다시)';
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
    
    const newPlayerScore = gameState.playerScore + (winner === 'player' ? 1 : 0);
    const newComputerScore = gameState.computerScore + (winner === 'computer' ? 1 : 0);
    const newAttackerWins = gameState.attackerWins + (winner === gameState.attacker ? 1 : 0);
    const newDefenderWins = gameState.defenderWins + (winner && winner !== gameState.attacker ? 1 : 0);
    
    updateGameState({
      playerChoice,
      computerChoice,
      attacker: newAttacker,
      result,
      gameOver,
      winner,
      round: gameState.round + 1,
      isPlaying: !gameOver,
      playerScore: newPlayerScore,
      computerScore: newComputerScore,
      attackerWins: newAttackerWins,
      defenderWins: newDefenderWins
    });
    
    // 게임이 끝나지 않았으면 다음 라운드를 위해 잠시 대기
    if (!gameOver) {
      console.log('👊 [묵찌빠] 2.5초 후 다음 라운드');
      setTimeout(() => {
        updateGameState({
          playerChoice: null,
          computerChoice: null,
          result: null
        });
      }, 2500);
    }
  };

  // 게임 시작
  const startGame = () => {
    console.log('👊 [묵찌빠] 게임 시작');
    updateGameState({
      ...initialState,
      attempts: gameState.attempts + 1,
      isPlaying: true
    });
  };

  // 게임 재시작
  const restartGame = () => {
    console.log('👊 [묵찌빠] 게재시작');
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
    return [
      { label: '플레이어', value: gameState.playerScore },
      { label: '컴퓨터', value: gameState.computerScore },
      { label: '공격자', value: gameState.attacker === 'player' ? '플레이어' : gameState.attacker === 'computer' ? '컴퓨터' : '미정' },
      { label: '라운드', value: gameState.round },
      { label: '상태', value: gameState.gameOver ? '종료' : gameState.isPlaying ? '진행중' : '대기' }
    ];
  };

  // 게임 인스트럭션 텍스트
  const getInstructionText = () => {
    if (gameState.gameOver) {
      const winner = gameState.winner === 'player' ? '플레이어' : '컴퓨터';
      return `🎯 게임 종료! ${winner} 승리!`;
    } else if (gameState.result && gameState.playerChoice && gameState.computerChoice) {
      return `${gameState.playerChoice} vs ${gameState.computerChoice} - ${gameState.result}`;
    } else if (gameState.isPlaying) {
      if (gameState.attacker === 'player') {
        return '👊 공격자입니다! 같은 것을 내서 승리하세요!';
      } else if (gameState.attacker === 'computer') {
        return '🛡️ 수비자입니다! 다른 것을 내서 공격권을 빼앗으세요!';
      } else {
        return '🎯 첫 판! 가위바위보로 공격권을 정하세요!';
      }
    } else {
      return '🎮 묵찌빠 게임을 시작하세요!';
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
      case '묵': return '✊';
      case '찌': return '✌️';
      case '빠': return '🖐️';
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
        backgroundColor: gameColors.mukjjippa,
        borderColor: gameColors.mukjjippa,
        borderWidth: 3
      });
    }
    
    return baseStyle;
  };

  return (
    <GameContainer title="👊 묵찌빠">
      <GameStats stats={getGameStats()} />
      
      <GameInstruction 
        text={getInstructionText()} 
        gameColor={gameColors.mukjjippa} 
      />

      {/* 공격자 표시 */}
      {gameState.attacker && (
        <View style={gameStyles.gridContainer}>
          <View style={[gameStyles.inputDisplay, { backgroundColor: gameColors.mukjjippa }]}>
            <Text style={[gameStyles.inputText, { color: 'white' }]}>
              {gameState.attacker === 'player' ? '🎯 플레이어 공격차례' : '🛡️ 컴퓨터 공격차례'}
            </Text>
          </View>
        </View>
      )}

      {/* 선택 결과 표시 */}
      {gameState.playerChoice && gameState.computerChoice && (
        <View style={gameStyles.gridContainer}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginBottom: 20 }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={[gameStyles.buttonText, { marginBottom: 10 }]}>플레이어</Text>
              <View style={[
                gameStyles.gameChoiceButtons, 
                { 
                  backgroundColor: gameState.attacker === 'player' ? gameColors.mukjjippa : '#555',
                  borderColor: gameState.attacker === 'player' ? gameColors.mukjjippa : '#777',
                  borderWidth: 2
                }
              ]}>
                <Text style={{ fontSize: 40 }}>{getChoiceEmoji(gameState.playerChoice)}</Text>
              </View>
            </View>
            
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Text style={[gameStyles.buttonText, { fontSize: 20 }]}>VS</Text>
            </View>
            
            <View style={{ alignItems: 'center' }}>
              <Text style={[gameStyles.buttonText, { marginBottom: 10 }]}>컴퓨터</Text>
              <View style={[
                gameStyles.gameChoiceButtons, 
                { 
                  backgroundColor: gameState.attacker === 'computer' ? gameColors.mukjjippa : '#555',
                  borderColor: gameState.attacker === 'computer' ? gameColors.mukjjippa : '#777',
                  borderWidth: 2
                }
              ]}>
                <Text style={{ fontSize: 40 }}>{getChoiceEmoji(gameState.computerChoice)}</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* 묵찌빠 선택 버튼 */}
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
            {['묵', '찌', '빠'].map(choice => (
              <TouchableOpacity
                key={choice}
                style={getChoiceButtonStyle(choice)}
                onPress={() => playMukjjippa(choice)}
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

      {/* 게임 규칙 설명 */}
      {!gameState.isPlaying && gameState.round === 0 && (
        <View style={[gameStyles.inputDisplay, { backgroundColor: '#1a1a1a', marginTop: 20 }]}>
          <Text style={[gameStyles.inputText, { fontSize: 14, textAlign: 'center' }]}>
            💡 묵찌빠 규칙{'\n'}
            1️⃣ 가위바위보로 공격권 결정{'\n'}
            2️⃣ 공격자가 같은 것을 내면 승리{'\n'}
            3️⃣ 수비자가 이기면 공격권 이동
          </Text>
        </View>
      )}

      {gameState.gameOver && (
        <GameResultComponent
          result={{
            score: gameState.winner === 'player' ? 100 : 20,
            message: gameState.winner === 'player' ? '공격 성공!' : '공격 실패!',
            isWin: gameState.winner === 'player'
          }}
          gameColor={gameColors.mukjjippa}
          additionalInfo={[
            { label: '최종 점수', value: `${gameState.playerScore} : ${gameState.computerScore}` },
            { label: '공격 성공', value: gameState.attackerWins.toString() },
            { label: '총 라운드', value: gameState.round.toString() }
          ]}
        />
      )}

      <GameButtons buttons={getGameButtons()} />
    </GameContainer>
  );
};

export default MukjjippaGame; 