enum AppRole { coach, player, parent }

extension AppRoleLabel on AppRole {
  String get label => switch (this) {
    AppRole.coach => '지도자',
    AppRole.player => '선수',
    AppRole.parent => '학부모',
  };
}
