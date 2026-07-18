enum AttendanceChoice { attending, late, absent }

class TodaySession {
  const TodaySession({
    required this.teamName,
    required this.playerName,
    required this.sessionTitle,
    required this.startTime,
    required this.meetTime,
    required this.location,
    required this.mission,
    required this.notice,
  });

  final String teamName;
  final String playerName;
  final String sessionTitle;
  final String startTime;
  final String meetTime;
  final String location;
  final String mission;
  final String notice;
}

