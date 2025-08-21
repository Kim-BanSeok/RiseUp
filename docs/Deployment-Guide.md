# 🚀 RiseUp 배포 가이드

## 📱 플랫폼별 배포 방법

### Android 배포

#### 1. 빌드 준비

```bash
# 프로젝트 루트에서
cd android

# Gradle 래퍼 권한 설정 (Linux/Mac)
chmod +x gradlew

# 의존성 동기화
./gradlew clean
```

#### 2. Release 빌드

```bash
# Release APK 빌드
./gradlew assembleRelease

# Release AAB 빌드 (Google Play Store용)
./gradlew bundleRelease
```

#### 3. 서명 설정

`android/app/build.gradle` 파일에서 서명 설정:

```gradle
android {
    signingConfigs {
        release {
            storeFile file("your-release-key.keystore")
            storePassword "your-store-password"
            keyAlias "your-key-alias"
            keyPassword "your-key-password"
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

#### 4. ProGuard 설정

`android/app/proguard-rules.pro`:

```proguard
# React Native 기본 규칙
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }

# AsyncStorage
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# 기타 라이브러리 규칙 추가
```

### iOS 배포

#### 1. 빌드 준비

```bash
# iOS 폴더로 이동
cd ios

# CocoaPods 의존성 설치
pod install

# Xcode 프로젝트 열기
open RiseUp.xcworkspace
```

#### 2. Xcode 설정

1. **Bundle Identifier 설정**
   - `RiseUp.xcodeproj` → `TARGETS` → `RiseUp` → `General`
   - `Bundle Identifier`: `com.yourcompany.riseup`

2. **Signing & Capabilities**
   - `Automatically manage signing` 체크
   - `Team` 선택
   - `Provisioning Profile` 자동 생성

3. **Build Configuration**
   - `Release` 설정으로 변경
   - `Product` → `Scheme` → `Edit Scheme`

#### 3. Archive 및 배포

```bash
# Archive 생성
xcodebuild -workspace RiseUp.xcworkspace \
           -scheme RiseUp \
           -configuration Release \
           -archivePath build/RiseUp.xcarchive \
           archive

# IPA 생성
xcodebuild -exportArchive \
           -archivePath build/RiseUp.xcarchive \
           -exportPath build/ \
           -exportOptionsPlist exportOptions.plist
```

## 🔧 환경별 설정

### Development 환경

```bash
# Metro 서버 시작
npm start

# Android 개발 빌드
npm run android

# iOS 개발 빌드
npm run ios
```

### Staging 환경

```bash
# 환경 변수 설정
export ENV=staging

# Staging용 빌드
npm run build:staging
```

### Production 환경

```bash
# 환경 변수 설정
export ENV=production

# Production용 빌드
npm run build:production
```

## 📦 앱 스토어 배포

### Google Play Store

#### 1. AAB 파일 업로드

```bash
# Release AAB 생성
cd android
./gradlew bundleRelease

# 생성된 파일 위치
# android/app/build/outputs/bundle/release/app-release.aab
```

#### 2. Play Console 설정

1. **앱 정보**
   - 앱 이름: RiseUp
   - 간단한 설명: 다기능 알람 및 타이머 앱
   - 전체 설명: 상세한 기능 설명

2. **그래픽 자산**
   - 앱 아이콘: 512x512 PNG
   - 스크린샷: 다양한 화면 크기별
   - 피처드 그래픽: 1024x500 PNG

3. **콘텐츠 등급**
   - 모든 연령층 대상
   - 광고 없음

#### 3. 릴리즈 관리

1. **내부 테스트**
   - 개발팀 내부 테스트
   - 초기 버그 수정

2. **비공개 테스트**
   - 제한된 사용자 그룹
   - 피드백 수집

3. **공개 테스트**
   - 더 넓은 사용자 그룹
   - 안정성 검증

4. **프로덕션 배포**
   - 단계적 롤아웃
   - 모니터링 및 대응

### Apple App Store

#### 1. App Store Connect 설정

1. **앱 정보**
   - 앱 이름: RiseUp
   - 부제목: 다기능 알람 및 타이머
   - 설명: 상세한 기능 설명

2. **카테고리**
   - 주 카테고리: Productivity
   - 보조 카테고리: Utilities

3. **가격 및 가용성**
   - 가격: 무료
   - 가용 지역: 전 세계

#### 2. 심사 제출

1. **빌드 업로드**
   - Xcode에서 Archive
   - App Store Connect에 업로드

2. **심사 정보**
   - 테스트 계정 정보
   - 특별한 기능 설명
   - 개인정보 처리방침

3. **심사 대기**
   - 일반적으로 1-3일
   - 피드백 수신 시 대응

## 🔍 배포 후 모니터링

### 성능 모니터링

```typescript
// 성능 측정 코드 예시
import { PerformanceObserver } from 'react-native';

const performanceObserver = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    console.log(`${entry.name}: ${entry.duration}ms`);
  });
});

performanceObserver.observe({ entryTypes: ['measure'] });
```

### 에러 추적

```typescript
// 에러 바운더리 예시
import React from 'react';
import { View, Text } from 'react-native';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // 에러 로깅 서비스로 전송
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>앱에 문제가 발생했습니다.</Text>
        </View>
      );
    }

    return this.props.children;
  }
}
```

### 사용자 피드백 수집

```typescript
// 피드백 수집 예시
import { Alert } from 'react-native';

const showFeedbackDialog = () => {
  Alert.alert(
    '피드백',
    '앱 사용 경험에 대해 의견을 들려주세요',
    [
      { text: '나중에', style: 'cancel' },
      { text: '피드백 작성', onPress: () => openFeedbackForm() }
    ]
  );
};
```

## 🚨 문제 해결

### 일반적인 빌드 오류

#### Android

```bash
# Gradle 캐시 정리
cd android
./gradlew clean
./gradlew --stop

# 의존성 재설치
cd ..
npm install
```

#### iOS

```bash
# iOS 빌드 캐시 정리
cd ios
rm -rf build/
rm -rf DerivedData/
pod deintegrate
pod install
```

### 메모리 문제

```typescript
// 메모리 최적화 예시
import { useMemo, useCallback } from 'react';

const OptimizedComponent = ({ data }) => {
  // 계산 비용이 큰 값 메모이제이션
  const processedData = useMemo(() => {
    return data.map(item => heavyProcessing(item));
  }, [data]);

  // 함수 참조 안정화
  const handlePress = useCallback((id) => {
    console.log('Item pressed:', id);
  }, []);

  return (
    // 컴포넌트 렌더링
  );
};
```

## 📋 체크리스트

### 배포 전 체크

- [ ] 모든 기능 테스트 완료
- [ ] 성능 테스트 통과
- [ ] 보안 검사 완료
- [ ] 접근성 가이드라인 준수
- [ ] 개인정보 처리방침 업데이트
- [ ] 라이선스 파일 포함
- [ ] README 파일 업데이트

### 배포 후 체크

- [ ] 앱 스토어 등록 확인
- [ ] 다운로드 및 설치 테스트
- [ ] 푸시 알림 테스트
- [ ] 백그라운드 동작 테스트
- [ ] 다양한 기기에서 테스트
- [ ] 사용자 피드백 모니터링

---

*이 가이드는 RiseUp 앱의 배포 과정을 설명합니다. 더 자세한 내용은 [완전 개발문서](../RiseUp-Complete-Documentation.md)를 참조하세요.*
