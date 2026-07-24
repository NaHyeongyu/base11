import 'package:clubhaus_mobile/app/theme/app_colors.dart';
import 'package:clubhaus_mobile/features/coach/domain/coach_models.dart';
import 'package:clubhaus_mobile/features/coach/presentation/coach_controller.dart';
import 'package:clubhaus_mobile/features/coach/presentation/widgets/coach_widgets.dart';
import 'package:flutter/material.dart';

class CoachHomeScreen extends StatelessWidget {
  const CoachHomeScreen({
    required this.snapshot,
    required this.controller,
    super.key,
  });

  final CoachTeamSnapshot snapshot;
  final CoachController controller;

  @override
  Widget build(BuildContext context) {
    final nextEvent = snapshot.todayEvents[1];
    return CustomScrollView(
      key: const PageStorageKey('coach-home'),
      slivers: [
        SliverPadding(
          padding: const EdgeInsets.fromLTRB(18, 16, 18, 32),
          sliver: SliverList.list(
            children: [
              _HomeHeader(snapshot: snapshot),
              const SizedBox(height: 22),
              _TodayHero(event: nextEvent, controller: controller),
              const SizedBox(height: 12),
              const Row(
                children: [
                  MiniMetric(
                    label: '응답 완료',
                    value: '24 / 26',
                    accent: AppColors.success,
                  ),
                  SizedBox(width: 8),
                  MiniMetric(
                    label: '상태 확인',
                    value: '2명',
                    accent: AppColors.warning,
                  ),
                  SizedBox(width: 8),
                  MiniMetric(label: '피드백 대기', value: '5건'),
                ],
              ),
              const SizedBox(height: 26),
              CoachSection(
                title: '빠른 실행',
                description: '자주 쓰는 업무를 바로 처리하세요.',
                child: _QuickActions(controller: controller),
              ),
              const SizedBox(height: 26),
              CoachSection(
                title: '지금 확인할 일',
                description: '훈련 전에 조치가 필요한 항목입니다.',
                action: TextButton(
                  onPressed: () => controller.selectTab(CoachTab.attendance),
                  child: const Text('전체 보기'),
                ),
                child: const _AttentionCard(),
              ),
              const SizedBox(height: 26),
              CoachSection(
                title: '오늘 일정',
                description: '7월 18일 토요일',
                child: _Timeline(events: snapshot.todayEvents),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _HomeHeader extends StatelessWidget {
  const _HomeHeader({required this.snapshot});

  final CoachTeamSnapshot snapshot;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 44,
          height: 44,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: const Color(0xFF781A25),
            borderRadius: BorderRadius.circular(14),
          ),
          child: const Text(
            'A',
            style: TextStyle(
              color: Colors.white,
              fontFamily: 'serif',
              fontSize: 18,
              fontWeight: FontWeight.w900,
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                snapshot.teamName,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 3),
              Text(
                '${snapshot.season} · ${snapshot.coachName}',
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(color: AppColors.muted, fontSize: 12),
              ),
            ],
          ),
        ),
        CoachIconButton(
          icon: Icons.notifications_none_rounded,
          label: '알림',
          badge: 3,
          onPressed: () {},
        ),
      ],
    );
  }
}

class _TodayHero extends StatelessWidget {
  const _TodayHero({required this.event, required this.controller});

  final CoachEvent event;
  final CoachController controller;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF101828), Color(0xFF173E9D)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        boxShadow: const [
          BoxShadow(
            color: Color(0x26101828),
            blurRadius: 24,
            offset: Offset(0, 12),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 7,
                height: 7,
                decoration: const BoxDecoration(
                  color: Color(0xFF6CE9A6),
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 7),
              const Text(
                'TODAY · NEXT SESSION',
                style: TextStyle(
                  color: Color(0xFF84ADFF),
                  fontSize: 12,
                  fontWeight: FontWeight.w900,
                  letterSpacing: 1.1,
                ),
              ),
              const Spacer(),
              const Text(
                'D-DAY',
                style: TextStyle(
                  color: Colors.white70,
                  fontSize: 12,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ],
          ),
          const SizedBox(height: 22),
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                event.time,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 36,
                  fontWeight: FontWeight.w900,
                  letterSpacing: -1.5,
                ),
              ),
              const SizedBox(width: 9),
              Padding(
                padding: const EdgeInsets.only(bottom: 7),
                child: Text(
                  '${event.endTime} 종료',
                  style: const TextStyle(
                    color: Color(0xFFD0D5DD),
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 9),
          Text(
            event.title,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 19,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 7),
          Row(
            children: [
              const Icon(
                Icons.location_on_outlined,
                size: 17,
                color: Color(0xFF98A2B3),
              ),
              const SizedBox(width: 5),
              Expanded(
                child: Text(
                  '${event.location} · ${event.participants}',
                  style: const TextStyle(
                    color: Color(0xFFD0D5DD),
                    fontSize: 12,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              Expanded(
                child: FilledButton.icon(
                  onPressed: () => controller.selectTab(CoachTab.attendance),
                  icon: const Icon(Icons.fact_check_outlined, size: 18),
                  label: const Text('출석 확인'),
                  style: FilledButton.styleFrom(
                    minimumSize: const Size.fromHeight(46),
                    backgroundColor: Colors.white,
                    foregroundColor: AppColors.ink,
                  ),
                ),
              ),
              const SizedBox(width: 9),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () => controller.selectTab(CoachTab.schedule),
                  icon: const Icon(Icons.calendar_month_outlined, size: 18),
                  label: const Text('일정 보기'),
                  style: OutlinedButton.styleFrom(
                    minimumSize: const Size.fromHeight(46),
                    foregroundColor: Colors.white,
                    side: const BorderSide(color: Color(0xFF475467)),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _QuickActions extends StatelessWidget {
  const _QuickActions({required this.controller});

  final CoachController controller;

  @override
  Widget build(BuildContext context) {
    final actions = [
      (
        Icons.add_task_rounded,
        '일정 등록',
        CoachTab.schedule,
        const Color(0xFFEFF4FF),
        AppColors.brand,
      ),
      (
        Icons.campaign_outlined,
        '공지 작성',
        CoachTab.management,
        const Color(0xFFFFF6ED),
        AppColors.warning,
      ),
      (
        Icons.track_changes_outlined,
        '미션 배정',
        CoachTab.roster,
        const Color(0xFFF4F3FF),
        const Color(0xFF6938EF),
      ),
      (
        Icons.rate_review_outlined,
        '피드백',
        CoachTab.management,
        const Color(0xFFECFDF3),
        AppColors.success,
      ),
    ];
    return Row(
      children: actions.indexed.map((entry) {
        final (index, action) = entry;
        return Expanded(
          child: Padding(
            padding: EdgeInsets.only(
              right: index == actions.length - 1 ? 0 : 8,
            ),
            child: InkWell(
              onTap: () => controller.selectTab(action.$3),
              borderRadius: BorderRadius.circular(16),
              child: Container(
                constraints: const BoxConstraints(minHeight: 92),
                padding: const EdgeInsets.symmetric(
                  horizontal: 6,
                  vertical: 12,
                ),
                decoration: BoxDecoration(
                  color: AppColors.surface,
                  border: Border.all(color: AppColors.line),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      width: 38,
                      height: 38,
                      decoration: BoxDecoration(
                        color: action.$4,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(action.$1, color: action.$5, size: 20),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      action.$2,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      }).toList(),
    );
  }
}

class _AttentionCard extends StatelessWidget {
  const _AttentionCard();

  @override
  Widget build(BuildContext context) {
    return CoachCard(
      padding: EdgeInsets.zero,
      child: Column(
        children: [
          const _AttentionRow(
            icon: Icons.healing_outlined,
            iconColor: AppColors.danger,
            iconBackground: Color(0xFFFEF3F2),
            title: '이도윤 · 왼쪽 발목 통증 4/10',
            detail: '17:22 보고 · 일부 참여 요청',
            action: '확인',
          ),
          Container(
            height: 1,
            margin: const EdgeInsets.symmetric(horizontal: 16),
            color: AppColors.line,
          ),
          const _AttentionRow(
            icon: Icons.person_search_outlined,
            iconColor: AppColors.warning,
            iconBackground: Color(0xFFFFF6ED),
            title: '훈련 응답이 필요한 선수 2명',
            detail: '한지민 외 1명 · 훈련 2시간 전',
            action: '알림',
          ),
        ],
      ),
    );
  }
}

class _AttentionRow extends StatelessWidget {
  const _AttentionRow({
    required this.icon,
    required this.iconColor,
    required this.iconBackground,
    required this.title,
    required this.detail,
    required this.action,
  });

  final IconData icon;
  final Color iconColor;
  final Color iconBackground;
  final String title;
  final String detail;
  final String action;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(15),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: iconBackground,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: iconColor, size: 21),
          ),
          const SizedBox(width: 11),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  detail,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(color: AppColors.muted, fontSize: 12),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          TextButton(
            onPressed: () {},
            style: TextButton.styleFrom(
              minimumSize: const Size(46, 42),
              padding: const EdgeInsets.symmetric(horizontal: 8),
            ),
            child: Text(action),
          ),
        ],
      ),
    );
  }
}

class _Timeline extends StatelessWidget {
  const _Timeline({required this.events});

  final List<CoachEvent> events;

  @override
  Widget build(BuildContext context) {
    return CoachCard(
      child: Column(
        children: events.indexed.map((entry) {
          final (index, event) = entry;
          final active = index == 1;
          return Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(
                width: 42,
                child: Padding(
                  padding: const EdgeInsets.only(top: 2),
                  child: Text(
                    event.time,
                    style: TextStyle(
                      color: active ? AppColors.brand : AppColors.muted,
                      fontSize: 12,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
              ),
              SizedBox(
                width: 20,
                child: Column(
                  children: [
                    Container(
                      width: 9,
                      height: 9,
                      decoration: BoxDecoration(
                        color: active
                            ? AppColors.brand
                            : const Color(0xFF98A2B3),
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: active
                              ? const Color(0xFFDBE7FF)
                              : const Color(0xFFEAECF0),
                          width: 3,
                        ),
                      ),
                    ),
                    if (index != events.length - 1)
                      Container(width: 1, height: 54, color: AppColors.line),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.only(bottom: 17),
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
                            tone: active
                                ? PlayerAvailability.ready
                                : PlayerAvailability.unanswered,
                          ),
                        ],
                      ),
                      const SizedBox(height: 5),
                      Text(
                        '${event.location} · ${event.participants}',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          color: AppColors.muted,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          );
        }).toList(),
      ),
    );
  }
}
