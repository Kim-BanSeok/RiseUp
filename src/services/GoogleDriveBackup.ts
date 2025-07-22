import AsyncStorage from '@react-native-async-storage/async-storage';
import { BackupData, BackupInfo } from '../utils/backup';

// Google Drive API 대체 (실제 구현에서는 적절한 라이브러리 사용)
interface MockGoogleDriveApi {
  setAccessToken(token: string): void;
  createFolder(name: string): Promise<string>;
  createFileMultipart(metadata: any, content: string): Promise<string>;
  getFile(fileId: string): Promise<string>;
  deleteFile(fileId: string): Promise<void>;
  listFiles(params: any): Promise<any>;
}

interface GoogleDriveBackupInfo extends BackupInfo {
  driveFileId: string;
  isCloudBackup: true;
  syncStatus: 'synced' | 'pending' | 'failed';
  lastSyncAt?: Date;
}

interface CloudBackupConfig {
  autoSync: boolean;
  syncInterval: number; // 시간 (hours)
  maxBackups: number;
  encryptBackups: boolean;
  wifiOnly: boolean;
}

class GoogleDriveBackupService {
  private static instance: GoogleDriveBackupService;
  private driveApi: MockGoogleDriveApi;
  private isInitialized = false;
  private config: CloudBackupConfig = {
    autoSync: false,
    syncInterval: 24, // 24시간
    maxBackups: 10,
    encryptBackups: true,
    wifiOnly: true,
  };

  static getInstance(): GoogleDriveBackupService {
    if (!GoogleDriveBackupService.instance) {
      GoogleDriveBackupService.instance = new GoogleDriveBackupService();
    }
    return GoogleDriveBackupService.instance;
  }

  constructor() {
    // Mock implementation - 실제 구현에서는 적절한 Google Drive API 라이브러리 사용
    this.driveApi = {
      setAccessToken: (token: string) => {
        console.log('Setting access token:', token);
      },
      createFolder: async (name: string) => {
        return `folder_${Date.now()}`;
      },
      createFileMultipart: async (metadata: any, content: string) => {
        return `file_${Date.now()}`;
      },
      getFile: async (fileId: string) => {
        throw new Error('Mock implementation - 실제 구현 필요');
      },
      deleteFile: async (fileId: string) => {
        console.log('Deleting file:', fileId);
      },
      listFiles: async (params: any) => {
        return { files: [] };
      },
    };
  }

  // Google Drive API 초기화
  async initialize(accessToken: string): Promise<boolean> {
    try {
      this.driveApi.setAccessToken(accessToken);
      await this.createAppFolder();
      this.isInitialized = true;
      
      console.log('✅ Google Drive 백업 서비스 초기화 완료');
      return true;
    } catch (error) {
      console.error('❌ Google Drive 초기화 실패:', error);
      return false;
    }
  }

  // 설정 관리
  async getConfig(): Promise<CloudBackupConfig> {
    try {
      const configData = await AsyncStorage.getItem('cloud_backup_config');
      if (configData) {
        return { ...this.config, ...JSON.parse(configData) };
      }
      return this.config;
    } catch (error) {
      console.error('백업 설정 로드 실패:', error);
      return this.config;
    }
  }

  async updateConfig(newConfig: Partial<CloudBackupConfig>): Promise<void> {
    try {
      this.config = { ...this.config, ...newConfig };
      await AsyncStorage.setItem('cloud_backup_config', JSON.stringify(this.config));
      console.log('💾 백업 설정 업데이트 완료');
    } catch (error) {
      console.error('백업 설정 저장 실패:', error);
    }
  }

  // 클라우드 백업 생성
  async createCloudBackup(backupData: BackupData, name: string): Promise<GoogleDriveBackupInfo | null> {
    if (!this.isInitialized) {
      console.error('Google Drive가 초기화되지 않았습니다');
      return null;
    }

    try {
      const fileName = `${name}_${Date.now()}.json`;
      const content = JSON.stringify(backupData, null, 2);

      // Google Drive에 파일 업로드
      const fileId = await this.driveApi.createFileMultipart({
        name: fileName,
        parents: [await this.getAppFolderId()],
        mimeType: 'application/json',
      }, content);

      const backupInfo: GoogleDriveBackupInfo = {
        id: `cloud_${Date.now()}`,
        name,
        timestamp: backupData.timestamp,
        size: content.length,
        metadata: backupData.metadata,
        driveFileId: fileId,
        isCloudBackup: true,
        syncStatus: 'synced',
        lastSyncAt: new Date(),
      };

      // 로컬에 백업 정보 저장
      await this.saveCloudBackupInfo(backupInfo);

      console.log('☁️ 클라우드 백업 생성 완료:', fileName);
      return backupInfo;
    } catch (error) {
      console.error('❌ 클라우드 백업 생성 실패:', error);
      return null;
    }
  }

  // 클라우드 백업 목록 조회
  async getCloudBackupList(): Promise<GoogleDriveBackupInfo[]> {
    try {
      const localBackups = await this.getLocalCloudBackupInfo();
      
      if (this.isInitialized) {
        // Drive에서 실제 파일 목록과 동기화
        await this.syncBackupList();
        return await this.getLocalCloudBackupInfo();
      }
      
      return localBackups;
    } catch (error) {
      console.error('클라우드 백업 목록 조회 실패:', error);
      return [];
    }
  }

  // 클라우드 백업 복원
  async restoreFromCloud(backupInfo: GoogleDriveBackupInfo): Promise<BackupData | null> {
    if (!this.isInitialized) {
      console.error('Google Drive가 초기화되지 않았습니다');
      return null;
    }

    try {
      const fileContent = await this.driveApi.getFile(backupInfo.driveFileId);
      const backupData: BackupData = JSON.parse(fileContent as string);

      // Date 객체 복원
      backupData.timestamp = new Date(backupData.timestamp);
      backupData.alarms = backupData.alarms.map(alarm => ({
        ...alarm,
        time: new Date(alarm.time),
        createdAt: new Date(alarm.createdAt),
        lastTriggered: alarm.lastTriggered ? new Date(alarm.lastTriggered) : undefined,
      }));

      console.log('☁️ 클라우드 백업 복원 완료');
      return backupData;
    } catch (error) {
      console.error('❌ 클라우드 백업 복원 실패:', error);
      return null;
    }
  }

  // 클라우드 백업 삭제
  async deleteCloudBackup(backupInfo: GoogleDriveBackupInfo): Promise<boolean> {
    if (!this.isInitialized) {
      console.error('Google Drive가 초기화되지 않았습니다');
      return false;
    }

    try {
      // Drive에서 파일 삭제
      await this.driveApi.deleteFile(backupInfo.driveFileId);
      
      // 로컬 정보 삭제
      await this.removeCloudBackupInfo(backupInfo.id);

      console.log('🗑️ 클라우드 백업 삭제 완료');
      return true;
    } catch (error) {
      console.error('❌ 클라우드 백업 삭제 실패:', error);
      return false;
    }
  }

  // 자동 동기화
  async performAutoSync(): Promise<void> {
    if (!this.config.autoSync || !this.isInitialized) {
      return;
    }

    try {
      console.log('🔄 자동 동기화 시작...');
      
      // 최근 로컬 백업을 클라우드로 업로드
      const { getBackupList, loadBackup } = await import('../utils/backup');
      const localBackups = await getBackupList();
      
      if (localBackups.length > 0) {
        const latestBackup = localBackups[0];
        const backupData = await loadBackup(latestBackup.id);
        
        await this.createCloudBackup(backupData, `AutoSync_${latestBackup.name}`);
      }

      // 오래된 백업 정리
      await this.cleanupOldBackups();

      console.log('✅ 자동 동기화 완료');
    } catch (error) {
      console.error('❌ 자동 동기화 실패:', error);
    }
  }

  // 백업 상태 확인
  async getBackupStatus(): Promise<{
    isConnected: boolean;
    totalCloudBackups: number;
    lastSyncTime?: Date;
    syncStatus: 'success' | 'pending' | 'error';
    storageUsed: string;
  }> {
    try {
      const cloudBackups = await this.getCloudBackupList();
      const lastSync = cloudBackups.length > 0 
        ? Math.max(...cloudBackups.map(b => b.lastSyncAt?.getTime() || 0))
        : 0;

      const totalSize = cloudBackups.reduce((sum, backup) => sum + backup.size, 0);

      return {
        isConnected: this.isInitialized,
        totalCloudBackups: cloudBackups.length,
        lastSyncTime: lastSync > 0 ? new Date(lastSync) : undefined,
        syncStatus: 'success',
        storageUsed: this.formatBytes(totalSize),
      };
    } catch (error) {
      return {
        isConnected: false,
        totalCloudBackups: 0,
        syncStatus: 'error',
        storageUsed: '0 B',
      };
    }
  }

  // Private helper methods
  private async createAppFolder(): Promise<string> {
    try {
      const folderId = await this.driveApi.createFolder('RiseUp_Backups');
      await AsyncStorage.setItem('drive_app_folder_id', folderId);
      return folderId;
    } catch (error) {
      // 폴더가 이미 존재할 수 있으므로 기존 폴더 ID 반환
      const existingId = await AsyncStorage.getItem('drive_app_folder_id');
      if (existingId) return existingId;
      throw error;
    }
  }

  private async getAppFolderId(): Promise<string> {
    const folderId = await AsyncStorage.getItem('drive_app_folder_id');
    if (!folderId) {
      return await this.createAppFolder();
    }
    return folderId;
  }

  private async saveCloudBackupInfo(backupInfo: GoogleDriveBackupInfo): Promise<void> {
    try {
      const existingBackups = await this.getLocalCloudBackupInfo();
      existingBackups.unshift(backupInfo);
      await AsyncStorage.setItem('cloud_backup_list', JSON.stringify(existingBackups));
    } catch (error) {
      console.error('클라우드 백업 정보 저장 실패:', error);
    }
  }

  private async getLocalCloudBackupInfo(): Promise<GoogleDriveBackupInfo[]> {
    try {
      const backupsData = await AsyncStorage.getItem('cloud_backup_list');
      if (backupsData) {
        const backups = JSON.parse(backupsData);
        return backups.map((backup: any) => ({
          ...backup,
          timestamp: new Date(backup.timestamp),
          lastSyncAt: backup.lastSyncAt ? new Date(backup.lastSyncAt) : undefined,
        }));
      }
      return [];
    } catch (error) {
      console.error('클라우드 백업 정보 로드 실패:', error);
      return [];
    }
  }

  private async removeCloudBackupInfo(backupId: string): Promise<void> {
    try {
      const existingBackups = await this.getLocalCloudBackupInfo();
      const updatedBackups = existingBackups.filter(backup => backup.id !== backupId);
      await AsyncStorage.setItem('cloud_backup_list', JSON.stringify(updatedBackups));
    } catch (error) {
      console.error('클라우드 백업 정보 삭제 실패:', error);
    }
  }

  private async syncBackupList(): Promise<void> {
    try {
      const appFolderId = await this.getAppFolderId();
      const driveFiles = await this.driveApi.listFiles({
        q: `'${appFolderId}' in parents and mimeType='application/json'`,
        fields: 'files(id, name, size, modifiedTime)',
      });

      // 로컬 정보와 Drive 파일 동기화
      const localBackups = await this.getLocalCloudBackupInfo();
      const driveFileIds = new Set(driveFiles.files?.map((f: any) => f.id) || []);

      // Drive에 없는 로컬 백업 정보 제거
      const validBackups = localBackups.filter(backup => 
        driveFileIds.has(backup.driveFileId)
      );

      await AsyncStorage.setItem('cloud_backup_list', JSON.stringify(validBackups));
    } catch (error) {
      console.error('백업 목록 동기화 실패:', error);
    }
  }

  private async cleanupOldBackups(): Promise<void> {
    try {
      const cloudBackups = await this.getCloudBackupList();
      
      if (cloudBackups.length > this.config.maxBackups) {
        const oldestBackups = cloudBackups
          .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
          .slice(0, cloudBackups.length - this.config.maxBackups);

        for (const backup of oldestBackups) {
          await this.deleteCloudBackup(backup);
        }

        console.log(`🗑️ 오래된 백업 ${oldestBackups.length}개 정리 완료`);
      }
    } catch (error) {
      console.error('오래된 백업 정리 실패:', error);
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export default GoogleDriveBackupService;
export type { GoogleDriveBackupInfo, CloudBackupConfig }; 