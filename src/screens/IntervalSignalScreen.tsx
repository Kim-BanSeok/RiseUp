// RiseUp/src/screens/IntervalSignalScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const IntervalSignalScreen = () => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 80 }]}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>⏳ 인터벌 신호</Text>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ 추가</Text>
        </TouchableOpacity>
      </View>

      {/* 설명 */}
      <View style={styles.descriptionContainer}>
        <Text style={styles.description}>
          운동이나 작업을 위한 인터벌 타이머를 설정하세요.
        </Text>
        <Text style={styles.subDescription}>
          • 운동 인터벌 (30초 운동 / 10초 휴식)
          {'\n'}• 포모도로 타이머 (25분 작업 / 5분 휴식)
          {'\n'}• 맞춤형 인터벌 설정
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {/* 인터벌 목록이 여기에 들어갈 예정 */}
        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderTitle}>🚧 개발 예정</Text>
          <Text style={styles.placeholderText}>
            인터벌 신호 기능을 준비 중입니다.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2D1B14',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD4B3',
  },
  addButton: {
    backgroundColor: '#FF7F50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFD4B3',
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  descriptionContainer: {
    backgroundColor: '#4A2C1A',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FF7F50',
  },
  description: {
    fontSize: 16,
    color: '#FFD4B3',
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  subDescription: {
    fontSize: 14,
    color: '#FFAB7A',
    lineHeight: 20,
  },
  content: {
    flex: 1,
  },
  placeholderCard: {
    backgroundColor: '#4A2C1A',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#8B6341',
    alignItems: 'center',
  },
  placeholderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF7F50',
    marginBottom: 10,
  },
  placeholderText: {
    fontSize: 16,
    color: '#FFAB7A',
    textAlign: 'center',
  },
});

export default IntervalSignalScreen;