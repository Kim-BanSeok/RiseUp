import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
  rawResourceId?: number;
  uri?: string;
}

export interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
}

class MusicService {
  private static instance: MusicService;
  private currentTrack: Track | null = null;
  private isPlaying: boolean = false;
  private playlists: Playlist[] = [];
  private currentPlaylist: string | null = null;

  static getInstance(): MusicService {
    if (!MusicService.instance) {
      MusicService.instance = new MusicService();
    }
    return MusicService.instance;
  }

  // 기본 플레이리스트 초기화
  async initializeDefaultPlaylists(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('music_playlists');
      if (stored) {
        this.playlists = JSON.parse(stored);
      } else {
        // 기본 플레이리스트 생성
        this.playlists = [
          {
            id: 'default',
            name: '기본 음악',
            tracks: [
              {
                id: '1',
                title: '잔잔한 멜로디',
                artist: '알림 음악',
                duration: 180,
                rawResourceId: 1
              },
              {
                id: '2',
                title: '자연의 소리',
                artist: '알림 음악',
                duration: 200,
                rawResourceId: 2
              },
              {
                id: '3',
                title: '평화로운 순간',
                artist: '알림 음악',
                duration: 150,
                rawResourceId: 3
              }
            ]
          },
          {
            id: 'relaxing',
            name: '휴식',
            tracks: [
              {
                id: '4',
                title: '명상 음악',
                artist: '힐링 사운드',
                duration: 300,
                rawResourceId: 4
              },
              {
                id: '5',
                title: '백색 소음',
                artist: '힐링 사운드',
                duration: 600,
                rawResourceId: 5
              }
            ]
          }
        ];
        await this.savePlaylists();
      }
    } catch (error) {
      console.error('Failed to initialize playlists:', error);
    }
  }

  // 플레이리스트 저장
  private async savePlaylists(): Promise<void> {
    try {
      await AsyncStorage.setItem('music_playlists', JSON.stringify(this.playlists));
    } catch (error) {
      console.error('Failed to save playlists:', error);
    }
  }

  // 플레이리스트 목록 가져오기
  getPlaylists(): Playlist[] {
    return this.playlists;
  }

  // 특정 플레이리스트 가져오기
  getPlaylist(id: string): Playlist | undefined {
    return this.playlists.find(playlist => playlist.id === id);
  }

  // 현재 플레이리스트 설정
  setCurrentPlaylist(playlistId: string): void {
    this.currentPlaylist = playlistId;
  }

  // 현재 플레이리스트 가져오기
  getCurrentPlaylist(): Playlist | null {
    if (!this.currentPlaylist) return null;
    return this.getPlaylist(this.currentPlaylist) || null;
  }

  // 트랙 재생 (시뮬레이션)
  async playTrack(track: Track): Promise<void> {
    try {
      this.currentTrack = track;
      this.isPlaying = true;
      console.log(`Playing: ${track.title} by ${track.artist}`);
      
      // 실제 음악 재생 로직은 여기에 구현
      // react-native-track-player 등의 라이브러리 사용 시
      // await TrackPlayer.add(track);
      // await TrackPlayer.play();
      
    } catch (error) {
      console.error('Failed to play track:', error);
      throw error;
    }
  }

  // 재생 일시정지
  async pause(): Promise<void> {
    try {
      this.isPlaying = false;
      console.log('Music paused');
      
      // 실제 일시정지 로직
      // await TrackPlayer.pause();
      
    } catch (error) {
      console.error('Failed to pause:', error);
      throw error;
    }
  }

  // 재생 재개
  async resume(): Promise<void> {
    try {
      this.isPlaying = true;
      console.log('Music resumed');
      
      // 실제 재개 로직
      // await TrackPlayer.play();
      
    } catch (error) {
      console.error('Failed to resume:', error);
      throw error;
    }
  }

  // 정지
  async stop(): Promise<void> {
    try {
      this.isPlaying = false;
      this.currentTrack = null;
      console.log('Music stopped');
      
      // 실제 정지 로직
      // await TrackPlayer.stop();
      
    } catch (error) {
      console.error('Failed to stop:', error);
      throw error;
    }
  }

  // 다음 트랙
  async nextTrack(): Promise<void> {
    if (!this.currentTrack || !this.currentPlaylist) return;
    
    const playlist = this.getCurrentPlaylist();
    if (!playlist) return;
    
    const currentIndex = playlist.tracks.findIndex(track => track.id === this.currentTrack!.id);
    const nextIndex = (currentIndex + 1) % playlist.tracks.length;
    const nextTrack = playlist.tracks[nextIndex];
    
    await this.playTrack(nextTrack);
  }

  // 이전 트랙
  async previousTrack(): Promise<void> {
    if (!this.currentTrack || !this.currentPlaylist) return;
    
    const playlist = this.getCurrentPlaylist();
    if (!playlist) return;
    
    const currentIndex = playlist.tracks.findIndex(track => track.id === this.currentTrack!.id);
    const prevIndex = currentIndex === 0 ? playlist.tracks.length - 1 : currentIndex - 1;
    const prevTrack = playlist.tracks[prevIndex];
    
    await this.playTrack(prevTrack);
  }

  // 현재 상태 가져오기
  getCurrentTrack(): Track | null {
    return this.currentTrack;
  }

  // 재생 상태 확인
  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  // 시간 포맷팅 유틸리티
  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  // 플레이리스트에 트랙 추가
  async addTrackToPlaylist(playlistId: string, track: Track): Promise<void> {
    const playlist = this.getPlaylist(playlistId);
    if (playlist) {
      playlist.tracks.push(track);
      await this.savePlaylists();
    }
  }

  // 플레이리스트에서 트랙 제거
  async removeTrackFromPlaylist(playlistId: string, trackId: string): Promise<void> {
    const playlist = this.getPlaylist(playlistId);
    if (playlist) {
      playlist.tracks = playlist.tracks.filter(track => track.id !== trackId);
      await this.savePlaylists();
    }
  }

  // 새 플레이리스트 생성
  async createPlaylist(name: string): Promise<string> {
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name,
      tracks: []
    };
    
    this.playlists.push(newPlaylist);
    await this.savePlaylists();
    
    return newPlaylist.id;
  }

  // 플레이리스트 삭제
  async deletePlaylist(playlistId: string): Promise<void> {
    this.playlists = this.playlists.filter(playlist => playlist.id !== playlistId);
    if (this.currentPlaylist === playlistId) {
      this.currentPlaylist = null;
      await this.stop();
    }
    await this.savePlaylists();
  }
}

export default MusicService; 