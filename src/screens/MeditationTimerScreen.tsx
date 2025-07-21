import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Vibration,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { playSound, stopSound } from '../utils/sounds';

const { width: screenWidth } = Dimensions.get('window');

interface MeditationSession {
  id: string;
  name: string;
  duration: number; // 분 단위
  description: string;
  backgroundSound?: string;
  icon: string;
}

const MEDITATION_PRESETS: MeditationSession[] = [
  {
    id: 'breathing',
    name: '호흡 명상',
    duration: 10,
    description: '깊은 호흡으로 마음을 진정시키세요',
    icon: '🫁'
  },
  {
    id: 'mindfulness',
    name: '마음챙김',
    duration: 15,
    description: '현재 순간에 집중하는 연습',
    icon: '🧘‍♀️'
  },
  {
    id: 'sleep',
    name: '수면 명상',
    duration: 20,
    description: '편안한 잠자리를 위한 명상',
    icon: '🌙'
  },
  {
    id: 'stress',
    name: '스트레스 해소',
    duration: 12,
    description: '일상의 스트레스를 해소하세요',
    icon: '💆‍♂️'
  },
  {
    id: 'focus',
    name: '집중력 향상',
    duration: 25,
    description: '집중력을 기르는 포모도로 명상',
    icon: '🎯'
  },
  {
    id: 'gratitude',
    name: '감사 명상',
    duration: 8,
    description: '감사한 마음을 기르는 시간',
    icon: '🙏'
  }
];

const MeditationTimerScreen = () => {
  const insets = useSafeAreaInsets();
  const [selectedSession, setSelectedSession] = useState<MeditationSession | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0); // 초 단위
  const [customDuration, setCustomDuration] = useState(10);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && remainingTime > 0) {
      interval = setInterval(() => {
        setRemainingTime(prev => {
          if (prev <= 1) {
            // 명상 완료
            handleMeditationComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isRunning, remainingTime]);

  const handleMeditationComplete = () => {
    setIsRunning(false);
    Vibration.vibrate([200, 100, 200]);
    playSound('alarm_gentle');
    setTimeout(() => stopSound(), 2000);
  };

  const startMeditation = (session: MeditationSession) => {
    setSelectedSession(session);
    setRemainingTime(session.duration * 60);
    setIsRunning(true);
  };

  const startCustomMeditation = () => {
    const customSession: MeditationSession = {
      id: 'custom',
      name: '사용자 정의',
      duration: customDuration,
      description: `${customDuration}분 명상`,
      icon: '⏰'
    };
    startMeditation(customSession);
  };

  const pauseResume = () => {
    setIsRunning(!isRunning);
  };

  const stopMeditation = () => {
    setIsRunning(false);
    setSelectedSession(null);
    setRemainingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const renderPresetCard = (session: MeditationSession) => (
    <TouchableOpacity
      key={session.id}
      style={styles.presetCard}
      onPress={() => startMeditation(session)}
      disabled={isRunning}
    >
      <Text style={styles.presetIcon}>{session.icon}</Text>
      <Text style={styles.presetName}>{session.name}</Text>
      <Text style={styles.presetDuration}>{session.duration}분</Text>
      <Text style={styles.presetDescription}>{session.description}</Text>
    </TouchableOpacity>
  );

  if (selectedSession && isRunning) {
    // 명상 진행 중 화면
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.meditationScreen}>
          <Text style={styles.sessionTitle}>{selectedSession.name}</Text>
          
          <View style={styles.timerCircle}>
            <Text style={styles.timerText}>{formatTime(remainingTime)}</Text>
            <Text style={styles.timerSubText}>남은 시간</Text>
          </View>
          
          <View style={styles.progressContainer}>
            <View 
              style={[
                styles.progressBar, 
                { 
                  width: `${((selectedSession.duration * 60 - remainingTime) / (selectedSession.duration * 60)) * 100}%` 
                }
              ]} 
            />
          </View>
          
          <Text style={styles.guidanceText}>
            깊게 숨을 들이마시고 천천히 내쉬세요
          </Text>
          
          <View style={styles.controlButtons}>
            <TouchableOpacity style={styles.controlButton} onPress={pauseResume}>
              <Text style={styles.controlButtonText}>
                {isRunning ? '⏸️ 일시정지' : '▶️ 재개'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.controlButton, styles.stopButton]} onPress={stopMeditation}>
              <Text style={styles.controlButtonText}>⏹️ 종료</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // 메인 선택 화면
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>🧘‍♀️ 명상 타이머</Text>
        <Text style={styles.subtitle}>마음의 평안을 찾아보세요</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 사용자 정의 타이머 */}
        <View style={styles.customSection}>
          <Text style={styles.sectionTitle}>사용자 정의</Text>
          <View style={styles.customTimer}>
            <View style={styles.durationSelector}>
              <TouchableOpacity
                style={styles.durationButton}
                onPress={() => setCustomDuration(Math.max(1, customDuration - 1))}
              >
                <Text style={styles.durationButtonText}>-</Text>
              </TouchableOpacity>
              
              <Text style={styles.customDurationText}>{customDuration}분</Text>
              
              <TouchableOpacity
                style={styles.durationButton}
                onPress={() => setCustomDuration(Math.min(60, customDuration + 1))}
              >
                <Text style={styles.durationButtonText}>+</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.startCustomButton}
              onPress={startCustomMeditation}
            >
              <Text style={styles.startCustomButtonText}>시작하기</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 프리셋 명상 */}
        <View style={styles.presetsSection}>
          <Text style={styles.sectionTitle}>추천 명상</Text>
          <View style={styles.presetsGrid}>
            {MEDITATION_PRESETS.map(renderPresetCard)}
          </View>
        </View>

        {/* 명상 가이드 */}
        <View style={styles.guideSection}>
          <Text style={styles.sectionTitle}>명상 가이드</Text>
          <View style={styles.guideCard}>
            <Text style={styles.guideTitle}>🌱 명상을 처음 시작하시나요?</Text>
            <Text style={styles.guideText}>
              1. 편안한 자세로 앉으세요{'\n'}
              2. 눈을 감고 호흡에 집중하세요{'\n'}
              3. 잡념이 들면 다시 호흡으로 돌아오세요{'\n'}
              4. 짧은 시간부터 시작해서 점차 늘려보세요
            </Text>
          </View>
        </View>
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
  customSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e0e0e0',
    marginBottom: 15,
  },
  customTimer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  durationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  durationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationButtonText: {
    fontSize: 20,
    color: '#e0e0e0',
    fontWeight: 'bold',
  },
  customDurationText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginHorizontal: 30,
  },
  startCustomButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 25,
  },
  startCustomButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  presetsSection: {
    marginBottom: 30,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  presetCard: {
    width: (screenWidth - 55) / 2,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  presetIcon: {
    fontSize: 30,
    marginBottom: 8,
  },
  presetName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e0e0e0',
    marginBottom: 4,
    textAlign: 'center',
  },
  presetDuration: {
    fontSize: 12,
    color: '#4CAF50',
    marginBottom: 6,
  },
  presetDescription: {
    fontSize: 11,
    color: '#a0a0a0',
    textAlign: 'center',
    lineHeight: 14,
  },
  guideSection: {
    marginBottom: 20,
  },
  guideCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e0e0e0',
    marginBottom: 10,
  },
  guideText: {
    fontSize: 14,
    color: '#a0a0a0',
    lineHeight: 20,
  },
  meditationScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  sessionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e0e0e0',
    marginBottom: 40,
  },
  timerCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  timerText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  timerSubText: {
    fontSize: 12,
    color: '#a0a0a0',
    marginTop: 5,
  },
  progressContainer: {
    width: '80%',
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    marginBottom: 30,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  guidanceText: {
    fontSize: 16,
    color: '#a0a0a0',
    textAlign: 'center',
    marginBottom: 40,
    fontStyle: 'italic',
  },
  controlButtons: {
    flexDirection: 'row',
    gap: 20,
  },
  controlButton: {
    backgroundColor: '#333',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  stopButton: {
    backgroundColor: '#f44336',
  },
  controlButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default MeditationTimerScreen; 