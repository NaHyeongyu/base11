import 'package:clubhaus_mobile/features/parent/domain/parent_models.dart';
import 'package:clubhaus_mobile/features/parent/presentation/parent_child_screen.dart';
import 'package:clubhaus_mobile/features/parent/presentation/parent_controller.dart';
import 'package:clubhaus_mobile/features/parent/presentation/parent_home_screen.dart';
import 'package:clubhaus_mobile/features/parent/presentation/parent_more_screen.dart';
import 'package:clubhaus_mobile/features/parent/presentation/parent_notices_screen.dart';
import 'package:clubhaus_mobile/features/parent/presentation/parent_schedule_screen.dart';
import 'package:flutter/material.dart';

class ParentShell extends StatefulWidget {
  const ParentShell({
    required this.snapshot,
    required this.onChangeRole,
    super.key,
  });
  final ParentSnapshot snapshot;
  final VoidCallback onChangeRole;

  @override
  State<ParentShell> createState() => _ParentShellState();
}

class _ParentShellState extends State<ParentShell> {
  final ParentController _controller = ParentController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => AnimatedBuilder(
    animation: _controller,
    builder: (context, _) {
      final selectedIndex = ParentTab.values.indexOf(_controller.tab);
      return Scaffold(
        body: SafeArea(
          bottom: false,
          child: IndexedStack(
            index: selectedIndex,
            children: [
              ParentHomeScreen(
                snapshot: widget.snapshot,
                controller: _controller,
              ),
              ParentScheduleScreen(snapshot: widget.snapshot),
              ParentNoticesScreen(
                snapshot: widget.snapshot,
                controller: _controller,
              ),
              ParentChildScreen(snapshot: widget.snapshot),
              ParentMoreScreen(
                snapshot: widget.snapshot,
                onChangeRole: widget.onChangeRole,
              ),
            ],
          ),
        ),
        bottomNavigationBar: NavigationBar(
          selectedIndex: selectedIndex,
          onDestinationSelected: (index) =>
              _controller.selectTab(ParentTab.values[index]),
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
              icon: Icon(Icons.campaign_outlined),
              selectedIcon: Icon(Icons.campaign_rounded),
              label: '공지',
            ),
            NavigationDestination(
              icon: Icon(Icons.family_restroom_outlined),
              selectedIcon: Icon(Icons.family_restroom_rounded),
              label: '자녀',
            ),
            NavigationDestination(
              icon: Icon(Icons.more_horiz_rounded),
              selectedIcon: Icon(Icons.grid_view_rounded),
              label: '더보기',
            ),
          ],
        ),
      );
    },
  );
}
