import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  StatusBar 
} from 'react-native';

interface SplashScreenProps {
  onAnimationEnd: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onAnimationEnd }) => {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.5);

  useEffect(() => {
    // 페이드인 및 스케일 애니메이션
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // 2.5초 후 메인 화면으로 이동
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(onAnimationEnd);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a73e8" />
      
      {/* 배경 그라디언트 효과 */}
      <View style={styles.gradientBackground} />
      
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* 메인 아이콘 */}
        <View style={styles.iconContainer}>
          <Text style={styles.mainIcon}>🌅</Text>
          <View style={styles.iconShadow} />
        </View>
        
        {/* 앱 이름 */}
        <Text style={styles.appName}>RiseUp</Text>
        <Text style={styles.tagline}>아침을 깨우는 스마트 알람</Text>
        
        {/* 로딩 애니메이션 */}
        <View style={styles.loadingContainer}>
          <View style={styles.loadingDot} />
          <View style={[styles.loadingDot, styles.loadingDot2]} />
          <View style={[styles.loadingDot, styles.loadingDot3]} />
        </View>
      </Animated.View>
      
      {/* 하단 텍스트 */}
      <Animated.View 
        style={[styles.footer, { opacity: fadeAnim }]}
      >
        <Text style={styles.footerText}>매일 아침을 새롭게</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a73e8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1a73e8',
    opacity: 0.9,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    zIndex: -1,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  tagline: {
    fontSize: 16,
    color: '#e3f2fd',
    fontWeight: '300',
    marginBottom: 40,
    textAlign: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
    marginHorizontal: 3,
    opacity: 0.7,
  },
  loadingDot2: {
    animationDelay: '0.2s',
  },
  loadingDot3: {
    animationDelay: '0.4s',
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  footerText: {
    color: '#e3f2fd',
    fontSize: 14,
    fontWeight: '300',
  },
});

export default SplashScreen;