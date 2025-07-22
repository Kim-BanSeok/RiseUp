import React, { useState } from 'react';
import { BaseGameProps } from '../../types/gameTypes';
import { gameColors } from '../../styles/gameStyles';
import { useBingoGame } from '../../hooks/useBingoGame';
import CustomAlert from '../CustomAlert';
import GameContainer from '../common/GameContainer';
import GameStats from '../common/GameStats';
import GameInstruction from '../common/GameInstruction';
import GameButtons from '../common/GameButtons';
import GameResultComponent from '../common/GameResult';
import BingoBoard from './bingo/BingoBoard';
import BoardSetup from './bingo/BoardSetup';
import NumberInputModal from './bingo/NumberInputModal';

const BingoGame: React.FC<BaseGameProps> = ({ onExit, onScore }) => {
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    buttons: [] as Array<{
      text: string;
      style?: 'default' | 'cancel' | 'destructive';
      onPress?: () => void;
    }>
  });

  const showCustomAlert = (
    title: string,
    message: string,
    buttons: Array<{
      text: string;
      style?: 'default' | 'cancel' | 'destructive';
      onPress?: () => void;
    }>
  ) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      buttons: buttons.map(button => ({
        ...button,
        onPress: () => {
          setAlertConfig(prev => ({ ...prev, visible: false }));
          if (button.onPress) {
            button.onPress();
          }
        }
      }))
    });
  };

  const {
    gameState,
    selectBoardSize,
    startWithDefaults,
    handleNumberInput,
    handleNumberBackspace,
    confirmNumber,
    completeSetup,
    selectSetupCell,
    closeInputModal,
    handleCellClick,
    restartGame
  } = useBingoGame({ onScore, showCustomAlert });

  // 게임 통계 데이터 생성
  const getGameStats = () => {
    if (gameState.isSetupPhase) {
      return [
        { label: '보드 크기', value: `${gameState.boardSize}×${gameState.boardSize}` },
        { label: '설정 단계', value: gameState.isSizeSelection ? '크기 선택' : '번호 입력' },
        { label: '진행률', value: gameState.isSizeSelection ? '0%' : `${Math.round((gameState.setupIndex / (gameState.boardSize * gameState.boardSize)) * 100)}%` }
      ];
    }
    
    return [
      { label: '보드 크기', value: `${gameState.boardSize}×${gameState.boardSize}` },
      { label: '플레이어', value: `${gameState.playerLines}/${gameState.boardSize * gameState.boardSize}` },
      { label: '컴퓨터', value: `${gameState.computerLines}/${gameState.boardSize * gameState.boardSize}` },
      { label: '현재 턴', value: gameState.currentTurn === 'player' ? '🙋‍♂️' : '🤖' }
    ];
  };

  // 게임 인스트럭션 텍스트 생성
  const getInstructionText = () => {
    if (gameState.isSetupPhase) {
      return gameState.isSizeSelection ? 
        '원하는 빙고판 크기를 선택하세요!' : 
        '빙고 번호를 설정하거나 기본 설정으로 시작하세요!';
    }
    
    if (gameState.gameOver) {
      return `🎯 게임 종료! ${gameState.winner === 'player' ? 
        '플레이어가 모든 칸을 먼저 채웠습니다!' : 
        '컴퓨터가 모든 칸을 먼저 채웠습니다!'}`;
    }
    
    return gameState.currentTurn === 'player' ? 
      '🎮 숫자를 선택하여 모든 칸을 채우세요!' :
      '⏳ 컴퓨터가 선택 중입니다...';
  };

  // 게임 버튼 구성
  const getGameButtons = () => {
    const buttons = [];
    
    if (gameState.gameOver) {
      buttons.push({
        text: '다시 시작',
        onPress: restartGame,
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

  return (
    <GameContainer title="🎯 빙고 대전">
      <GameStats stats={getGameStats()} />
      
      <GameInstruction 
        text={getInstructionText()} 
        gameColor={gameColors.bingo} 
      />

      {gameState.isSetupPhase ? (
        <BoardSetup
          phase={gameState.isSizeSelection ? 'size' : 'numbers'}
          boardSize={gameState.boardSize}
          setupNumbers={gameState.setupNumbers}
          setupIndex={gameState.setupIndex}
          selectedSetupIndex={gameState.selectedSetupIndex}
          currentInputNumber={gameState.currentInputNumber}
          onSizeSelect={selectBoardSize}
          onNumberInput={handleNumberInput}
          onNumberConfirm={confirmNumber}
          onNumberBackspace={handleNumberBackspace}
          onCellSelect={selectSetupCell}
          onStartWithDefaults={startWithDefaults}
          onCompleteSetup={completeSetup}
        />
      ) : (
        <>
          <BingoBoard
            title="🙋‍♂️ 플레이어 보드"
            board={gameState.board}
            boardSize={gameState.boardSize}
            onCellPress={handleCellClick}
            disabled={gameState.gameOver || gameState.currentTurn !== 'player'}
            filledCount={gameState.playerLines}
            totalCount={gameState.boardSize * gameState.boardSize}
            cellSize={Math.max(25, Math.min(40, 300 / gameState.boardSize))}
          />

          <BingoBoard
            title="🤖 컴퓨터 보드"
            board={gameState.computerBoard}
            boardSize={gameState.boardSize}
            disabled={true}
            filledCount={gameState.computerLines}
            totalCount={gameState.boardSize * gameState.boardSize}
            cellSize={Math.max(25, Math.min(40, 300 / gameState.boardSize))}
          />

          {gameState.gameOver && (
            <GameResultComponent
              result={{
                score: gameState.winner === 'player' ? 500 : 100,
                message: gameState.winner === 'player' ? 
                  '모든 칸을 먼저 채웠습니다!' : 
                  '컴퓨터가 먼저 완성했습니다',
                isWin: gameState.winner === 'player'
              }}
              gameColor={gameColors.bingo}
              additionalInfo={[
                { label: '플레이어', value: `${gameState.playerLines}/${gameState.boardSize * gameState.boardSize}` },
                { label: '컴퓨터', value: `${gameState.computerLines}/${gameState.boardSize * gameState.boardSize}` }
              ]}
            />
          )}
        </>
      )}

      <GameButtons buttons={getGameButtons()} />
      
      <NumberInputModal
        visible={gameState.isInputModalVisible}
        currentNumber={gameState.currentInputNumber}
        cellIndex={gameState.selectedSetupIndex}
        boardSize={gameState.boardSize}
        onNumberInput={handleNumberInput}
        onBackspace={handleNumberBackspace}
        onConfirm={confirmNumber}
        onClose={closeInputModal}
      />
      
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
      />
    </GameContainer>
  );
};

export default BingoGame; 