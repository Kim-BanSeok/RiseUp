import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

interface BingoGameProps {
  onExit: () => void;
  onScore: (game: string, score: number) => void;
}

interface BingoCell {
  number: number;
  selected: boolean;
  selectedBy: 'player' | 'computer' | null;
  index: number;
}

interface BingoGameState {
  boardSize: number;
  board: BingoCell[];
  computerBoard: BingoCell[];
  completedLines: string[];
  gameOver: boolean;
  score: number;
  isSetupPhase: boolean;
  isSizeSelection: boolean;
  currentTurn: 'player' | 'computer';
  playerLines: number;
  computerLines: number;
  winner: string | null;
  setupNumbers: string[];
  setupIndex: number;
  currentInputNumber: string;
  isAllBingo: boolean;
}

const BingoGame: React.FC<BingoGameProps> = ({ onExit, onScore }) => {
  const [bingoGame, setBingoGame] = useState<BingoGameState>({
    boardSize: 5,
    board: Array(25).fill(null).map((_, i) => ({
      number: i + 1,
      selected: false,
      selectedBy: null,
      index: i
    })),
    computerBoard: Array(25).fill(null).map((_, i) => ({
      number: Math.floor(Math.random() * 50) + 1,
      selected: false,
      selectedBy: null,
      index: i
    })),
    completedLines: [],
    gameOver: false,
    score: 0,
    isSetupPhase: true,
    isSizeSelection: true,
    currentTurn: 'player',
    playerLines: 0,
    computerLines: 0,
    winner: null,
    setupNumbers: Array(25).fill('').map((_, i) => (i + 1).toString()),
    setupIndex: 0,
    currentInputNumber: '',
    isAllBingo: false
  });

  // 모든 칸 채우기 체크
  const checkAllCellsFilled = (board: BingoCell[]) => {
    const allFilled = board.every(cell => cell.selected);
    console.log('🔍 [빙고] 모든 칸 채우기 체크:', {
      totalCells: board.length,
      filledCells: board.filter(cell => cell.selected).length,
      allFilled,
      boardData: board.map((cell, index) => ({
        index,
        number: cell.number,
        selected: cell.selected,
        selectedBy: cell.selectedBy
      }))
    });
    return allFilled;
  };

  // 보드 크기 선택
  const selectBoardSize = (size: number) => {
    console.log('📏 [빙고] 보드 크기 선택:', size);
    const totalCells = size * size;
    console.log('📏 [빙고] 총 셀 수:', totalCells);
    
    const newBingoState = {
      ...bingoGame,
      boardSize: size,
      board: Array(totalCells).fill(null).map((_, i) => ({
        number: i + 1,
        selected: false,
        selectedBy: null as 'player' | 'computer' | null,
        index: i
      })),
      computerBoard: Array(totalCells).fill(null).map((_, i) => ({
        number: Math.floor(Math.random() * (totalCells * 2)) + 1,
        selected: false,
        selectedBy: null as 'player' | 'computer' | null,
        index: i
      })),
      setupNumbers: Array(totalCells).fill('').map((_, i) => (i + 1).toString()),
      setupIndex: 0,
      isSizeSelection: false,
      isSetupPhase: true
    };
    
    console.log('📏 [빙고] 새로운 보드 상태:', {
      boardSize: newBingoState.boardSize,
      playerBoard: newBingoState.board.map(cell => cell.number),
      computerBoard: newBingoState.computerBoard.map(cell => cell.number),
      setupNumbers: newBingoState.setupNumbers
    });
    
    setBingoGame(newBingoState);
  };

  // 기본 설정으로 바로 시작
  const startWithDefaults = () => {
    console.log('🚀 [빙고] 기본 설정으로 시작');
    const totalCells = bingoGame.boardSize * bingoGame.boardSize;
    console.log('🚀 [빙고] 기본 설정 데이터:', {
      boardSize: bingoGame.boardSize,
      totalCells
    });
    
    const newBoard = Array(totalCells).fill(null).map((_, i) => ({
      number: i + 1,
      selected: false,
      selectedBy: null as 'player' | 'computer' | null,
      index: i
    }));
    
    console.log('🚀 [빙고] 기본 플레이어 보드:', newBoard.map(cell => cell.number));
    
    setBingoGame(prev => ({
      ...prev,
      board: newBoard,
      isSetupPhase: false,
      currentTurn: 'player'
    }));
    
    console.log('🚀 [빙고] 기본 설정 완료, 게임 시작!');
  };

  // 숫자 입력 처리
  const handleBingoNumberInput = (digit: string) => {
    console.log('🔢 [빙고] 숫자 입력:', digit);
    console.log('🔢 [빙고] 현재 입력 상태:', {
      currentInput: bingoGame.currentInputNumber,
      length: bingoGame.currentInputNumber.length
    });
    
    if (bingoGame.currentInputNumber.length >= 2) {
      console.log('🔢 [빙고] 입력 제한 - 최대 2자리');
      return;
    }
    
    const newInput = bingoGame.currentInputNumber + digit;
    console.log('🔢 [빙고] 새로운 입력값:', newInput);
    
    setBingoGame(prev => ({
      ...prev,
      currentInputNumber: newInput
    }));
  };

  // 백스페이스
  const handleBingoBackspace = () => {
    console.log('⌫ [빙고] 백스페이스');
    console.log('⌫ [빙고] 현재 입력:', bingoGame.currentInputNumber);
    
    const newInput = bingoGame.currentInputNumber.slice(0, -1);
    console.log('⌫ [빙고] 백스페이스 후:', newInput);
    
    setBingoGame(prev => ({
      ...prev,
      currentInputNumber: newInput
    }));
  };

  // 숫자 확정
  const confirmBingoNumber = () => {
    console.log('✅ [빙고] 숫자 확정 시도');
    console.log('✅ [빙고] 현재 상태:', {
      setupIndex: bingoGame.setupIndex,
      maxIndex: bingoGame.boardSize * bingoGame.boardSize,
      currentInput: bingoGame.currentInputNumber
    });
    
    if (bingoGame.setupIndex >= bingoGame.boardSize * bingoGame.boardSize) {
      console.log('✅ [빙고] 확정 실패 - 설정 완료됨');
      return;
    }
    if (!bingoGame.currentInputNumber) {
      console.log('✅ [빙고] 확정 실패 - 입력값 없음');
      return;
    }
    
    const newNumber = bingoGame.currentInputNumber;
    const existingNumbers = bingoGame.setupNumbers.slice(0, bingoGame.setupIndex);
    console.log('✅ [빙고] 중복 체크:', {
      newNumber,
      existingNumbers,
      isDuplicate: existingNumbers.includes(newNumber)
    });
    
    if (existingNumbers.includes(newNumber)) {
      console.log('✅ [빙고] 확정 실패 - 중복된 숫자');
      setBingoGame(prev => ({
        ...prev,
        currentInputNumber: ''
      }));
      return;
    }
    
    const newSetupNumbers = [...bingoGame.setupNumbers];
    newSetupNumbers[bingoGame.setupIndex] = bingoGame.currentInputNumber;
    
    console.log('✅ [빙고] 숫자 확정 성공:', {
      index: bingoGame.setupIndex,
      number: bingoGame.currentInputNumber,
      newSetupNumbers
    });
    
    setBingoGame(prev => ({
      ...prev,
      setupNumbers: newSetupNumbers,
      setupIndex: prev.setupIndex + 1,
      currentInputNumber: ''
    }));
  };

  // 설정 완료
  const completeBingoSetup = () => {
    console.log('🏁 [빙고] 설정 완료 시작');
    const totalCells = bingoGame.boardSize * bingoGame.boardSize;
    const numbers = bingoGame.setupNumbers.map(num => parseInt(num) || 1);
    console.log('🏁 [빙고] 설정 완료 데이터:', {
      totalCells,
      setupNumbers: bingoGame.setupNumbers,
      parsedNumbers: numbers
    });
    
    const newBoard = Array(totalCells).fill(null).map((_, i) => ({
      number: numbers[i],
      selected: false,
      selectedBy: null as 'player' | 'computer' | null,
      index: i
    }));
    
    console.log('🏁 [빙고] 새로운 플레이어 보드:', newBoard.map(cell => cell.number));
    
    setBingoGame(prev => ({
      ...prev,
      board: newBoard,
      isSetupPhase: false,
      currentTurn: 'player'
    }));
    
    console.log('🏁 [빙고] 설정 완료, 게임 시작!');
  };

  // 플레이어 클릭 처리
  const handleBingoClick = (index: number) => {
    console.log('🎯 [빙고] 플레이어 클릭 - 인덱스:', index);
    console.log('🎯 [빙고] 현재 게임 상태:', {
      gameOver: bingoGame.gameOver,
      isSetupPhase: bingoGame.isSetupPhase,
      currentTurn: bingoGame.currentTurn,
      cellSelected: bingoGame.board[index]?.selected
    });
    
    if (bingoGame.gameOver || bingoGame.isSetupPhase || bingoGame.currentTurn !== 'player') {
      console.log('🎯 [빙고] 클릭 무시됨 - 조건 미충족');
      return;
    }
    if (bingoGame.board[index].selected) {
      console.log('🎯 [빙고] 클릭 무시됨 - 이미 선택된 칸');
      return;
    }
    
    const selectedNumber = bingoGame.board[index].number;
    console.log('🎯 [빙고] 선택된 숫자:', selectedNumber);
    
    const newPlayerBoard = [...bingoGame.board];
    newPlayerBoard[index].selected = true;
    newPlayerBoard[index].selectedBy = 'player';
    console.log('🎯 [빙고] 플레이어 보드 업데이트 완료');
    
    const newComputerBoard = [...bingoGame.computerBoard];
    const computerMatchIndex = newComputerBoard.findIndex(cell => 
      cell.number === selectedNumber && !cell.selected
    );
    console.log('🎯 [빙고] 컴퓨터 보드에서 매치된 인덱스:', computerMatchIndex);
    if (computerMatchIndex !== -1) {
      newComputerBoard[computerMatchIndex].selected = true;
      newComputerBoard[computerMatchIndex].selectedBy = 'player';
      console.log('🎯 [빙고] 컴퓨터 보드 업데이트 완료');
    }
    
    const playerAllFilled = checkAllCellsFilled(newPlayerBoard);
    const computerAllFilled = checkAllCellsFilled(newComputerBoard);
    console.log('🎯 [빙고] 모든 칸 채우기 체크:', {
      playerAllFilled,
      computerAllFilled
    });
    
    const playerWins = playerAllFilled;
    const computerWins = computerAllFilled;
    
    const playerFilledCount = newPlayerBoard.filter(cell => cell.selected).length;
    const computerFilledCount = newComputerBoard.filter(cell => cell.selected).length;
    console.log('🎯 [빙고] 선택된 칸 수:', {
      player: playerFilledCount,
      computer: computerFilledCount
    });
    
    const newGameState = {
      ...bingoGame,
      board: newPlayerBoard,
      computerBoard: newComputerBoard,
      completedLines: playerWins ? ['모든 칸 완성!'] : [],
      playerLines: playerFilledCount,
      computerLines: computerFilledCount,
      gameOver: playerWins || computerWins,
      winner: playerWins ? 'player' : computerWins ? 'computer' : null,
      currentTurn: (playerWins || computerWins ? 'player' : 'computer') as 'player' | 'computer',
      isAllBingo: playerWins || computerWins
    };
    console.log('🎯 [빙고] 새로운 게임 상태:', newGameState);
    
    setBingoGame(newGameState);
    
    if (playerWins) {
      console.log('🎯 [빙고] 플레이어 승리! 500점 획득');
      onScore('빙고', 500);
    } else if (!computerWins) {
      console.log('🎯 [빙고] 컴퓨터 턴으로 전환, 1.5초 후 자동 플레이');
      setTimeout(() => {
        handleComputerTurn(newPlayerBoard, newComputerBoard);
      }, 1500);
    }
  };

  // 컴퓨터 턴 처리
  const handleComputerTurn = (currentPlayerBoard: BingoCell[], currentComputerBoard: BingoCell[]) => {
    console.log('🤖 [빙고] 컴퓨터 턴 시작');
    console.log('🤖 [빙고] 현재 보드 상태:', {
      playerBoardCells: currentPlayerBoard.length,
      computerBoardCells: currentComputerBoard.length,
      gameOver: bingoGame.gameOver
    });
    
    if (bingoGame.gameOver) {
      console.log('🤖 [빙고] 컴퓨터 턴 취소 - 게임 종료됨');
      return;
    }
    
    const availableCells = currentComputerBoard
      .map((cell, index) => ({ ...cell, index }))
      .filter(cell => !cell.selected);
    
    console.log('🤖 [빙고] 선택 가능한 칸 수:', availableCells.length);
    
    if (availableCells.length === 0) {
      console.log('🤖 [빙고] 선택 가능한 칸이 없음');
      return;
    }
    
    const randomIndex = Math.floor(Math.random() * availableCells.length);
    const selectedCell = availableCells[randomIndex];
    const selectedNumber = selectedCell.number;
    
    console.log('🤖 [빙고] 컴퓨터가 선택한 칸:', {
      index: selectedCell.index,
      number: selectedNumber,
      availableCount: availableCells.length,
      randomIndex
    });
    
    const newComputerBoard = [...currentComputerBoard];
    newComputerBoard[selectedCell.index].selected = true;
    newComputerBoard[selectedCell.index].selectedBy = 'computer';
    console.log('🤖 [빙고] 컴퓨터 보드 업데이트 완료');
    
    const newPlayerBoard = [...currentPlayerBoard];
    const playerMatchIndex = newPlayerBoard.findIndex(cell => 
      cell.number === selectedNumber && !cell.selected
    );
    console.log('🤖 [빙고] 플레이어 보드에서 매치된 인덱스:', playerMatchIndex);
    if (playerMatchIndex !== -1) {
      newPlayerBoard[playerMatchIndex].selected = true;
      newPlayerBoard[playerMatchIndex].selectedBy = 'computer';
      console.log('🤖 [빙고] 플레이어 보드 업데이트 완료');
    }
    
    const playerAllFilled = checkAllCellsFilled(newPlayerBoard);
    const computerAllFilled = checkAllCellsFilled(newComputerBoard);
    console.log('🤖 [빙고] 모든 칸 채우기 체크:', {
      playerAllFilled,
      computerAllFilled
    });
    
    const playerWins = playerAllFilled;
    const computerWins = computerAllFilled;
    
    const playerFilledCount = newPlayerBoard.filter(cell => cell.selected).length;
    const computerFilledCount = newComputerBoard.filter(cell => cell.selected).length;
    console.log('🤖 [빙고] 선택된 칸 수:', {
      player: playerFilledCount,
      computer: computerFilledCount
    });
    
    const newGameState = {
      ...bingoGame,
      board: newPlayerBoard,
      computerBoard: newComputerBoard,
      completedLines: computerWins ? ['모든 칸 완성!'] : [],
      playerLines: playerFilledCount,
      computerLines: computerFilledCount,
      gameOver: playerWins || computerWins,
      winner: playerWins ? 'player' : computerWins ? 'computer' : null,
      currentTurn: (playerWins || computerWins ? 'computer' : 'player') as 'player' | 'computer',
      isAllBingo: playerWins || computerWins
    };
    console.log('🤖 [빙고] 새로운 게임 상태:', newGameState);
    
    setBingoGame(newGameState);
    
    if (computerWins) {
      console.log('🤖 [빙고] 컴퓨터 승리! 100점 참가상');
      onScore('빙고', 100);
    } else {
      console.log('🤖 [빙고] 컴퓨터 턴 완료, 플레이어 턴으로 전환');
    }
  };

  // 게임 재시작
  const restartGame = () => {
    console.log('🔄 [빙고] 게임 재시작');
    setBingoGame({
      boardSize: 5,
      board: Array(25).fill(null).map((_, i) => ({
        number: i + 1,
        selected: false,
        selectedBy: null,
        index: i
      })),
      computerBoard: Array(25).fill(null).map((_, i) => ({
        number: Math.floor(Math.random() * 50) + 1,
        selected: false,
        selectedBy: null,
        index: i
      })),
      completedLines: [],
      gameOver: false,
      score: 0,
      isSetupPhase: true,
      isSizeSelection: true,
      currentTurn: 'player',
      playerLines: 0,
      computerLines: 0,
      winner: null,
      setupNumbers: Array(25).fill('').map((_, i) => (i + 1).toString()),
      setupIndex: 0,
      currentInputNumber: '',
      isAllBingo: false
    });
  };

  return (
    <ScrollView 
      style={styles.gameContainer}
      contentContainerStyle={styles.gameScrollContent}
      showsVerticalScrollIndicator={true}
    >
      <Text style={styles.gameTitle}>🎯 빙고 대전</Text>
      
      {bingoGame.isSizeSelection ? (
        <>
          <View style={styles.sizeSelectionHeader}>
            <Text style={styles.sizeSelectionTitle}>빙고판 크기 선택</Text>
            <Text style={styles.sizeSelectionSubtitle}>원하는 크기를 선택하세요</Text>
          </View>
          
          <View style={styles.sizeOptions}>
            {[5, 6, 7].map(size => (
              <TouchableOpacity
                key={size}
                style={styles.sizeOptionButton}
                onPress={() => selectBoardSize(size)}
              >
                <Text style={styles.sizeOptionText}>{size}×{size}</Text>
                <Text style={styles.sizeOptionDesc}>
                  {size === 5 ? '클래식' : size === 6 ? '중급' : '고급'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      ) : bingoGame.isSetupPhase ? (
        <>
          <View style={styles.bingoSetupHeader}>
            <Text style={styles.bingoSetupTitle}>
              빙고 번호 설정 ({bingoGame.boardSize}×{bingoGame.boardSize})
            </Text>
            <Text style={styles.bingoSetupProgress}>
              {bingoGame.setupIndex + 1} / {bingoGame.boardSize * bingoGame.boardSize}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.defaultStartButton} 
            onPress={startWithDefaults}
          >
            <Text style={styles.defaultStartText}>🚀 기본 설정으로 바로 시작</Text>
          </TouchableOpacity>
          
          <View style={[styles.dynamicBingoBoard, { width: bingoGame.boardSize * 36 }]}>
            {Array(bingoGame.boardSize * bingoGame.boardSize).fill(null).map((_, index) => {
              console.log(`🎨 [빙고] 렌더링 셀 ${index}:`, {
                setupNumber: bingoGame.setupNumbers[index],
                defaultNumber: index + 1,
                isActive: index === bingoGame.setupIndex,
                isFilled: !!bingoGame.setupNumbers[index]
              });
              
              return (
                <View
                  key={index}
                  style={[
                    styles.dynamicBingoCell,
                    index === bingoGame.setupIndex && styles.bingoCellActive,
                    bingoGame.setupNumbers[index] && styles.bingoCellFilled
                  ]}
                >
                  <Text style={styles.dynamicBingoCellText}>
                    {bingoGame.setupNumbers[index] || (index + 1)}
                  </Text>
                </View>
              );
            })}
          </View>

          <View style={styles.duplicateWarning}>
            <Text style={styles.duplicateWarningText}>
              ⚠️ 중복된 숫자는 입력할 수 없습니다
            </Text>
          </View>

          <View style={styles.compactInputSection}>
            <Text style={styles.compactInputLabel}>
              {bingoGame.setupIndex < bingoGame.boardSize * bingoGame.boardSize ? 
                `${bingoGame.setupIndex + 1}번째 칸` : '설정 완료'}
            </Text>
            
            <View style={styles.inlineInputContainer}>
              <Text style={styles.compactCurrentInput}>
                {bingoGame.currentInputNumber || '숫자 입력'}
              </Text>
              <TouchableOpacity
                style={styles.compactConfirmButton}
                onPress={confirmBingoNumber}
                disabled={!bingoGame.currentInputNumber}
              >
                <Text style={styles.compactConfirmText}>✓</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.compactBackspaceButton}
                onPress={handleBingoBackspace}
              >
                <Text style={styles.compactBackspaceText}>⌫</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.compactNumberPad}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(num => (
              <TouchableOpacity
                key={num}
                style={styles.compactNumberButton}
                onPress={() => handleBingoNumberInput(num.toString())}
              >
                <Text style={styles.compactNumberButtonText}>{num}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.compactActionButtons}>
            <TouchableOpacity
              style={[
                styles.compactCompleteButton, 
                bingoGame.setupIndex < bingoGame.boardSize * bingoGame.boardSize && styles.disabledButton
              ]}
              onPress={completeBingoSetup}
              disabled={bingoGame.setupIndex < bingoGame.boardSize * bingoGame.boardSize}
            >
              <Text style={styles.compactCompleteButtonText}>설정 완료</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <View style={styles.bingoGameStatus}>
            <View style={styles.bingoStatItem}>
              <Text style={styles.bingoStatLabel}>보드</Text>
              <Text style={styles.bingoStatValue}>{bingoGame.boardSize}×{bingoGame.boardSize}</Text>
            </View>
            <View style={styles.bingoStatItem}>
              <Text style={styles.bingoStatLabel}>플레이어</Text>
              <Text style={styles.bingoStatValue}>
                {bingoGame.playerLines}/{bingoGame.boardSize * bingoGame.boardSize}
              </Text>
            </View>
            <View style={styles.bingoStatItem}>
              <Text style={styles.bingoStatLabel}>컴퓨터</Text>
              <Text style={styles.bingoStatValue}>
                {bingoGame.computerLines}/{bingoGame.boardSize * bingoGame.boardSize}
              </Text>
            </View>
            <View style={styles.bingoStatItem}>
              <Text style={styles.bingoStatLabel}>현재 턴</Text>
              <Text style={styles.bingoStatValue}>
                {bingoGame.currentTurn === 'player' ? '🙋‍♂️' : '🤖'}
              </Text>
            </View>
          </View>

          <View style={styles.bingoInstruction}>
            <Text style={styles.instructionText}>
              {bingoGame.gameOver ? 
                `🎯 게임 종료! ${bingoGame.winner === 'player' ? '플레이어가 모든 칸을 먼저 채웠습니다!' : '컴퓨터가 모든 칸을 먼저 채웠습니다!'}` :
                bingoGame.currentTurn === 'player' ? 
                  '🎮 숫자를 선택하여 모든 칸을 채우세요!' :
                  '⏳ 컴퓨터가 선택 중입니다...'
              }
            </Text>
          </View>
          
          <View style={styles.verticalBoardContainer}>
            <View style={styles.playerBoardSection}>
              <View style={styles.boardHeader}>
                <Text style={styles.boardTitle}>🙋‍♂️ 플레이어 보드</Text>
                <Text style={styles.boardScore}>
                  {bingoGame.playerLines}/{bingoGame.boardSize * bingoGame.boardSize}
                </Text>
              </View>
              <View style={[
                styles.dynamicBingoBoard, 
                styles.playerBoard,
                { width: bingoGame.boardSize * 36 }
              ]}>
                {bingoGame.board.map((cell, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dynamicBingoCell,
                      cell.selected && cell.selectedBy === 'player' && styles.cellSelectedByPlayer,
                      cell.selected && cell.selectedBy === 'computer' && styles.cellSelectedByComputer,
                    ]}
                    onPress={() => handleBingoClick(index)}
                    disabled={bingoGame.gameOver || bingoGame.currentTurn !== 'player' || cell.selected}
                  >
                    <Text style={[
                      styles.dynamicBingoCellText,
                      cell.selected && styles.bingoCellTextSelected
                    ]}>
                      {cell.number}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.boardDivider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>VS</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.computerBoardSection}>
              <View style={styles.boardHeader}>
                <Text style={styles.boardTitle}>🤖 컴퓨터 보드</Text>
                <Text style={styles.boardScore}>
                  {bingoGame.computerLines}/{bingoGame.boardSize * bingoGame.boardSize}
                </Text>
              </View>
              <View style={[
                styles.dynamicBingoBoard, 
                styles.computerBoard,
                { width: bingoGame.boardSize * 36 }
              ]}>
                {bingoGame.computerBoard.map((cell, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dynamicBingoCell,
                      cell.selected && cell.selectedBy === 'player' && styles.cellSelectedByPlayer,
                      cell.selected && cell.selectedBy === 'computer' && styles.cellSelectedByComputer,
                    ]}
                  >
                    <Text style={[
                      styles.dynamicBingoCellText,
                      cell.selected && styles.bingoCellTextSelected
                    ]}>
                      {cell.number}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {!bingoGame.gameOver && (
            <View style={styles.bingoProgress}>
              <Text style={styles.bingoProgressTitle}>📊 진행도</Text>
              <View style={styles.progressBars}>
                <View style={styles.progressBarContainer}>
                  <Text style={styles.progressLabel}>🙋‍♂️ 플레이어</Text>
                  <View style={styles.bingoProgressBar}>
                    <View 
                      style={[
                        styles.bingoProgressFill, 
                        styles.playerProgress,
                        { width: `${(bingoGame.playerLines / (bingoGame.boardSize * bingoGame.boardSize)) * 100}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.bingoProgressText}>
                    {bingoGame.playerLines}/{bingoGame.boardSize * bingoGame.boardSize}
                  </Text>
                </View>
                
                <View style={styles.progressBarContainer}>
                  <Text style={styles.progressLabel}>🤖 컴퓨터</Text>
                  <View style={styles.bingoProgressBar}>
                    <View 
                      style={[
                        styles.bingoProgressFill, 
                        styles.computerProgress,
                        { width: `${(bingoGame.computerLines / (bingoGame.boardSize * bingoGame.boardSize)) * 100}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.bingoProgressText}>
                    {bingoGame.computerLines}/{bingoGame.boardSize * bingoGame.boardSize}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {bingoGame.gameOver && (
            <View style={styles.bingoGameOver}>
              <Text style={styles.gameOverTitle}>🎮 게임 종료!</Text>
              <Text style={styles.finalScore}>
                {bingoGame.winner === 'player' ? 
                  '🎉 승리! 모든 칸을 먼저 채웠습니다! (500점)' : 
                  '😢 패배... 컴퓨터가 먼저 완성했습니다'}
              </Text>
              <Text style={styles.accuracy}>
                최종 점수: 플레이어 {bingoGame.playerLines}/{bingoGame.boardSize * bingoGame.boardSize}, 컴퓨터 {bingoGame.computerLines}/{bingoGame.boardSize * bingoGame.boardSize}
              </Text>
            </View>
          )}
        </>
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
  sizeSelectionHeader: {
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#333',
  },
  sizeSelectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 8,
  },
  sizeSelectionSubtitle: {
    fontSize: 16,
    color: '#a0a0a0',
  },
  sizeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  sizeOptionButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFD700',
    minWidth: 100,
  },
  sizeOptionText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 8,
  },
  sizeOptionDesc: {
    fontSize: 14,
    color: '#a0a0a0',
  },
  bingoSetupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  bingoSetupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  bingoSetupProgress: {
    fontSize: 14,
    color: '#a0a0a0',
    fontWeight: '500',
  },
  defaultStartButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#45A049',
  },
  defaultStartText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  dynamicBingoBoard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
    alignSelf: 'center',
  },
  dynamicBingoCell: {
    backgroundColor: '#555',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
    width: 32,
    height: 32,
  },
  dynamicBingoCellText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  bingoCellActive: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
    borderWidth: 2,
  },
  bingoCellFilled: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
    borderWidth: 2,
  },
  bingoCellTextSelected: {
    color: 'white',
  },
  duplicateWarning: {
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  duplicateWarningText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  compactInputSection: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  compactInputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 8,
    textAlign: 'center',
  },
  inlineInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  compactCurrentInput: {
    fontSize: 18,
    color: '#e0e0e0',
    backgroundColor: '#333',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 100,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#555',
  },
  compactConfirmButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 6,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactConfirmText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  compactBackspaceButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 6,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactBackspaceText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  compactNumberPad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  compactNumberButton: {
    backgroundColor: '#333',
    borderRadius: 6,
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 3,
    borderWidth: 1,
    borderColor: '#555',
  },
  compactNumberButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  compactActionButtons: {
    alignItems: 'center',
    marginBottom: 10,
  },
  compactCompleteButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 2,
    borderColor: '#45A049',
  },
  compactCompleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#666',
    borderColor: '#555',
    opacity: 0.5,
  },
  bingoGameStatus: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  bingoStatItem: {
    alignItems: 'center',
  },
  bingoStatLabel: {
    fontSize: 14,
    color: '#a0a0a0',
    marginBottom: 4,
  },
  bingoStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  bingoInstruction: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  instructionText: {
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
    fontWeight: '600',
  },
  verticalBoardContainer: {
    marginBottom: 20,
  },
  playerBoardSection: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  computerBoardSection: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  boardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  boardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  boardScore: {
    fontSize: 16,
    color: '#fff',
  },
  playerBoard: {},
  computerBoard: {},
  boardDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#777',
  },
  dividerText: {
    fontSize: 16,
    color: '#FFD700',
    marginHorizontal: 12,
  },
  cellSelectedByPlayer: {},
  cellSelectedByComputer: {},
  bingoProgress: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#444',
  },
  bingoProgressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 15,
    textAlign: 'center',
  },
  progressBars: {
    gap: 12,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#e0e0e0',
    minWidth: 80,
  },
  bingoProgressBar: {
    flex: 1,
    height: 12,
    backgroundColor: '#333',
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#555',
  },
  bingoProgressFill: {
    height: '100%',
    borderRadius: 5,
  },
  playerProgress: {
    backgroundColor: '#4CAF50',
  },
  computerProgress: {
    backgroundColor: '#FF6B6B',
  },
  bingoProgressText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#a0a0a0',
    minWidth: 40,
    textAlign: 'right',
  },
  bingoGameOver: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    borderWidth: 2,
    borderColor: '#FFD700',
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

export default BingoGame; 