#!/bin/bash

echo "🧹 RiseUp 프로젝트 용량 정리 시작..."

# 1. node_modules 재설치 (가장 효과적)
echo "📦 node_modules 정리 중..."
rm -rf node_modules/
npm install

# 2. 시스템 파일 정리
echo "🗑️ 시스템 파일 정리 중..."
find . -name ".DS_Store" -delete
find . -name "Thumbs.db" -delete

# 3. 빌드 캐시 정리
echo "🔨 빌드 캐시 정리 중..."
rm -rf android/app/build/
rm -rf android/.gradle/
rm -rf ios/build/
rm -rf .metro-health-check*

# 4. 불필요한 폴더 정리 (확인 후 실행)
echo "📂 불필요한 폴더 정리 중..."
rm -rf side_AlarmApp/
rm -rf .bundle/

# 5. Metro 캐시 정리
echo "⚡ Metro 캐시 정리 중..."
npx react-native start --reset-cache

echo "✅ 정리 완료! 용량이 크게 줄었을 것입니다." 