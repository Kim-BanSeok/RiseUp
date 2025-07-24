import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from '../../components/CustomAlert';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  isPinned: boolean;
}

const NotesScreen = () => {
  const insets = useSafeAreaInsets();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const NOTES_STORAGE_KEY = '@RiseUp:notes';

  // 메모 로드
  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const savedNotes = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
      if (savedNotes) {
        const parsedNotes = JSON.parse(savedNotes).map((note: any) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt),
        }));
        setNotes(parsedNotes);
      }
    } catch (error) {
      console.error('메모 로드 실패:', error);
    }
  };

  const saveNotes = async (notesToSave: Note[]) => {
    try {
      await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notesToSave));
    } catch (error) {
      console.error('메모 저장 실패:', error);
    }
  };

  const addNote = () => {
    if (!newNoteTitle.trim() && !newNoteContent.trim()) {
      return;
    }

    const newNote: Note = {
      id: Date.now().toString(),
      title: newNoteTitle.trim() || '제목 없음',
      content: newNoteContent.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
      isPinned: false,
    };

    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
    
    setNewNoteTitle('');
    setNewNoteContent('');
    setIsAddingNote(false);
  };

  const updateNote = (noteId: string, updates: Partial<Note>) => {
    const updatedNotes = notes.map(note => 
      note.id === noteId 
        ? { ...note, ...updates, updatedAt: new Date() }
        : note
    );
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
  };

  const deleteNote = (noteId: string) => {
    const updatedNotes = notes.filter(note => note.id !== noteId);
    setNotes(updatedNotes);
    saveNotes(updatedNotes);
  };

  const togglePin = (noteId: string) => {
    const note = notes.find(n => n.id === noteId);
    if (note) {
      updateNote(noteId, { isPinned: !note.isPinned });
    }
  };

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedNotes = filteredNotes.sort((a, b) => {
    // 고정된 메모를 먼저 표시
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    // 최신 메모를 먼저 표시
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const renderNote = ({ item }: { item: Note }) => (
    <TouchableOpacity
      style={[styles.noteItem, item.isPinned && styles.pinnedNote]}
      onPress={() => setEditingNote(item)}
    >
      <View style={styles.noteHeader}>
        <Text style={styles.noteTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <View style={styles.noteActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => togglePin(item.id)}
          >
            <Text style={styles.actionIcon}>
              {item.isPinned ? '📌' : '📍'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => deleteNote(item.id)}
          >
            <Text style={styles.actionIcon}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={styles.noteContent} numberOfLines={3}>
        {item.content}
      </Text>
      
      <Text style={styles.noteDate}>
        {new Date(item.updatedAt).toLocaleDateString('ko-KR')}
      </Text>
    </TouchableOpacity>
  );

  const renderAddNoteForm = () => (
    <View style={styles.addNoteForm}>
      <TextInput
        style={styles.titleInput}
        placeholder="제목 (선택사항)"
        placeholderTextColor="#A67C61"
        value={newNoteTitle}
        onChangeText={setNewNoteTitle}
      />
      <TextInput
        style={styles.contentInput}
        placeholder="메모를 입력하세요..."
        placeholderTextColor="#A67C61"
        value={newNoteContent}
        onChangeText={setNewNoteContent}
        multiline
        textAlignVertical="top"
      />
      <View style={styles.formActions}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => {
            setIsAddingNote(false);
            setNewNoteTitle('');
            setNewNoteContent('');
          }}
        >
          <Text style={styles.cancelButtonText}>취소</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={addNote}
        >
          <Text style={styles.saveButtonText}>저장</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { 
        paddingTop: insets.top,
        paddingBottom: insets.bottom + 100 
      }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>메모</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsAddingNote(true)}
        >
          <Text style={styles.addButtonText}>+ 새 메모</Text>
        </TouchableOpacity>
      </View>

      {/* 검색 */}
      <TextInput
        style={styles.searchInput}
        placeholder="메모 검색..."
        placeholderTextColor="#A67C61"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* 메모 추가 폼 */}
      {isAddingNote && renderAddNoteForm()}

      {/* 메모 목록 */}
      <FlatList
        data={sortedNotes}
        renderItem={renderNote}
        keyExtractor={(item) => item.id}
        style={styles.notesList}
        showsVerticalScrollIndicator={false}
      />
    </KeyboardAvoidingView>
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
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#FF7F50',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  searchInput: {
    backgroundColor: '#333',
    color: 'white',
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 8,
    fontSize: 16,
  },
  addNoteForm: {
    backgroundColor: '#2A2A2A',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FF7F50',
  },
  titleInput: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
    paddingVertical: 8,
  },
  contentInput: {
    color: 'white',
    fontSize: 14,
    minHeight: 100,
    paddingVertical: 8,
    marginBottom: 15,
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancelButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  cancelButtonText: {
    color: '#A67C61',
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  notesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  noteItem: {
    backgroundColor: '#2A2A2A',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#FF7F50',
  },
  pinnedNote: {
    borderLeftColor: '#FFD700',
    backgroundColor: '#2A2A2A',
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  noteActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    padding: 5,
  },
  actionIcon: {
    fontSize: 16,
  },
  noteContent: {
    color: '#CCCCCC',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  noteDate: {
    color: '#A67C61',
    fontSize: 12,
  },
});

export default NotesScreen; 