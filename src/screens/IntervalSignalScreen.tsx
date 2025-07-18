// RiseUp/src/screens/IntervalSignalScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Dimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useInterval } from '../context/IntervalContext';
import { useCustomAlert } from '../hooks/useCustomAlert';
import CustomAlert from '../components/CustomAlert';
import IntervalHistoryScreen from '../screens/IntervalHistoryScreen';

const { width: screenWidth } = Dimensions.get('window');

const IntervalSignalScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const {
    templates,
    currentSession,
    startSession,
    pauseSession,
    resumeSession,
    stopSession,
    resetSession,
    remainingTime,
    currentPhase,
    currentCycle,
    isRunning,
    history
  } = useInterval();

  const { alertConfig, showCustomAlert, hideAlert } = useCustomAlert();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // 시간 포맷팅 함수
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 카테고리 필터링
  const categories = [
    { id: 'all', name: '전체', icon: '📋' },
    { id: 'workout', name: '운동', icon: '💪' },
    { id: 'study', name: '공부', icon: '📚' },
    { id: 'meditation', name: '명상', icon: '🧘‍♂️' },
    { id: 'custom', name: '커스텀', icon: '⚙️' },
  ];

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(template => template.category === selectedCategory);

  // 템플릿 시작 핸들러
  const handleStartTemplate = (templateId: string) => {
    if (currentSession) {
      showCustomAlert(
        '세션 진행 중',
        '현재 진행 중인 세션이 있습니다. 새로운 세션을 시작하려면 현재 세션을 먼저 종료해주세요.',
        [
          { text: '취소', style: 'cancel' },
          { 
            text: '기존 세션 종료',
            style: 'destructive',
            onPress: () => {
              stopSession();
              setTimeout(() => startSession(templateId), 100);
            }
          }
        ]
      );
    } else {
      startSession(templateId);
    }
  };

  // 세션 중지 확인
  const handleStopSession = () => {
    showCustomAlert(
      '세션 중지',
      '정말로 현재 세션을 중지하시겠습니까? 진행 상황이 저장되지 않습니다.',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '중지', 
          style: 'destructive',
          onPress: stopSession
        }
      ]
    );
  };

  // 현재 세션 진행률 계산
  const getSessionProgress = () => {
    if (!currentSession) return 0;
    const template = templates.find(t => t.id === currentSession.templateId);
    if (!template) return 0;
    
    const totalPhases = template.phases.length * template.totalCycles;
    return (currentSession.currentPhaseIndex / totalPhases) * 100;
  };

  // 카테고리 필터 렌더링
  const renderCategoryFilter = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilter}>
      {categories.map(category => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.categoryButton,
            selectedCategory === category.id && styles.categoryButtonActive
          ]}
          onPress={() => setSelectedCategory(category.id)}
        >
          <Text style={styles.categoryIcon}>{category.icon}</Text>
          <Text style={[
            styles.categoryButtonText,
            selectedCategory === category.id && styles.categoryButtonTextActive
          ]}>
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  // 현재 세션 카드 렌더링
  const renderCurrentSession = () => {
    if (!currentSession) return null;

    const template = templates.find(t => t.id === currentSession.templateId);
    if (!template) return null;

    return (
      <View style={styles.currentSessionCard}>
        <View style={styles.sessionHeader}>
          <Text style={styles.sessionTitle}>{template.name}</Text>
          <Text style={styles.sessionSubtitle}>
            {currentCycle}/{template.totalCycles} 사이클
          </Text>
        </View>

        {/* 진행률 바 */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[
              styles.progressFill,
              { width: `${getSessionProgress()}%` }
            ]} />
          </View>
          <Text style={styles.progressText}>
            {Math.round(getSessionProgress())}%
          </Text>
        </View>

        {/* 현재 페이즈 정보 */}
        {currentPhase && (
          <View style={[
            styles.phaseCard,
            { backgroundColor: currentPhase.color + '20', borderColor: currentPhase.color }
          ]}>
            <Text style={[styles.phaseName, { color: currentPhase.color }]}>
              {currentPhase.name}
            </Text>
            <Text style={styles.phaseTime}>
              {formatTime(remainingTime)}
            </Text>
          </View>
        )}

        {/* 컨트롤 버튼들 */}
        <View style={styles.controlButtons}>
          <TouchableOpacity
            style={[styles.controlButton, styles.resetButton]}
            onPress={resetSession}
          >
            <Text style={styles.controlButtonText}>🔄</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.controlButton,
              styles.playPauseButton,
              isRunning ? styles.pauseButton : styles.playButton
            ]}
            onPress={isRunning ? pauseSession : resumeSession}
          >
            <Text style={styles.playPauseText}>
              {isRunning ? '⏸️' : '▶️'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, styles.stopButton]}
            onPress={handleStopSession}
          >
            <Text style={styles.controlButtonText}>⏹️</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // 템플릿 카드 렌더링
  const renderTemplateItem = ({ item }: { item: any }) => {
    const totalDuration = item.phases.reduce((sum: number, phase: any) => sum + phase.duration, 0) * item.totalCycles;
    
    return (
      <TouchableOpacity
        style={styles.templateCard}
        onPress={() => handleStartTemplate(item.id)}
        disabled={!!currentSession}
      >
        <View style={styles.templateHeader}>
          <Text style={styles.templateIcon}>{item.icon}</Text>
          <View style={styles.templateInfo}>
            <Text style={styles.templateName}>{item.name}</Text>
            <Text style={styles.templateDescription}>{item.description}</Text>
          </View>
        </View>

        <View style={styles.templateDetails}>
          <View style={styles.templateStat}>
            <Text style={styles.statLabel}>사이클</Text>
            <Text style={styles.statValue}>{item.totalCycles}</Text>
          </View>
          <View style={styles.templateStat}>
            <Text style={styles.statLabel}>총 시간</Text>
            <Text style={styles.statValue}>{formatTime(totalDuration)}</Text>
          </View>
          <View style={styles.templateStat}>
            <Text style={styles.statLabel}>단계</Text>
            <Text style={styles.statValue}>{item.phases.length}</Text>
          </View>
        </View>

        {/* 페이즈 프리뷰 */}
        <View style={styles.phasePreview}>
          {item.phases.map((phase: any, index: number) => (
            <View
              key={index}
              style={[
                styles.phasePreviewItem,
                { backgroundColor: phase.color }
              ]}
            />
          ))}
        </View>

        {currentSession && (
          <View style={styles.disabledOverlay}>
            <Text style={styles.disabledText}>세션 진행 중</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // 빈 상태 렌더링
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>⏳</Text>
      <Text style={styles.emptyText}>
        {selectedCategory === 'all' 
          ? '사용 가능한 템플릿이 없습니다' 
          : `${categories.find(c => c.id === selectedCategory)?.name} 템플릿이 없습니다`
        }
      </Text>
      <Text style={styles.emptySubText}>
        새로운 인터벌 템플릿을 추가해보세요
      </Text>
    </View>
  );

  return (
    <>
      <View style={[styles.container, { paddingBottom: insets.bottom + 80 }]}>
        {/* 헤더 - SafeArea 고려하여 수정 */}
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <Text style={styles.title}>⏳ 인터벌 신호</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => navigation.navigate('AddIntervalTemplate')}
          >
            <Text style={styles.addButtonText}>+ 추가</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* 현재 세션 (있는 경우) */}
          {renderCurrentSession()}

          {/* 카테고리 필터 */}
          {renderCategoryFilter()}

          {/* 템플릿 목록 */}
          <View style={styles.templatesSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                템플릿 ({filteredTemplates.length}개)
              </Text>
              {history.length > 0 && (
                <TouchableOpacity
                  onPress={() => navigation.navigate('IntervalHistory')}
                >
                  <Text style={styles.historyButton}>히스토리</Text>
                </TouchableOpacity>
              )}
            </View>

            {filteredTemplates.length > 0 ? (
              <FlatList
                data={filteredTemplates}
                renderItem={renderTemplateItem}
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
    backgroundColor: '#1A1A1A', // 배경색 추가
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#FF7F50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  currentSessionCard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#2A2A2A',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FF7F50',
  },
  sessionHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  sessionTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sessionSubtitle: {
    color: '#A67C61',
    fontSize: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#444',
    borderRadius: 4,
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF7F50',
    borderRadius: 4,
  },
  progressText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    minWidth: 40,
  },
  phaseCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    marginBottom: 20,
  },
  phaseName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  phaseTime: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'android' ? 'monospace' : 'Courier',
  },
  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#6C757D',
  },
  playPauseButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  playButton: {
    backgroundColor: '#28A745',
  },
  pauseButton: {
    backgroundColor: '#FFC107',
  },
  stopButton: {
    backgroundColor: '#DC3545',
  },
  controlButtonText: {
    fontSize: 24,
  },
  playPauseText: {
    fontSize: 32,
  },
  categoryFilter: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  categoryButton: {
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
  categoryButtonActive: {
    backgroundColor: '#FF7F50',
    borderColor: '#FFD4B3',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryButtonText: {
    color: '#A67C61',
    fontSize: 14,
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
  templatesSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  historyButton: {
    color: '#FF7F50',
    fontSize: 14,
    fontWeight: '600',
  },
  templateCard: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    position: 'relative',
  },
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  templateIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  templateDescription: {
    color: '#A67C61',
    fontSize: 14,
  },
  templateDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
    paddingVertical: 8,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
  },
  templateStat: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#A67C61',
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  phasePreview: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  phasePreviewItem: {
    flex: 1,
    marginRight: 1,
  },
  disabledOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledText: {
    color: '#A67C61',
    fontSize: 16,
    fontWeight: '600',
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
  },
});

export default IntervalSignalScreen;