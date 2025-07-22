import { useState, useCallback } from 'react';
import { BingoGameState, BingoCell } from '../types/gameTypes';

interface UseBingoGameProps {
  onScore: (game: string, score: number) => void;
  showCustomAlert: (
    title: string,
    message: string,
    buttons: Array<{
      text: string;
      style?: 'default' | 'cancel' | 'destructive';
      onPress?: () => void;
    }>
  ) => void;
}

interface UseBingoGameReturn {
  gameState: BingoGameState;
  selectBoardSize: (size: number) => void;
  startWithDefaults: () => void;
  handleNumberInput: (digit: string) => void;
  handleNumberBackspace: () => void;
  confirmNumber: () => void;
  completeSetup: () => void;
  selectSetupCell: (index: number) => void;
  closeInputModal: () => void;
  handleCellClick: (index: number) => void;
  restartGame: () => void;
}

export const useBingoGame = ({ onScore, showCustomAlert }: UseBingoGameProps): UseBingoGameReturn => {
  
  const [gameState, setGameState] = useState<BingoGameState>({
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
    selectedSetupIndex: 0,
    currentInputNumber: '',
    isInputModalVisible: false,
    isAllBingo: false
  });

  // 모든 칸 채우기 체크
  const checkAllCellsFilled = useCallback((board: BingoCell[]) => {
    const allFilled = board.every(cell => cell.selected);
    console.log('🔍 [빙고] 모든 칸 채우기 체크:', {
      totalCells: board.length,
      filledCells: board.filter(cell => cell.selected).length,
      allFilled
    });
    return allFilled;
  }, []);

  // 보드 크기 선택
  const selectBoardSize = useCallback((size: number) => {
    console.log('📏 [빙고] 보드 크기 선택:', size);
    const totalCells = size * size;
    
    setGameState(prev => ({
      ...prev,
      boardSize: size,
      board: Array(totalCells).fill(null).map((_, i) => ({
        number: i + 1,
        selected: false,
        selectedBy: null,
        index: i
      })),
      computerBoard: Array(totalCells).fill(null).map((_, i) => ({
        number: Math.floor(Math.random() * (totalCells * 2)) + 1,
        selected: false,
        selectedBy: null,
        index: i
      })),
      setupNumbers: Array(totalCells).fill('').map((_, i) => (i + 1).toString()),
      setupIndex: 0,
      selectedSetupIndex: 0,
      isInputModalVisible: false,
      isSizeSelection: false,
      isSetupPhase: true
    }));
  }, []);

  // 기본 설정으로 바로 시작
  const startWithDefaults = useCallback(() => {
    console.log('🚀 [빙고] 기본 설정으로 시작');
    const totalCells = gameState.boardSize * gameState.boardSize;
    
    const newBoard = Array(totalCells).fill(null).map((_, i) => ({
      number: i + 1,
      selected: false,
      selectedBy: null,
      index: i
    }));
    
    setGameState(prev => ({
      ...prev,
      board: newBoard,
      isSetupPhase: false,
      currentTurn: 'player'
    }));
  }, [gameState.boardSize]);

  // 숫자 입력 처리
  const handleNumberInput = useCallback((digit: string) => {
    console.log('🔢 [빙고] 숫자 입력:', digit);
    
    if (gameState.currentInputNumber.length >= 2) {
      console.log('🔢 [빙고] 입력 제한 - 최대 2자리');
      return;
    }
    
    const newInput = gameState.currentInputNumber + digit;
    console.log('🔢 [빙고] 새로운 입력값:', newInput);
    
    setGameState(prev => ({
      ...prev,
      currentInputNumber: newInput
    }));
  }, [gameState.currentInputNumber]);

  // 백스페이스
  const handleNumberBackspace = useCallback(() => {
    console.log('⌫ [빙고] 백스페이스');
    
    setGameState(prev => ({
      ...prev,
      currentInputNumber: prev.currentInputNumber.slice(0, -1)
    }));
  }, []);

  // 셀 선택 (번호 설정 시)
  const selectSetupCell = useCallback((index: number) => {
    console.log('🎯 [빙고] 설정 셀 선택:', index);
    
    setGameState(prev => ({
      ...prev,
      selectedSetupIndex: index,
      currentInputNumber: prev.setupNumbers[index] || '',
      isInputModalVisible: true
    }));
  }, []);

  // 입력 모달 닫기
  const closeInputModal = useCallback(() => {
    console.log('❌ [빙고] 입력 모달 닫기');
    
    setGameState(prev => ({
      ...prev,
      isInputModalVisible: false,
      currentInputNumber: ''
    }));
  }, []);

  // 숫자 확정
  const confirmNumber = useCallback(() => {
    console.log('✅ [빙고] 숫자 확정 시도');
    
    if (!gameState.currentInputNumber) {
      console.log('✅ [빙고] 확정 실패 - 입력값 없음');
      return;
    }
    
    const newNumber = gameState.currentInputNumber;
    const targetIndex = gameState.selectedSetupIndex;
    
    // 현재 선택된 칸이 아닌 다른 칸들과 중복 체크
    const existingNumbers = gameState.setupNumbers.filter((num, index) => index !== targetIndex && num !== '');
    
    if (existingNumbers.includes(newNumber)) {
      console.log('✅ [빙고] 확정 실패 - 중복된 숫자222');
      showCustomAlert(
        '중복된 번호',
        `숫자 ${newNumber}은(는) 이미 사용된 번호입니다.\n다른 숫자를 입력해주세요.`,
        [
          {
            text: '확인',
            style: 'default',
            onPress: () => {},
          }
        ]
      );
      setGameState(prev => ({
        ...prev,
        currentInputNumber: ''
      }));
      return;
    }
    
    const newSetupNumbers = [...gameState.setupNumbers];
    newSetupNumbers[targetIndex] = gameState.currentInputNumber;
    
    console.log('✅ [빙고] 숫자 확정 성공');
    
    setGameState(prev => ({
      ...prev,
      setupNumbers: newSetupNumbers,
      setupIndex: prev.setupIndex + 1,
      currentInputNumber: '',
      isInputModalVisible: false
    }));
  }, [gameState.currentInputNumber, gameState.setupNumbers, gameState.selectedSetupIndex, showCustomAlert]);

  // 설정 완료
  const completeSetup = useCallback(() => {
    console.log('🏁 [빙고] 설정 완료');
    const totalCells = gameState.boardSize * gameState.boardSize;
    const numbers = gameState.setupNumbers.map(num => parseInt(num) || 1);
    
    const newBoard = Array(totalCells).fill(null).map((_, i) => ({
      number: numbers[i],
      selected: false,
      selectedBy: null,
      index: i
    }));
    
    setGameState(prev => ({
      ...prev,
      board: newBoard,
      isSetupPhase: false,
      currentTurn: 'player'
    }));
  }, [gameState.boardSize, gameState.setupNumbers]);

  // 컴퓨터 턴 처리
  const handleComputerTurn = useCallback((currentPlayerBoard: BingoCell[], currentComputerBoard: BingoCell[]) => {
    console.log('🤖 [빙고] 컴퓨터 턴 시작');
    
    if (gameState.gameOver) {
      console.log('🤖 [빙고] 컴퓨터 턴 취소 - 게임 종료됨');
      return;
    }
    
    const availableCells = currentComputerBoard
      .map((cell, index) => ({ ...cell, index }))
      .filter(cell => !cell.selected);
    
    if (availableCells.length === 0) {
      console.log('🤖 [빙고] 선택 가능한 칸이 없음');
      return;
    }
    
    const randomIndex = Math.floor(Math.random() * availableCells.length);
    const selectedCell = availableCells[randomIndex];
    const selectedNumber = selectedCell.number;
    
    console.log('🤖 [빙고] 컴퓨터가 선택한 칸:', selectedCell.index, '번호:', selectedNumber);
    
    const newComputerBoard = [...currentComputerBoard];
    newComputerBoard[selectedCell.index].selected = true;
    newComputerBoard[selectedCell.index].selectedBy = 'computer';
    
    const newPlayerBoard = [...currentPlayerBoard];
    const playerMatchIndex = newPlayerBoard.findIndex(cell => 
      cell.number === selectedNumber && !cell.selected
    );
    if (playerMatchIndex !== -1) {
      newPlayerBoard[playerMatchIndex].selected = true;
      newPlayerBoard[playerMatchIndex].selectedBy = 'computer';
    }
    
    const playerAllFilled = checkAllCellsFilled(newPlayerBoard);
    const computerAllFilled = checkAllCellsFilled(newComputerBoard);
    
    const playerWins = playerAllFilled;
    const computerWins = computerAllFilled;
    
    const playerFilledCount = newPlayerBoard.filter(cell => cell.selected).length;
    const computerFilledCount = newComputerBoard.filter(cell => cell.selected).length;
    
    setGameState(prev => ({
      ...prev,
      board: newPlayerBoard,
      computerBoard: newComputerBoard,
      completedLines: computerWins ? ['모든 칸 완성!'] : [],
      playerLines: playerFilledCount,
      computerLines: computerFilledCount,
      gameOver: playerWins || computerWins,
      winner: playerWins ? 'player' : computerWins ? 'computer' : null,
      currentTurn: (playerWins || computerWins ? 'computer' : 'player') as 'player' | 'computer',
      isAllBingo: playerWins || computerWins
    }));
    
    if (computerWins) {
      console.log('🤖 [빙고] 컴퓨터 승리! 100점 참가상');
      onScore('빙고', 100);
    }
  }, [gameState.gameOver, checkAllCellsFilled, onScore]);

  // 플레이어 클릭 처리
  const handleCellClick = useCallback((index: number) => {
    console.log('🎯 [빙고] 플레이어 클릭 - 인덱스:', index);
    
    if (gameState.gameOver || gameState.isSetupPhase || gameState.currentTurn !== 'player') {
      console.log('🎯 [빙고] 클릭 무시됨 - 조건 미충족');
      return;
    }
    if (gameState.board[index].selected) {
      console.log('🎯 [빙고] 클릭 무시됨 - 이미 선택된 칸');
      return;
    }
    
    const selectedNumber = gameState.board[index].number;
    console.log('🎯 [빙고] 선택된 숫자:', selectedNumber);
    
    const newPlayerBoard = [...gameState.board];
    newPlayerBoard[index].selected = true;
    newPlayerBoard[index].selectedBy = 'player';
    
    const newComputerBoard = [...gameState.computerBoard];
    const computerMatchIndex = newComputerBoard.findIndex(cell => 
      cell.number === selectedNumber && !cell.selected
    );
    if (computerMatchIndex !== -1) {
      newComputerBoard[computerMatchIndex].selected = true;
      newComputerBoard[computerMatchIndex].selectedBy = 'player';
    }
    
    const playerAllFilled = checkAllCellsFilled(newPlayerBoard);
    const computerAllFilled = checkAllCellsFilled(newComputerBoard);
    
    const playerWins = playerAllFilled;
    const computerWins = computerAllFilled;
    
    const playerFilledCount = newPlayerBoard.filter(cell => cell.selected).length;
    const computerFilledCount = newComputerBoard.filter(cell => cell.selected).length;
    
    setGameState(prev => ({
      ...prev,
      board: newPlayerBoard,
      computerBoard: newComputerBoard,
      completedLines: playerWins ? ['모든 칸 완성!'] : [],
      playerLines: playerFilledCount,
      computerLines: computerFilledCount,
      gameOver: playerWins || computerWins,
      winner: playerWins ? 'player' : computerWins ? 'computer' : null,
      currentTurn: (playerWins || computerWins ? 'player' : 'computer') as 'player' | 'computer',
      isAllBingo: playerWins || computerWins
    }));
    
    if (playerWins) {
      console.log('🎯 [빙고] 플레이어 승리! 500점 획득');
      onScore('빙고', 500);
    } else if (!computerWins) {
      console.log('🎯 [빙고] 컴퓨터 턴으로 전환, 1.5초 후 자동 플레이');
      setTimeout(() => {
        handleComputerTurn(newPlayerBoard, newComputerBoard);
      }, 1500);
    }
  }, [gameState, checkAllCellsFilled, onScore, handleComputerTurn]);

  // 게임 재시작
  const restartGame = useCallback(() => {
    console.log('🔄 [빙고] 게임 재시작');
    setGameState({
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
      selectedSetupIndex: 0,
      currentInputNumber: '',
      isInputModalVisible: false,
      isAllBingo: false
    });
  }, []);

  return {
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
  };
}; 