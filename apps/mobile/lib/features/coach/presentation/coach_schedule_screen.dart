import 'package:clubhaus_mobile/app/theme/app_colors.dart';
import 'package:clubhaus_mobile/features/coach/domain/coach_models.dart';
import 'package:clubhaus_mobile/features/coach/presentation/widgets/coach_widgets.dart';
import 'package:flutter/material.dart';

class CoachScheduleScreen extends StatelessWidget {
  const CoachScheduleScreen({required this.snapshot, super.key});

  final CoachTeamSnapshot snapshot;

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
    return CustomScrollView(
      key: const PageStorageKey('coach-schedule'),
      slivers: [
        SliverPadding(
          padding: const EdgeInsets.fromLTRB(18, 16, 18, 32),
          sliver: SliverList.list(
            children: [
              CoachPageHeader(
                eyebrow: 'TEAM CALENDAR',
                title: '일정',
                description: '훈련·경기·미팅을 한곳에서 관리합니다.',
                trailing: CoachIconButton(
                  icon: Icons.add_rounded,
                  label: '일정 추가',
                  onPressed: () {},
                ),
              ),
              const SizedBox(height: 22),
              Row(
                children: [
                  IconButton(
                    onPressed: () {},
                    tooltip: '이전 주',
                    icon: const Icon(Icons.chevron_left_rounded),
                  ),
                  const Expanded(
                    child: Text(
                      '2026년 7월 3주',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ),
                  IconButton(
                    onPressed: () {},
                    tooltip: '다음 주',
                    icon: const Icon(Icons.chevron_right_rounded),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              SizedBox(
                height: 72,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemCount: days.length,
                  separatorBuilder: (_, _) => const SizedBox(width: 7),
                  itemBuilder: (context, index) {
                    final selected = index == 4;
                    return Container(
                      width: 48,
                      decoration: BoxDecoration(
                        color: selected ? AppColors.ink : AppColors.surface,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: selected ? AppColors.ink : AppColors.line,
                        ),
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            days[index].$1,
                            style: TextStyle(
                              color: selected
                                  ? const Color(0xFFD0D5DD)
                                  : AppColors.muted,
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            days[index].$2,
                            style: TextStyle(
                              color: selected ? Colors.white : AppColors.ink,
                              fontSize: 17,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                          if (selected) ...[
                            const SizedBox(height: 5),
                            Container(
                              width: 4,
                              height: 4,
                              decoration: const BoxDecoration(
                                color: Color(0xFF84ADFF),
                                shape: BoxShape.circle,
                              ),
                            ),
                          ],
                        ],
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 26),
              CoachSection(
                title: '오늘 · 7월 18일',
                description: '예정된 일정 ${snapshot.todayEvents.length}개',
                child: Column(
                  children: snapshot.todayEvents.indexed
                      .map(
                        (entry) => Padding(
                          padding: EdgeInsets.only(
                            bottom: entry.$1 == snapshot.todayEvents.length - 1
                                ? 0
                                : 10,
                          ),
                          child: _ScheduleCard(
                            event: entry.$2,
                            highlighted: entry.$1 == 1,
                          ),
                        ),
                      )
                      .toList(),
                ),
              ),
              const SizedBox(height: 26),
              const CoachSection(
                title: '다가오는 경기',
                description: 'K리그 주니어 U18',
                child: _NextMatchCard(),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _ScheduleCard extends StatelessWidget {
  const _ScheduleCard({required this.event, required this.highlighted});

  final CoachEvent event;
  final bool highlighted;

  @override
  Widget build(BuildContext context) {
    return CoachCard(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Container(
            width: 4,
            height: 54,
            decoration: BoxDecoration(
              color: highlighted ? AppColors.brand : const Color(0xFF98A2B3),
              borderRadius: BorderRadius.circular(8),
            ),
          ),
          const SizedBox(width: 13),
          SizedBox(
            width: 48,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  event.time,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  event.endTime,
                  style: const TextStyle(color: AppColors.muted, fontSize: 10),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        event.title,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                    StatusPill(
                      event.type,
                      tone: highlighted
                          ? PlayerAvailability.ready
                          : PlayerAvailability.unanswered,
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  '${event.location} · ${event.participants}',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(color: AppColors.muted, fontSize: 10),
                ),
              ],
            ),
          ),
          const SizedBox(width: 4),
          IconButton(
            onPressed: () {},
            tooltip: '일정 상세',
            icon: const Icon(
              Icons.chevron_right_rounded,
              color: AppColors.muted,
            ),
          ),
        ],
      ),
    );
  }
}

class _NextMatchCard extends StatelessWidget {
  const _NextMatchCard();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF182230), Color(0xFF101828)],
        ),
        borderRadius: BorderRadius.circular(20),
      ),
      child: const Column(
        children: [
          Row(
            children: [
              StatusPill('D-2', tone: PlayerAvailability.watch),
              Spacer(),
              Text(
                '7월 20일 일요일 · 15:00',
                style: TextStyle(
                  color: Color(0xFFD0D5DD),
                  fontSize: 10,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
          SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _MiniCrest(label: 'A', color: Color(0xFF781A25)),
              SizedBox(width: 12),
              Expanded(
                child: Text(
                  'FC 안양 U18',
                  maxLines: 2,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
              Padding(
                padding: EdgeInsets.symmetric(horizontal: 8),
                child: Text(
                  'VS',
                  style: TextStyle(
                    color: Color(0xFF84ADFF),
                    fontSize: 12,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
              Expanded(
                child: Text(
                  '수원FC U18',
                  maxLines: 2,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
              SizedBox(width: 12),
              _MiniCrest(label: 'S', color: Color(0xFF175CD3)),
            ],
          ),
          SizedBox(height: 17),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.location_on_outlined,
                size: 16,
                color: Color(0xFF98A2B3),
              ),
              SizedBox(width: 5),
              Flexible(
                child: Text(
                  '수원월드컵 보조구장 · 13:30 집합',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(color: Color(0xFF98A2B3), fontSize: 10),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _MiniCrest extends StatelessWidget {
  const _MiniCrest({required this.label, required this.color});
  final String label;
  final Color color;
  @override
  Widget build(BuildContext context) => Container(
    width: 42,
    height: 42,
    alignment: Alignment.center,
    decoration: BoxDecoration(
      color: color,
      borderRadius: BorderRadius.circular(13),
    ),
    child: Text(
      label,
      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900),
    ),
  );
}
