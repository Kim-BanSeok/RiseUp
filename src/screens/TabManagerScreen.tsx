import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTab } from '../context/TabContext';
import { TabConfig } from '../components/CustomTabBar';
import { DEFAULT_TABS } from '../navigation/TabConfig';
import CustomAlert from '../components/CustomAlert';
import { useCustomAlert } from '../hooks/useCustomAlert';
import { TAB_TEMPLATES, TabTemplate, TEMPLATE_CATEGORIES } from '../data/TabTemplates';

const TabManagerScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { 
    tabs, 
    removeTab, 
    reorderTabs, 
    resetTabs, 
    addTab, 
    updateTab 
  } = useTab();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTab, setEditingTab] = useState<TabConfig | null>(null);
  const [customTitle, setCustomTitle] = useState('');
  const [customIcon, setCustomIcon] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // CustomAlert 훅 사용
  const { alertConfig, showCustomAlert, hideAlert } = useCustomAlert();

  // 디버그: 컴포넌트 마운트 시 테스트
  React.useEffect(() => {
    console.log('TabManagerScreen 마운트됨');
    console.log('alertConfig:', alertConfig);
  }, []);

  // 테스트 버튼 추가
  const handleTestAlert = () => {
    console.log('테스트 알림 호출');
    showCustomAlert(
      '테스트',
      'CustomAlert이 정상 작동합니다!',
      [{ text: '확인' }]
    );
  };

  // 이미 추가된 탭들을 제외한 사용 가능한 템플릿들만 필터링
  const availableTemplates = useMemo(() => {
    const existingTabTitles = tabs.map(tab => tab.title.toLowerCase());
    const existingTabIds = tabs.map(tab => tab.id.toLowerCase());
    
    let filteredTemplates = TAB_TEMPLATES.filter(template => {
      const titleExists = existingTabTitles.includes(template.title.toLowerCase());
      const idExists = existingTabIds.some(existingId => 
        existingId.includes(template.id) || template.id.includes(existingId)
      );
      
      return !titleExists && !idExists;
    });

    // 카테고리 필터링
    if (selectedCategory !== 'all') {
      filteredTemplates = filteredTemplates.filter(
        template => template.category === selectedCategory
      );
    }

    return filteredTemplates;
  }, [tabs, selectedCategory]);

  const handleRemoveTab = (tabId: string) => {
    console.log('탭 제거 알림 호출');
    showCustomAlert(
      '탭 제거',
      '이 탭을 제거하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '제거', 
          style: 'destructive',
          onPress: () => {
            console.log('탭 제거 실행');
            removeTab(tabId);
          }
        }
      ]
    );
  };

  const handleAddTemplate = (template: TabTemplate) => {
    const newTab: TabConfig = {
      id: `${template.id}_${Date.now()}`,
      title: template.title,
      icon: template.icon,
      component: template.component,
    };
    addTab(newTab);
    setShowAddModal(false);
  };

  const handleCustomTab = () => {
    if (!customTitle.trim() || !customIcon.trim()) {
      console.log('입력 오류 알림 호출');
      showCustomAlert(
        '오류',
        '제목과 아이콘을 모두 입력해주세요.',
        [{ text: '확인' }]
      );
      return;
    }

    // 이미 존재하는 제목인지 확인
    const existingTitles = tabs.map(tab => tab.title.toLowerCase());
    if (existingTitles.includes(customTitle.trim().toLowerCase())) {
      console.log('중복 이름 오류 알림 호출');
      showCustomAlert(
        '오류',
        '이미 존재하는 탭 이름입니다.',
        [{ text: '확인' }]
      );
      return;
    }

    const newTab: TabConfig = {
      id: `custom_${Date.now()}`,
      title: customTitle.trim(),
      icon: customIcon.trim(),
      component: () => (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1A1A1A'}}>
          <Text style={{color: 'white', fontSize: 18}}>🚧 {customTitle}</Text>
          <Text style={{color: '#A67C61', marginTop: 10}}>사용자 정의 탭</Text>
        </View>
      ),
    };

    addTab(newTab);
    setCustomTitle('');
    setCustomIcon('');
    setShowAddModal(false);
  };

  const handleResetTabs = () => {
    console.log('탭 초기화 알림 호출');
    showCustomAlert(
      '탭 초기화',
      '모든 탭을 기본 설정으로 되돌리시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '초기화', 
          style: 'destructive',
          onPress: () => {
            console.log('탭 초기화 실행');
            resetTabs();
          }
        }
      ]
    );
  };

  const renderTabItem = ({ item, index }: { item: TabConfig; index: number }) => {
    const isDefault = DEFAULT_TABS.some(dt => dt.id === item.id);
    
    return (
      <View style={styles.tabItem}>
        <View style={styles.tabInfo}>
          <Text style={styles.tabIcon}>{item.icon}</Text>
          <View style={styles.tabDetails}>
            <Text style={styles.tabTitle}>{item.title}</Text>
            <Text style={styles.tabType}>
              {isDefault ? '기본 탭' : '추가 탭'}
              {item.badge ? ` • 배지: ${item.badge}` : ''}
            </Text>
          </View>
        </View>
        
        <View style={styles.tabActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setEditingTab(item)}
          >
            <Text style={styles.actionButtonText}>편집</Text>
          </TouchableOpacity>
          
          {!isDefault && (
            <TouchableOpacity
              style={[styles.actionButton, styles.removeButton]}
              onPress={() => handleRemoveTab(item.id)}
            >
              <Text style={styles.removeButtonText}>제거</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderCategoryFilter = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilter}>
      <TouchableOpacity
        style={[
          styles.categoryButton,
          selectedCategory === 'all' && styles.categoryButtonActive
        ]}
        onPress={() => setSelectedCategory('all')}
      >
        <Text style={[
          styles.categoryButtonText,
          selectedCategory === 'all' && styles.categoryButtonTextActive
        ]}>
          전체
        </Text>
      </TouchableOpacity>
      
      {TEMPLATE_CATEGORIES.map(category => (
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

  const renderTemplateItem = ({ item }: { item: TabTemplate }) => (
    <TouchableOpacity
      style={styles.templateItem}
      onPress={() => handleAddTemplate(item)}
    >
      <Text style={styles.templateIcon}>{item.icon}</Text>
      <View style={styles.templateInfo}>
        <Text style={styles.templateTitle}>{item.title}</Text>
        <Text style={styles.templateDescription}>{item.description}</Text>
      </View>
      <Text style={styles.addIcon}>+</Text>
    </TouchableOpacity>
  );

  const renderEmptyTemplates = () => (
    <View style={styles.emptyTemplatesContainer}>
      <Text style={styles.emptyTemplatesIcon}>🎉</Text>
      <Text style={styles.emptyTemplatesText}>
        {selectedCategory === 'all' 
          ? '모든 템플릿을 추가했습니다!' 
          : '이 카테고리의 모든 템플릿을 추가했습니다!'
        }
      </Text>
      <Text style={styles.emptyTemplatesSubText}>
        커스텀 탭을 만들어 더 많은 기능을 추가해보세요.
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
          <Text style={styles.title}>탭 관리</Text>
          {/* 테스트 버튼 추가 */}
          <TouchableOpacity onPress={handleTestAlert}>
            <Text style={styles.resetButton}>테스트</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleResetTabs}>
            <Text style={styles.resetButton}>초기화</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* 현재 탭 목록 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>현재 탭 ({tabs.length}개)</Text>
            <FlatList
              data={tabs}
              renderItem={renderTabItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>

          {/* 추가 버튼 */}
          <TouchableOpacity
            style={styles.addTabButton}
            onPress={() => setShowAddModal(true)}
          >
            <Text style={styles.addTabButtonText}>+ 새 탭 추가</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* 탭 추가 모달 */}
        <Modal
          visible={showAddModal}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>새 탭 추가</Text>
                <TouchableOpacity onPress={() => setShowAddModal(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView>
                {/* 카테고리 필터 */}
                {renderCategoryFilter()}

                {/* 템플릿 탭들 */}
                <View style={styles.templateSection}>
                  <Text style={styles.modalSectionTitle}>
                    템플릿 선택 ({availableTemplates.length}개 사용 가능)
                  </Text>
                  
                  {availableTemplates.length > 0 ? (
                    <FlatList
                      data={availableTemplates}
                      renderItem={renderTemplateItem}
                      keyExtractor={(item) => item.id}
                      scrollEnabled={false}
                    />
                  ) : (
                    renderEmptyTemplates()
                  )}
                </View>

                {/* 커스텀 탭 */}
                <Text style={styles.modalSectionTitle}>커스텀 탭</Text>
                <View style={styles.customTabForm}>
                  <TextInput
                    style={styles.input}
                    placeholder="탭 제목 (예: 일기)"
                    placeholderTextColor="#A67C61"
                    value={customTitle}
                    onChangeText={setCustomTitle}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="아이콘 (이모지)"
                    placeholderTextColor="#A67C61"
                    value={customIcon}
                    onChangeText={setCustomIcon}
                  />
                  <TouchableOpacity
                    style={styles.createButton}
                    onPress={handleCustomTab}
                  >
                    <Text style={styles.createButtonText}>커스텀 탭 생성</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>

      {/* CustomAlert - 디버그 정보 추가 */}
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onRequestClose={hideAlert}
      />
      
      {/* 디버그: alert 상태 표시 */}
      {__DEV__ && alertConfig.visible && (
        <View style={{
          position: 'absolute',
          top: 100,
          left: 20,
          backgroundColor: 'red',
          padding: 10,
          zIndex: 9999
        }}>
          <Text style={{ color: 'white' }}>
            Alert Visible: {alertConfig.visible ? 'true' : 'false'}
          </Text>
        </View>
      )}
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
    fontSize: 18,
    fontWeight: 'bold',
  },
  resetButton: {
    color: '#FF4444',
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  tabItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  tabInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tabIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  tabDetails: {
    flex: 1,
  },
  tabTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  tabType: {
    color: '#A67C61',
    fontSize: 12,
    marginTop: 2,
  },
  tabActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    backgroundColor: '#FF7F50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  removeButton: {
    backgroundColor: '#FF4444',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  addTabButton: {
    backgroundColor: '#4A2C1A',
    borderWidth: 2,
    borderColor: '#FF7F50',
    borderStyle: 'dashed',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  addTabButtonText: {
    color: '#FF7F50',
    fontSize: 16,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#2A2A2A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  modalTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalClose: {
    color: '#A67C61',
    fontSize: 20,
  },
  templateSection: {
    marginBottom: 20,
  },
  modalSectionTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  templateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 5,
    backgroundColor: '#333',
    borderRadius: 8,
  },
  templateIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  templateInfo: {
    flex: 1,
  },
  templateTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  templateDescription: {
    color: '#A67C61',
    fontSize: 12,
    marginTop: 2,
  },
  addIcon: {
    color: '#FF7F50',
    fontSize: 20,
    fontWeight: 'bold',
  },
  emptyTemplatesContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTemplatesIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  emptyTemplatesText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  emptyTemplatesSubText: {
    color: '#A67C61',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  customTabForm: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  input: {
    backgroundColor: '#333',
    color: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 16,
  },
  createButton: {
    backgroundColor: '#FF7F50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // 카테고리 필터 스타일 추가
  categoryFilter: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 10,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    backgroundColor: '#333',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryButtonActive: {
    backgroundColor: '#FF7F50',
    borderColor: '#FFD4B3',
  },
  categoryIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  categoryButtonText: {
    color: '#A67C61',
    fontSize: 12,
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default TabManagerScreen; 