# Redux Toolkit 도입 검토 및 상태 관리 분석

## 현재 Context API 사용 현황

### 1. 기존 Context 구조
- **AlarmContext**: 알람 관리, 그룹, 히스토리 (70+ 라인, 복잡한 상태)
- **TimerContext**: 타이머, 템플릿, 카테고리, 히스토리 (850+ 라인, 매우 복잡)
- **IntervalContext**: 인터벌 타이머, 백그라운드 관리 (613+ 라인, 복잡)
- **TabContext**: 탭 관리 및 동적 컴포넌트 (240+ 라인, 중간 복잡도)
- **GameScoreContext**: 게임 점수 관리 (76 라인, 단순)
- **ThemeContext**: 테마 설정 (294 라인, 중간 복잡도)

### 2. 복잡성 분석

#### 고복잡도 Context
- **TimerContext** (850+ 라인)
  - 다중 상태: timers, templates, history, categories
  - 복잡한 비즈니스 로직: 타이머 실행, 완료 처리
  - AsyncStorage 연동: 6개의 useEffect
  - 실시간 업데이트: setInterval 사용
  
- **IntervalContext** (613 라인)
  - 백그라운드 타이머 관리
  - 복잡한 상태 계산: currentPhase, currentCycle
  - 외부 시스템 연동: BackgroundTimerManager

#### 중복 로직
- **AsyncStorage 패턴**: 모든 Context에서 반복
- **히스토리 관리**: Alarm, Timer, Interval에서 중복
- **완료 처리**: Timer, Interval에서 유사한 로직

### 3. 성능 이슈

#### Context 리렌더링 문제
```typescript
// TimerContext에서 10ms마다 모든 타이머 상태 업데이트
useEffect(() => {
  const interval = setInterval(() => {
    setTimers(prevTimers => 
      prevTimers.map(timer => {
        // 모든 구독 컴포넌트가 리렌더링됨
      })
    );
  }, 10);
}, []);
```

#### 불필요한 리렌더링
- 하나의 타이머 변경 시 전체 타이머 리스트 업데이트
- Context value 객체 재생성으로 인한 의존성 체인 리렌더링

## Redux Toolkit 도입 검토

### 1. 도입 장점

#### A. 성능 최적화
```typescript
// Redux Selector를 통한 세분화된 구독
const activeTimers = useSelector(selectActiveTimers);
const completedTimers = useSelector(selectCompletedTimers);
// 필요한 데이터만 구독하여 리렌더링 최소화
```

#### B. 코드 구조 개선
```typescript
// Redux Slice로 관련 로직 그룹화
const timerSlice = createSlice({
  name: 'timer',
  initialState,
  reducers: {
    startTimer: (state, action) => {
      // Immer로 불변성 관리 자동화
    },
    updateTimer: (state, action) => {
      // 예측 가능한 상태 업데이트
    }
  }
});
```

#### C. 미들웨어 활용
```typescript
// Redux-Persist로 자동 저장
// Redux-Saga/RTK Query로 비동기 처리 개선
```

### 2. 도입 단점

#### A. 학습 곡선
- Redux 개념 이해 필요
- 기존 Context 코드 대대적 리팩토링

#### B. 코드 복잡성 증가
- 단순한 GameScoreContext 같은 경우 오버엔지니어링
- Boilerplate 코드 증가

#### C. 번들 크기 증가
- Redux Toolkit: ~47KB
- React Redux: ~22KB

### 3. 혼합 접근법 제안

#### Redux로 이관할 Context
1. **TimerContext** (최우선)
   - 복잡한 상태 로직
   - 실시간 업데이트 성능 이슈
   - 다중 화면 동기화 필요

2. **AlarmContext** (두 번째)
   - 복잡한 스케줄링 로직
   - 백그라운드 알림 관리

3. **IntervalContext** (세 번째)
   - 백그라운드 상태 관리
   - 복잡한 타이머 로직

#### Context로 유지할 것
1. **ThemeContext**
   - 간단한 상태
   - 전역적이지만 변경 빈도 낮음

2. **GameScoreContext**
   - 단순한 상태 구조
   - 제한적인 사용 범위

3. **TabContext**
   - UI 상태 관리
   - 동적 컴포넌트 로딩

## 단계별 마이그레이션 계획

### Phase 1: Redux 기반 구축
```bash
npm install @reduxjs/toolkit react-redux redux-persist
```

### Phase 2: TimerContext 마이그레이션
- Redux slice 생성
- Selector 최적화
- 성능 비교 측정

### Phase 3: 점진적 확장
- AlarmContext 이관
- IntervalContext 이관
- 성능 모니터링

## 성능 개선 예상 효과

### Before (Context API)
```typescript
// 10ms마다 모든 구독 컴포넌트 리렌더링
TimerScreen -> 재렌더링
TimerCard (10개) -> 모두 재렌더링
진행률 바 (10개) -> 모두 재렌더링
```

### After (Redux + Selectors)
```typescript
// 변경된 타이머만 선별적 업데이트
TimerScreen -> 리렌더링 안함
TimerCard (변경된 1개) -> 해당 카드만 재렌더링
진행률 바 (변경된 1개) -> 해당 바만 재렌더링
```

## 결론 및 권장사항

### 권장사항: **단계적 혼합 접근**

1. **즉시 개선 가능한 것들**
   - Context value 메모이제이션
   - useCallback/useMemo 추가 적용
   - 구독 최적화

2. **Redux 도입 대상**
   - TimerContext (최우선 - 성능 이슈 심각)
   - AlarmContext (두 번째 - 복잡성 높음)

3. **Context 유지 대상**
   - ThemeContext, GameScoreContext, TabContext

### 예상 성능 개선
- **렌더링 횟수**: 70-80% 감소
- **메모리 사용량**: 20-30% 감소
- **UI 반응성**: 현저한 개선

### 개발 비용
- **마이그레이션 시간**: 2-3일 (TimerContext 기준)
- **학습 비용**: 중간 (기존 Redux 경험 없는 경우)
- **유지보수성**: 장기적으로 크게 개선 