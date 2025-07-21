import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCustomAlert } from '../hooks/useCustomAlert';
import CustomAlert from '../components/CustomAlert';

interface ConversionUnit {
  id: string;
  name: string;
  symbol: string;
  factor: number; // 기준 단위 대비 배수
}

interface ConversionCategory {
  id: string;
  name: string;
  icon: string;
  units: ConversionUnit[];
}

const CONVERSION_CATEGORIES: ConversionCategory[] = [
  {
    id: 'length',
    name: '길이',
    icon: '📏',
    units: [
      { id: 'mm', name: '밀리미터', symbol: 'mm', factor: 0.001 },
      { id: 'cm', name: '센티미터', symbol: 'cm', factor: 0.01 },
      { id: 'm', name: '미터', symbol: 'm', factor: 1 },
      { id: 'km', name: '킬로미터', symbol: 'km', factor: 1000 },
      { id: 'inch', name: '인치', symbol: 'in', factor: 0.0254 },
      { id: 'ft', name: '피트', symbol: 'ft', factor: 0.3048 },
      { id: 'yard', name: '야드', symbol: 'yd', factor: 0.9144 },
      { id: 'mile', name: '마일', symbol: 'mi', factor: 1609.34 },
    ]
  },
  {
    id: 'weight',
    name: '무게',
    icon: '⚖️',
    units: [
      { id: 'mg', name: '밀리그램', symbol: 'mg', factor: 0.000001 },
      { id: 'g', name: '그램', symbol: 'g', factor: 0.001 },
      { id: 'kg', name: '킬로그램', symbol: 'kg', factor: 1 },
      { id: 'ton', name: '톤', symbol: 't', factor: 1000 },
      { id: 'oz', name: '온스', symbol: 'oz', factor: 0.0283495 },
      { id: 'lb', name: '파운드', symbol: 'lb', factor: 0.453592 },
      { id: 'stone', name: '스톤', symbol: 'st', factor: 6.35029 },
    ]
  },
  {
    id: 'temperature',
    name: '온도',
    icon: '🌡️',
    units: [
      { id: 'celsius', name: '섭씨', symbol: '°C', factor: 1 },
      { id: 'fahrenheit', name: '화씨', symbol: '°F', factor: 1 },
      { id: 'kelvin', name: '켈빈', symbol: 'K', factor: 1 },
    ]
  },
  {
    id: 'volume',
    name: '부피',
    icon: '🧪',
    units: [
      { id: 'ml', name: '밀리리터', symbol: 'ml', factor: 0.001 },
      { id: 'l', name: '리터', symbol: 'L', factor: 1 },
      { id: 'gallon', name: '갤런', symbol: 'gal', factor: 3.78541 },
      { id: 'quart', name: '쿼트', symbol: 'qt', factor: 0.946353 },
      { id: 'pint', name: '파인트', symbol: 'pt', factor: 0.473176 },
      { id: 'cup', name: '컵', symbol: 'cup', factor: 0.236588 },
      { id: 'floz', name: '액량 온스', symbol: 'fl oz', factor: 0.0295735 },
    ]
  },
  {
    id: 'area',
    name: '넓이',
    icon: '📐',
    units: [
      { id: 'sqmm', name: '제곱밀리미터', symbol: 'mm²', factor: 0.000001 },
      { id: 'sqcm', name: '제곱센티미터', symbol: 'cm²', factor: 0.0001 },
      { id: 'sqm', name: '제곱미터', symbol: 'm²', factor: 1 },
      { id: 'hectare', name: '헥타르', symbol: 'ha', factor: 10000 },
      { id: 'sqkm', name: '제곱킬로미터', symbol: 'km²', factor: 1000000 },
      { id: 'sqin', name: '제곱인치', symbol: 'in²', factor: 0.00064516 },
      { id: 'sqft', name: '제곱피트', symbol: 'ft²', factor: 0.092903 },
      { id: 'acre', name: '에이커', symbol: 'ac', factor: 4046.86 },
    ]
  },
  {
    id: 'speed',
    name: '속도',
    icon: '🚗',
    units: [
      { id: 'mps', name: '미터/초', symbol: 'm/s', factor: 1 },
      { id: 'kmh', name: '킬로미터/시', symbol: 'km/h', factor: 0.277778 },
      { id: 'mph', name: '마일/시', symbol: 'mph', factor: 0.44704 },
      { id: 'knot', name: '노트', symbol: 'kn', factor: 0.514444 },
      { id: 'fps', name: '피트/초', symbol: 'ft/s', factor: 0.3048 },
    ]
  }
];

const UnitConverterScreen = () => {
  const insets = useSafeAreaInsets();
  const { alertConfig, showCustomAlert } = useCustomAlert();
  const [selectedCategory, setSelectedCategory] = useState<ConversionCategory>(CONVERSION_CATEGORIES[0]);
  const [fromUnit, setFromUnit] = useState<ConversionUnit>(CONVERSION_CATEGORIES[0].units[2]); // 미터
  const [toUnit, setToUnit] = useState<ConversionUnit>(CONVERSION_CATEGORIES[0].units[3]); // 킬로미터
  const [inputValue, setInputValue] = useState('1');
  const [result, setResult] = useState('0.001');
  
  // 새로운 상태 추가
  const [showUnitSelector, setShowUnitSelector] = useState(false);
  const [unitSelectorType, setUnitSelectorType] = useState<'from' | 'to'>('from');
  const [showInputModal, setShowInputModal] = useState(false);
  const [tempInputValue, setTempInputValue] = useState('1');

  const convertValue = (value: string, from: ConversionUnit, to: ConversionUnit, category: ConversionCategory) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return '0';

    if (category.id === 'temperature') {
      return convertTemperature(numValue, from.id, to.id).toFixed(6).replace(/\.?0+$/, '');
    } else {
      // 다른 단위들은 기준 단위를 통한 변환
      const baseValue = numValue * from.factor;
      const convertedValue = baseValue / to.factor;
      return convertedValue.toFixed(6).replace(/\.?0+$/, '');
    }
  };

  const convertTemperature = (value: number, fromId: string, toId: string): number => {
    if (fromId === toId) return value;

    // 먼저 섭씨로 변환
    let celsius = value;
    if (fromId === 'fahrenheit') {
      celsius = (value - 32) * 5/9;
    } else if (fromId === 'kelvin') {
      celsius = value - 273.15;
    }

    // 섭씨에서 목표 단위로 변환
    if (toId === 'celsius') {
      return celsius;
    } else if (toId === 'fahrenheit') {
      return celsius * 9/5 + 32;
    } else if (toId === 'kelvin') {
      return celsius + 273.15;
    }

    return celsius;
  };

  const handleCategoryChange = (category: ConversionCategory) => {
    setSelectedCategory(category);
    setFromUnit(category.units[0]);
    setToUnit(category.units[1]);
    setInputValue('1');
    setResult(convertValue('1', category.units[0], category.units[1], category));
  };

  const handleFromUnitChange = (unit: ConversionUnit) => {
    setFromUnit(unit);
    setResult(convertValue(inputValue, unit, toUnit, selectedCategory));
  };

  const handleToUnitChange = (unit: ConversionUnit) => {
    setToUnit(unit);
    setResult(convertValue(inputValue, fromUnit, unit, selectedCategory));
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    setResult(convertValue(value, fromUnit, toUnit, selectedCategory));
  };

  const swapUnits = () => {
    const tempUnit = fromUnit;
    setFromUnit(toUnit);
    setToUnit(tempUnit);
    setInputValue(result);
    setResult(convertValue(result, toUnit, tempUnit, selectedCategory));
  };

  const clearInput = () => {
    setInputValue('0');
    setResult('0');
  };

  const addToInput = (digit: string) => {
    if (inputValue === '0' && digit !== '.') {
      setInputValue(digit);
    } else {
      setInputValue(prev => prev + digit);
    }
    setResult(convertValue(inputValue + digit, fromUnit, toUnit, selectedCategory));
  };

  const removeLastDigit = () => {
    const newValue = inputValue.length > 1 ? inputValue.slice(0, -1) : '0';
    setInputValue(newValue);
    setResult(convertValue(newValue, fromUnit, toUnit, selectedCategory));
  };

  const handleFromUnitPress = () => {
    setUnitSelectorType('from');
    setShowUnitSelector(true);
  };

  const handleToUnitPress = () => {
    setUnitSelectorType('to');
    setShowUnitSelector(true);
  };

  const selectUnit = (unit: ConversionUnit) => {
    if (unitSelectorType === 'from') {
      handleFromUnitChange(unit);
    } else {
      handleToUnitChange(unit);
    }
    setShowUnitSelector(false);
  };

  const handleInputPress = () => {
    setTempInputValue(inputValue);
    setShowInputModal(true);
  };

  const confirmInput = () => {
    handleInputChange(tempInputValue);
    setShowInputModal(false);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>🔄 단위 변환기</Text>
      </View>

      {/* 카테고리 선택 */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryTabs}>
        {CONVERSION_CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryTab,
              selectedCategory.id === category.id && styles.categoryTabActive
            ]}
            onPress={() => handleCategoryChange(category)}
          >
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text style={[
              styles.categoryTabText,
              selectedCategory.id === category.id && styles.categoryTabTextActive
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* 변환 영역 */}
        <View style={styles.conversionArea}>
          {/* From 단위 */}
          <View style={styles.conversionSection}>
            <Text style={styles.sectionLabel}>변환할 값</Text>
            <TouchableOpacity 
              style={styles.unitSelector}
              onPress={handleFromUnitPress}
            >
              <Text style={styles.unitText}>{fromUnit.name}</Text>
              <Text style={styles.unitSymbol}>{fromUnit.symbol}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.valueInput}
              onPress={handleInputPress}
            >
              <Text style={styles.valueInputText}>{inputValue}</Text>
            </TouchableOpacity>
          </View>

          {/* 교환 버튼 */}
          <TouchableOpacity style={styles.swapButton} onPress={swapUnits}>
            <Text style={styles.swapButtonText}>⇅</Text>
          </TouchableOpacity>

          {/* To 단위 */}
          <View style={styles.conversionSection}>
            <Text style={styles.sectionLabel}>변환된 값</Text>
            <TouchableOpacity 
              style={styles.unitSelector}
              onPress={handleToUnitPress}
            >
              <Text style={styles.unitText}>{toUnit.name}</Text>
              <Text style={styles.unitSymbol}>{toUnit.symbol}</Text>
            </TouchableOpacity>
            
            <View style={styles.resultContainer}>
              <Text style={styles.resultValue}>{result}</Text>
            </View>
          </View>
        </View>

        {/* 빠른 변환 */}
        <View style={styles.quickConversions}>
          <Text style={styles.quickTitle}>빠른 변환</Text>
          <View style={styles.quickGrid}>
            {['1', '10', '100', '1000'].map((value) => (
              <TouchableOpacity
                key={value}
                style={styles.quickButton}
                onPress={() => handleInputChange(value)}
              >
                <Text style={styles.quickButtonText}>{value}</Text>
                <Text style={styles.quickButtonResult}>
                  {convertValue(value, fromUnit, toUnit, selectedCategory)} {toUnit.symbol}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 변환 공식 */}
        <View style={styles.formulaSection}>
          <Text style={styles.formulaTitle}>변환 공식</Text>
          <View style={styles.formulaCard}>
            {selectedCategory.id === 'temperature' ? (
              <Text style={styles.formulaText}>
                온도 변환은 복잡한 공식을 사용합니다.{'\n'}
                • 섭씨 ↔ 화씨: °F = °C × 9/5 + 32{'\n'}
                • 섭씨 ↔ 켈빈: K = °C + 273.15
              </Text>
            ) : (
              <Text style={styles.formulaText}>
                {fromUnit.name} = {inputValue} × {(1 / fromUnit.factor).toFixed(6).replace(/\.?0+$/, '')} = {(parseFloat(inputValue) / fromUnit.factor).toFixed(6).replace(/\.?0+$/, '')} 기준단위{'\n'}
                {toUnit.name} = 기준단위 ÷ {(1 / toUnit.factor).toFixed(6).replace(/\.?0+$/, '')} = {result} {toUnit.symbol}
              </Text>
            )}
          </View>
        </View>

        {/* 하단 여백 추가 */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* 단위 선택 모달 */}
      <Modal
        visible={showUnitSelector}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowUnitSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.unitSelectorModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {unitSelectorType === 'from' ? '변환할 단위' : '변환될 단위'} 선택
              </Text>
              <TouchableOpacity 
                onPress={() => setShowUnitSelector(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.unitList}>
              {selectedCategory.units.map((unit) => (
                <TouchableOpacity
                  key={unit.id}
                  style={[
                    styles.unitItem,
                    (unitSelectorType === 'from' ? fromUnit.id === unit.id : toUnit.id === unit.id) && 
                    styles.unitItemSelected
                  ]}
                  onPress={() => selectUnit(unit)}
                >
                  <Text style={[
                    styles.unitItemName,
                    (unitSelectorType === 'from' ? fromUnit.id === unit.id : toUnit.id === unit.id) && 
                    styles.unitItemNameSelected
                  ]}>
                    {unit.name}
                  </Text>
                  <Text style={[
                    styles.unitItemSymbol,
                    (unitSelectorType === 'from' ? fromUnit.id === unit.id : toUnit.id === unit.id) && 
                    styles.unitItemSymbolSelected
                  ]}>
                    {unit.symbol}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 값 입력 모달 */}
      <Modal
        visible={showInputModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowInputModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.inputModal}>
            <Text style={styles.modalTitle}>값 입력</Text>
            <TextInput
              style={styles.modalInput}
              value={tempInputValue}
              onChangeText={setTempInputValue}
              keyboardType="numeric"
              placeholder="변환할 값을 입력하세요"
              placeholderTextColor="#666"
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowInputModal(false)}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmInput}
              >
                <Text style={styles.confirmButtonText}>확인</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* CustomAlert */}
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onRequestClose={() => showCustomAlert('', '', [])}
      />

      {/* 디버그: alert 상태 표시 */}
      {__DEV__ && alertConfig.visible && (
        <View style={{
          position: 'absolute',
          top: 100,
          left: 20,
          backgroundColor: 'red',
          padding: 10,
          zIndex: 500 // 9999에서 500으로 수정
        }}>
          <Text style={{ color: 'white' }}>
            Alert Visible: {alertConfig.visible ? 'true' : 'false'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e0e0e0',
  },
  categoryTabs: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    maxHeight: 80,
  },
  categoryTab: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
    maxWidth: 80,
    height: 60,
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: '#333',
  },
  categoryTabActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  categoryIcon: {
    fontSize: 14,
    marginBottom: 2,
  },
  categoryTabText: {
    color: '#a0a0a0',
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '500',
  },
  categoryTabTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  contentContainer: {
    paddingBottom: 20, // 추가 하단 패딩
  },
  bottomSpacing: {
    height: 20, // 추가 하단 여백
  },
  conversionArea: {
    marginBottom: 25,
  },
  conversionSection: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  sectionLabel: {
    fontSize: 13,
    color: '#a0a0a0',
    marginBottom: 12,
    fontWeight: '500',
  },
  unitSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#444',
  },
  unitText: {
    fontSize: 15,
    color: '#e0e0e0',
    fontWeight: '500',
  },
  unitSymbol: {
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: 'bold',
    backgroundColor: '#1a3a1a',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  valueInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 15,
    minHeight: 50,
    borderWidth: 1,
    borderColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueInputText: {
    fontSize: 20,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  swapButton: {
    alignSelf: 'center',
    backgroundColor: '#4CAF50',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  swapButtonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
  resultContainer: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 15,
    minHeight: 50,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  resultValue: {
    fontSize: 20,
    color: '#FFD700',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  quickConversions: {
    marginBottom: 25,
  },
  quickTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e0e0e0',
    marginBottom: 12,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickButton: {
    width: '48%',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 60,
    borderWidth: 1,
    borderColor: '#333',
  },
  quickButtonText: {
    fontSize: 16,
    color: '#e0e0e0',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  quickButtonResult: {
    fontSize: 11,
    color: '#4CAF50',
    textAlign: 'center',
    numberOfLines: 1,
  },
  formulaSection: {
    marginBottom: 20,
  },
  formulaTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#e0e0e0',
    marginBottom: 12,
  },
  formulaCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  formulaText: {
    fontSize: 12,
    color: '#a0a0a0',
    lineHeight: 18,
    fontFamily: 'monospace',
  },
  
  // 새로운 모달 스타일들
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    // zIndex 제거 - Modal은 자체적으로 최상위 레이어에 렌더링됨
  },
  unitSelectorModal: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    maxHeight: 500,
    borderWidth: 1,
    borderColor: '#333',
    // zIndex 제거
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e0e0e0',
  },
  closeButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#a0a0a0',
  },
  unitList: {
    maxHeight: 400,
  },
  unitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  unitItemSelected: {
    backgroundColor: '#2a4a2a',
  },
  unitItemName: {
    fontSize: 16,
    color: '#e0e0e0',
  },
  unitItemNameSelected: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  unitItemSymbol: {
    fontSize: 14,
    color: '#a0a0a0',
  },
  unitItemSymbolSelected: {
    color: '#4CAF50',
  },
  inputModal: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 300,
    borderWidth: 1,
    borderColor: '#333',
    // zIndex 제거
  },
  modalInput: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 15,
    fontSize: 18,
    color: '#e0e0e0',
    marginVertical: 15,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#333',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButtonText: {
    color: '#a0a0a0',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default UnitConverterScreen; 