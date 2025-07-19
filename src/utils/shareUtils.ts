import { Share, Platform } from 'react-native';
import { IntervalTemplate, IntervalHistory } from '../context/IntervalContext';

// 인터벌 템플릿 공유
export const shareIntervalTemplate = async (template: IntervalTemplate) => {
  try {
    const message = `⏳ 인터벌 템플릿: ${template.name}

📋 설정:
• 작업 시간: ${template.workDuration}초
• 휴식 시간: ${template.restDuration}초
• 사이클 수: ${template.cycles}회
• 총 시간: ${Math.floor((template.workDuration + template.restDuration) * template.cycles / 60)}분

💡 설명: ${template.description || '설명 없음'}

#인터벌타이머 #운동 #공부 #집중`;

    await Share.share({
      message,
      title: `${template.name} - 인터벌 템플릿`,
    });
  } catch (error) {
    console.error('템플릿 공유 실패:', error);
  }
};

// 인터벌 결과 공유
export const shareIntervalResult = async (history: IntervalHistory) => {
  try {
    const totalMinutes = Math.floor(history.totalDuration / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    const timeString = hours > 0 
      ? `${hours}시간 ${minutes}분` 
      : `${minutes}분`;

    const message = `🎯 인터벌 완료!

📊 결과:
• 템플릿: ${history.templateName}
• 완료 시간: ${timeString}
• 완료 사이클: ${history.completedCycles}회
• 완료일: ${new Date(history.endTime).toLocaleDateString('ko-KR')}

�� 오늘도 화이팅!

#인터벌완료 #성취감 #목표달성`;

    await Share.share({
      message,
      title: `${history.templateName} - 인터벌 완료`,
    });
  } catch (error) {
    console.error('결과 공유 실패:', error);
  }
};

// 인터벌 통계 공유
export const shareIntervalStats = async (stats: {
  totalSessions: number;
  totalTime: number;
  totalCycles: number;
  favoriteTemplate: string;
}) => {
  try {
    const totalHours = Math.floor(stats.totalTime / 3600);
    const totalMinutes = Math.floor((stats.totalTime % 3600) / 60);
    
    const timeString = totalHours > 0 
      ? `${totalHours}시간 ${totalMinutes}분` 
      : `${totalMinutes}분`;

    const message = `�� 내 인터벌 통계

🎯 총 세션: ${stats.totalSessions}회
⏱️ 총 시간: ${timeString}
🔄 총 사이클: ${stats.totalCycles}회
⭐ 인기 템플릿: ${stats.favoriteTemplate}

�� 꾸준함이 최고의 실력!

#인터벌통계 #꾸준함 #성장`;

    await Share.share({
      message,
      title: '내 인터벌 통계',
    });
  } catch (error) {
    console.error('통계 공유 실패:', error);
  }
};

// QR 코드 생성 (텍스트 기반)
export const generateQRText = (template: IntervalTemplate): string => {
  const data = {
    type: 'interval_template',
    name: template.name,
    workDuration: template.workDuration,
    restDuration: template.restDuration,
    cycles: template.cycles,
    description: template.description,
  };
  
  return JSON.stringify(data);
};

// QR 코드 텍스트 파싱
export const parseQRText = (text: string): IntervalTemplate | null => {
  try {
    const data = JSON.parse(text);
    if (data.type === 'interval_template') {
      return {
        id: Date.now().toString(),
        name: data.name,
        workDuration: data.workDuration,
        restDuration: data.restDuration,
        cycles: data.cycles,
        description: data.description,
        createdAt: new Date(),
        usageCount: 0,
      };
    }
  } catch (error) {
    console.error('QR 코드 파싱 실패:', error);
  }
  return null;
}; 