import 'package:clubhaus_mobile/features/coach/domain/coach_models.dart';
import 'package:flutter/foundation.dart';

class CoachController extends ChangeNotifier {
  CoachTab _tab = CoachTab.home;
  AttendanceFilter _attendanceFilter = AttendanceFilter.all;
  String _rosterQuery = '';
  final Map<int, String> _attendanceOverrides = {};

  CoachTab get tab => _tab;
  AttendanceFilter get attendanceFilter => _attendanceFilter;
  String get rosterQuery => _rosterQuery;

  void selectTab(CoachTab value) {
    if (_tab == value) return;
    _tab = value;
    notifyListeners();
  }

  void setAttendanceFilter(AttendanceFilter value) {
    if (_attendanceFilter == value) return;
    _attendanceFilter = value;
    notifyListeners();
  }

  void setRosterQuery(String value) {
    final normalized = value.trim().toLowerCase();
    if (_rosterQuery == normalized) return;
    _rosterQuery = normalized;
    notifyListeners();
  }

  String responseFor(CoachPlayer player) =>
      _attendanceOverrides[player.id] ?? player.response;

  void cycleAttendance(CoachPlayer player) {
    const responses = ['참석', '지각', '일부 참여', '결석'];
    final current = responseFor(player);
    final nextIndex = (responses.indexOf(current) + 1) % responses.length;
    _attendanceOverrides[player.id] = responses[nextIndex];
    notifyListeners();
  }
}
