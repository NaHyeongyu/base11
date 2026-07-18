import 'package:clubhaus_mobile/features/parent/domain/parent_models.dart';
import 'package:flutter/foundation.dart';

class ParentController extends ChangeNotifier {
  ParentTab _tab = ParentTab.home;
  final Set<int> _readNotices = {3, 4};

  ParentTab get tab => _tab;
  bool isRead(int noticeId) => _readNotices.contains(noticeId);

  void selectTab(ParentTab tab) {
    if (_tab == tab) return;
    _tab = tab;
    notifyListeners();
  }

  void markRead(int noticeId) {
    if (_readNotices.add(noticeId)) notifyListeners();
  }
}
