enum ParentTab { home, schedule, notices, child, more }

class ParentEvent {
  const ParentEvent({
    required this.date,
    required this.time,
    required this.title,
    required this.location,
    required this.meetTime,
    required this.type,
    this.preparation,
  });

  final String date;
  final String time;
  final String title;
  final String location;
  final String meetTime;
  final String type;
  final String? preparation;
}

class ParentNotice {
  const ParentNotice({
    required this.id,
    required this.title,
    required this.preview,
    required this.time,
    required this.category,
    required this.important,
  });

  final int id;
  final String title;
  final String preview;
  final String time;
  final String category;
  final bool important;
}

class ParentSnapshot {
  const ParentSnapshot({
    required this.parentName,
    required this.childName,
    required this.teamName,
    required this.events,
    required this.notices,
  });

  final String parentName;
  final String childName;
  final String teamName;
  final List<ParentEvent> events;
  final List<ParentNotice> notices;
}
