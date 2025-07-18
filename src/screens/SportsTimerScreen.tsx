// RiseUp/src/screens/SportsTimerScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SportsTimerScreen = () => {
  const insets = useSafeAreaInsets();

  const sportsTemplates = [
    { id: '1', name: '축구', icon: '⚽', periods: ['전반 45분', '하프타임 15분', '후반 45분'] },
    { id: '2', name: '농구', icon: '🏀', periods: ['1쿼터 12분', '휴식 2분', '2쿼터 12분', '하프타임 15분'] },
    { id: '3', name: '배구', icon: '🏐', periods: ['1세트', '세트간 휴식 3분', '2세트'] },
    { id: '4', name: '테니스', icon: '🎾', periods: ['1세트', '세트간 휴식 90초', '2세트'] },
  ];

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 80 }]}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>🏆 스포츠 타이머</Text>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ 커스텀</Text>
        </TouchableOpacity>
      </View>

      {/* 설명 */}
      <View style={styles.descriptionContainer}>
        <Text style={styles.description}>
          스포츠 경기 시간을 정확하게 관리하세요.
        </Text>
        <Text style={styles.subDescription}>
          전반/후반, 쿼터, 세트 시간과 휴식시간을 자동으로 알려드립니다.
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>스포츠 템플릿</Text>
        
        {sportsTemplates.map((sport) => (
          <TouchableOpacity key={sport.id} style={styles.sportCard}>
            <View style={styles.sportHeader}>
              <Text style={styles.sportIcon}>{sport.icon}</Text>
              <Text style={styles.sportName}>{sport.name}</Text>
              <TouchableOpacity style={styles.startButton}>
                <Text style={styles.startButtonText}>시작</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.periodsContainer}>
              {sport.periods.map((period, index) => (
                <Text key={index} style={styles.periodText}>
                  {index + 1}. {period}
                </Text>
              ))}
            </View>
          </TouchableOpacity>
        ))}

        {/* 개발 예정 카드 */}
        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderTitle}>🚧 개발 예정</Text>
          <Text style={styles.placeholderText}>
            스포츠 타이머 기능을 준비 중입니다.
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
    textAlign: 'center',
    lineHeight: 20,
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF7F50',
    marginBottom: 15,
  },
  sportCard: {
    backgroundColor: '#4A2C1A',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#8B6341',
  },
  sportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sportIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  sportName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD4B3',
    flex: 1,
  },
  startButton: {
    backgroundColor: '#FF7F50',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  startButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  periodsContainer: {
    marginTop: 5,
  },
  periodText: {
    fontSize: 14,
    color: '#FFAB7A',
    marginBottom: 3,
  },
  placeholderCard: {
    backgroundColor: '#4A2C1A',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#8B6341',
    alignItems: 'center',
    marginTop: 20,
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

export default SportsTimerScreen;