#!/bin/bash

echo "🔧 Import 경로를 수정하는 중..."

# TabConfig.ts 파일의 import 수정
sed -i '' "s|import { HomeScreen } from '../screens/alarm';|import HomeScreen from '../screens/alarm/HomeScreen';|g" src/navigation/TabConfig.ts
sed -i '' "s|import { StopwatchScreen } from '../screens/stopwatch';|import StopwatchScreen from '../screens/stopwatch/StopwatchScreen';|g" src/navigation/TabConfig.ts
sed -i '' "s|import { TimerScreen } from '../screens/timer';|import TimerScreen from '../screens/timer/TimerScreen';|g" src/navigation/TabConfig.ts
sed -i '' "s|import { WorldClockScreen } from '../screens/worldclock';|import WorldClockScreen from '../screens/worldclock/WorldClockScreen';|g" src/navigation/TabConfig.ts
sed -i '' "s|import { IntervalSignalScreen } from '../screens/interval';|import IntervalSignalScreen from '../screens/interval/IntervalSignalScreen';|g" src/navigation/TabConfig.ts
sed -i '' "s|import { SportsTimerScreen } from '../screens/sports';|import SportsTimerScreen from '../screens/sports/SportsTimerScreen';|g" src/navigation/TabConfig.ts

# 기타 주요 navigation 파일들의 import 경로 수정
find src/navigation -name "*.tsx" -o -name "*.ts" | xargs sed -i '' "s|../screens/HomeScreen|../screens/alarm/HomeScreen|g"
find src/navigation -name "*.tsx" -o -name "*.ts" | xargs sed -i '' "s|../screens/StopwatchScreen|../screens/stopwatch/StopwatchScreen|g"
find src/navigation -name "*.tsx" -o -name "*.ts" | xargs sed -i '' "s|../screens/TimerScreen|../screens/timer/TimerScreen|g"

# 모든 파일에서 상대 경로 수정 - 컨텍스트 import
find src/screens -name "*.tsx" | xargs sed -i '' "s|'../context/|'../../context/|g"
find src/screens -name "*.tsx" | xargs sed -i '' "s|'../components/|'../../components/|g"
find src/screens -name "*.tsx" | xargs sed -i '' "s|'../utils/|'../../utils/|g"
find src/screens -name "*.tsx" | xargs sed -i '' "s|'../hooks/|'../../hooks/|g"
find src/screens -name "*.tsx" | xargs sed -i '' "s|'../services/|'../../services/|g"
find src/screens -name "*.tsx" | xargs sed -i '' "s|'../navigation/|'../../navigation/|g"
find src/screens -name "*.tsx" | xargs sed -i '' "s|'../notifications/|'../../notifications/|g"
find src/screens -name "*.tsx" | xargs sed -i '' "s|'../data/|'../../data/|g"
find src/screens -name "*.tsx" | xargs sed -i '' "s|'../native/|'../../native/|g"
find src/screens -name "*.tsx" | xargs sed -i '' "s|'../styles/|'../../styles/|g"

# 알람 폴더 내부 cross-reference 수정
find src/screens/alarm -name "*.tsx" | xargs sed -i '' "s|'../screens/AlarmHistoryScreen'|'./AlarmHistoryScreen'|g"
find src/screens/alarm -name "*.tsx" | xargs sed -i '' "s|'../screens/BackupRestoreScreen'|'./BackupRestoreScreen'|g"
find src/screens/alarm -name "*.tsx" | xargs sed -i '' "s|'../screens/AlarmStatsScreen'|'./AlarmStatsScreen'|g"

# 공통 폴더 내부 cross-reference 수정
find src/screens/common -name "*.tsx" | xargs sed -i '' "s|'../screens/CalculatorScreen'|'../utilities/CalculatorScreen'|g"
find src/screens/common -name "*.tsx" | xargs sed -i '' "s|'../screens/NotesScreen'|'../utilities/NotesScreen'|g"

echo "✅ Import 경로 수정 완료!"
echo "📋 다음 단계: npx tsc --noEmit 으로 오류 확인" 