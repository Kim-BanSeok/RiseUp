import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface DaySelectorProps {
  selectedDays: number[];
  onDaysChange: (days: number[]) => void;
}

const DaySelector: React.FC<DaySelectorProps> = ({ selectedDays, onDaysChange }) => {
  const days = [
    { label: '일', value: 0 },
    { label: '월', value: 1 },
    { label: '화', value: 2 },
    { label: '수', value: 3 },
    { label: '목', value: 4 },
    { label: '금', value: 5 },
    { label: '토', value: 6 },
  ];

  const toggleDay = (dayValue: number) => {
    if (selectedDays.includes(dayValue)) {
      // 선택 해제
      onDaysChange(selectedDays.filter(day => day !== dayValue));
    } else {
      // 선택 추가
      onDaysChange([...selectedDays, dayValue].sort());
    }
  };

  const selectPreset = (preset: 'weekdays' | 'weekend' | 'everyday' | 'none') => {
    switch (preset) {
      case 'weekdays':
        onDaysChange([1, 2, 3, 4, 5]); // 월~금
        break;
      case 'weekend':
        onDaysChange([0, 6]); // 일, 토
        break;
      case 'everyday':
        onDaysChange([0, 1, 2, 3, 4, 5, 6]); // 매일
        break;
      case 'none':
        onDaysChange([]); // 한번만
        break;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>반복 요일 선택</Text>
      
      {/* 요일 버튼들 */}
      <View style={styles.daysContainer}>
        {days.map((day) => (
          <TouchableOpacity
            key={day.value}
            style={[
              styles.dayButton,
              selectedDays.includes(day.value) && styles.dayButtonSelected
            ]}
            onPress={() => toggleDay(day.value)}
          >
            <Text style={[
              styles.dayText,
              selectedDays.includes(day.value) && styles.dayTextSelected
            ]}>
              {day.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 프리셋 버튼들 */}
      <View style={styles.presetContainer}>
        <TouchableOpacity
          style={styles.presetButton}
          onPress={() => selectPreset('weekdays')}
        >
          <Text style={styles.presetText}>평일</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.presetButton}
          onPress={() => selectPreset('weekend')}
        >
          <Text style={styles.presetText}>주말</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.presetButton}
          onPress={() => selectPreset('everyday')}
        >
          <Text style={styles.presetText}>매일</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.presetButton}
          onPress={() => selectPreset('none')}
        >
          <Text style={styles.presetText}>한번만</Text>
        </TouchableOpacity>
      </View>

      {/* 선택된 요일 표시 */}
      <Text style={styles.selectedText}>
        {selectedDays.length === 0 
          ? '한번만 울림' 
          : selectedDays.length === 7 
          ? '매일 반복' 
          : `${selectedDays.map(d => days[d].label).join(', ')} 반복`
        }
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
    color: '#FFAB7A', // 따뜻한 오렌지
    textAlign: 'center',
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6B4E37', // 어두운 브라운
    borderWidth: 1,
    borderColor: '#8B6341',
  },
  dayButtonSelected: {
    backgroundColor: '#FF7F50', // 코랄 오렌지
    borderColor: '#FF6347',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFAB7A',
  },
  dayTextSelected: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  presetContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
    flexWrap: 'wrap',
  }, 
  presetButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#4A2C1A',
    borderRadius: 20,
    margin: 3,
    borderWidth: 1,
    borderColor: '#8B6341',
  },
  presetText: {
    fontSize: 12,
    color: '#FFAB7A',
    fontWeight: '500',
  },
  selectedText: {
    fontSize: 14,
    color: '#FF7F50', // 코랄 오렌지
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default DaySelector;