import 'package:clubhaus_mobile/features/today/domain/today_session.dart';

abstract interface class TodayRepository {
  Future<TodaySession> load();
}

class PreviewTodayRepository implements TodayRepository {
  const PreviewTodayRepository();

  @override
  Future<TodaySession> load() async {
    return const TodaySession(
      teamName: 'FC 안양 U18',
      playerName: '나현규',
      sessionTitle: '팀 전술 훈련',
      startTime: '18:00',
      meetTime: '17:40 집합',
      location: '안양 보조구장',
      mission: '공을 받기 전 양쪽 어깨 너머를 확인하기',
      notice: '훈련장 입구가 북문으로 변경되었습니다.',
    );
  }
}

