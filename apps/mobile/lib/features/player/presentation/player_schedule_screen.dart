import 'package:clubhaus_mobile/app/theme/app_colors.dart';
import 'package:clubhaus_mobile/features/player/domain/player_models.dart';
import 'package:clubhaus_mobile/shared/widgets/app_components.dart';
import 'package:flutter/material.dart';

class PlayerScheduleScreen extends StatelessWidget {
  const PlayerScheduleScreen({required this.snapshot, super.key});
  final PlayerSnapshot snapshot;

  @override
  Widget build(BuildContext context) => CustomScrollView(
    key: const PageStorageKey('player-schedule'),
    slivers: [
      SliverPadding(
        padding: const EdgeInsets.fromLTRB(18, 16, 18, 32),
        sliver: SliverList.list(
          children: [
            AppPageHeader(
              eyebrow: 'MY SCHEDULE',
              title: '일정',
              description: '집합 시간과 준비물을 놓치지 마세요.',
              trailing: AppRoundButton(
                icon: Icons.calendar_today_rounded,
                label: '달력 보기',
                onPressed: () {},
              ),
            ),
            const SizedBox(height: 22),
            const _WeekStrip(),
            const SizedBox(height: 24),
            AppSection(
              title: '오늘 · 7월 18일',
              description: '예정된 일정 ${snapshot.activities.length}개',
              child: Column(
                children: snapshot.activities.indexed
                    .map(
                      (entry) => Padding(
                        padding: EdgeInsets.only(
                          bottom: entry.$1 == snapshot.activities.length - 1
                              ? 0
                              : 10,
                        ),
                        child: _ActivityCard(activity: entry.$2),
                      ),
                    )
                    .toList(),
              ),
            ),
            const SizedBox(height: 26),
            const AppSection(
              title: '다가오는 경기',
              description: 'K리그 주니어 U18',
              child: _MatchCard(),
            ),
            const SizedBox(height: 26),
            const AppSection(title: '이번 주', child: _WeekSummary()),
          ],
        ),
      ),
    ],
  );
}

class _WeekStrip extends StatelessWidget {
  const _WeekStrip();

  @override
  Widget build(BuildContext context) {
    const days = [
      ('월', '14'),
      ('화', '15'),
      ('수', '16'),
      ('목', '17'),
      ('금', '18'),
      ('토', '19'),
      ('일', '20'),
    ];
    return Row(
      children: days.indexed
          .map(
            (entry) => Expanded(
              child: Padding(
                padding: EdgeInsets.only(
                  right: entry.$1 == days.length - 1 ? 0 : 6,
                ),
                child: Container(
                  height: 70,
                  decoration: BoxDecoration(
                    color: entry.$2.$2 == '18'
                        ? AppColors.ink
                        : AppColors.surface,
                    border: Border.all(
                      color: entry.$2.$2 == '18'
                          ? AppColors.ink
                          : AppColors.line,
                    ),
                    borderRadius: BorderRadius.circular(15),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        entry.$2.$1,
                        style: TextStyle(
                          color: entry.$2.$2 == '18'
                              ? Colors.white60
                              : AppColors.muted,
                          fontSize: 12,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        entry.$2.$2,
                        style: TextStyle(
                          color: entry.$2.$2 == '18'
                              ? Colors.white
                              : AppColors.ink,
                          fontSize: 16,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          )
          .toList(),
    );
  }
}

class _ActivityCard extends StatelessWidget {
  const _ActivityCard({required this.activity});
  final PlayerActivity activity;

  @override
  Widget build(BuildContext context) => AppCard(
    padding: const EdgeInsets.all(16),
    child: Row(
      children: [
        SizedBox(
          width: 48,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                activity.time,
                style: const TextStyle(fontWeight: FontWeight.w900),
              ),
              Text(
                activity.endTime,
                style: const TextStyle(color: AppColors.muted, fontSize: 12),
              ),
            ],
          ),
        ),
        Container(
          width: 3,
          height: 48,
          decoration: BoxDecoration(
            color: activity.type == '훈련' ? AppColors.brand : AppColors.muted,
            borderRadius: BorderRadius.circular(4),
          ),
        ),
        const SizedBox(width: 13),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                activity.title,
                style: const TextStyle(fontWeight: FontWeight.w900),
              ),
              const SizedBox(height: 5),
              Text(
                activity.location,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(color: AppColors.muted, fontSize: 12),
              ),
              if (activity.note != null)
                Text(
                  activity.note!,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(color: AppColors.brand, fontSize: 12),
                ),
            ],
          ),
        ),
        const Icon(Icons.chevron_right_rounded, color: AppColors.muted),
      ],
    ),
  );
}

class _MatchCard extends StatelessWidget {
  const _MatchCard();

  @override
  Widget build(BuildContext context) => AppCard(
    color: AppColors.ink,
    borderColor: AppColors.ink,
    child: Column(
      children: [
        const Row(
          children: [
            AppPill(
              label: 'D-2',
              foreground: Color(0xFFB9E6FE),
              background: Color(0xFF1849A9),
            ),
            Spacer(),
            Text(
              '7월 20일 일요일 · 15:00',
              style: TextStyle(color: Colors.white70, fontSize: 12),
            ),
          ],
        ),
        const SizedBox(height: 22),
        const Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            _TeamMark(letter: 'A', name: 'FC 안양 U18'),
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 18),
              child: Text(
                'VS',
                style: TextStyle(
                  color: Colors.white54,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ),
            _TeamMark(letter: 'S', name: '수원FC U18'),
          ],
        ),
        const SizedBox(height: 20),
        Container(height: 1, color: Colors.white12),
        const SizedBox(height: 14),
        const Row(
          children: [
            Icon(Icons.location_on_outlined, color: Colors.white54, size: 16),
            SizedBox(width: 5),
            Expanded(
              child: Text(
                '수원월드컵 보조구장 · 13:30 집합',
                style: TextStyle(color: Colors.white70, fontSize: 12),
              ),
            ),
          ],
        ),
      ],
    ),
  );
}

class _TeamMark extends StatelessWidget {
  const _TeamMark({required this.letter, required this.name});
  final String letter;
  final String name;

  @override
  Widget build(BuildContext context) => SizedBox(
    width: 90,
    child: Column(
      children: [
        CircleAvatar(
          radius: 24,
          backgroundColor: Colors.white12,
          child: Text(
            letter,
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.w900,
            ),
          ),
        ),
        const SizedBox(height: 8),
        Text(
          name,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 12,
            fontWeight: FontWeight.w800,
          ),
        ),
      ],
    ),
  );
}

class _WeekSummary extends StatelessWidget {
  const _WeekSummary();

  @override
  Widget build(BuildContext context) => const Row(
    children: [
      AppMetric(label: '팀 훈련', value: '4회'),
      SizedBox(width: 8),
      AppMetric(label: '경기', value: '1회', accent: AppColors.warning),
      SizedBox(width: 8),
      AppMetric(label: '회복·휴식', value: '2일', accent: AppColors.success),
    ],
  );
}
