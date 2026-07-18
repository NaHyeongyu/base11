import 'package:clubhaus_mobile/features/player/data/player_preview_data.dart';
import 'package:clubhaus_mobile/features/player/domain/player_models.dart';
import 'package:clubhaus_mobile/features/player/presentation/player_controller.dart';
import 'package:clubhaus_mobile/features/player/presentation/player_growth_screen.dart';
import 'package:clubhaus_mobile/features/player/presentation/player_profile_screen.dart';
import 'package:clubhaus_mobile/features/player/presentation/player_schedule_screen.dart';
import 'package:clubhaus_mobile/features/player/presentation/player_team_screen.dart';
import 'package:clubhaus_mobile/features/player/presentation/player_today_screen.dart';
import 'package:flutter/material.dart';

class PlayerShell extends StatefulWidget {
  const PlayerShell({required this.onChangeRole, super.key});
  final VoidCallback onChangeRole;

  @override
  State<PlayerShell> createState() => _PlayerShellState();
}

class _PlayerShellState extends State<PlayerShell> {
  final PlayerController _controller = PlayerController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => AnimatedBuilder(
    animation: _controller,
    builder: (context, _) {
      final selectedIndex = PlayerTab.values.indexOf(_controller.tab);
      return Scaffold(
        body: SafeArea(
          bottom: false,
          child: IndexedStack(
            index: selectedIndex,
            children: [
              PlayerTodayScreen(
                snapshot: PlayerPreviewData.snapshot,
                controller: _controller,
              ),
              const PlayerScheduleScreen(snapshot: PlayerPreviewData.snapshot),
              const PlayerGrowthScreen(),
              const PlayerTeamScreen(),
              PlayerProfileScreen(
                snapshot: PlayerPreviewData.snapshot,
                onChangeRole: widget.onChangeRole,
              ),
            ],
          ),
        ),
        bottomNavigationBar: NavigationBar(
          selectedIndex: selectedIndex,
          onDestinationSelected: (index) =>
              _controller.selectTab(PlayerTab.values[index]),
          destinations: const [
            NavigationDestination(
              icon: Icon(Icons.home_outlined),
              selectedIcon: Icon(Icons.home_rounded),
              label: '오늘',
            ),
            NavigationDestination(
              icon: Icon(Icons.calendar_month_outlined),
              selectedIcon: Icon(Icons.calendar_month_rounded),
              label: '일정',
            ),
            NavigationDestination(
              icon: Icon(Icons.trending_up_outlined),
              selectedIcon: Icon(Icons.trending_up_rounded),
              label: '성장',
            ),
            NavigationDestination(
              icon: Icon(Icons.shield_outlined),
              selectedIcon: Icon(Icons.shield_rounded),
              label: '우리 팀',
            ),
            NavigationDestination(
              icon: Icon(Icons.person_outline_rounded),
              selectedIcon: Icon(Icons.person_rounded),
              label: '내 정보',
            ),
          ],
        ),
      );
    },
  );
}
