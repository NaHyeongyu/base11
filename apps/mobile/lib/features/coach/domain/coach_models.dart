enum CoachTab { home, schedule, attendance, roster, management }

enum AttendanceFilter { all, attention, unanswered }

enum PlayerAvailability { ready, watch, injured, unanswered }

class CoachPlayer {
  const CoachPlayer({
    required this.id,
    required this.name,
    required this.number,
    required this.position,
    required this.grade,
    required this.attendance,
    required this.condition,
    required this.availability,
    required this.response,
    this.note,
  });

  final int id;
  final String name;
  final int number;
  final String position;
  final String grade;
  final int attendance;
  final int condition;
  final PlayerAvailability availability;
  final String response;
  final String? note;
}

class CoachEvent {
  const CoachEvent({
    required this.time,
    required this.endTime,
    required this.title,
    required this.type,
    required this.location,
    required this.participants,
  });

  final String time;
  final String endTime;
  final String title;
  final String type;
  final String location;
  final String participants;
}

class CoachTeamSnapshot {
  const CoachTeamSnapshot({
    required this.teamName,
    required this.season,
    required this.coachName,
    required this.players,
    required this.todayEvents,
  });

  final String teamName;
  final String season;
  final String coachName;
  final List<CoachPlayer> players;
  final List<CoachEvent> todayEvents;
}
