import 'package:clubhaus_mobile/features/coach/domain/coach_models.dart';
import 'package:clubhaus_mobile/features/coach/presentation/coach_attendance_screen.dart';
import 'package:clubhaus_mobile/features/coach/presentation/coach_controller.dart';
import 'package:clubhaus_mobile/features/coach/presentation/coach_home_screen.dart';
import 'package:clubhaus_mobile/features/coach/presentation/coach_management_screen.dart';
import 'package:clubhaus_mobile/features/coach/presentation/coach_roster_screen.dart';
import 'package:clubhaus_mobile/features/coach/presentation/coach_schedule_screen.dart';
import 'package:flutter/material.dart';

class CoachShell extends StatefulWidget {
  const CoachShell({
    required this.snapshot,
    required this.onChangeRole,
    super.key,
  });

  final CoachTeamSnapshot snapshot;
  final VoidCallback onChangeRole;

  @override
  State<CoachShell> createState() => _CoachShellState();
}

class _CoachShellState extends State<CoachShell> {
  final CoachController _controller = CoachController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, _) {
        final selectedIndex = CoachTab.values.indexOf(_controller.tab);
        return Scaffold(
          body: SafeArea(
            bottom: false,
            child: IndexedStack(
              index: selectedIndex,
              children: [
                CoachHomeScreen(
                  snapshot: widget.snapshot,
                  controller: _controller,
                ),
                CoachScheduleScreen(snapshot: widget.snapshot),
                CoachAttendanceScreen(
                  snapshot: widget.snapshot,
                  controller: _controller,
                ),
                CoachRosterScreen(
                  snapshot: widget.snapshot,
                  controller: _controller,
                ),
                CoachManagementScreen(
                  snapshot: widget.snapshot,
                  onChangeRole: widget.onChangeRole,
                ),
              ],
            ),
          ),
          bottomNavigationBar: NavigationBar(
            selectedIndex: selectedIndex,
            onDestinationSelected: (index) =>
                _controller.selectTab(CoachTab.values[index]),
            destinations: const [
              NavigationDestination(
                icon: Icon(Icons.home_outlined),
                selectedIcon: Icon(Icons.home_rounded),
                label: '홈',
              ),
              NavigationDestination(
                icon: Icon(Icons.calendar_month_outlined),
                selectedIcon: Icon(Icons.calendar_month_rounded),
                label: '일정',
              ),
              NavigationDestination(
                icon: Icon(Icons.fact_check_outlined),
                selectedIcon: Icon(Icons.fact_check_rounded),
                label: '출석',
              ),
              NavigationDestination(
                icon: Icon(Icons.groups_outlined),
                selectedIcon: Icon(Icons.groups_rounded),
                label: '선수단',
              ),
              NavigationDestination(
                icon: Icon(Icons.grid_view_outlined),
                selectedIcon: Icon(Icons.grid_view_rounded),
                label: '관리',
              ),
            ],
          ),
        );
      },
    );
  }
}
