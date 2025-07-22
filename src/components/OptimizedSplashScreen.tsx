import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface SplashScreenProps {
  onAnimationEnd: () => void;
}

interface LoadingTask {
  name: string;
  task: () => Promise<void>;
  priority: 'high' | 'medium' | 'low';
}

const OptimizedSplashScreen: React.FC<SplashScreenProps> = ({ onAnimationEnd }) => {
  const { theme } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const logoRotateAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('초기화 중...');
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isAnimationComplete, setIsAnimationComplete] = useState(false);
  
  // 고정 너비 값 사용
  const width = 350; // 대부분의 모바일 화면 너비

  // 초기 데이터 로딩 태스크들
  const loadingTasks: LoadingTask[] = [
    {
      name: '알람 데이터 로딩',
      task: async () => {
        // 알람 Context 초기화 시뮬레이션
        await new Promise(resolve => setTimeout(resolve, 200));
      },
      priority: 'high',
    },
    {
      name: '타이머 설정 복원',
      task: async () => {
        // 타이머 Context 초기화 시뮬레이션
        await new Promise(resolve => setTimeout(resolve, 150));
      },
      priority: 'high',
    },
    {
      name: '게임 점수 로딩',
      task: async () => {
        // 게임 점수 Context 초기화 시뮬레이션
        await new Promise(resolve => setTimeout(resolve, 100));
      },
      priority: 'medium',
    },
    {
      name: '테마 설정 적용',
      task: async () => {
        // 테마 Context 초기화 시뮬레이션
        await new Promise(resolve => setTimeout(resolve, 50));
      },
      priority: 'high',
    },
    {
      name: '캐시 정리',
      task: async () => {
        // 캐시 정리 시뮬레이션
        await new Promise(resolve => setTimeout(resolve, 100));
      },
      priority: 'low',
    },
  ];

  // 병렬 데이터 로딩
  const loadInitialData = useCallback(async () => {
    try {
      const totalTasks = loadingTasks.length;
      let completedTasks = 0;

      // 우선순위별로 태스크 그룹화
      const highPriorityTasks = loadingTasks.filter(task => task.priority === 'high');
      const mediumPriorityTasks = loadingTasks.filter(task => task.priority === 'medium');
      const lowPriorityTasks = loadingTasks.filter(task => task.priority === 'low');

      // 고우선순위 태스크 병렬 실행
      const executeTaskGroup = async (tasks: LoadingTask[], groupName: string) => {
        setLoadingText(`${groupName} 로딩 중...`);
        
        const taskPromises = tasks.map(async (task) => {
          await task.task();
          completedTasks++;
          const progress = (completedTasks / totalTasks) * 100;
          setLoadingProgress(progress);
          
          // 진행률 애니메이션
          Animated.timing(progressAnim, {
            toValue: progress,
            duration: 200,
            useNativeDriver: false,
          }).start();
        });

        await Promise.all(taskPromises);
      };

      // 순차적으로 우선순위 그룹 실행
      await executeTaskGroup(highPriorityTasks, '핵심 기능');
      await executeTaskGroup(mediumPriorityTasks, '부가 기능');
      await executeTaskGroup(lowPriorityTasks, '최적화');

      setLoadingText('완료!');
      setIsDataLoaded(true);
    } catch (error) {
      console.error('초기 데이터 로딩 실패:', error);
      setLoadingText('로딩 완료');
      setIsDataLoaded(true);
    }
  }, [loadingTasks, progressAnim]);

  // 애니메이션 시작
  useEffect(() => {
    // 로고 애니메이션
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsAnimationComplete(true);
    });

    // 로고 회전 애니메이션 (부드러운 회전)
    Animated.loop(
      Animated.timing(logoRotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();

    // 데이터 로딩 시작
    loadInitialData();
  }, [fadeAnim, scaleAnim, logoRotateAnim, loadInitialData]);

  // 모든 준비 완료 시 화면 전환
  useEffect(() => {
    if (isDataLoaded && isAnimationComplete) {
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          onAnimationEnd();
        });
      }, 500); // 0.5초 추가 대기

      return () => clearTimeout(timer);
    }
  }, [isDataLoaded, isAnimationComplete, fadeAnim, onAnimationEnd]);

  const logoRotation = logoRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [0, width - 80],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.primary }]}>
      <StatusBar 
        barStyle={theme.isDark ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.primary}
      />
      
      {/* 배경 그라디언트 효과 */}
      <View style={[styles.gradientBackground, { backgroundColor: theme.colors.primaryDark }]} />
      
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* 메인 로고 */}
        <Animated.View 
          style={[
            styles.iconContainer,
            {
              transform: [{ rotate: logoRotation }],
            }
          ]}
        >
          <Text style={styles.mainIcon}>🌅</Text>
          <View style={[styles.iconShadow, { backgroundColor: theme.colors.primaryLight }]} />
        </Animated.View>
        
        {/* 앱 이름 */}
        <Text style={[styles.appName, { color: theme.colors.background }]}>RiseUp</Text>
        <Text style={[styles.tagline, { color: theme.colors.background }]}>
          아침을 깨우는 스마트 알람
        </Text>
      </Animated.View>
      
      {/* 로딩 진행률 */}
      <View style={styles.loadingContainer}>
        <Text style={[styles.loadingText, { color: theme.colors.background }]}>
          {loadingText}
        </Text>
        
        {/* 진행률 바 */}
        <View style={[styles.progressBarContainer, { backgroundColor: theme.colors.primaryLight }]}>
          <Animated.View 
            style={[
              styles.progressBar,
              { 
                backgroundColor: theme.colors.background,
                width: progressWidth,
              }
            ]} 
          />
        </View>
        
        {/* 진행률 퍼센티지 */}
        <Text style={[styles.progressText, { color: theme.colors.background }]}>
          {Math.round(loadingProgress)}%
        </Text>
        
        {/* 로딩 스피너 */}
        <ActivityIndicator 
          size="small" 
          color={theme.colors.background}
          style={styles.spinner}
        />
      </View>
      
      {/* 하단 브랜딩 */}
      <Animated.View 
        style={[styles.footer, { opacity: fadeAnim }]}
      >
        <Text style={[styles.footerText, { color: theme.colors.background }]}>
          매일 아침을 새롭게
        </Text>
        <Text style={[styles.versionText, { color: theme.colors.background }]}>
          v1.0.0
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 30,
  },
  mainIcon: {
    fontSize: 80,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  iconShadow: {
    position: 'absolute',
    top: 5,
    left: 5,
    width: 80,
    height: 80,
    borderRadius: 40,
    opacity: 0.2,
    zIndex: -1,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '300',
    textAlign: 'center',
    opacity: 0.9,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 150,
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 14,
    marginBottom: 15,
    fontWeight: '500',
  },
  progressBarContainer: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    marginBottom: 10,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  spinner: {
    marginTop: 5,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    fontWeight: '300',
    marginBottom: 4,
  },
  versionText: {
    fontSize: 12,
    fontWeight: '300',
    opacity: 0.7,
  },
});

export default OptimizedSplashScreen; 