# 🚨 RiseUp 문제 해결 가이드

## 🔍 일반적인 문제들

### 1. 앱이 시작되지 않음

#### 증상
- 앱 아이콘을 터치해도 반응 없음
- 검은 화면만 표시
- 즉시 종료됨

#### 해결 방법

**1단계: 캐시 정리**
```bash
# Metro 캐시 정리
npm start -- --reset-cache

# Watchman 캐시 정리 (macOS)
watchman watch-del-all

# React Native 캐시 정리
rm -rf node_modules/
npm install
```

**2단계: 네이티브 빌드 정리**
```bash
# Android
cd android
./gradlew clean
cd ..

# iOS
cd ios
rm -rf build/
rm -rf DerivedData/
pod deintegrate
pod install
cd ..
```

**3단계: 디바이스/시뮬레이터 재시작**
```bash
# Android 에뮬레이터 재시작
adb kill-server
adb start-server

# iOS 시뮬레이터 재시작
xcrun simctl shutdown all
xcrun simctl boot "iPhone 14"
```

### 2. Metro 서버 연결 문제

#### 증상
- "Metro bundler is not running" 오류
- "Unable to resolve module" 오류
- 번들링이 멈춤

#### 해결 방법

**Metro 서버 재시작**
```bash
# 1. 현재 Metro 프로세스 종료
pkill -f "react-native"

# 2. 포트 확인 및 해제
lsof -ti:8081 | xargs kill -9

# 3. Metro 서버 재시작
npm start
```

**포트 충돌 해결**
```bash
# 다른 포트로 Metro 실행
npm start -- --port 8082

# 또는 환경변수 설정
export RCT_METRO_PORT=8082
npm start
```

### 3. 네이티브 모듈 오류

#### 증상
- "Native module cannot be null" 오류
- "Module not found" 오류
- 링킹 오류

#### 해결 방법

**Android**
```bash
cd android
./gradlew clean
./gradlew assembleDebug
cd ..
```

**iOS**
```bash
cd ios
pod install
cd ..
npx react-native run-ios
```

## 📱 플랫폼별 문제

### Android 문제

#### 1. Gradle 빌드 실패

**오류 메시지**: `Execution failed for task ':app:processDebugResources'`

**해결 방법**:
```bash
# Gradle 캐시 정리
cd android
./gradlew clean
./gradlew --stop

# 의존성 재설치
cd ..
npm install
cd android
./gradlew assembleDebug
```

#### 2. ADB 연결 문제

**오류 메시지**: `adb: command not found` 또는 `device unauthorized`

**해결 방법**:
```bash
# ADB 경로 확인
which adb

# 환경변수 설정 (macOS/Linux)
export PATH=$PATH:$HOME/Library/Android/sdk/platform-tools

# 디바이스 인증
adb devices
# 디바이스에서 "USB 디버깅 허용" 확인
```

#### 3. 에뮬레이터 성능 문제

**증상**: 에뮬레이터가 느리거나 멈춤

**해결 방법**:
```bash
# 에뮬레이터 설정 최적화
# AVD Manager에서:
# - Hardware acceleration: Intel HAXM 사용
# - RAM: 2GB 이상
# - VM Heap: 256MB
# - Graphics: Hardware - GLES 2.0
```

### iOS 문제

#### 1. CocoaPods 오류

**오류 메시지**: `pod: command not found` 또는 `pod install` 실패

**해결 방법**:
```bash
# CocoaPods 설치
sudo gem install cocoapods

# 또는 Homebrew 사용
brew install cocoapods

# iOS 프로젝트에서
cd ios
pod install
```

#### 2. Xcode 빌드 오류

**오류 메시지**: `Build input file cannot be found` 또는 `Code signing is required`

**해결 방법**:
1. **Xcode에서 프로젝트 열기**
   ```bash
   open ios/RiseUp.xcworkspace
   ```

2. **Signing & Capabilities 설정**
   - `Automatically manage signing` 체크
   - `Team` 선택
   - `Bundle Identifier` 고유값으로 설정

3. **Build Settings 확인**
   - `iOS Deployment Target` 설정
   - `Architectures` 설정

#### 3. 시뮬레이터 문제

**증상**: 시뮬레이터가 실행되지 않음

**해결 방법**:
```bash
# 시뮬레이터 재설정
xcrun simctl shutdown all
xcrun simctl erase all

# 특정 시뮬레이터 실행
xcrun simctl boot "iPhone 14"
open -a Simulator
```

## 🧩 React Native 특정 문제

### 1. Hot Reload 문제

#### 증상
- 코드 변경 시 자동 새로고침 안됨
- 변경사항이 반영되지 않음

#### 해결 방법

**개발자 메뉴에서 설정**
1. 디바이스에서 `Cmd+M` (Android) 또는 `Cmd+D` (iOS)
2. `Enable Fast Refresh` 체크
3. `Reload` 선택

**터미널에서 설정**
```bash
# Fast Refresh 강제 활성화
npx react-native start --reset-cache
```

### 2. 네비게이션 문제

#### 증상
- 화면 전환이 안됨
- `navigation.navigate` 오류
- 탭 전환이 안됨

#### 해결 방법

**네비게이션 설정 확인**
```typescript
// App.tsx에서 NavigationContainer 확인
import { NavigationContainer } from '@react-navigation/native';

export default function App() {
  return (
    <NavigationContainer>
      <MainNavigator />
    </NavigationContainer>
  );
}
```

**스택 네비게이터 설정**
```typescript
// 화면 등록 확인
const Stack = createStackNavigator();

function MainNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Alarm" component={AlarmScreen} />
      {/* 모든 화면이 등록되어 있는지 확인 */}
    </Stack.Navigator>
  );
}
```

### 3. 상태 관리 문제

#### 증상
- Context 값이 업데이트되지 않음
- 상태 변경이 UI에 반영되지 않음

#### 해결 방법

**Context Provider 확인**
```typescript
// App.tsx에서 Provider 순서 확인
export default function App() {
  return (
    <AlarmProvider>
      <TimerProvider>
        <TabProvider>
          <AppNavigator />
        </TabProvider>
      </TimerProvider>
    </AlarmProvider>
  );
}
```

**useEffect 의존성 배열 확인**
```typescript
// 무한 루프 방지
useEffect(() => {
  // 상태 업데이트 로직
}, [dependency]); // 의존성 배열 확인
```

## 🔧 성능 문제

### 1. 렌더링 성능 저하

#### 증상
- 앱이 느려짐
- 스크롤이 버벅임
- 메모리 사용량 증가

#### 해결 방법

**React.memo 사용**
```typescript
const OptimizedComponent = React.memo(({ data }) => {
  return (
    <View>
      {data.map(item => (
        <Item key={item.id} item={item} />
      ))}
    </View>
  );
});
```

**useMemo/useCallback 최적화**
```typescript
const Component = ({ items }) => {
  // 계산 비용이 큰 값 메모이제이션
  const processedItems = useMemo(() => {
    return items.map(item => heavyProcessing(item));
  }, [items]);

  // 함수 참조 안정화
  const handlePress = useCallback((id) => {
    console.log('Pressed:', id);
  }, []);

  return (
    // 컴포넌트 렌더링
  );
};
```

### 2. 메모리 누수

#### 증상
- 앱 실행 시간이 길어질수록 느려짐
- 메모리 사용량이 계속 증가

#### 해결 방법

**useEffect 정리 함수 사용**
```typescript
useEffect(() => {
  const interval = setInterval(() => {
    // 타이머 로직
  }, 1000);

  // 정리 함수
  return () => {
    clearInterval(interval);
  };
}, []);
```

**이벤트 리스너 정리**
```typescript
useEffect(() => {
  const handleAppStateChange = (nextAppState) => {
    // 앱 상태 변경 처리
  };

  AppState.addEventListener('change', handleAppStateChange);

  return () => {
    AppState.removeEventListener('change', handleAppStateChange);
  };
}, []);
```

## 📊 디버깅 도구

### 1. React Native Debugger

**설치 및 실행**
```bash
# macOS
brew install --cask react-native-debugger

# 또는 수동 설치
# https://github.com/jhen0409/react-native-debugger
```

**사용법**
1. React Native Debugger 실행
2. 앱에서 개발자 메뉴 열기
3. `Debug JS Remotely` 선택
4. Chrome DevTools에서 디버깅

### 2. Flipper

**설치**
```bash
# macOS
brew install --cask flipper

# 또는 https://fbflipper.com/ 에서 다운로드
```

**플러그인**
- Network
- Layout
- Crash Reporter
- Database
- Shared Preferences

### 3. 로깅 및 모니터링

**구조화된 로깅**
```typescript
const logger = {
  info: (message: string, data?: any) => {
    console.log(`ℹ️ [${new Date().toISOString()}] ${message}`, data);
  },
  error: (message: string, error?: any) => {
    console.error(`❌ [${new Date().toISOString()}] ${message}`, error);
  },
  warn: (message: string, data?: any) => {
    console.warn(`⚠️ [${new Date().toISOString()}] ${message}`, data);
  }
};

// 사용 예시
logger.info('알람 추가됨', { id: 'alarm-1', time: '08:00' });
logger.error('알람 저장 실패', error);
```

## 📋 문제 해결 체크리스트

### 기본 확인사항

- [ ] Node.js 버전 확인 (18.0.0 이상)
- [ ] React Native CLI 버전 확인
- [ ] 의존성 패키지 버전 호환성 확인
- [ ] 네이티브 모듈 링킹 상태 확인

### 빌드 문제

- [ ] 캐시 정리 완료
- [ ] 의존성 재설치 완료
- [ ] 네이티브 프로젝트 정리 완료
- [ ] 환경변수 설정 확인

### 런타임 문제

- [ ] Metro 서버 상태 확인
- [ ] 디바이스/시뮬레이터 연결 상태 확인
- [ ] 네트워크 설정 확인
- [ ] 권한 설정 확인

## 🆘 추가 도움

### 공식 문서
- [React Native Troubleshooting](https://reactnative.dev/docs/troubleshooting)
- [React Native Environment Setup](https://reactnative.dev/docs/environment-setup)

### 커뮤니티
- [React Native GitHub Issues](https://github.com/facebook/react-native/issues)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/react-native)
- [React Native Discord](https://discord.gg/react-native)

### 로그 분석
```bash
# Android 로그캣
adb logcat | grep -i "react"

# iOS 콘솔 로그
# Xcode → Window → Devices and Simulators → View Device Logs
```

---

*이 가이드는 RiseUp 앱의 일반적인 문제들을 해결하는 방법을 설명합니다. 더 자세한 내용은 [완전 개발문서](../RiseUp-Complete-Documentation.md)를 참조하세요.*
