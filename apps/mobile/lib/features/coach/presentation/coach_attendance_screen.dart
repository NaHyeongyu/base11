import 'package:clubhaus_mobile/app/theme/app_colors.dart';
import 'package:clubhaus_mobile/features/coach/domain/coach_models.dart';
import 'package:clubhaus_mobile/features/coach/presentation/coach_controller.dart';
import 'package:clubhaus_mobile/features/coach/presentation/widgets/coach_widgets.dart';
import 'package:flutter/material.dart';

class CoachAttendanceScreen extends StatelessWidget {
  const CoachAttendanceScreen({
    required this.snapshot,
    required this.controller,
    super.key,
  });

  final CoachTeamSnapshot snapshot;
  final CoachController controller;

  @override
  Widget build(BuildContext context) {
    final filtered = snapshot.players.where((player) {
      return switch (controller.attendanceFilter) {
        AttendanceFilter.all => true,
        AttendanceFilter.attention =>
          player.availability == PlayerAvailability.watch ||
              player.availability == PlayerAvailability.injured,
        AttendanceFilter.unanswered =>
          player.availability == PlayerAvailability.unanswered,
      };
    }).toList();

    return CustomScrollView(
      key: const PageStorageKey('coach-attendance'),
      slivers: [
        SliverPadding(
          padding: const EdgeInsets.fromLTRB(18, 16, 18, 32),
          sliver: SliverList.list(
            children: [
              CoachPageHeader(
                eyebrow: 'LIVE ATTENDANCE',
                title: '출석 현황',
                description: '응답과 실제 출석, 몸 상태를 함께 확인합니다.',
                trailing: CoachIconButton(
                  icon: Icons.qr_code_scanner_rounded,
                  label: '현장 체크인',
                  onPressed: () {},
                ),
              ),
              const SizedBox(height: 20),
              const _AttendanceHero(),
              const SizedBox(height: 20),
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _FilterChip(
                      label: '전체 ${snapshot.players.length}',
                      selected:
                          controller.attendanceFilter == AttendanceFilter.all,
                      onSelected: () =>
                          controller.setAttendanceFilter(AttendanceFilter.all),
                    ),
                    const SizedBox(width: 8),
                    _FilterChip(
                      label: '상태 확인 2',
                      selected:
                          controller.attendanceFilter ==
                          AttendanceFilter.attention,
                      onSelected: () => controller.setAttendanceFilter(
                        AttendanceFilter.attention,
                      ),
                    ),
                    const SizedBox(width: 8),
                    _FilterChip(
                      label: '미응답 1',
                      selected:
                          controller.attendanceFilter ==
                          AttendanceFilter.unanswered,
                      onSelected: () => controller.setAttendanceFilter(
                        AttendanceFilter.unanswered,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              if (filtered.isEmpty)
                const _NoAttendanceResults()
              else
                CoachCard(
                  padding: EdgeInsets.zero,
                  child: Column(
                    children: filtered.indexed
                        .map(
                          (entry) => _PlayerAttendanceRow(
                            player: entry.$2,
                            response: controller.responseFor(entry.$2),
                            showDivider: entry.$1 != filtered.length - 1,
                            onCycle: () => controller.cycleAttendance(entry.$2),
                          ),
                        )
                        .toList(),
                  ),
                ),
              const SizedBox(height: 14),
              OutlinedButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.notifications_active_outlined),
                label: const Text('미응답 선수에게 한 번에 알림 보내기'),
                style: OutlinedButton.styleFrom(
                  minimumSize: const Size.fromHeight(50),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _AttendanceHero extends StatelessWidget {
  const _AttendanceHero();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.ink,
        borderRadius: BorderRadius.circular(22),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Expanded(
                child: Text(
                  '18:00 팀 전술 훈련',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
              StatusPill('진행 전', tone: PlayerAvailability.ready),
            ],
          ),
          const SizedBox(height: 6),
          const Text(
            '안양 보조구장 · 17:40 집합',
            style: TextStyle(color: Color(0xFF98A2B3), fontSize: 11),
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              const _HeroMetric(
                value: '24',
                label: '응답',
                color: Color(0xFF84ADFF),
              ),
              Container(width: 1, height: 42, color: const Color(0xFF344054)),
              const _HeroMetric(
                value: '22',
                label: '참석 예정',
                color: Color(0xFF6CE9A6),
              ),
              Container(width: 1, height: 42, color: const Color(0xFF344054)),
              const _HeroMetric(
                value: '2',
                label: '상태 확인',
                color: Color(0xFFFDB022),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _HeroMetric extends StatelessWidget {
  const _HeroMetric({
    required this.value,
    required this.label,
    required this.color,
  });
  final String value;
  final String label;
  final Color color;
  @override
  Widget build(BuildContext context) => Expanded(
    child: Column(
      children: [
        Text(
          value,
          style: TextStyle(
            color: color,
            fontSize: 24,
            fontWeight: FontWeight.w900,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(
            color: Color(0xFF98A2B3),
            fontSize: 9,
            fontWeight: FontWeight.w700,
          ),
        ),
      ],
    ),
  );
}

class _FilterChip extends StatelessWidget {
  const _FilterChip({
    required this.label,
    required this.selected,
    required this.onSelected,
  });
  final String label;
  final bool selected;
  final VoidCallback onSelected;
  @override
  Widget build(BuildContext context) => ChoiceChip(
    label: Text(label),
    selected: selected,
    onSelected: (_) => onSelected(),
    showCheckmark: false,
    labelStyle: TextStyle(
      color: selected ? Colors.white : AppColors.muted,
      fontSize: 11,
      fontWeight: FontWeight.w800,
    ),
    selectedColor: AppColors.ink,
    backgroundColor: AppColors.surface,
    side: BorderSide(color: selected ? AppColors.ink : AppColors.line),
    padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 7),
  );
}

class _PlayerAttendanceRow extends StatelessWidget {
  const _PlayerAttendanceRow({
    required this.player,
    required this.response,
    required this.showDivider,
    required this.onCycle,
  });
  final CoachPlayer player;
  final String response;
  final bool showDivider;
  final VoidCallback onCycle;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(15, 14, 12, 14),
          child: Row(
            children: [
              PlayerNumber(player: player),
              const SizedBox(width: 11),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Flexible(
                          child: Text(
                            player.name,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                        ),
                        const SizedBox(width: 7),
                        StatusPill(
                          _availabilityLabel(player.availability),
                          tone: player.availability,
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      player.note ??
                          '${player.position} · ${player.grade} · 컨디션 ${player.condition}',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(
                        color:
                            player.note != null &&
                                player.availability != PlayerAvailability.ready
                            ? AppColors.danger
                            : AppColors.muted,
                        fontSize: 10,
                        fontWeight: player.note != null
                            ? FontWeight.w700
                            : FontWeight.w400,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              OutlinedButton(
                onPressed: onCycle,
                style: OutlinedButton.styleFrom(
                  minimumSize: const Size(64, 42),
                  padding: const EdgeInsets.symmetric(horizontal: 9),
                  side: BorderSide(
                    color: response == '미응답'
                        ? const Color(0xFFFDB022)
                        : AppColors.line,
                  ),
                  foregroundColor: response == '결석'
                      ? AppColors.danger
                      : AppColors.ink,
                ),
                child: Text(
                  response,
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
            ],
          ),
        ),
        if (showDivider) const Divider(height: 1, indent: 68, endIndent: 14),
      ],
    );
  }

  static String _availabilityLabel(PlayerAvailability availability) =>
      switch (availability) {
        PlayerAvailability.ready => '정상',
        PlayerAvailability.watch => '관찰',
        PlayerAvailability.injured => '부상',
        PlayerAvailability.unanswered => '미확인',
      };
}

class _NoAttendanceResults extends StatelessWidget {
  const _NoAttendanceResults();
  @override
  Widget build(BuildContext context) => const CoachCard(
    child: Padding(
      padding: EdgeInsets.symmetric(vertical: 22),
      child: Column(
        children: [
          Icon(
            Icons.check_circle_outline_rounded,
            size: 36,
            color: AppColors.success,
          ),
          SizedBox(height: 10),
          Text(
            '확인이 필요한 선수가 없습니다',
            style: TextStyle(fontWeight: FontWeight.w800),
          ),
          SizedBox(height: 4),
          Text(
            '선수 상태가 변경되면 이곳에 표시됩니다.',
            style: TextStyle(color: AppColors.muted, fontSize: 11),
          ),
        ],
      ),
    ),
  );
}
