import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';

interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number; // 초 단위
  artwork?: string;
  url: string;
}

interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
  artwork?: string;
}

// 기본 제공 음악 (알람 사운드 활용)
const DEFAULT_TRACKS: Track[] = [
  {
    id: 'classic',
    title: '클래식 알람',
    artist: 'RiseUp',
    duration: 30,
    url: 'alarm_classic'
  },
  {
    id: 'gentle',
    title: '젠틀 멜로디',
    artist: 'RiseUp',
    duration: 45,
    url: 'alarm_gentle'
  },
  {
    id: 'nature',
    title: '자연의 소리',
    artist: 'RiseUp',
    duration: 60,
    url: 'alarm_nature'
  },
  {
    id: 'loud',
    title: '파워풀 사운드',
    artist: 'RiseUp',
    duration: 35,
    url: 'alarm_loud'
  },
];

const DEFAULT_PLAYLISTS: Playlist[] = [
  {
    id: 'favorites',
    name: '즐겨찾기',
    tracks: [],
  },
  {
    id: 'recent',
    name: '최근 재생',
    tracks: [],
  },
  {
    id: 'default',
    name: '기본 사운드',
    tracks: DEFAULT_TRACKS,
  },
];

const MusicPlayerScreen = () => {
  const insets = useSafeAreaInsets();
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [playlists, setPlaylists] = useState<Playlist[]>(DEFAULT_PLAYLISTS);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist>(DEFAULT_PLAYLISTS[2]);
  const [showPlayer, setShowPlayer] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'none' | 'one' | 'all'>('none');
  const [shuffleMode, setShuffleMode] = useState(false);

  const handleTrackEnd = useCallback(() => {
    if (repeatMode === 'one') {
      setCurrentTime(0);
      return;
    }
    
    const currentIndex = selectedPlaylist.tracks.findIndex(t => t.id === currentTrack?.id);
    if (currentIndex !== -1) {
      if (repeatMode === 'all' || currentIndex < selectedPlaylist.tracks.length - 1) {
        const nextIndex = (currentIndex + 1) % selectedPlaylist.tracks.length;
        playTrack(selectedPlaylist.tracks[nextIndex]);
      } else {
        setIsPlaying(false);
        setCurrentTime(0);
      }
    }
  }, [repeatMode, selectedPlaylist.tracks, currentTrack?.id]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentTrack) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= currentTrack.duration) {
            handleTrackEnd();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack, handleTrackEnd]);

  const playTrack = (track: Track) => {
    setCurrentTrack(track);
    setCurrentTime(0);
    setIsPlaying(true);
    setShowPlayer(true);
    
    // TODO: 실제 음악 재생 구현
    console.log('재생 중:', track.title);
  };

  const pauseResume = () => {
    setIsPlaying(!isPlaying);
    // TODO: 실제 재생/일시정지 구현
  };

  const skipNext = () => {
    if (!currentTrack) return;
    
    const currentIndex = selectedPlaylist.tracks.findIndex(t => t.id === currentTrack.id);
    if (currentIndex !== -1 && currentIndex < selectedPlaylist.tracks.length - 1) {
      playTrack(selectedPlaylist.tracks[currentIndex + 1]);
    }
  };

  const skipPrevious = () => {
    if (!currentTrack) return;
    
    if (currentTime > 3) {
      setCurrentTime(0);
      return;
    }
    
    const currentIndex = selectedPlaylist.tracks.findIndex(t => t.id === currentTrack.id);
    if (currentIndex > 0) {
      playTrack(selectedPlaylist.tracks[currentIndex - 1]);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleRepeatMode = () => {
    const modes: Array<'none' | 'one' | 'all'> = ['none', 'one', 'all'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setRepeatMode(modes[nextIndex]);
  };

  const getRepeatIcon = () => {
    switch (repeatMode) {
      case 'none': return '🔁';
      case 'one': return '🔂';
      case 'all': return '🔁';
      default: return '🔁';
    }
  };

  const renderTrackItem = (track: Track, _index: number) => (
    <TouchableOpacity
      key={track.id}
      style={[
        styles.trackItem,
        currentTrack?.id === track.id && styles.currentTrackItem
      ]}
      onPress={() => playTrack(track)}
    >
      <View style={styles.trackArtwork}>
        <Text style={styles.trackArtworkText}>🎵</Text>
      </View>
      
      <View style={styles.trackInfo}>
        <Text style={[
          styles.trackTitle,
          currentTrack?.id === track.id && styles.currentTrackText
        ]}>
          {track.title}
        </Text>
        <Text style={styles.trackArtist}>{track.artist}</Text>
      </View>
      
      <View style={styles.trackActions}>
        <Text style={styles.trackDuration}>{formatTime(track.duration)}</Text>
        {currentTrack?.id === track.id && isPlaying && (
          <Text style={styles.playingIndicator}>🔊</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>🎵 음악 플레이어</Text>
        <TouchableOpacity
          style={styles.libraryButton}
          onPress={() => {
            Alert.alert(
              '기능 준비 중',
              '음악 라이브러리 연동 기능을 준비 중입니다.\n현재는 기본 제공 사운드를 사용해주세요.',
              [{ text: '확인' }]
            );
          }}
        >
          <Text style={styles.libraryButtonText}>📁 라이브러리</Text>
        </TouchableOpacity>
      </View>

      {/* 플레이리스트 선택 */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.playlistTabs}>
        {playlists.map((playlist) => (
          <TouchableOpacity
            key={playlist.id}
            style={[
              styles.playlistTab,
              selectedPlaylist.id === playlist.id && styles.playlistTabActive
            ]}
            onPress={() => setSelectedPlaylist(playlist)}
          >
            <Text style={[
              styles.playlistTabText,
              selectedPlaylist.id === playlist.id && styles.playlistTabTextActive
            ]}>
              {playlist.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 트랙 목록 */}
      <ScrollView style={styles.trackList}>
        {selectedPlaylist.tracks.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎵</Text>
            <Text style={styles.emptyText}>플레이리스트가 비어있습니다</Text>
            <Text style={styles.emptySubText}>음악을 추가해보세요</Text>
          </View>
        ) : (
          selectedPlaylist.tracks.map(renderTrackItem)
        )}
      </ScrollView>

      {/* 미니 플레이어 */}
      {currentTrack && !showPlayer && (
        <TouchableOpacity
          style={styles.miniPlayer}
          onPress={() => setShowPlayer(true)}
        >
          <View style={styles.miniPlayerInfo}>
            <Text style={styles.miniPlayerTitle}>{currentTrack.title}</Text>
            <Text style={styles.miniPlayerArtist}>{currentTrack.artist}</Text>
          </View>
          
          <TouchableOpacity onPress={pauseResume}>
            <Text style={styles.miniPlayerButton}>
              {isPlaying ? '⏸️' : '▶️'}
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>
      )}

      {/* 풀 플레이어 모달 */}
      {showPlayer && currentTrack && (
        <View style={styles.fullPlayer}>
          <View style={styles.playerHeader}>
            <TouchableOpacity onPress={() => setShowPlayer(false)}>
              <Text style={styles.playerCloseButton}>▼</Text>
            </TouchableOpacity>
            <Text style={styles.playerTitle}>재생 중</Text>
            <View style={{ width: 30 }} />
          </View>

          <View style={styles.playerContent}>
            {/* 앨범 아트 */}
            <View style={styles.albumArt}>
              <Text style={styles.albumArtText}>🎵</Text>
            </View>

            {/* 트랙 정보 */}
            <Text style={styles.playerTrackTitle}>{currentTrack.title}</Text>
            <Text style={styles.playerTrackArtist}>{currentTrack.artist}</Text>

            {/* 진행 바 */}
            <View style={styles.progressContainer}>
              <Text style={styles.progressTime}>{formatTime(currentTime)}</Text>
              <View style={styles.progressTrack}>
                <View 
                  style={[
                    styles.progressFill,
                    { width: `${(currentTime / currentTrack.duration) * 100}%` }
                  ]}
                />
              </View>
              <Text style={styles.progressTime}>{formatTime(currentTrack.duration)}</Text>
            </View>

            {/* 컨트롤 버튼 */}
            <View style={styles.playerControls}>
              <TouchableOpacity onPress={() => setShuffleMode(!shuffleMode)}>
                <Text style={[styles.controlButton, shuffleMode && styles.controlButtonActive]}>
                  🔀
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={skipPrevious}>
                <Text style={styles.controlButton}>⏮️</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.playPauseButton} onPress={pauseResume}>
                <Text style={styles.playPauseButtonText}>
                  {isPlaying ? '⏸️' : '▶️'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={skipNext}>
                <Text style={styles.controlButton}>⏭️</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={toggleRepeatMode}>
                <Text style={[styles.controlButton, repeatMode !== 'none' && styles.controlButtonActive]}>
                  {getRepeatIcon()}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e0e0e0',
  },
  libraryButton: {
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  libraryButtonText: {
    color: '#e0e0e0',
    fontSize: 14,
    fontWeight: '500',
  },
  playlistTabs: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    maxHeight: 60,
  },
  playlistTab: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    marginRight: 12,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  playlistTabActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  playlistTabText: {
    color: '#a0a0a0',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  playlistTabTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  trackList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 50,
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 18,
    color: '#a0a0a0',
    marginBottom: 5,
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    minHeight: 64,
  },
  currentTrackItem: {
    backgroundColor: '#2a4a2a',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  trackArtwork: {
    width: 40,
    height: 40,
    backgroundColor: '#333',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  trackArtworkText: {
    fontSize: 16,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 16,
    color: '#e0e0e0',
    marginBottom: 2,
    fontWeight: '500',
  },
  currentTrackText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  trackArtist: {
    fontSize: 14,
    color: '#a0a0a0',
  },
  trackActions: {
    alignItems: 'flex-end',
  },
  trackDuration: {
    fontSize: 12,
    color: '#666',
  },
  playingIndicator: {
    fontSize: 16,
    marginTop: 4,
  },
  miniPlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
    minHeight: 60,
  },
  miniPlayerInfo: {
    flex: 1,
  },
  miniPlayerTitle: {
    fontSize: 14,
    color: '#e0e0e0',
    marginBottom: 2,
    fontWeight: '500',
  },
  miniPlayerArtist: {
    fontSize: 12,
    color: '#a0a0a0',
  },
  miniPlayerButton: {
    fontSize: 24,
    marginLeft: 15,
    minWidth: 40,
    textAlign: 'center',
  },
  fullPlayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0a0a0a',
    zIndex: 800, // 탭바보다 낮게 수정
  },
  playerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 60,
  },
  playerCloseButton: {
    fontSize: 20,
    color: '#a0a0a0',
    minWidth: 30,
    textAlign: 'center',
  },
  playerTitle: {
    fontSize: 16,
    color: '#e0e0e0',
    fontWeight: '600',
  },
  playerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  albumArt: {
    width: 250,
    height: 250,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    borderWidth: 1,
    borderColor: '#333',
  },
  albumArtText: {
    fontSize: 80,
  },
  playerTrackTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e0e0e0',
    textAlign: 'center',
    marginBottom: 8,
  },
  playerTrackArtist: {
    fontSize: 18,
    color: '#a0a0a0',
    textAlign: 'center',
    marginBottom: 40,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 40,
  },
  progressTime: {
    fontSize: 12,
    color: '#a0a0a0',
    width: 40,
    textAlign: 'center',
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: '#333',
    borderRadius: 2,
    marginHorizontal: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  playerControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  controlButton: {
    fontSize: 24,
    color: '#a0a0a0',
    minWidth: 40,
    textAlign: 'center',
    paddingVertical: 8,
  },
  controlButtonActive: {
    color: '#4CAF50',
  },
  playPauseButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  playPauseButtonText: {
    fontSize: 24,
    color: 'white',
  },
});

export default MusicPlayerScreen; 