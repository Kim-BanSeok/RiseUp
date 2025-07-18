import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useInterval, IntervalHistory } from '../context/IntervalContext';
import { useCustomAlert } from '../hooks/useCustomAlert';
import CustomAlert from '../components/CustomAlert';

const { width: screenWidth } = Dimensions.get('window');

const IntervalHistoryScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { history, clearHistory, templates } = useInterval();
  const { alertConfig, showCustomAlert, hideAlert } = useCustomAlert();
  
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedSort, setSelectedSort] = useState<'date' | 'duration' | 'template'>('date');

  // 필터 옵션
  const filterOptions = [
    { id: 'all', name: '전체', icon: '📋' },
    { id: 'today', name: '오늘', icon: '📅' },
    { id: 'week', name: '이번 주', icon: '📊' },
    { id: 'month', name: '이번 달', icon: '🗓️' },
  ];

  // 정렬 옵션
  const sortOptions = [
    { id: 'date', name: '날짜순', icon: '📅' },
    { id: 'duration', name: '시간순', icon: '⏱️' },
    { id: 'template', name: '템플릿순', icon: '📋' },
  ];

  // 날짜 필터링 함수
  const filterByDate = (item: IntervalHistory) => {
    const itemDate = new Date(item.endTime);
    const now = new Date();
    
    switch (selectedFilter) {
      case 'today':
        return itemDate.toDateString() === now.toDateString();
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return itemDate >= weekAgo;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return itemDate >= monthAgo;
      default:
        return true;
    }
  };

  // 필터링 및 정렬된 히스토리
  const filteredAndSortedHistory = useMemo(() => {
    let filtered = history.filter(filterByDate);
    
    return filtered.sort((a, b) => {
      switch (selectedSort) {
        case 'date':
          return new Date(b.endTime).getTime() - new Date(a.endTime).getTime();
        case 'duration':
          return b.totalDuration - a.totalDuration;
        case 'template':
          return a.templateName.localeCompare(b.templateName);
        default:
          return 0;
      }
    });
  }, [history, selectedFilter, selectedSort]);

  // 통계 계산
  const statistics = useMemo(() => {
    const filteredHistory = history.filter(filterByDate);
    
    const totalSessions = filteredHistory.length;
    const totalTime = filteredHistory.reduce((sum, session) => sum + session.totalDuration, 0);
    const avgDuration = totalSessions > 0 ? totalTime / totalSessions : 0;
    const totalCycles = filteredHistory.reduce((sum, session) => sum + session.completedCycles, 0);
    
    // 가장 많이 사용한 템플릿
    const templateCounts = filteredHistory.reduce((acc, session) => {
      acc[session.templateName] = (acc[session.templateName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const favoriteTemplate = Object.entries(templateCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '없음';

    return {
      totalSessions,
      totalTime,
      avgDuration,
      totalCycles,
      favoriteTemplate,
    };
  }, [history, selectedFilter]);

  // 시간 포맷팅
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}시간 ${minutes}분`;
    } else if (minutes > 0) {
      return `${minutes}분 ${secs}초`;
    } else {
      return `${secs}초`;
    }
  };

  // 날짜 포맷팅
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return `오늘 ${date.toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    } else if (diffDays === 1) {
      return `어제 ${date.toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    } else if (diffDays < 7) {
      return `${diffDays}일 전`;
    } else {
      return date.toLocaleDateString('ko-KR');
    }
  };

  // 히스토리 전체 삭제
  const handleClearHistory = () => {
    showCustomAlert(
      '히스토리 삭제',
      '모든 히스토리를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '삭제', 
          style: 'destructive',
          onPress: clearHistory
        }
      ]
    );
  };

  // 필터 버튼 렌더링
  const renderFilterButtons = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
      {filterOptions.map(option => (
        <TouchableOpacity
          key={option.id}
          style={[
            styles.filterButton,
            selectedFilter === option.id && styles.filterButtonActive
          ]}
          onPress={() => setSelectedFilter(option.id)}
        >
          <Text style={styles.filterIcon}>{option.icon}</Text>
          <Text style={[
            styles.filterText,
            selectedFilter === option.id && styles.filterTextActive
          ]}>
            {option.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  // 정렬 버튼 렌더링
  const renderSortButtons = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortContainer}>
      {sortOptions.map(option => (
        <TouchableOpacity
          key={option.id}
          style={[
            styles.sortButton,
            selectedSort === option.id && styles.sortButtonActive
          ]}
          onPress={() => setSelectedSort(option.id as any)}
        >
          <Text style={styles.sortIcon}>{option.icon}</Text>
          <Text style={[
            styles.sortText,
            selectedSort === option.id && styles.sortTextActive
          ]}>
            {option.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  // 통계 카드 렌더링
  const renderStatistics = () => (
    <View style={styles.statisticsCard}>
      <Text style={styles.statisticsTitle}>📊 통계</Text>
      <View style={styles.statisticsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{statistics.totalSessions}</Text>
          <Text style={styles.statLabel}>완료된 세션</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatDuration(statistics.totalTime)}</Text>
          <Text style={styles.statLabel}>총 시간</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{formatDuration(statistics.avgDuration)}</Text>
          <Text style={styles.statLabel}>평균 시간</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{statistics.totalCycles}</Text>
          <Text style={styles.statLabel}>총 사이클</Text>
        </View>
      </View>
      <View style={styles.favoriteTemplate}>
        <Text style={styles.favoriteLabel}>가장 많이 사용한 템플릿</Text>
        <Text style={styles.favoriteValue}>{statistics.favoriteTemplate}</Text>
      </View>
    </View>
  );

  // 히스토리 아이템 렌더링
  const renderHistoryItem = ({ item }: { item: IntervalHistory }) => {
    const template = templates.find(t => t.id === item.templateId);
    const templateIcon = template?.icon || '⏱️';
    
    return (
      <View style={styles.historyItem}>
        <View style={styles.historyHeader}>
          <View style={styles.historyTitleContainer}>
            <Text style={styles.historyIcon}>{templateIcon}</Text>
            <View style={styles.historyTitleText}>
              <Text style={styles.historyTitle}>{item.templateName}</Text>
              <Text style={styles.historyDate}>{formatDate(new Date(item.endTime))}</Text>
            </View>
          </View>
          <View style={styles.historyCompletion}>
            <Text style={styles.completionText}>
              {item.completedCycles}/{item.totalCycles}
            </Text>
            <Text style={styles.completionLabel}>사이클</Text>
          </View>
        </View>

        <View style={styles.historyDetails}>
          <View style={styles.historyDetailItem}>
            <Text style={styles.detailIcon}>⏱️</Text>
            <Text style={styles.detailText}>{formatDuration(item.totalDuration)}</Text>
          </View>
          <View style={styles.historyDetailItem}>
            <Text style={styles.detailIcon}>📅</Text>
            <Text style={styles.detailText}>
              {new Date(item.startTime).toLocaleTimeString('ko-KR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })} - {new Date(item.endTime).toLocaleTimeString('ko-KR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          </View>
        </View>

        {/* 완료율 바 */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[
              styles.progressFill,
              { 
                width: `${(item.completedCycles / item.totalCycles) * 100}%`,
                backgroundColor: item.completedCycles === item.totalCycles ? '#28A745' : '#FF7F50'
              }
            ]} />
          </View>
          <Text style={styles.progressText}>
            {Math.round((item.completedCycles / item.totalCycles) * 100)}%
          </Text>
        </View>
      </View>
    );
  };

  // 빈 상태 렌더링
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📋</Text>
      <Text style={styles.emptyText}>
        {selectedFilter === 'all' 
          ? '완료된 세션이 없습니다' 
          : `${filterOptions.find(f => f.id === selectedFilter)?.name}에 완료된 세션이 없습니다`
        }
      </Text>
      <Text style={styles.emptySubText}>
        인터벌 템플릿을 실행하고 완료하면 여기에 기록됩니다
      </Text>
    </View>
  );

  return (
    <>
      <View style={[styles.container, { paddingBottom: insets.bottom + 80 }]}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← 돌아가기</Text>
          </TouchableOpacity>
          <Text style={styles.title}>히스토리</Text>
          {history.length > 0 && (
            <TouchableOpacity onPress={handleClearHistory}>
              <Text style={styles.clearButton}>전체 삭제</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* 통계 */}
          {history.length > 0 && renderStatistics()}

          {/* 필터 */}
          <View style={styles.filterSection}>
            <Text style={styles.sectionTitle}>기간 필터</Text>
            {renderFilterButtons()}
          </View>

          {/* 정렬 */}
          <View style={styles.sortSection}>
            <Text style={styles.sectionTitle}>정렬</Text>
            {renderSortButtons()}
          </View>

          {/* 히스토리 목록 */}
          <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>
              세션 기록 ({filteredAndSortedHistory.length}개)
            </Text>
            
            {filteredAndSortedHistory.length > 0 ? (
              <FlatList
                data={filteredAndSortedHistory}
                renderItem={renderHistoryItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              renderEmptyState()
            )}
          </View>
        </ScrollView>
      </View>

      {/* CustomAlert */}
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onRequestClose={hideAlert}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    color: '#FF7F50',
    fontSize: 16,
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  clearButton: {
    color: '#FF4444',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  statisticsCard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#2A2A2A',
    borderRadius: 16,
  },
  statisticsTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  statisticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    width: '48%',
    backgroundColor: '#1A1A1A',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    color: '#FF7F50',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: '#A67C61',
    fontSize: 12,
    textAlign: 'center',
  },
  favoriteTemplate: {
    backgroundColor: '#1A1A1A',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  favoriteLabel: {
    color: '#A67C61',
    fontSize: 12,
    marginBottom: 4,
  },
  favoriteValue: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  filterSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sortSection: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  filterContainer: {
    paddingVertical: 4,
  },
  sortContainer: {
    paddingVertical: 4,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    backgroundColor: '#333',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterButtonActive: {
    backgroundColor: '#FF7F50',
    borderColor: '#FFD4B3',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    backgroundColor: '#333',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  sortButtonActive: {
    backgroundColor: '#4ECDC4',
    borderColor: '#B2F5EA',
  },
  filterIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  sortIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  filterText: {
    color: '#A67C61',
    fontSize: 14,
    fontWeight: '500',
  },
  filterTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  sortText: {
    color: '#A67C61',
    fontSize: 14,
    fontWeight: '500',
  },
  sortTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  historySection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  historyItem: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  historyTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  historyIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  historyTitleText: {
    flex: 1,
  },
  historyTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  historyDate: {
    color: '#A67C61',
    fontSize: 12,
  },
  historyCompletion: {
    alignItems: 'center',
  },
  completionText: {
    color: '#FF7F50',
    fontSize: 18,
    fontWeight: 'bold',
  },
  completionLabel: {
    color: '#A67C61',
    fontSize: 10,
  },
  historyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  historyDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  detailText: {
    color: '#A67C61',
    fontSize: 12,
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#444',
    borderRadius: 3,
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    minWidth: 35,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubText: {
    color: '#A67C61',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default IntervalHistoryScreen; 