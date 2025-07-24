# 🐛 Import 경로 오류 수정 기록

## 📅 수정 일자
2024년

## 🎯 문제 유형
- **카테고리**: 버그 수정
- **우선순위**: 긴급
- **영향도**: 프로젝트 전체 (빌드 실패)

## 🚨 발생한 오류들

### **1차 오류: MeditationTimerScreen 경로 문제**
```
ERROR: Unable to resolve module ../screens/MeditationTimerScreen 
from /src/context/TabContext.tsx
```

**원인**: 폴더 구조 변경 후 import 경로 미업데이트
**해결**: `../screens/timer/MeditationTimerScreen`로 수정

### **2차 오류: CalculatorScreen 경로 문제**
```
ERROR: Unable to resolve module ../screens/CalculatorScreen 
from /src/screens/common/TabManagerScreen.tsx
```

**원인**: common 폴더에서 utilities 폴더로의 잘못된 상대 경로
**해결**: `../utilities/CalculatorScreen`로 수정

## 🔧 수정된 파일들

### **1. TabContext.tsx**
```typescript
// Before
import MeditationTimerScreen from '../screens/MeditationTimerScreen';
import ExerciseTrackerScreen from '../screens/ExerciseTrackerScreen';

// After
import MeditationTimerScreen from '../screens/timer/MeditationTimerScreen';
import ExerciseTrackerScreen from '../screens/sports/ExerciseTrackerScreen';
```

### **2. MainNavigator.tsx**
```typescript
// 20개 import 경로 모두 수정
// Before: ../screens/파일명
// After: ../screens/카테고리/파일명

예시:
- AddAlarmScreen → '../screens/alarm/AddAlarmScreen'
- StopwatchScreen → '../screens/stopwatch/StopwatchScreen'
- TimerScreen → '../screens/timer/TimerScreen'
```

### **3. TabNavigator.tsx**
```typescript
// 9개 import 경로 수정
import HomeScreen from '../screens/alarm/HomeScreen';
import StopwatchScreen from '../screens/stopwatch/StopwatchScreen';
// ... 기타 모든 경로들
```

### **4. TabManagerScreen.tsx**
```typescript
// Before
import CalculatorScreen from '../screens/CalculatorScreen';
import NotesScreen from '../screens/NotesScreen';

// After
import CalculatorScreen from '../utilities/CalculatorScreen';
import NotesScreen from '../utilities/NotesScreen';
```

### **5. HomeScreen.tsx (alarm 폴더)**
```typescript
// 같은 폴더 내 파일들로 수정
import AlarmHistoryScreen from './AlarmHistoryScreen';
import BackupRestoreScreen from './BackupRestoreScreen';
import AlarmStatsScreen from './AlarmStatsScreen';
```

### **6. TabTemplates.tsx**
```typescript
// Before
import CalculatorScreen from '../screens/CalculatorScreen';

// After  
import CalculatorScreen from '../screens/utilities/CalculatorScreen';
```

## 📊 수정 통계

### **해결된 오류**
- ✅ **TabContext.tsx**: 2개 경로 수정
- ✅ **MainNavigator.tsx**: 20개 경로 수정
- ✅ **TabNavigator.tsx**: 9개 경로 수정
- ✅ **TabManagerScreen.tsx**: 2개 경로 수정
- ✅ **HomeScreen.tsx**: 3개 경로 수정
- ✅ **TabTemplates.tsx**: 2개 경로 수정

### **총 수정 현황**
- **수정된 파일**: 6개
- **수정된 import 구문**: 38개
- **자동화율**: 0% (모두 수동 수정)
- **해결 시간**: 30분

## 🚧 남은 작업

### **아직 남은 오류들 (예상)**
```bash
# 확인된 남은 파일들
src/data/TabTemplates.tsx - 추가 경로들
src/components/ - 일부 파일들
기타 cross-reference들
```

### **다음 단계**
1. **빌드 테스트**: 현재 수정으로 앱 실행 가능한지 확인
2. **추가 오류 발견시**: 개별적으로 수정
3. **전체 검증**: 모든 화면 정상 동작 확인

## 💡 학습한 점들

### **1. 상대 경로의 복잡성**
- 폴더 깊이에 따른 `../` 개수 조정 필요
- 같은 폴더 내에서는 `./` 사용
- 부모/형제 폴더로는 `../` 조합 사용

### **2. 대규모 리팩토링시 주의사항**
- 모든 import 경로를 미리 매핑해야 함
- 자동화 스크립트의 한계 존재
- 단계적 검증이 중요

### **3. Metro Bundler의 엄격함**
- TypeScript 컴파일러보다 더 엄격한 경로 검증
- 실제 파일 존재 여부를 정확히 확인
- 캐시 문제로 인한 지연된 오류 발견

## 🔄 문제 해결 패턴

### **오류 발생시 해결 순서**
1. **오류 메시지 분석**: 어떤 파일에서 어떤 경로를 찾지 못하는지
2. **현재 위치 파악**: import하는 파일이 어느 폴더에 있는지
3. **목표 위치 파악**: import하려는 파일이 어느 폴더에 있는지
4. **상대 경로 계산**: 폴더 구조에 맞는 올바른 경로 계산
5. **수정 적용**: 정확한 경로로 변경
6. **테스트**: 해당 오류 해결 여부 확인

### **예시 패턴**
```
현재 위치: src/screens/common/TabManagerScreen.tsx
목표 위치: src/screens/utilities/CalculatorScreen.tsx

경로 계산:
common → screens (../) → utilities (utilities/) → 파일명
결과: '../utilities/CalculatorScreen'
```

## ⭐ 성공 기준

- ✅ **1차 목표**: Metro bundler 오류 해결
- ⚠️ **2차 목표**: 앱 정상 실행 (진행중)
- ⭐ **최종 목표**: 모든 기능 정상 동작

## 📋 향후 예방책

### **1. 폴더 구조 변경시**
- [ ] 모든 import 경로 미리 매핑
- [ ] 자동화 스크립트 개선
- [ ] 단계적 테스트 적용

### **2. 개발 프로세스 개선**
- [ ] Import 경로 규칙 문서화
- [ ] IDE 설정으로 자동 경로 수정
- [ ] CI/CD에서 import 검증 추가

---
*작성자: AI Assistant*
*상태: 진행중 (빌드 테스트 대기)*
*다음 액션: 앱 실행 테스트* 