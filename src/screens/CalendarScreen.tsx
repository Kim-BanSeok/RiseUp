import React, { useState, useEffect } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from '../components/CustomAlert'; // Alert 대신 CustomAlert 사용

interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  description: string;
  category: 'work' | 'personal' | 'health' | 'study' | 'other';
  reminder: boolean;
  reminderTime: number; // 분 단위
}

interface CalendarDay {
  date: number;
  fullDate: string;
  isToday: boolean;
  isCurrentMonth: boolean;
  events: Event[];
}

const CalendarScreen = () => {
  const insets = useSafeAreaInsets();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showEventDetail, setShowEventDetail] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [calendar, setCalendar] = useState<CalendarDay[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // 일정 추가 폼 상태
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventTime, setNewEventTime] = useState('09:00');
  const [newEventDate, setNewEventDate] = useState(new Date());
  const [newEventDescription, setNewEventDescription] = useState('');
  const [newEventCategory, setNewEventCategory] = useState<Event['category']>('personal');
  
  // 시간/날짜 선택 모달 상태
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // CustomAlert 상태
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    buttons: [] as Array<{
      text: string;
      style?: 'default' | 'cancel' | 'destructive';
      onPress?: () => void;
    }>
  });

  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ];

  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  const categoryColors = {
    work: '#FF7F50',
    personal: '#4A90E2',
    health: '#7ED321',
    study: '#F5A623',
    other: '#9013FE'
  };

  const categoryNames = {
    work: '업무',
    personal: '개인',
    health: '건강',
    study: '학습',
    other: '기타'
  };

  // 날짜를 로컬 날짜 문자열로 변환하는 헬퍼 함수
  const formatDateToLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 문자열에서 로컬 Date 객체 생성하는 헬퍼 함수
  const parseLocalDate = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  useEffect(() => {
    loadEvents();
    generateCalendar();
  }, [currentDate]);

  const showCustomAlert = (title: string, message: string, buttons: Array<{
    text: string;
    style?: 'default' | 'cancel' | 'destructive';
    onPress?: () => void;
  }>) => {
    setAlertConfig({ title, message, buttons });
    setAlertVisible(true);
  };

  const loadEvents = async () => {
    try {
      const savedEvents = await AsyncStorage.getItem('calendar_events');
      if (savedEvents) {
        setEvents(JSON.parse(savedEvents));
      }
    } catch (error) {
      console.error('일정 로딩 실패:', error);
    }
  };

  const saveEvents = async (newEvents: Event[]) => {
    try {
      await AsyncStorage.setItem('calendar_events', JSON.stringify(newEvents));
      setEvents(newEvents);
    } catch (error) {
      console.error('일정 저장 실패:', error);
    }
  };

  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const calendarDays: CalendarDay[] = [];
    const currentDay = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      const dayEvents = events.filter(event => {
        const eventDate = parseLocalDate(event.date);
        return eventDate.toDateString() === currentDay.toDateString();
      });
      
      calendarDays.push({
        date: currentDay.getDate(),
        fullDate: formatDateToLocal(currentDay), // 수정
        isToday: currentDay.toDateString() === new Date().toDateString(),
        isCurrentMonth: currentDay.getMonth() === month,
        events: dayEvents
      });
      
      currentDay.setDate(currentDay.getDate() + 1);
    }
    
    setCalendar(calendarDays);
  };

  const addEvent = () => {
    if (!newEventTitle.trim()) {
      showCustomAlert('오류', '일정 제목을 입력하세요.', [
        {
          text: '확인',
          onPress: () => setAlertVisible(false)
        }
      ]);
      return;
    }

    if (isEditMode && selectedEvent) {
      // 편집 모드: 기존 일정 수정
      const updatedEvent: Event = {
        ...selectedEvent,
        title: newEventTitle,
        date: formatDateToLocal(newEventDate), // 수정
        time: newEventTime,
        description: newEventDescription,
        category: newEventCategory,
      };

      const newEvents = events.map(event => 
        event.id === selectedEvent.id ? updatedEvent : event
      );
      
      saveEvents(newEvents);
      generateCalendar();
      
      showCustomAlert('완료', '일정이 수정되었습니다.', [
        {
          text: '확인',
          onPress: () => setAlertVisible(false)
        }
      ]);
    } else {
      // 생성 모드: 새 일정 추가
      const newEvent: Event = {
        id: Date.now().toString(),
        title: newEventTitle,
        date: formatDateToLocal(newEventDate), // 수정
        time: newEventTime,
        description: newEventDescription,
        category: newEventCategory,
        reminder: false,
        reminderTime: 10
      };

      const newEvents = [...events, newEvent];
      saveEvents(newEvents);
      generateCalendar();
      
      showCustomAlert('완료', '새 일정이 추가되었습니다.', [
        {
          text: '확인',
          onPress: () => setAlertVisible(false)
        }
      ]);
    }

    // 폼 초기화 및 모달 닫기
    resetForm();
  };

  const resetForm = () => {
    setNewEventTitle('');
    setNewEventTime('09:00');
    setNewEventDate(selectedDate);
    setNewEventDescription('');
    setNewEventCategory('personal');
    setIsEditMode(false);
    setSelectedEvent(null);
    setShowAddEvent(false);
  };

  const openAddEventModal = () => {
    resetForm();
    setShowAddEvent(true);
  };

  const openEditEventModal = (event: Event) => {
    setNewEventTitle(event.title);
    setNewEventTime(event.time);
    setNewEventDate(parseLocalDate(event.date)); // 수정
    setNewEventDescription(event.description);
    setNewEventCategory(event.category);
    setIsEditMode(true);
    setSelectedEvent(event);
    setShowEventDetail(false);
    setShowAddEvent(true);
  };

  const deleteEvent = (eventId: string) => {
    showCustomAlert(
      '일정 삭제',
      '이 일정을 삭제하시겠습니까?',
      [
        { 
          text: '취소', 
          style: 'cancel',
          onPress: () => setAlertVisible(false)
        },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            const newEvents = events.filter(event => event.id !== eventId);
            saveEvents(newEvents);
            generateCalendar();
            setAlertVisible(false);
          }
        }
      ]
    );
  };

  const getSelectedDateEvents = () => {
    const selectedDateString = formatDateToLocal(selectedDate); // 수정
    return events.filter(event => event.date === selectedDateString);
  };

  const renderCalendarDay = (day: CalendarDay, index: number) => {
    const isSelected = day.fullDate === formatDateToLocal(selectedDate); // 수정
    
    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.calendarDay,
          day.isToday && styles.todayDay,
          isSelected && styles.selectedDay,
          !day.isCurrentMonth && styles.otherMonthDay
        ]}
        onPress={() => setSelectedDate(parseLocalDate(day.fullDate))} // 수정
      >
        <Text style={[
          styles.dayText,
          day.isToday && styles.todayText,
          isSelected && styles.selectedText,
          !day.isCurrentMonth && styles.otherMonthText
        ]}>
          {day.date}
        </Text>
        
        {day.events.length > 0 && (
          <View style={styles.eventIndicator}>
            <Text style={styles.eventCount}>{day.events.length}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderEventItem = (event: Event) => (
    <TouchableOpacity
      key={event.id}
      style={[styles.eventItem, { borderLeftColor: categoryColors[event.category] }]}
      onPress={() => {
        setSelectedEvent(event);
        setShowEventDetail(true);
      }}
      onLongPress={() => deleteEvent(event.id)}
    >
      <View style={styles.eventHeader}>
        <Text style={styles.eventTitle}>{event.title}</Text>
        <Text style={styles.eventTime}>{event.time}</Text>
      </View>
      
      <Text style={styles.eventCategory}>{categoryNames[event.category]}</Text>
      
      {event.description ? (
        <Text style={styles.eventDescription} numberOfLines={2}>
          {event.description}
        </Text>
      ) : null}
    </TouchableOpacity>
  );

  const changeMonth = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  // 시간 선택 컴포넌트
  const renderTimePicker = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
    const minutes = ['00', '15', '30', '45'];

    const currentHour = newEventTime.split(':')[0];
    const currentMinute = newEventTime.split(':')[1];

    return (
      <Modal
        visible={showTimePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTimePicker(false)}
      >
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerContent}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>시간 선택</Text>
              <TouchableOpacity
                style={styles.pickerCloseButton}
                onPress={() => setShowTimePicker(false)}
              >
                <Text style={styles.pickerCloseText}>완료</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.timePickerContainer}>
              {/* 시간 선택 */}
              <View style={styles.timeColumn}>
                <Text style={styles.timeColumnTitle}>시</Text>
                <ScrollView style={styles.timeScroll} showsVerticalScrollIndicator={false}>
                  {hours.map(hour => (
                    <TouchableOpacity
                      key={hour}
                      style={[
                        styles.timeOption,
                        currentHour === hour && styles.selectedTimeOption
                      ]}
                      onPress={() => setNewEventTime(`${hour}:${currentMinute}`)}
                    >
                      <Text style={[
                        styles.timeOptionText,
                        currentHour === hour && styles.selectedTimeOptionText
                      ]}>
                        {hour}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* 분 선택 */}
              <View style={styles.timeColumn}>
                <Text style={styles.timeColumnTitle}>분</Text>
                <ScrollView style={styles.timeScroll} showsVerticalScrollIndicator={false}>
                  {minutes.map(minute => (
                    <TouchableOpacity
                      key={minute}
                      style={[
                        styles.timeOption,
                        currentMinute === minute && styles.selectedTimeOption
                      ]}
                      onPress={() => setNewEventTime(`${currentHour}:${minute}`)}
                    >
                      <Text style={[
                        styles.timeOptionText,
                        currentMinute === minute && styles.selectedTimeOptionText
                      ]}>
                        {minute}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // 날짜 선택 컴포넌트
  const renderDatePicker = () => {
    const today = new Date();
    const dates = [];
    
    // 이전 7일, 오늘, 이후 30일
    for (let i = -7; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }

    return (
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerContent}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>날짜 선택</Text>
              <TouchableOpacity
                style={styles.pickerCloseButton}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.pickerCloseText}>완료</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.datePickerContainer}>
              {dates.map((date, index) => {
                const isSelected = date.toDateString() === newEventDate.toDateString();
                const isToday = date.toDateString() === today.toDateString();
                
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dateOption,
                      isSelected && styles.selectedDateOption
                    ]}
                    onPress={() => {
                      setNewEventDate(date);
                      setShowDatePicker(false);
                    }}
                  >
                    <View style={styles.dateOptionContent}>
                      <Text style={[
                        styles.dateOptionText,
                        isSelected && styles.selectedDateOptionText
                      ]}>
                        {date.toLocaleDateString('ko-KR', {
                          month: 'long',
                          day: 'numeric',
                          weekday: 'short'
                        })}
                        {isToday && ' (오늘)'}
                      </Text>
                      {isSelected && <Text style={styles.checkMark}>✓</Text>}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.title}>📅 캘린더</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={openAddEventModal}
        >
          <Text style={styles.addButtonText}>+ 일정 추가</Text>
        </TouchableOpacity>
      </View>

      {/* 월 네비게이션 */}
      <View style={styles.monthNavigation}>
        <TouchableOpacity style={styles.navButton} onPress={() => changeMonth(-1)}>
          <Text style={styles.navButtonText}>‹</Text>
        </TouchableOpacity>
        
        <Text style={styles.monthTitle}>
          {currentDate.getFullYear()}년 {monthNames[currentDate.getMonth()]}
        </Text>
        
        <TouchableOpacity style={styles.navButton} onPress={() => changeMonth(1)}>
          <Text style={styles.navButtonText}>›</Text>
        </TouchableOpacity>
      </View>

      {/* 요일 헤더 */}
      <View style={styles.weekDaysHeader}>
        {dayNames.map(day => (
          <Text key={day} style={styles.weekDayText}>{day}</Text>
        ))}
      </View>

      {/* 캘린더 그리드 */}
      <View style={styles.calendarGrid}>
        {calendar.map((day, index) => renderCalendarDay(day, index))}
      </View>

      {/* 선택된 날짜의 일정 목록 */}
      <View style={styles.eventsList}>
        <Text style={styles.eventsTitle}>
          {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 일정
        </Text>
        
        <ScrollView style={styles.eventsContainer}>
          {getSelectedDateEvents().length > 0 ? (
            getSelectedDateEvents().map(renderEventItem)
          ) : (
            <View style={styles.noEventsContainer}>
              <Text style={styles.noEventsText}>일정이 없습니다.</Text>
              <TouchableOpacity
                style={styles.quickAddButton}
                onPress={openAddEventModal}
              >
                <Text style={styles.quickAddText}>+ 빠른 일정 추가</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>

      {/* 일정 추가/편집 모달 */}
      <Modal
        visible={showAddEvent}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          resetForm();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isEditMode ? '일정 수정' : '새 일정 추가'}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={resetForm}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              {/* 날짜 선택 */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>📅 날짜</Text>
                <TouchableOpacity
                  style={styles.dateTimeButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.dateTimeButtonText}>
                    {newEventDate.toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      weekday: 'long'
                    })}
                  </Text>
                  <Text style={styles.arrowIcon}>›</Text>
                </TouchableOpacity>
              </View>

              {/* 일정 제목 */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>일정 제목</Text>
                <TextInput
                  style={styles.textInput}
                  value={newEventTitle}
                  onChangeText={setNewEventTitle}
                  placeholder="일정 제목을 입력하세요"
                  placeholderTextColor="#666"
                />
              </View>

              {/* 시간 선택 */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>⏰ 시간</Text>
                <TouchableOpacity
                  style={styles.dateTimeButton}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Text style={styles.dateTimeButtonText}>{newEventTime}</Text>
                  <Text style={styles.arrowIcon}>›</Text>
                </TouchableOpacity>
              </View>

              {/* 카테고리 */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>카테고리</Text>
                <View style={styles.categoryContainer}>
                  {Object.entries(categoryNames).map(([key, name]) => (
                    <TouchableOpacity
                      key={key}
                      style={[
                        styles.categoryButton,
                        { backgroundColor: categoryColors[key as Event['category']] },
                        newEventCategory === key && styles.selectedCategory
                      ]}
                      onPress={() => setNewEventCategory(key as Event['category'])}
                    >
                      <Text style={styles.categoryButtonText}>{name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* 설명 */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>설명 (선택사항)</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={newEventDescription}
                  onChangeText={setNewEventDescription}
                  placeholder="일정 설명을 입력하세요"
                  placeholderTextColor="#666"
                  multiline
                  numberOfLines={3}
                />
              </View>

              {/* 저장 버튼 */}
              <TouchableOpacity style={styles.saveButton} onPress={addEvent}>
                <Text style={styles.saveButtonText}>
                  {isEditMode ? '일정 수정' : '일정 저장'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 일정 상세보기 모달 */}
      <Modal
        visible={showEventDetail}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEventDetail(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.detailModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>일정 상세</Text>
              <View style={styles.headerButtons}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => {
                    if (selectedEvent) {
                      openEditEventModal(selectedEvent);
                    }
                  }}
                >
                  <Text style={styles.editButtonText}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowEventDetail(false)}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
            </View>

            {selectedEvent && (
              <ScrollView style={styles.detailContent}>
                {/* 일정 제목 */}
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>📝 제목</Text>
                  <Text style={styles.detailTitle}>{selectedEvent.title}</Text>
                </View>

                {/* 날짜 및 시간 */}
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>📅 날짜 및 시간</Text>
                  <Text style={styles.detailText}>
                    {parseLocalDate(selectedEvent.date).toLocaleDateString('ko-KR', { // 수정
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      weekday: 'long'
                    })} {selectedEvent.time}
                  </Text>
                </View>

                {/* 카테고리 */}
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>🏷️ 카테고리</Text>
                  <View style={styles.categoryBadge}>
                    <View 
                      style={[
                        styles.categoryIndicator, 
                        { backgroundColor: categoryColors[selectedEvent.category] }
                      ]} 
                    />
                    <Text style={styles.detailText}>
                      {categoryNames[selectedEvent.category]}
                    </Text>
                  </View>
                </View>

                {/* 설명 */}
                {selectedEvent.description ? (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>📄 설명</Text>
                    <Text style={styles.detailDescription}>
                      {selectedEvent.description}
                    </Text>
                  </View>
                ) : null}

                {/* 알림 설정 */}
                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>🔔 알림</Text>
                  <Text style={styles.detailText}>
                    {selectedEvent.reminder 
                      ? `${selectedEvent.reminderTime}분 전 알림` 
                      : '알림 없음'
                    }
                  </Text>
                </View>

                {/* 삭제 버튼 */}
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => {
                    setShowEventDetail(false);
                    deleteEvent(selectedEvent.id);
                  }}
                >
                  <Text style={styles.deleteButtonText}>🗑️ 일정 삭제</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* 시간 선택 모달 */}
      {renderTimePicker()}

      {/* 날짜 선택 모달 */}
      {renderDatePicker()}

      {/* CustomAlert */}
      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onRequestClose={() => setAlertVisible(false)}
      />
    </View>
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
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#FF7F50',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  navButton: {
    padding: 10,
  },
  navButtonText: {
    color: '#FF7F50',
    fontSize: 24,
    fontWeight: 'bold',
  },
  monthTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  weekDaysHeader: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  weekDayText: {
    flex: 1,
    textAlign: 'center',
    color: '#A67C61',
    fontSize: 14,
    fontWeight: '500',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    maxHeight: 240, // 캘린더 높이 제한 추가
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
    position: 'relative',
  },
  dayText: {
    color: 'white',
    fontSize: 16,
  },
  todayDay: {
    backgroundColor: '#FF7F50',
  },
  todayText: {
    color: 'white',
    fontWeight: 'bold',
  },
  selectedDay: {
    backgroundColor: '#4A90E2',
  },
  selectedText: {
    color: 'white',
    fontWeight: 'bold',
  },
  otherMonthDay: {
    opacity: 0.3,
  },
  otherMonthText: {
    color: '#666',
  },
  eventIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#FF7F50',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventCount: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  eventsList: {
    flex: 1, // 더 많은 공간 차지
    backgroundColor: '#2A2A2A',
    marginTop: 15, // 여백 늘림
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 300, // 최소 높이 설정
  },
  eventsTitle: {
    color: 'white',
    fontSize: 20, // 폰트 크기 증가
    fontWeight: 'bold',
    marginBottom: 20, // 여백 늘림
  },
  eventsContainer: {
    flex: 1,
  },
  eventItem: {
    backgroundColor: '#3A3A3A',
    borderRadius: 12, // 둥근 모서리 증가
    padding: 20, // 패딩 증가
    marginBottom: 15, // 여백 증가
    borderLeftWidth: 5, // 왼쪽 보더 두께 증가
    minHeight: 80, // 최소 높이 설정
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8, // 여백 증가
  },
  eventTitle: {
    color: 'white',
    fontSize: 18, // 폰트 크기 증가
    fontWeight: 'bold',
    flex: 1,
  },
  eventTime: {
    color: '#A67C61',
    fontSize: 16, // 폰트 크기 증가
    fontWeight: '500',
  },
  eventCategory: {
    color: '#A67C61',
    fontSize: 14, // 폰트 크기 증가
    marginBottom: 8, // 여백 증가
  },
  eventDescription: {
    color: '#CCC',
    fontSize: 15, // 폰트 크기 증가
    lineHeight: 22, // 줄간격 증가
  },
  noEventsContainer: {
    alignItems: 'center',
    marginTop: 80, // 여백 증가
  },
  noEventsText: {
    color: '#666',
    fontSize: 18, // 폰트 크기 증가
    textAlign: 'center',
    marginBottom: 25, // 여백 증가
  },
  quickAddButton: {
    backgroundColor: '#FF7F50',
    paddingHorizontal: 25, // 패딩 증가
    paddingVertical: 15, // 패딩 증가
    borderRadius: 25,
  },
  quickAddText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16, // 폰트 크기 증가
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#2A2A2A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  detailModalContent: {
    backgroundColor: '#2A2A2A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    minHeight: '60%',
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
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  editButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 18,
  },
  closeButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#A67C61',
    fontSize: 20,
  },
  modalForm: {
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#3A3A3A',
    color: 'white',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#4A4A4A',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  selectedDateText: {
    color: '#A67C61',
    fontSize: 16,
    padding: 15,
    backgroundColor: '#3A3A3A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#4A4A4A',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    opacity: 0.7,
  },
  selectedCategory: {
    opacity: 1,
  },
  categoryButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#FF7F50',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  detailSection: {
    marginBottom: 25,
  },
  detailLabel: {
    color: '#A67C61',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  detailTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  detailText: {
    color: 'white',
    fontSize: 16,
  },
  detailDescription: {
    color: '#CCC',
    fontSize: 16,
    lineHeight: 24,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: '#FF4444',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dateTimeButton: {
    backgroundColor: '#3A3A3A',
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#4A4A4A',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateTimeButtonText: {
    color: 'white',
    fontSize: 16,
  },
  arrowIcon: {
    color: '#A67C61',
    fontSize: 18,
    fontWeight: 'bold',
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContent: {
    backgroundColor: '#2A2A2A',
    borderRadius: 15,
    width: '90%',
    maxHeight: '70%',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  pickerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  pickerCloseButton: {
    backgroundColor: '#FF7F50',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  pickerCloseText: {
    color: 'white',
    fontWeight: '500',
  },
  timePickerContainer: {
    flexDirection: 'row',
    padding: 20,
    height: 300,
  },
  timeColumn: {
    flex: 1,
    marginHorizontal: 10,
  },
  timeColumnTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  timeScroll: {
    maxHeight: 250,
  },
  timeOption: {
    backgroundColor: '#3A3A3A',
    padding: 15,
    marginVertical: 2,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedTimeOption: {
    backgroundColor: '#FF7F50',
  },
  timeOptionText: {
    color: 'white',
    fontSize: 16,
  },
  selectedTimeOptionText: {
    color: 'white',
    fontWeight: 'bold',
  },
  datePickerContainer: {
    padding: 20,
    maxHeight: 400,
  },
  dateOption: {
    backgroundColor: '#3A3A3A',
    padding: 15,
    marginVertical: 3,
    borderRadius: 10,
  },
  selectedDateOption: {
    backgroundColor: '#FF7F50',
  },
  dateOptionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateOptionText: {
    color: 'white',
    fontSize: 16,
  },
  selectedDateOptionText: {
    color: 'white',
    fontWeight: 'bold',
  },
  checkMark: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CalendarScreen; 