# 📁 폴더 구조 재설계

## 📅 변경 일자
2024년 (탭별 폴더 구조화)

## 🎯 변경 목적

### 문제점
- 33개의 화면 파일이 `/src/screens/` 한 폴더에 모두 위치
- 파일 찾기 어려움 및 관리의 복잡성
- 탭별 관련성이 명확하지 않음
- 팀 협업시 충돌 가능성 증가

### 해결 방안
탭 기반 폴더 구조로 재조직화

## 🏗️ 새로운 구조

```
src/screens/
├── alarm/          # 🏠 알람 관련 화면들
│   ├── HomeScreen.tsx
│   ├── AddAlarmScreen.tsx
│   ├── AlarmHistoryScreen.tsx
│   ├── AlarmStatsScreen.tsx
│   ├── AlarmGroupManagerScreen.tsx
│   ├── BackupRestoreScreen.tsx
│   └── index.ts
├── stopwatch/      # ⏱️ 스톱워치
│   ├── StopwatchScreen.tsx
│   └── index.ts
├── timer/          # ⏲️ 타이머 관련 화면들
│   ├── TimerScreen.tsx
│   ├── AddTimerScreen.tsx
│   ├── TimerCategoriesScreen.tsx
│   ├── TimerHistoryScreen.tsx
│   ├── TimerTemplatesScreen.tsx
│   ├── MeditationTimerScreen.tsx
│   └── index.ts
├── worldclock/     # 🌍 세계시계
│   ├── WorldClockScreen.tsx
│   └── index.ts
├── interval/       # ⏳ 인터벌 관련 화면들
│   ├── IntervalSignalScreen.tsx
│   ├── IntervalHistoryScreen.tsx
│   ├── IntervalStatsScreen.tsx
│   ├── IntervalBackupScreen.tsx
│   ├── AddIntervalTemplateScreen.tsx
│   └── index.ts
├── sports/         # 🏆 스포츠 관련 화면들
│   ├── SportsTimerScreen.tsx
│   ├── AddCustomSportScreen.tsx
│   ├── ExerciseTrackerScreen.tsx
│   └── index.ts
├── common/         # ⚙️ 공통 설정 화면들
│   ├── TabManagerScreen.tsx
│   ├── ThemeSettingsScreen.tsx
│   └── index.ts
└── utilities/      # 🔧 유틸리티 도구들
    ├── CalculatorScreen.tsx
    ├── UnitConverterScreen.tsx
    ├── QRScannerScreen.tsx
    ├── MusicPlayerScreen.tsx
    ├── WeatherScreen.tsx
    ├── FlashlightScreen.tsx
    ├── NotesScreen.tsx
    ├── CalendarScreen.tsx
    ├── HabitTrackerScreen.tsx
    ├── MiniGamesScreen.tsx
    └── index.ts
```

## 🎯 설계 원칙

### 1. 기능별 그룹핑
- 주요 탭별로 관련 화면들을 묶음
- 논리적 연관성을 기준으로 분류

### 2. 확장성 고려
- 새로운 기능 추가시 해당 폴더에 쉽게 추가 가능
- index.ts로 깔끔한 export 관리

### 3. 네이밍 컨벤션
- 폴더명: 소문자, 단수형
- 파일명: PascalCase 유지

### 4. Import 경로 최적화
- 각 폴더별 index.ts로 재export
- 상대 경로 통일 (`../../`로 상위 레벨 접근)

## ✅ 장점

1. **가독성 향상**: 관련 파일들이 한 곳에 모임
2. **유지보수성**: 기능별 수정이 용이
3. **팀 협업**: 동시 작업시 충돌 최소화
4. **확장성**: 새 기능 추가가 체계적
5. **모듈화**: 컴포넌트 분리 철학 반영

## ⚠️ 주의사항

1. **Import 경로 대량 수정 필요**
   - 모든 파일의 import 경로를 `../../`로 변경
   - 자동화 스크립트 활용 필요

2. **빌드 설정 확인**
   - TypeScript 컴파일러가 새 경로 인식하는지 확인
   - Metro bundler 설정 점검

3. **팀원 커뮤니케이션**
   - 새로운 폴더 구조에 대한 안내 필요
   - 파일 위치 변경사항 공유

## 🚀 향후 개선 방향

1. **배럴 파일 최적화**
   - index.ts 파일들의 재export 성능 최적화
   - 트리 쉐이킹 고려

2. **공통 컴포넌트 분리**
   - 여러 탭에서 사용하는 컴포넌트들을 별도 폴더로 분리
   - `src/components/common/` 활용

3. **타입 정의 정리**
   - 각 기능별 타입들을 해당 폴더 내 types.ts로 이동
   - 글로벌 타입과 로컬 타입 구분

---
*작성자: AI Assistant*
*리뷰 필요: 팀 리더 승인 후 적용* 