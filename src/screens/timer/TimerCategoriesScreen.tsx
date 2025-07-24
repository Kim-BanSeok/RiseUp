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
import { useTimer } from '../../context/TimerContext';
import CustomAlert from '../../components/CustomAlert';

const TimerCategoriesScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
  const { 
    timerCategories, 
    addTimerCategory, 
    deleteTimerCategory, 
    updateTimerCategory,
    getCategoryStats
  } = useTimer();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    icon: '📁',
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

  const icons = ['📁', '💼', '💪', '📚', '🏠', '⚙️', '🎯', '🌟', '🔥', '💎', '🌈', '🎨'];
  const colors = ['#FF7F50', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFA500', '#9B59B6', '#E74C3C', '#3498DB', '#2ECC71'];

  const handleCreateCategory = () => {
    if (!newCategory.name.trim()) {
      showCustomAlert('⚠️ 입력 오류', '카테고리 이름을 입력해주세요.', [
        { text: '확인' }
      ]);
      return;
    }

    addTimerCategory(
      newCategory.name.trim(),
      newCategory.description.trim() || undefined,
      newCategory.icon,
      newCategory.color
    );

    setNewCategory({
      name: '',
      description: '',
      icon: '📁',
      color: '#FF7F50'
    });
    setShowAddForm(false);

    showCustomAlert('✅ 완료', '카테고리가 생성되었습니다.', [
      { text: '확인' }
    ]);
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setNewCategory({
      name: category.name,
      description: category.description || '',
      icon: category.icon,
      color: category.color
    });
    setShowAddForm(true);
  };

  const handleUpdateCategory = () => {
    if (!newCategory.name.trim()) {
      showCustomAlert('⚠️ 입력 오류', '카테고리 이름을 입력해주세요.', [
        { text: '확인' }
      ]);
      return;
    }

    updateTimerCategory(editingCategory.id, {
      name: newCategory.name.trim(),
      description: newCategory.description.trim() || undefined,
      icon: newCategory.icon,
      color: newCategory.color
    });

    setNewCategory({
      name: '',
      description: '',
      icon: '📁',
      color: '#FF7F50'
    });
    setEditingCategory(null);
    setShowAddForm(false);

    showCustomAlert('✅ 완료', '카테고리가 수정되었습니다.', [
      { text: '확인' }
    ]);
  };

  const handleDeleteCategory = (category: any) => {
    if (category.isDefault) {
      showCustomAlert('⚠️ 삭제 불가', '기본 카테고리는 삭제할 수 없습니다.', [
        { text: '확인' }
      ]);
      return;
    }

    showCustomAlert(
      '🗑️ 삭제 확인',
      `"${category.name}" 카테고리를 삭제하시겠습니까?`,
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '삭제', 
          style: 'destructive',
          onPress: () => deleteTimerCategory(category.id)
        }
      ]
    );
  };

  const renderCategoryItem = ({ item }: { item: any }) => {
    const stats = getCategoryStats(item.id);
    
    return (
      <View style={[styles.categoryItem, { borderLeftColor: item.color }]}>
        <View style={styles.categoryHeader}>
          <Text style={styles.categoryIcon}>{item.icon}</Text>
          <View style={styles.categoryInfo}>
            <Text style={styles.categoryName}>{item.name}</Text>
            {item.description && (
              <Text style={styles.categoryDescription}>{item.description}</Text>
            )}
            <Text style={styles.categoryStats}>
              타이머 {stats.totalTimers}개 • 완료 {stats.completedTimers}개
            </Text>
          </View>
          <Text style={styles.categoryUsage}>사용 {item.usageCount}회</Text>
        </View>
        
        <View style={styles.categoryActions}>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => handleEditCategory(item)}
          >
            <Text style={styles.editButtonText}>수정</Text>
          </TouchableOpacity>
          
          {!item.isDefault && (
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => handleDeleteCategory(item)}
            >
              <Text style={styles.deleteButtonText}>삭제</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.title}>📂 타이머 카테고리</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => {
              setEditingCategory(null);
              setShowAddForm(!showAddForm);
            }}
          >
            <Text style={styles.addButtonText}>
              {showAddForm ? '취소' : '+ 새 카테고리'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 새 카테고리 추가/수정 폼 */}
        {showAddForm && (
          <View style={styles.addForm}>
            <Text style={styles.formTitle}>
              {editingCategory ? '카테고리 수정' : '새 카테고리 추가'}
            </Text>
            
            <TextInput
              style={styles.textInput}
              value={newCategory.name}
              onChangeText={(text) => setNewCategory(prev => ({ ...prev, name: text }))}
              placeholder="카테고리 이름"
              placeholderTextColor="#A67C61"
            />
            
            <TextInput
              style={styles.textInput}
              value={newCategory.description}
              onChangeText={(text) => setNewCategory(prev => ({ ...prev, description: text }))}
              placeholder="설명 (선택사항)"
              placeholderTextColor="#A67C61"
            />
            
            <Text style={styles.sectionLabel}>아이콘 선택:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconSelector}>
              {icons.map(icon => (
                <TouchableOpacity
                  key={icon}
                  style={[
                    styles.iconOption,
                    newCategory.icon === icon && styles.iconOptionSelected
                  ]}
                  onPress={() => setNewCategory(prev => ({ ...prev, icon }))}
                >
                  <Text style={styles.iconText}>{icon}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <Text style={styles.sectionLabel}>색상 선택:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorSelector}>
              {colors.map(color => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    newCategory.color === color && styles.colorOptionSelected
                  ]}
                  onPress={() => setNewCategory(prev => ({ ...prev, color }))}
                />
              ))}
            </ScrollView>
            
            <TouchableOpacity 
              style={styles.createButton}
              onPress={editingCategory ? handleUpdateCategory : handleCreateCategory}
            >
              <Text style={styles.createButtonText}>
                {editingCategory ? '수정하기' : '카테고리 생성'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 카테고리 목록 */}
        <FlatList
          data={timerCategories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          style={styles.categoryList}
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
  sectionLabel: {
    fontSize: 14,
    color: '#FFAB7A',
    marginBottom: 8,
  },
  iconSelector: {
    marginBottom: 15,
  },
  iconOption: {
    backgroundColor: '#2D1B14',
    padding: 10,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#8B6341',
  },
  iconOptionSelected: {
    backgroundColor: '#FF7F50',
    borderColor: '#FF7F50',
  },
  iconText: {
    fontSize: 20,
  },
  colorSelector: {
    marginBottom: 15,
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
    borderWidth: 2,
    borderColor: '#8B6341',
  },
  colorOptionSelected: {
    borderColor: '#FFD4B3',
    borderWidth: 3,
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
  categoryList: {
    flex: 1,
  },
  categoryItem: {
    backgroundColor: '#4A2C1A',
    marginHorizontal: 20,
    marginVertical: 5,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8B6341',
    borderLeftWidth: 4,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFD4B3',
  },
  categoryDescription: {
    fontSize: 12,
    color: '#FFAB7A',
    marginTop: 2,
  },
  categoryStats: {
    fontSize: 11,
    color: '#A67C61',
    marginTop: 2,
  },
  categoryUsage: {
    fontSize: 12,
    color: '#FF7F50',
  },
  categoryActions: {
    flexDirection: 'row',
    gap: 10,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#4A90E2',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  editButtonText: {
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

export default TimerCategoriesScreen; 