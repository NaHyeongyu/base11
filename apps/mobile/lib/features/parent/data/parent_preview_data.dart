import 'package:clubhaus_mobile/features/parent/domain/parent_models.dart';

abstract final class ParentPreviewData {
  static const events = [
    ParentEvent(
      date: '7월 18일 오늘',
      time: '18:00',
      title: '팀 전술 훈련',
      location: '안양 보조구장',
      meetTime: '17:40 집합',
      type: '훈련',
      preparation: '검정 훈련복 · 축구화 · 개인 물병',
    ),
    ParentEvent(
      date: '7월 20일 일요일',
      time: '15:00',
      title: '수원FC U18전',
      location: '수원월드컵 보조구장',
      meetTime: '13:30 집합',
      type: '경기',
      preparation: '원정 유니폼 · 신분증 · 간식',
    ),
    ParentEvent(
      date: '7월 21일 월요일',
      time: '휴식',
      title: '공식 휴식일',
      location: '개별 회복',
      meetTime: '통증이 있을 때만 상태 전달',
      type: '휴식',
    ),
  ];

  static const notices = [
    ParentNotice(
      id: 1,
      title: '오늘 훈련장 입구 변경 안내',
      preview: '보조구장 남문 공사로 북문 주차장을 이용해주세요.',
      time: '오늘 10:20',
      category: '긴급',
      important: true,
    ),
    ParentNotice(
      id: 2,
      title: '수원 원정 경기 이동 계획',
      preview: '클럽 버스는 12:10 안양종합운동장에서 출발합니다.',
      time: '어제',
      category: '경기',
      important: true,
    ),
    ParentNotice(
      id: 3,
      title: '7월 팀 일정 확정본',
      preview: '전국대회 기간을 포함한 월간 일정을 확인해주세요.',
      time: '7월 15일',
      category: '일정',
      important: false,
    ),
    ParentNotice(
      id: 4,
      title: '부천FC전 사진 업로드',
      preview: '팀 앨범에 경기 사진 32장이 추가되었습니다.',
      time: '7월 14일',
      category: '앨범',
      important: false,
    ),
  ];

  static const snapshot = ParentSnapshot(
    parentName: '나영희',
    childName: '김민수',
    teamName: 'FC 안양 U18',
    events: events,
    notices: notices,
  );
}
