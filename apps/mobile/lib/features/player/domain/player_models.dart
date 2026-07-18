enum PlayerTab { today, schedule, growth, team, profile }

class PlayerActivity {
  const PlayerActivity({
    required this.time,
    required this.endTime,
    required this.title,
    required this.type,
    required this.location,
    this.note,
  });

  final String time;
  final String endTime;
  final String title;
  final String type;
  final String location;
  final String? note;
}

class PlayerSnapshot {
  const PlayerSnapshot({
    required this.name,
    required this.teamName,
    required this.number,
    required this.position,
    required this.grade,
    required this.activities,
  });

  final String name;
  final String teamName;
  final int number;
  final String position;
  final String grade;
  final List<PlayerActivity> activities;
}
