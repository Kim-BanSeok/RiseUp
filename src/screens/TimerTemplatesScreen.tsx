import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTimer } from '../context/TimerContext';
import CustomAlert from '../components/CustomAlert';

const TimerTemplatesScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { 
    timerTemplates, 
    addTimerTemplate, 
    deleteTimerTemplate, 
    createTimerFromTemplate,
    getTemplatesByCategory 
  } = useTimer();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    duration: '',
    category: 'productivity',
    icon: '⏰',
    color: '#FF7F50'
  });

  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    buttons: [] as any[]
  });

  const showCustomAlert = (title: string, message: string, buttons: any[]) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      buttons: buttons.map(button => ({
        ...button,
        onPress: () => {
          setAlertConfig(prev => ({ ...prev, visible: false }));
          if (button.onPress) button.onPress();
        }
      }))
    });
  };

  const categories = [
    { key: 'productivity', label: '생산성', icon: '💼' },
    { key: 'health', label: '건강', icon: '💪' },
    { key: 'education', label: '교육', icon: '📚' },
    { key: 'daily', label: '일상', icon: '🏠' },
    { key: 'custom', label: '커스텀', icon: '⚙️' }
  ];

  const handleCreateTemplate = () => {
    if (!newTemplate.name.trim() || !newTemplate.duration.trim()) {
      showCustomAlert('⚠️ 입력 오류', '이름과 시간을 입력해주세요.', [
        { text: '확인' }
      ]);
      return;
    }

    const duration = parseInt(newTemplate.duration) * 60 * 1000; // 분을 밀리초로 변환
    if (duration <= 0) {
      showCustomAlert('⚠️ 시간 오류', '올바른 시간을 입력해주세요.', [
        { text: '확인' }
      ]);
      return;
    }

    addTimerTemplate(
      newTemplate.name.trim(),
      duration,
      newTemplate.category,
      newTemplate.description.trim() || undefined,
      newTemplate.icon,
      newTemplate.color
    );

    setNewTemplate({
      name: '',
      description: '',
      duration: '',
      category: 'productivity',
      icon: '⏰',
      color: '#FF7F50'
    });
    setShowAddForm(false);

    showCustomAlert('✅ 완료', '템플릿이 생성되었습니다.', [
      { text: '확인' }
    ]);
  };

  const handleDeleteTemplate = (template: any) => {
    if (template.isDefault) {
      showCustomAlert('⚠️ 삭제 불가', '기본 템플릿은 삭제할 수 없습니다.', [
        { text: '확인' }
      ]);
      return;
    }

    showCustomAlert(
      '🗑️ 삭제 확인',
      `"${template.name}" 템플릿을 삭제하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '삭제', 
          style: 'destructive',
          onPress: () => deleteTimerTemplate(template.id)
        }
      ]
    );
  };

  const handleUseTemplate = (template: any) => {
    createTimerFromTemplate(template.id);
    showCustomAlert('✅ 완료', `"${template.name}" 타이머가 생성되었습니다.`, [
      { text: '확인', onPress: () => navigation.goBack() }
    ]);
  };

  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}시간 ${remainingMinutes}분`;
    }
    return `${minutes}분`;
  };

  const renderTemplateItem = ({ item }: { item: any }) => (
    <View style={[styles.templateItem, { borderLeftColor: item.color }]}>
      <View style={styles.templateHeader}>
        <Text style={styles.templateIcon}>{item.icon}</Text>
        <View style={styles.templateInfo}>
          <Text style={styles.templateName}>{item.name}</Text>
          <Text style={styles.templateDuration}>{formatDuration(item.duration)}</Text>
          {item.description && (
            <Text style={styles.templateDescription}>{item.description}</Text>
          )}
        </View>
        <Text style={styles.templateUsage}>사용 {item.usageCount}회</Text>
      </View>
      
      <View style={styles.templateActions}>
        <TouchableOpacity 
          style={styles.useButton}
          onPress={() => handleUseTemplate(item)}
        >
          <Text style={styles.useButtonText}>사용하기</Text>
        </TouchableOpacity>
        
        {!item.isDefault && (
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={() => handleDeleteTemplate(item)}
          >
            <Text style={styles.deleteButtonText}>삭제</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderCategorySection = ({ item: category }: { item: any }) => {
    const categoryTemplates = getTemplatesByCategory(category.key);
    
    if (categoryTemplates.length === 0) return null;

    return (
      <View style={styles.categorySection}>
        <Text style={styles.categoryTitle}>
          {category.icon} {category.label}
        </Text>
        <FlatList
          data={categoryTemplates}
          renderItem={renderTemplateItem}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
        />
      </View>
    );
  };

  return (
    <>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.title}>📋 타이머 템플릿</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowAddForm(!showAddForm)}
          >
            <Text style={styles.addButtonText}>
              {showAddForm ? '취소' : '+ 새 템플릿'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 새 템플릿 추가 폼 */}
        {showAddForm && (
          <View style={styles.addForm}>
            <Text style={styles.formTitle}>새 템플릿 추가</Text>
            
            <TextInput
              style={styles.textInput}
              value={newTemplate.name}
              onChangeText={(text) => setNewTemplate(prev => ({ ...prev, name: text }))}
              placeholder="템플릿 이름"
              placeholderTextColor="#A67C61"
            />
            
            <TextInput
              style={styles.textInput}
              value={newTemplate.description}
              onChangeText={(text) => setNewTemplate(prev => ({ ...prev, description: text }))}
              placeholder="설명 (선택사항)"
              placeholderTextColor="#A67C61"
            />
            
            <TextInput
              style={styles.textInput}
              value={newTemplate.duration}
              onChangeText={(text) => setNewTemplate(prev => ({ ...prev, duration: text }))}
              placeholder="시간 (분)"
              placeholderTextColor="#A67C61"
              keyboardType="numeric"
            />
            
            <View style={styles.categorySelector}>
              <Text style={styles.categoryLabel}>카테고리:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {categories.map(cat => (
                  <TouchableOpacity
                    key={cat.key}
                    style={[
                      styles.categoryOption,
                      newTemplate.category === cat.key && styles.categoryOptionSelected
                    ]}
                    onPress={() => setNewTemplate(prev => ({ ...prev, category: cat.key }))}
                  >
                    <Text style={[
                      styles.categoryOptionText,
                      newTemplate.category === cat.key && styles.categoryOptionTextSelected
                    ]}>
                      {cat.icon} {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            <TouchableOpacity 
              style={styles.createButton}
              onPress={handleCreateTemplate}
            >
              <Text style={styles.createButtonText}>템플릿 생성</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 템플릿 목록 */}
        <FlatList
          data={categories}
          renderItem={renderCategorySection}
          keyExtractor={(item) => item.key}
          style={styles.templateList}
          showsVerticalScrollIndicator={false}
        />
      </View>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onRequestClose={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2D1B14',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#8B6341',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD4B3',
  },
  addButton: {
    backgroundColor: '#228B22',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  addForm: {
    padding: 20,
    backgroundColor: '#4A2C1A',
    margin: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8B6341',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFAB7A',
    marginBottom: 15,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#8B6341',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#2D1B14',
    color: '#FFD4B3',
    marginBottom: 10,
  },
  categorySelector: {
    marginBottom: 15,
  },
  categoryLabel: {
    fontSize: 14,
    color: '#FFAB7A',
    marginBottom: 8,
  },
  categoryOption: {
    backgroundColor: '#2D1B14',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#8B6341',
  },
  categoryOptionSelected: {
    backgroundColor: '#FF7F50',
    borderColor: '#FF7F50',
  },
  categoryOptionText: {
    color: '#FFD4B3',
    fontSize: 12,
  },
  categoryOptionTextSelected: {
    color: '#FFF',
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#228B22',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  templateList: {
    flex: 1,
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFAB7A',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  templateItem: {
    backgroundColor: '#4A2C1A',
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8B6341',
    borderLeftWidth: 4,
  },
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  templateIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFD4B3',
  },
  templateDuration: {
    fontSize: 14,
    color: '#FFAB7A',
    marginTop: 2,
  },
  templateDescription: {
    fontSize: 12,
    color: '#A67C61',
    marginTop: 2,
  },
  templateUsage: {
    fontSize: 12,
    color: '#FF7F50',
  },
  templateActions: {
    flexDirection: 'row',
    gap: 10,
  },
  useButton: {
    flex: 1,
    backgroundColor: '#4A90E2',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  useButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 12,
  },
  deleteButton: {
    backgroundColor: '#E74C3C',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 12,
  },
});

export default TimerTemplatesScreen; 