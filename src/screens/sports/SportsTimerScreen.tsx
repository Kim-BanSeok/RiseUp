// RiseUp/src/screens/SportsTimerScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Vibration,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import CustomAlert from '../../components/CustomAlert';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SportPeriod {
  id: string;
  name: string;
  duration: number; // 분 단위
  isBreak: boolean;
}

interface SportTemplate {
  id: string;
  name: string;
  icon: string;
  periods: SportPeriod[];
}

interface ActiveTimer {
  sportId: string;
  sportName: string;
  currentPeriodIndex: number;
  remainingTime: number; // 초 단위
  isRunning: boolean;
  isPaused: boolean;
}

const SportsTimerScreen = ({ navigation, route }: any) => {
  const insets = useSafeAreaInsets();
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null);
  const [customSports, setCustomSports] = useState<SportTemplate[]>([]);
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    buttons: [] as any[]
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const sportsTemplates: SportTemplate[] = [
    {
      id: 'soccer',
      name: '축구',
      icon: '⚽',
      periods: [
        { id: '1', name: '전반전', duration: 45, isBreak: false },
        { id: '2', name: '하프타임', duration: 15, isBreak: true },
        { id: '3', name: '후반전', duration: 45, isBreak: false },
      ]
    },
    {
      id: 'basketball',
      name: '농구',
      icon: '🏀',
      periods: [
        { id: '1', name: '1쿼터', duration: 12, isBreak: false },
        { id: '2', name: '1쿼터 휴식', duration: 2, isBreak: true },
        { id: '3', name: '2쿼터', duration: 12, isBreak: false },
        { id: '4', name: '하프타임', duration: 15, isBreak: true },
        { id: '5', name: '3쿼터', duration: 12, isBreak: false },
        { id: '6', name: '3쿼터 휴식', duration: 2, isBreak: true },
        { id: '7', name: '4쿼터', duration: 12, isBreak: false },
      ]
    },
    {
      id: 'volleyball',
      name: '배구',
      icon: '🏐',
      periods: [
        { id: '1', name: '1세트', duration: 25, isBreak: false },
        { id: '2', name: '세트간 휴식', duration: 3, isBreak: true },
        { id: '3', name: '2세트', duration: 25, isBreak: false },
        { id: '4', name: '세트간 휴식', duration: 3, isBreak: true },
        { id: '5', name: '3세트', duration: 25, isBreak: false },
      ]
    },
    {
      id: 'tennis',
      name: '테니스',
      icon: '🎾',
      periods: [
        { id: '1', name: '1세트', duration: 20, isBreak: false },
        { id: '2', name: '세트간 휴식', duration: 1.5, isBreak: true },
        { id: '3', name: '2세트', duration: 20, isBreak: false },
        { id: '4', name: '세트간 휴식', duration: 1.5, isBreak: true },
        { id: '5', name: '3세트', duration: 20, isBreak: false },
      ]
    },
  ];

  const showCustomAlert = (title: string, message: string, buttons: any[]) => {
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

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const startSportTimer = (sport: SportTemplate) => {
    if (activeTimer) {
      showCustomAlert(
        '⚠️ 타이머 실행 중',
        '현재 실행 중인 타이머가 있습니다. 새로운 타이머를 시작하시겠습니까?',
        [
          { text: '취소', style: 'cancel' },
          {
            text: '시작',
            onPress: () => {
              const newTimer: ActiveTimer = {
                sportId: sport.id,
                sportName: sport.name,
                currentPeriodIndex: 0,
                remainingTime: sport.periods[0].duration * 60,
                isRunning: true,
                isPaused: false,
              };
              setActiveTimer(newTimer);
              startInterval();
            }
          }
        ]
      );
    } else {
      const newTimer: ActiveTimer = {
        sportId: sport.id,
        sportName: sport.name,
        currentPeriodIndex: 0,
        remainingTime: sport.periods[0].duration * 60,
        isRunning: true,
        isPaused: false,
      };
      setActiveTimer(newTimer);
      startInterval();
    }
  };

  const startInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      setActiveTimer(prev => {
        if (!prev || !prev.isRunning) return prev;
        
        const newRemainingTime = prev.remainingTime - 1;
        
        if (newRemainingTime <= 0) {
          // 현재 기간 종료
          const currentSport = sportsTemplates.find(s => s.id === prev.sportId) || 
                              customSports.find(s => s.id === prev.sportId);
          if (!currentSport) return prev;
          
          if (prev.currentPeriodIndex < currentSport.periods.length - 1) {
            // 다음 기간으로 이동
            const nextPeriodIndex = prev.currentPeriodIndex + 1;
            const nextPeriod = currentSport.periods[nextPeriodIndex];
            
            // 진동 알림
            Vibration.vibrate(1000);
            
            return {
              ...prev,
              currentPeriodIndex: nextPeriodIndex,
              remainingTime: nextPeriod.duration * 60,
            };
          } else {
            // 모든 기간 완료
            Vibration.vibrate(2000);
            clearInterval(intervalRef.current!);
            
            showCustomAlert(
              '🏆 경기 종료!',
              `${prev.sportName} 경기가 완료되었습니다!`,
              [
                {
                  text: '확인',
                  onPress: () => setActiveTimer(null)
                }
              ]
            );
            
            return null;
          }
        }
        
        return {
          ...prev,
          remainingTime: newRemainingTime,
        };
      });
    }, 1000);
  };

  const pauseTimer = () => {
    if (activeTimer) {
      setActiveTimer(prev => prev ? { ...prev, isRunning: false, isPaused: true } : null);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  const resumeTimer = () => {
    if (activeTimer && activeTimer.isPaused) {
      setActiveTimer(prev => prev ? { ...prev, isRunning: true, isPaused: false } : null);
      startInterval();
    }
  };

  const stopTimer = () => {
    if (activeTimer) {
      showCustomAlert(
        '⏹️ 타이머 중지',
        '현재 실행 중인 타이머를 중지하시겠습니까?',
        [
          { text: '취소', style: 'cancel' },
          {
            text: '중지',
            onPress: () => {
              setActiveTimer(null);
              if (intervalRef.current) {
                clearInterval(intervalRef.current);
              }
            }
          }
        ]
      );
    }
  };

  const getCurrentPeriod = () => {
    if (!activeTimer) return null;
    const sport = sportsTemplates.find(s => s.id === activeTimer.sportId) || 
                  customSports.find(s => s.id === activeTimer.sportId);
    return sport ? sport.periods[activeTimer.currentPeriodIndex] : null;
  };

  const getProgress = () => {
    if (!activeTimer) return 0;
    const currentPeriod = getCurrentPeriod();
    if (!currentPeriod) return 0;
    
    const totalTime = currentPeriod.duration * 60;
    const elapsedTime = totalTime - activeTimer.remainingTime;
    return (elapsedTime / totalTime) * 100;
  };

  // 커스텀 스포츠 로드
  const loadCustomSports = async () => {
    try {
      const savedCustomSports = await AsyncStorage.getItem('customSports');
      if (savedCustomSports) {
        setCustomSports(JSON.parse(savedCustomSports));
      }
    } catch (error) {
      console.error('커스텀 스포츠 로드 실패:', error);
    }
  };

  // 커스텀 스포츠 저장
  const saveCustomSports = async (newCustomSports: SportTemplate[]) => {
    try {
      await AsyncStorage.setItem('customSports', JSON.stringify(newCustomSports));
    } catch (error) {
      console.error('커스텀 스포츠 저장 실패:', error);
    }
  };

  // 커스텀 스포츠 추가 처리
  const handleAddCustom = () => {
    navigation.navigate('AddCustomSport');
  };

  // 화면이 포커스될 때마다 실행
  useFocusEffect(
    React.useCallback(() => {
      if (route?.params?.customSport) {
        const newCustomSport = route.params.customSport;
        setCustomSports(prev => {
          const updated = [...prev, newCustomSport];
          // AsyncStorage에 저장
          saveCustomSports(updated);
          return updated;
        });
        
        // 파라미터 초기화
        navigation.setParams({ customSport: undefined });
        
        // 성공 메시지
        showCustomAlert(
          '✅ 커스텀 스포츠 추가됨',
          `${newCustomSport.name} 스포츠가 추가되었습니다!`,
          [{ text: '확인' }]
        );
      }
    }, [route?.params?.customSport])
  );

  // 컴포넌트 마운트 시 커스텀 스포츠 로드
  useEffect(() => {
    loadCustomSports();
  }, []);

  // 화면이 포커스될 때마다 커스텀 스포츠 다시 로드
  useFocusEffect(
    React.useCallback(() => {
      loadCustomSports();
    }, [])
  );

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 80 }]}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>🏆 스포츠 타이머</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddCustom}>
          <Text style={styles.addButtonText}>+ 커스텀</Text>
        </TouchableOpacity>
      </View>

      {/* 활성 타이머 표시 */}
      {activeTimer && (
        <View style={styles.activeTimerContainer}>
          <View style={styles.activeTimerHeader}>
            <Text style={styles.activeSportIcon}>
              {(sportsTemplates.find(s => s.id === activeTimer.sportId) || 
                customSports.find(s => s.id === activeTimer.sportId))?.icon}
            </Text>
            <Text style={styles.activeSportName}>{activeTimer.sportName}</Text>
          </View>
          
          <View style={styles.timerDisplay}>
            <Text style={styles.timerTime}>{formatTime(activeTimer.remainingTime)}</Text>
            <Text style={styles.timerPeriod}>
              {getCurrentPeriod()?.name}
            </Text>
          </View>
          
          {/* 진행률 바 */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${getProgress()}%` },
                  getCurrentPeriod()?.isBreak && styles.breakProgress
                ]} 
              />
            </View>
          </View>
          
          {/* 컨트롤 버튼들 */}
          <View style={styles.timerControls}>
            {activeTimer.isRunning ? (
              <TouchableOpacity style={styles.controlButton} onPress={pauseTimer}>
                <Text style={styles.controlButtonText}>⏸️ 일시정지</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.controlButton} onPress={resumeTimer}>
                <Text style={styles.controlButtonText}>▶️ 재개</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity style={styles.stopButton} onPress={stopTimer}>
              <Text style={styles.stopButtonText}>⏹️ 중지</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 설명 */}
      {!activeTimer && (
        <View style={styles.descriptionContainer}>
          <Text style={styles.description}>
            스포츠 경기 시간을 정확하게 관리하세요.
          </Text>
          <Text style={styles.subDescription}>
            전반/후반, 쿼터, 세트 시간과 휴식시간을 자동으로 알려드립니다.
          </Text>
        </View>
      )}

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>
          {activeTimer ? '다른 스포츠 시작' : '스포츠 템플릿'}
        </Text>
        
        {/* 기본 스포츠 템플릿 */}
        {sportsTemplates.map((sport) => (
          <TouchableOpacity 
            key={sport.id} 
            style={[
              styles.sportCard,
              activeTimer?.sportId === sport.id && styles.activeSportCard
            ]}
            onPress={() => startSportTimer(sport)}
          >
            <View style={styles.sportHeader}>
              <Text style={styles.sportIcon}>{sport.icon}</Text>
              <Text style={styles.sportName}>{sport.name}</Text>
              <TouchableOpacity 
                style={[
                  styles.startButton,
                  activeTimer?.sportId === sport.id && styles.activeStartButton
                ]}
                onPress={() => startSportTimer(sport)}
              >
                <Text style={styles.startButtonText}>
                  {activeTimer?.sportId === sport.id ? '실행중' : '시작'}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.periodsContainer}>
              {sport.periods.map((period, index) => (
                <Text key={period.id} style={styles.periodText}>
                  {index + 1}. {period.name} ({period.duration}분)
                  {period.isBreak && ' - 휴식'}
                </Text>
              ))}
            </View>
          </TouchableOpacity>
        ))}

        {/* 커스텀 스포츠 */}
        {customSports.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>커스텀 스포츠</Text>
            {customSports.map((sport) => (
              <TouchableOpacity 
                key={sport.id} 
                style={[
                  styles.sportCard,
                  styles.customSportCard,
                  activeTimer?.sportId === sport.id && styles.activeSportCard
                ]}
                onPress={() => startSportTimer(sport)}
              >
                <View style={styles.sportHeader}>
                  <Text style={styles.sportIcon}>{sport.icon}</Text>
                  <Text style={styles.sportName}>{sport.name}</Text>
                  <TouchableOpacity 
                    style={[
                      styles.startButton,
                      activeTimer?.sportId === sport.id && styles.activeStartButton
                    ]}
                    onPress={() => startSportTimer(sport)}
                  >
                    <Text style={styles.startButtonText}>
                      {activeTimer?.sportId === sport.id ? '실행중' : '시작'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.periodsContainer}>
                  {sport.periods.map((period, index) => (
                    <Text key={period.id} style={styles.periodText}>
                      {index + 1}. {period.name} ({period.duration}분)
                      {period.isBreak && ' - 휴식'}
                    </Text>
                  ))}
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onRequestClose={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2D1B14',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD4B3',
  },
  addButton: {
    backgroundColor: '#FF7F50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFD4B3',
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  activeTimerContainer: {
    backgroundColor: '#4A2C1A',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FF7F50',
  },
  activeTimerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  activeSportIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  activeSportName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD4B3',
  },
  timerDisplay: {
    alignItems: 'center',
    marginBottom: 15,
  },
  timerTime: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FF7F50',
    marginBottom: 5,
  },
  timerPeriod: {
    fontSize: 16,
    color: '#FFAB7A',
    fontWeight: '600',
  },
  progressContainer: {
    marginBottom: 15,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#8B6341',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF7F50',
    borderRadius: 4,
  },
  breakProgress: {
    backgroundColor: '#32CD32',
  },
  timerControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  controlButton: {
    backgroundColor: '#FF7F50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  controlButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  stopButton: {
    backgroundColor: '#CD5C5C',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  stopButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  descriptionContainer: {
    backgroundColor: '#4A2C1A',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FF7F50',
  },
  description: {
    fontSize: 16,
    color: '#FFD4B3',
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  subDescription: {
    fontSize: 14,
    color: '#FFAB7A',
    textAlign: 'center',
    lineHeight: 20,
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF7F50',
    marginBottom: 15,
  },
  sportCard: {
    backgroundColor: '#4A2C1A',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#8B6341',
  },
  activeSportCard: {
    borderColor: '#FF7F50',
    borderWidth: 2,
  },
  customSportCard: {
    borderColor: '#32CD32',
    borderWidth: 1,
  },
  sportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sportIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  sportName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD4B3',
    flex: 1,
  },
  startButton: {
    backgroundColor: '#FF7F50',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  activeStartButton: {
    backgroundColor: '#32CD32',
  },
  startButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  periodsContainer: {
    marginTop: 5,
  },
  periodText: {
    fontSize: 14,
    color: '#FFAB7A',
    marginBottom: 3,
  },
});

export default SportsTimerScreen;