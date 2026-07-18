import 'package:clubhaus_mobile/app/theme/app_theme.dart';
import 'package:clubhaus_mobile/features/coach/presentation/coach_shell.dart';
import 'package:clubhaus_mobile/features/parent/presentation/parent_shell.dart';
import 'package:clubhaus_mobile/features/player/presentation/player_shell.dart';
import 'package:clubhaus_mobile/features/role/domain/app_role.dart';
import 'package:clubhaus_mobile/features/role/presentation/role_selection_screen.dart';
import 'package:flutter/material.dart';

class ClubhausApp extends StatelessWidget {
  const ClubhausApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'BASE11',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      home: const _RoleGate(),
    );
  }
}

class _RoleGate extends StatefulWidget {
  const _RoleGate();

  @override
  State<_RoleGate> createState() => _RoleGateState();
}

class _RoleGateState extends State<_RoleGate> {
  AppRole? _role;

  void _selectRole(AppRole role) => setState(() => _role = role);
  void _clearRole() => setState(() => _role = null);

  @override
  Widget build(BuildContext context) => switch (_role) {
    AppRole.coach => CoachShell(onChangeRole: _clearRole),
    AppRole.player => PlayerShell(onChangeRole: _clearRole),
    AppRole.parent => ParentShell(onChangeRole: _clearRole),
    null => RoleSelectionScreen(onSelected: _selectRole),
  };
}
