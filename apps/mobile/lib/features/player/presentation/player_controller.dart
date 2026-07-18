import 'package:clubhaus_mobile/features/player/domain/player_models.dart';
import 'package:flutter/foundation.dart';

class PlayerController extends ChangeNotifier {
  PlayerTab _tab = PlayerTab.today;
  String _attendance = '참석';
  String _condition = '보통';
  bool _checkInSaved = false;
  bool _missionComplete = false;

  PlayerTab get tab => _tab;
  String get attendance => _attendance;
  String get condition => _condition;
  bool get checkInSaved => _checkInSaved;
  bool get missionComplete => _missionComplete;

  void selectTab(PlayerTab tab) {
    if (_tab == tab) return;
    _tab = tab;
    notifyListeners();
  }

  void setAttendance(String value) {
    _attendance = value;
    _checkInSaved = false;
    notifyListeners();
  }

  void setCondition(String value) {
    _condition = value;
    _checkInSaved = false;
    notifyListeners();
  }

  void saveCheckIn() {
    _checkInSaved = true;
    notifyListeners();
  }

  void toggleMission() {
    _missionComplete = !_missionComplete;
    notifyListeners();
  }
}
