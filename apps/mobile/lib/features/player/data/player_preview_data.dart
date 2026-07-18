import 'package:clubhaus_mobile/features/player/domain/player_models.dart';

abstract final class PlayerPreviewData {
  static const activities = [
    PlayerActivity(
      time: '16:30',
      endTime: '17:10',
      title: '개별 영상 미팅',
      type: '미팅',
      location: '클럽하우스 2층',
      note: '지난 경기 전환 장면 준비',
    ),
    PlayerActivity(
      time: '18:00',
      endTime: '20:00',
      title: '팀 전술 훈련',
      type: '훈련',
      location: '안양 보조구장',
      note: '17:40 집합 · 검정 훈련복',
    ),
  ];

  static const snapshot = PlayerSnapshot(
    name: '김민수',
    teamName: 'FC 안양 U18',
    number: 11,
    position: 'FW',
    grade: '3학년',
    activities: activities,
  );
}
