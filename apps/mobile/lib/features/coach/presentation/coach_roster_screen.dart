import 'package:clubhaus_mobile/app/theme/app_colors.dart';
import 'package:clubhaus_mobile/features/coach/domain/coach_models.dart';
import 'package:clubhaus_mobile/features/coach/presentation/coach_controller.dart';
import 'package:clubhaus_mobile/features/coach/presentation/widgets/coach_widgets.dart';
import 'package:flutter/material.dart';

class CoachRosterScreen extends StatelessWidget {
  const CoachRosterScreen({
    required this.snapshot,
    required this.controller,
    super.key,
  });

  final CoachTeamSnapshot snapshot;
  final CoachController controller;

  @override
  Widget build(BuildContext context) {
    final players = snapshot.players.where((player) {
      final haystack =
          '${player.name} ${player.number} ${player.position} ${player.grade}'
              .toLowerCase();
      return haystack.contains(controller.rosterQuery);
    }).toList();

    return CustomScrollView(
      key: const PageStorageKey('coach-roster'),
      slivers: [
        SliverPadding(
          padding: const EdgeInsets.fromLTRB(18, 16, 18, 32),
          sliver: SliverList.list(
            children: [
              CoachPageHeader(
                eyebrow: 'TEAM ROSTER',
                title: '선수단',
                description: '선수 프로필과 최근 상태를 확인합니다.',
                trailing: CoachIconButton(
                  icon: Icons.person_add_alt_1_rounded,
                  label: '선수 초대',
                  onPressed: () {},
                ),
              ),
              const SizedBox(height: 20),
              TextField(
                onChanged: controller.setRosterQuery,
                textInputAction: TextInputAction.search,
                decoration: const InputDecoration(
                  hintText: '이름, 번호, 포지션 검색',
                  prefixIcon: Icon(Icons.search_rounded),
                  suffixIcon: Icon(Icons.tune_rounded),
                ),
              ),
              const SizedBox(height: 12),
              const Row(
                children: [
                  MiniMetric(label: '등록 선수', value: '26명'),
                  SizedBox(width: 8),
                  MiniMetric(
                    label: '평균 출석',
                    value: '93%',
                    accent: AppColors.success,
                  ),
                  SizedBox(width: 8),
                  MiniMetric(
                    label: '상태 확인',
                    value: '2명',
                    accent: AppColors.warning,
                  ),
                ],
              ),
              const SizedBox(height: 22),
              Row(
                children: [
                  Text(
                    '선수 ${players.length}명',
                    style: const TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const Spacer(),
                  TextButton.icon(
                    onPressed: () {},
                    icon: const Icon(Icons.filter_list_rounded, size: 17),
                    label: const Text('필터'),
                  ),
                ],
              ),
              const SizedBox(height: 8),
            ],
          ),
        ),
        if (players.isEmpty)
          const SliverPadding(
            padding: EdgeInsets.symmetric(horizontal: 18),
            sliver: SliverToBoxAdapter(child: _EmptyRoster()),
          )
        else
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(18, 0, 18, 32),
            sliver: SliverList.separated(
              itemCount: players.length,
              separatorBuilder: (_, _) => const SizedBox(height: 10),
              itemBuilder: (context, index) =>
                  _PlayerCard(player: players[index]),
            ),
          ),
      ],
    );
  }
}

class _PlayerCard extends StatelessWidget {
  const _PlayerCard({required this.player});
  final CoachPlayer player;

  @override
  Widget build(BuildContext context) {
    return CoachCard(
      padding: const EdgeInsets.all(15),
      child: Row(
        children: [
          PlayerNumber(player: player, size: 50),
          const SizedBox(width: 13),
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
                          fontSize: 14,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ),
                    const SizedBox(width: 7),
                    StatusPill(
                      _label(player.availability),
                      tone: player.availability,
                    ),
                  ],
                ),
                const SizedBox(height: 5),
                Text(
                  'No.${player.number} · ${player.position} · ${player.grade}',
                  style: const TextStyle(color: AppColors.muted, fontSize: 12),
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: _InlineStat(
                        label: '출석',
                        value: '${player.attendance}%',
                        progress: player.attendance / 100,
                        color: AppColors.success,
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: _InlineStat(
                        label: '준비도',
                        value: '${player.condition}',
                        progress: player.condition / 100,
                        color: player.condition < 60
                            ? AppColors.warning
                            : AppColors.brand,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(width: 4),
          IconButton(
            onPressed: () {},
            tooltip: '${player.name} 상세',
            icon: const Icon(
              Icons.chevron_right_rounded,
              color: AppColors.muted,
            ),
          ),
        ],
      ),
    );
  }

  static String _label(PlayerAvailability availability) =>
      switch (availability) {
        PlayerAvailability.ready => '정상',
        PlayerAvailability.watch => '관찰',
        PlayerAvailability.injured => '부상',
        PlayerAvailability.unanswered => '미확인',
      };
}

class _InlineStat extends StatelessWidget {
  const _InlineStat({
    required this.label,
    required this.value,
    required this.progress,
    required this.color,
  });
  final String label;
  final String value;
  final double progress;
  final Color color;
  @override
  Widget build(BuildContext context) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Row(
        children: [
          Text(
            label,
            style: const TextStyle(color: AppColors.muted, fontSize: 12),
          ),
          const Spacer(),
          Text(
            value,
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800),
          ),
        ],
      ),
      const SizedBox(height: 5),
      ClipRRect(
        borderRadius: BorderRadius.circular(6),
        child: LinearProgressIndicator(
          value: progress,
          minHeight: 4,
          backgroundColor: const Color(0xFFEEF1F5),
          color: color,
        ),
      ),
    ],
  );
}

class _EmptyRoster extends StatelessWidget {
  const _EmptyRoster();
  @override
  Widget build(BuildContext context) => const CoachCard(
    child: Padding(
      padding: EdgeInsets.symmetric(vertical: 24),
      child: Column(
        children: [
          Icon(Icons.search_off_rounded, size: 38, color: AppColors.muted),
          SizedBox(height: 11),
          Text('검색 결과가 없습니다', style: TextStyle(fontWeight: FontWeight.w900)),
          SizedBox(height: 4),
          Text(
            '이름이나 번호를 다시 확인해주세요.',
            style: TextStyle(color: AppColors.muted, fontSize: 12),
          ),
        ],
      ),
    ),
  );
}
