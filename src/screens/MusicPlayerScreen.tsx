import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
  rawResourceId?: number;
}

interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
}

const DEFAULT_PLAYLISTS: Playlist[] = [
  {
    id: 'classical',
    name: '클래식',
    tracks: [
      {
        id: 'classic1',
        title: '캐논 변주곡',
        artist: '파헬벨',
        duration: 240,
        rawResourceId: 2131623936,
      },
      {
        id: 'classic2', 
        title: '월광 소나타',
        artist: '베토벤',
        duration: 180,
        rawResourceId: 2131623936,
      }
    ]
  },
  {
    id: 'nature',
    name: '자연음',
    tracks: [
      {
        id: 'nature1',
        title: '숲속의 새소리',
        artist: '자연음',
        duration: 300,
        rawResourceId: 2131623939,
      }
    ]
  },
  {
    id: 'gentle',
    name: '잔잔한 음악',
    tracks: [
      {
        id: 'gentle1',
        title: '부드러운 알람',
        artist: '릴렉스',
        duration: 120,
        rawResourceId: 2131623937,
      }
    ]
  }
];

const MusicPlayerScreen = React.memo(() => {
  const insets = useSafeAreaInsets();
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [playlists] = useState<Playlist[]>(DEFAULT_PLAYLISTS);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist>(DEFAULT_PLAYLISTS[2]);
  const [showPlayer, setShowPlayer] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'track' | 'queue'>('off');
  const [shuffleMode, setShuffleMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const playTrack = useCallback(async (track: Track) => {
    try {
      setIsLoading(true);
      setCurrentTrack(track);
      setShowPlayer(true);
      setIsPlaying(true);
      console.log('재생 중:', track.title);
      Alert.alert('재생 시작', `${track.title} - ${track.artist}`);
    } catch (error) {
      console.error('재생 실패:', error);
      Alert.alert('재생 오류', '음악을 재생할 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const togglePlayback = useCallback(async () => {
    if (isPlaying) {
      setIsPlaying(false);
      console.log('일시정지');
    } else {
      setIsPlaying(true);
      console.log('재생');
    }
  }, [isPlaying]);

  const skipToNext = useCallback(async () => {
    if (!currentTrack || !selectedPlaylist) return;
    
    const currentIndex = selectedPlaylist.tracks.findIndex(track => track.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % selectedPlaylist.tracks.length;
    const nextTrack = selectedPlaylist.tracks[nextIndex];
    
    await playTrack(nextTrack);
  }, [currentTrack, selectedPlaylist, playTrack]);

  const skipToPrevious = useCallback(async () => {
    if (!currentTrack || !selectedPlaylist) return;
    
    const currentIndex = selectedPlaylist.tracks.findIndex(track => track.id === currentTrack.id);
    const prevIndex = currentIndex === 0 ? selectedPlaylist.tracks.length - 1 : currentIndex - 1;
    const prevTrack = selectedPlaylist.tracks[prevIndex];
    
    await playTrack(prevTrack);
  }, [currentTrack, selectedPlaylist, playTrack]);

  const toggleRepeatMode = useCallback(() => {
    const modes: Array<'off' | 'track' | 'queue'> = ['off', 'track', 'queue'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setRepeatMode(modes[nextIndex]);
  }, [repeatMode]);

  const toggleShuffleMode = useCallback(() => {
    setShuffleMode(prev => !prev);
  }, []);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderTrackItem = useCallback(({ item }: { item: Track }) => (
    <TouchableOpacity
      style={styles.trackItem}
      onPress={() => playTrack(item)}
      disabled={isLoading}
    >
      <View style={styles.trackInfo}>
        <Text style={styles.trackTitle}>{item.title}</Text>
        <Text style={styles.trackArtist}>{item.artist}</Text>
      </View>
      <View style={styles.trackDuration}>
        <Text style={styles.durationText}>{formatDuration(item.duration)}</Text>
        {isLoading && currentTrack?.id === item.id && (
          <ActivityIndicator size="small" color="#1a73e8" style={styles.loadingIndicator} />
        )}
      </View>
    </TouchableOpacity>
  ), [playTrack, isLoading, currentTrack]);

  const renderPlaylistItem = useCallback(({ item }: { item: Playlist }) => (
    <TouchableOpacity
      style={[
        styles.playlistItem,
        selectedPlaylist.id === item.id && styles.selectedPlaylist
      ]}
      onPress={() => setSelectedPlaylist(item)}
    >
      <Text style={[
        styles.playlistName,
        selectedPlaylist.id === item.id && styles.selectedPlaylistText
      ]}>
        {item.name}
      </Text>
      <Text style={styles.trackCount}>{item.tracks.length}곡</Text>
    </TouchableOpacity>
  ), [selectedPlaylist]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>🎵 음악 플레이어</Text>
      </View>

      {/* 플레이리스트 선택 */}
      <View style={styles.playlistSection}>
        <Text style={styles.sectionTitle}>플레이리스트</Text>
        <FlatList
          data={playlists}
          renderItem={renderPlaylistItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.playlistContainer}
        />
      </View>

      {/* 트랙 목록 */}
      <View style={styles.tracksSection}>
        <Text style={styles.sectionTitle}>트랙 목록</Text>
        <FlatList
          data={selectedPlaylist.tracks}
          renderItem={renderTrackItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.tracksContainer}
        />
      </View>

      {/* 미니 플레이어 */}
      {showPlayer && currentTrack && (
        <View style={styles.miniPlayer}>
          <View style={styles.miniPlayerInfo}>
            <Text style={styles.miniPlayerTitle} numberOfLines={1}>
              {currentTrack.title}
            </Text>
            <Text style={styles.miniPlayerArtist} numberOfLines={1}>
              {currentTrack.artist}
            </Text>
          </View>
          
          <View style={styles.miniPlayerControls}>
            <TouchableOpacity onPress={skipToPrevious} style={styles.controlButton}>
              <Text style={styles.controlIcon}>⏮</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={togglePlayback} style={styles.playButton}>
              <Text style={styles.playIcon}>{isPlaying ? '⏸' : '▶'}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={skipToNext} style={styles.controlButton}>
              <Text style={styles.controlIcon}>⏭</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 컨트롤 패널 */}
      {showPlayer && (
        <View style={styles.controlPanel}>
          <TouchableOpacity onPress={toggleRepeatMode} style={styles.controlButton}>
            <Text style={[
              styles.controlIcon,
              repeatMode !== 'off' && styles.activeControl
            ]}>
              {repeatMode === 'off' ? '🔁' : repeatMode === 'track' ? '🔂' : '🔁'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={toggleShuffleMode} style={styles.controlButton}>
            <Text style={[
              styles.controlIcon,
              shuffleMode && styles.activeControl
            ]}>
              🔀
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A1A',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  playlistSection: {
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  playlistContainer: {
    paddingHorizontal: 20,
  },
  playlistItem: {
    backgroundColor: '#333',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginRight: 10,
    minWidth: 100,
    alignItems: 'center',
  },
  selectedPlaylist: {
    backgroundColor: '#1a73e8',
  },
  playlistName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  selectedPlaylistText: {
    color: '#ffffff',
  },
  trackCount: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  tracksSection: {
    flex: 1,
  },
  tracksContainer: {
    paddingHorizontal: 20,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    backgroundColor: '#333',
    borderRadius: 10,
    marginBottom: 8,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  trackArtist: {
    fontSize: 14,
    color: '#999',
  },
  trackDuration: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationText: {
    fontSize: 14,
    color: '#999',
    marginRight: 10,
  },
  loadingIndicator: {
    marginLeft: 5,
  },
  miniPlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#333',
    borderTopWidth: 1,
    borderTopColor: '#444',
  },
  miniPlayerInfo: {
    flex: 1,
  },
  miniPlayerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  miniPlayerArtist: {
    fontSize: 14,
    color: '#999',
  },
  miniPlayerControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    padding: 10,
  },
  playButton: {
    padding: 15,
    backgroundColor: '#1a73e8',
    borderRadius: 25,
    marginHorizontal: 10,
  },
  controlIcon: {
    fontSize: 20,
    color: '#ffffff',
  },
  playIcon: {
    fontSize: 18,
    color: '#ffffff',
  },
  activeControl: {
    color: '#1a73e8',
  },
  controlPanel: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: '#333',
    borderTopWidth: 1,
    borderTopColor: '#444',
  },
});

MusicPlayerScreen.displayName = 'MusicPlayerScreen';

export default MusicPlayerScreen; 